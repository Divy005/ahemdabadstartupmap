"use client";

import { cx } from "@/lib/utils";

export type ViewMode = "map" | "grid";

const OPTIONS: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
  {
    id: "map",
    label: "Map",
    icon: (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
        <path d="M6 1.6 1.9 3.1a.9.9 0 0 0-.6.85v9.2c0 .63.63 1.06 1.2.83L6 12.6l4 1.8 3.7-1.5c.36-.14.6-.48.6-.86v-9.2c0-.63-.63-1.06-1.2-.83L10 3.4 6 1.6Zm.75 1.62 2.5 1.12v7.84l-2.5-1.12V3.22Z" />
      </svg>
    ),
  },
  {
    id: "grid",
    label: "Grid",
    icon: (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
        <path d="M2.5 2.5h4.2v4.2H2.5V2.5Zm6.8 0h4.2v4.2H9.3V2.5ZM2.5 9.3h4.2v4.2H2.5V9.3Zm6.8 0h4.2v4.2H9.3V9.3Z" />
      </svg>
    ),
  },
];

export default function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="View mode"
      className="inline-flex shrink-0 rounded-full border border-ink-100 bg-white p-0.5"
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            className={cx(
              "inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors",
              active
                ? "bg-ink-600 text-white"
                : "text-ink-500 hover:bg-ink-50 hover:text-ink-700",
            )}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
