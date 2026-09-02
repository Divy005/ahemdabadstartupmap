"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import type { Startup } from "@/types";
import {
  AHMEDABAD_CENTER,
  DEFAULT_ZOOM,
  MARKER_COLORS,
  SECTOR_HEX,
} from "@/lib/constants";
import MapLegend from "./MapLegend";

/** Cluster group is only typed loosely — the plugin augments Leaflet at runtime. */
type ClusterGroup = {
  clearLayers: () => void;
  addLayers: (layers: unknown[]) => void;
};

function markerColor(s: Startup) {
  if (s.type === "vc") return MARKER_COLORS.vc;
  return s.location.pinType === "precise" ? MARKER_COLORS.precise : MARKER_COLORS.area;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Builds the popup body as real DOM so the "View details" button can call back
 * into React rather than going through a global.
 */
function buildPopup(s: Startup, onOpen: (s: Startup) => void) {
  const el = document.createElement("div");
  el.className = "p-3.5";
  const open = s.hiring ? s.jobs.length : 0;
  const accent = SECTOR_HEX[s.sector] ?? SECTOR_HEX.Other;

  el.innerHTML = `
    <div style="display:flex;align-items:flex-start;gap:8px;justify-content:space-between">
      <p style="font-weight:600;font-size:14px;color:#0F2B3C;letter-spacing:-0.01em;margin:0 18px 0 0">
        ${escapeHtml(s.name)}
      </p>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">
      <span style="font-size:11px;font-weight:500;padding:1px 7px;border-radius:5px;background:${accent}14;color:${accent};border:1px solid ${accent}2e">
        ${escapeHtml(s.sector)}
      </span>
      <span style="font-size:11px;font-weight:500;padding:1px 7px;border-radius:5px;background:#fff;color:#4C7B98;border:1px solid #DDE7EE">
        ${escapeHtml(s.stage)}
      </span>
      ${
        open > 0
          ? `<span style="font-size:11px;font-weight:500;padding:1px 7px;border-radius:5px;background:#F0FDF4;color:#15803D;border:1px solid #BBF7D0">
               ${open} hiring
             </span>`
          : ""
      }
    </div>
    <p style="margin:8px 0 0;font-size:12.5px;line-height:1.5;color:#4C7B98">
      ${escapeHtml(s.description.slice(0, 120))}${s.description.length > 120 ? "…" : ""}
    </p>
    <p style="margin:8px 0 0;font-size:12px;color:#7FA3BA">
      ◈ ${escapeHtml(s.location.area)}
      <span style="color:#B6CBD9"> · ${s.location.pinType === "precise" ? "precise pin" : "area-level pin"}</span>
    </p>
  `;

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "View details →";
  button.style.cssText =
    "margin-top:10px;font-size:12.5px;font-weight:600;color:#CF4A17;background:none;border:0;padding:0;cursor:pointer";
  button.addEventListener("click", () => onOpen(s));
  el.appendChild(button);

  return el;
}

export default function MapView({
  startups,
  onOpen,
}: {
  startups: Startup[];
  onOpen: (s: Startup) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const clusterRef = useRef<ClusterGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  const [ready, setReady] = useState(false);

  // Create the map once. Leaflet and the cluster plugin are loaded on demand.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet.markercluster");
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: AHMEDABAD_CENTER,
        zoom: DEFAULT_ZOOM,
        scrollWheelZoom: true,
        zoomControl: false,
        preferCanvas: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      const cluster = (L as any).markerClusterGroup({
        maxClusterRadius: 46,
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        disableClusteringAtZoom: 16,
        // Markers are rebuilt wholesale on every filter change; per-marker
        // add animations leave stragglers unpositioned, so bulk-add instead.
        animateAddingMarkers: false,
        chunkedLoading: true,
        iconCreateFunction: (c: any) => {
          const n = c.getChildCount();
          const size = n < 10 ? 34 : n < 40 ? 42 : 50;
          return L.divIcon({
            html: `<div>${n}</div>`,
            className: "asm-cluster",
            iconSize: L.point(size, size),
          });
        },
      });

      map.addLayer(cluster);

      leafletRef.current = L;
      mapRef.current = map;
      clusterRef.current = cluster as ClusterGroup;
      setReady(true);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      clusterRef.current = null;
    };
  }, []);

  // Keep Leaflet honest about its own size when the layout changes around it.
  useEffect(() => {
    if (!ready || !containerRef.current) return;
    const observer = new ResizeObserver(() => mapRef.current?.invalidateSize());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [ready]);

  // Redraw markers whenever the filtered set changes.
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const cluster = clusterRef.current;
    if (!ready || !L || !map || !cluster) return;

    cluster.clearLayers();
    const markers: Marker[] = [];

    for (const s of startups) {
      const color = markerColor(s);
      const dashed = s.type !== "vc" && s.location.pinType === "area";
      const hiring = s.hiring && s.jobs.length > 0;

      const icon = L.divIcon({
        className: "asm-marker asm-marker-appear",
        iconSize: [15, 15],
        iconAnchor: [7.5, 7.5],
        popupAnchor: [0, -10],
        html: `<div class="asm-marker-dot${dashed ? " asm-marker-dot--area" : ""}${
          hiring ? " asm-marker-hiring" : ""
        }" style="background:${dashed ? "#FFFFFF" : color};border-color:${
          dashed ? color : "#fff"
        };position:relative"></div>`,
      });

      const marker = L.marker([s.location.lat, s.location.lng], {
        icon,
        title: s.name,
        alt: `${s.name} — ${s.sector} in ${s.location.area}`,
        riseOnHover: true,
      });

      marker.bindPopup(() => buildPopup(s, onOpenRef.current), {
        closeButton: true,
        autoPanPadding: L.point(24, 24),
      });

      markers.push(marker);
    }

    cluster.addLayers(markers);

    if (markers.length > 0) {
      const bounds = L.latLngBounds(
        startups.map((s) => [s.location.lat, s.location.lng] as [number, number]),
      );
      map.flyToBounds(bounds, {
        padding: [56, 56],
        maxZoom: markers.length === 1 ? 15 : 14,
        duration: 0.5,
      });
    }
  }, [startups, ready]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        role="application"
        aria-label={`Map of ${startups.length} startups and investors in Ahmedabad`}
        className="h-[52vh] w-full rounded-xl border border-ink-100 bg-ink-50 sm:h-[60vh]"
      />
      <MapLegend />

      {!ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-ink-50/80">
          <p className="text-[13px] font-medium text-ink-400">Loading map…</p>
        </div>
      )}

      {ready && startups.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-white/70">
          <p className="rounded-full bg-white px-4 py-2 text-[13px] font-medium text-ink-500 shadow-card">
            No companies match those filters
          </p>
        </div>
      )}
    </div>
  );
}
