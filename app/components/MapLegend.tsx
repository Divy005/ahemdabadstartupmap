"use client";

import { useState } from "react";
import { MARKER_COLORS } from "@/lib/constants";
import { cx } from "@/lib/utils";

const ITEMS = [
  { color: MARKER_COLORS.precise, label: "Startup — precise office pin", dashed: false },
  { color: MARKER_COLORS.area, label: "Startup — area-level pin", dashed: true },
  { color: MARKER_COLORS.vc, label: "VC firm / Incubator", dashed: false },
  { color: MARKER_COLORS.registry, label: "Registered company (MCA)", dashed: false },
];

// Ring colours read on the pin border; the disc itself carries the logo.


export default function MapLegend() {
  // Collapsed by default on phones, where it would cover a third of the map.
  // Safe to read `window` here: the map (and so this) is client-only.
  const [open, setOpen] = useState(
    () => typeof window === "undefined" || window.innerWidth >= 640,
  );

  return (
    <div className="pointer-events-auto absolute bottom-6 left-3 z-[450] sm:bottom-8 sm:left-4">
      <div className="overflow-hidden rounded-lg border border-ink-100 bg-white/95 shadow-card backdrop-blur">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center gap-2 px-3 py-2 text-[11.5px] font-semibold uppercase tracking-wide text-ink-500 hover:bg-ink-50"
        >
          Legend
          <svg
            viewBox="0 0 16 16"
            className={cx("h-3 w-3 transition-transform", open && "rotate-180")}
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M4.2 6.1a.8.8 0 0 1 1.13 0L8 8.77l2.67-2.67a.8.8 0 1 1 1.13 1.13L8.57 10.5a.8.8 0 0 1-1.14 0L4.2 7.23a.8.8 0 0 1 0-1.13Z" />
          </svg>
        </button>

        {open && (
          <ul className="border-t border-ink-50 px-3 py-2.5">
            {ITEMS.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-2 py-1 text-[12px] text-ink-500"
              >
                <span
                  aria-hidden="true"
                  className="h-3.5 w-3.5 shrink-0 rounded-full bg-white"
                  style={{ border: `2px ${item.dashed ? "dashed" : "solid"} ${item.color}` }}
                />
                {item.label}
              </li>
            ))}
            <li className="mt-1 flex items-center gap-2 border-t border-ink-50 pt-2 text-[12px] text-ink-500">
              <span
                aria-hidden="true"
                className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white bg-red-600 ring-1 ring-red-700"
              />
              Red dot = has open roles
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
