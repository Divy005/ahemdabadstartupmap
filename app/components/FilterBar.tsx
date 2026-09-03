"use client";

import { useEffect, useState } from "react";
import type { Filters, SortKey } from "@/types";
import { activeFilterCount, cx } from "@/lib/utils";
import SearchBar from "./SearchBar";
import ViewToggle, { type ViewMode } from "./ViewToggle";

export interface Facets {
  areas: string[];
  sectors: string[];
  stages: string[];
}

const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "startup", label: "Startups" },
  { value: "vc", label: "VC firms / Incubators" },
  { value: "registry", label: "Registered companies" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "alphabetical", label: "A–Z" },
  { value: "newest", label: "Recently founded" },
  { value: "funding", label: "Most funded" },
  { value: "jobs", label: "Most roles open" },
];

function Select({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  allLabel: string;
}) {
  const active = value !== "all";
  return (
    <div className="relative shrink-0">
      <label className="sr-only" htmlFor={`filter-${label}`}>
        {label}
      </label>
      <select
        id={`filter-${label}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx(
          "field w-full cursor-pointer appearance-none sm:w-auto",
          active && "border-saffron-400 bg-saffron-50 text-saffron-700",
        )}
      >
        <option value="all">{allLabel}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 16 16"
        className={cx(
          "pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2",
          active ? "text-saffron-600" : "text-ink-300",
        )}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M4.2 6.1a.8.8 0 0 1 1.13 0L8 8.77l2.67-2.67a.8.8 0 1 1 1.13 1.13L8.57 10.5a.8.8 0 0 1-1.14 0L4.2 7.23a.8.8 0 0 1 0-1.13Z" />
      </svg>
    </div>
  );
}

function TypeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const active = value !== "all";
  return (
    <div className="relative shrink-0">
      <label className="sr-only" htmlFor="filter-type">
        Type
      </label>
      <select
        id="filter-type"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx(
          "field w-full cursor-pointer appearance-none sm:w-auto",
          active && "border-saffron-400 bg-saffron-50 text-saffron-700",
        )}
      >
        {TYPE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 16 16"
        className={cx(
          "pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2",
          active ? "text-saffron-600" : "text-ink-300",
        )}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M4.2 6.1a.8.8 0 0 1 1.13 0L8 8.77l2.67-2.67a.8.8 0 1 1 1.13 1.13L8.57 10.5a.8.8 0 0 1-1.14 0L4.2 7.23a.8.8 0 0 1 0-1.13Z" />
      </svg>
    </div>
  );
}

function HiringToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={value}
      onClick={() => onChange(!value)}
      className={cx("pill-button shrink-0", value && "pill-button-active")}
    >
      <span
        aria-hidden="true"
        className={cx(
          "h-1.5 w-1.5 rounded-full",
          value ? "bg-saffron-500" : "bg-green-500",
        )}
      />
      Hiring now
    </button>
  );
}

/** The controls, shared by the desktop rail and the mobile sheet. */
function Controls({
  filters,
  facets,
  set,
  stacked,
}: {
  filters: Filters;
  facets: Facets;
  set: (patch: Partial<Filters>) => void;
  stacked?: boolean;
}) {
  return (
    <div
      className={cx(
        stacked
          ? "grid grid-cols-1 gap-2.5"
          : "flex items-center gap-2 overflow-x-auto no-scrollbar",
      )}
    >
      <TypeSelect value={filters.type} onChange={(v) => set({ type: v })} />
      <Select
        label="Area"
        allLabel="All areas"
        value={filters.area}
        options={facets.areas}
        onChange={(v) => set({ area: v })}
      />
      <Select
        label="Sector"
        allLabel="All sectors"
        value={filters.sector}
        options={facets.sectors}
        onChange={(v) => set({ sector: v })}
      />
      <Select
        label="Stage"
        allLabel="All stages"
        value={filters.stage}
        options={facets.stages}
        onChange={(v) => set({ stage: v })}
      />
      <HiringToggle value={filters.hiring} onChange={(v) => set({ hiring: v })} />
    </div>
  );
}

export default function FilterBar({
  filters,
  facets,
  resultCount,
  jobCount,
  view,
  sort,
  onFilters,
  onView,
  onSort,
  onReset,
  onOpenJobs,
}: {
  filters: Filters;
  facets: Facets;
  resultCount: number;
  jobCount: number;
  view: ViewMode;
  sort: SortKey;
  onFilters: (patch: Partial<Filters>) => void;
  onView: (v: ViewMode) => void;
  onSort: (v: SortKey) => void;
  onReset: () => void;
  onOpenJobs: () => void;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const active = activeFilterCount(filters);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  return (
    <div className="sticky top-0 z-[500] border-b border-ink-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto max-w-page px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Row 1 — search, then controls. Stacks on small screens so nothing
            gets squeezed down to an unreadable width. */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <SearchBar
            value={filters.q}
            onChange={(q) => onFilters({ q })}
            className="min-w-0 md:flex-1"
          />

          <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className={cx(
              "pill-button shrink-0 md:hidden",
              active > 0 && "pill-button-active",
            )}
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
              <path d="M2 4.25c0-.41.34-.75.75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.25Zm2 3.75c0-.41.34-.75.75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 4 8Zm2.25 3.5a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" />
            </svg>
            Filters
            {active > 0 && (
              <span className="ml-0.5 rounded-full bg-saffron-500 px-1.5 text-[10px] font-bold text-white">
                {active}
              </span>
            )}
          </button>

          <ViewToggle value={view} onChange={onView} />

          <button
            type="button"
            onClick={onOpenJobs}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3.5 text-[13px] font-semibold text-green-800 transition-colors hover:bg-green-100"
          >
            <span aria-hidden="true">💼</span>
            <span>Jobs</span>
            <span className="rounded-full bg-green-600 px-1.5 py-px text-[10px] font-bold text-white">
              {jobCount}
            </span>
          </button>
          </div>
        </div>

        {/* Row 2 — desktop filter rail */}
        <div className="mt-2 hidden items-center gap-2 md:flex">
          <Controls filters={filters} facets={facets} set={onFilters} />

          <div className="ml-auto flex shrink-0 items-center gap-3">
            {view === "grid" && (
              <div className="relative">
                <label className="sr-only" htmlFor="sort">
                  Sort
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => onSort(e.target.value as SortKey)}
                  className="field cursor-pointer appearance-none"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      Sort: {o.label}
                    </option>
                  ))}
                </select>
                <svg
                  viewBox="0 0 16 16"
                  className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-300"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M4.2 6.1a.8.8 0 0 1 1.13 0L8 8.77l2.67-2.67a.8.8 0 1 1 1.13 1.13L8.57 10.5a.8.8 0 0 1-1.14 0L4.2 7.23a.8.8 0 0 1 0-1.13Z" />
                </svg>
              </div>
            )}

            <p aria-live="polite" className="text-[13px] font-medium text-ink-500">
              <span className="tabular-nums text-ink-800">{resultCount}</span>{" "}
              {resultCount === 1 ? "result" : "results"}
            </p>

            {active > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="text-[13px] font-medium text-saffron-600 underline-offset-2 hover:underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Row 2 (mobile) — result count only */}
        <div className="mt-2 flex items-center justify-between md:hidden">
          <p aria-live="polite" className="text-[13px] font-medium text-ink-500">
            <span className="tabular-nums text-ink-800">{resultCount}</span>{" "}
            {resultCount === 1 ? "result" : "results"}
          </p>
          {active > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="text-[13px] font-medium text-saffron-600 underline-offset-2 hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[1000] md:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-ink-900/40"
            onClick={() => setSheetOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="absolute inset-x-0 bottom-0 max-h-[85vh] animate-slide-up overflow-y-auto rounded-t-2xl bg-white p-4 pb-8 shadow-panel"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink-100" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink-800">Filters</h2>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="rounded-full p-2 text-ink-400 hover:bg-ink-50"
                aria-label="Close filters"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M3.7 2.6 8 6.9l4.3-4.3a.78.78 0 1 1 1.1 1.1L9.1 8l4.3 4.3a.78.78 0 1 1-1.1 1.1L8 9.1l-4.3 4.3a.78.78 0 1 1-1.1-1.1L6.9 8 2.6 3.7a.78.78 0 1 1 1.1-1.1Z" />
                </svg>
              </button>
            </div>

            <Controls filters={filters} facets={facets} set={onFilters} stacked />

            {view === "grid" && (
              <div className="mt-2.5">
                <label className="sr-only" htmlFor="sort-mobile">
                  Sort
                </label>
                <select
                  id="sort-mobile"
                  value={sort}
                  onChange={(e) => onSort(e.target.value as SortKey)}
                  className="field w-full cursor-pointer appearance-none"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      Sort: {o.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={onReset}
                className="h-11 flex-1 rounded-full border border-ink-100 text-sm font-medium text-ink-600"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="h-11 flex-[2] rounded-full bg-saffron-500 text-sm font-semibold text-white"
              >
                Show {resultCount} {resultCount === 1 ? "result" : "results"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
