import { ImageResponse } from "next/og";
import startups from "@/data/startups.json";
import type { Startup } from "@/types";
import { countJobs } from "@/lib/utils";

export const alt = "Ahmedabad Startup Map";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const all = startups as Startup[];

export default function OpengraphImage() {
  const startupCount = all.filter((s) => s.type === "startup").length;
  const vcCount = all.filter((s) => s.type === "vc").length;
  const jobCount = countJobs(all);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FAFAFA",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 26,
              fontWeight: 600,
              color: "#E85D26",
              letterSpacing: -0.5,
            }}
          >
            📍 ahmedabadstartupmap.com
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 84,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: -3,
              color: "#0F2B3C",
              display: "flex",
            }}
          >
            Ahmedabad Startup Map
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 32,
              lineHeight: 1.35,
              color: "#4C7B98",
              maxWidth: 900,
              display: "flex",
            }}
          >
            Every startup, VC firm and open role in the city — on one map.
          </div>
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          {[
            { value: startupCount, label: "Startups", color: "#1D4ED8" },
            { value: vcCount, label: "VCs & incubators", color: "#7C3AED" },
            { value: jobCount, label: "Open roles", color: "#16A34A" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                background: "#FFFFFF",
                border: "1px solid #DDE7EE",
                borderRadius: 16,
                padding: "22px 32px",
                minWidth: 240,
              }}
            >
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  letterSpacing: -2,
                  color: stat.color,
                  display: "flex",
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 24, color: "#7FA3BA", display: "flex" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
