"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { JobFilters, JobListing } from "@/types";
import { JOB_TYPE_LABELS } from "@/lib/constants";
import { EMPTY_JOB_FILTERS, cx, filterJobs } from "@/lib/utils";
import JobCard from "./JobCard";
import SearchBar from "./SearchBar";
import { EmptyState } from "./Primitives";

const JOBS_PAGE = 50;

function TypeChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cx("pill-button shrink-0", active && "pill-button-active")}
    >
      {label}
      <span
        className={cx(
          "rounded-full px-1.5 text-[10px] font-bold tabular-nums",
          active ? "bg-saffron-500 text-white" : "bg-ink-50 text-ink-500",
        )}
      >
        {count}
      </span>
    </button>
  );
}

export default function JobsPanel({
  open,
  jobs,
  onClose,
  onOpenCompany,
}: {
  open: boolean;
  jobs: JobListing[];
  onClose: () => void;
  onOpenCompany: (companyId: string) => void;
}) {
  const [filters, setFilters] = useState<JobFilters>(EMPTY_JOB_FILTERS);
  // Paged for the same reason as the grid: the board can run to thousands.
  const [shown, setShown] = useState(JOBS_PAGE);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      restoreTo.current?.focus?.();
    };
  }, [open, onClose]);

  const typeCounts = useMemo(() => {
    const base = filterJobs(jobs, { ...filters, jobType: "all" });
    return base.reduce<Record<string, number>>(
      (acc, j) => {
        acc.all += 1;
        acc[j.type] = (acc[j.type] ?? 0) + 1;
        return acc;
      },
      { all: 0 },
    );
  }, [jobs, filters]);

  const visible = useMemo(() => filterJobs(jobs, filters), [jobs, filters]);

  // Re-filtering starts the paging over.
  useEffect(() => setShown(JOBS_PAGE), [filters]);

  const sectors = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.sector))).sort(),
    [jobs],
  );
  const areas = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.area))).sort(),
    [jobs],
  );

  if (!open) return null;

  const set = (patch: Partial<JobFilters>) =>
    setFilters((f) => ({ ...f, ...patch }));

  return (
    <div className="fixed inset-0 z-[1100]">
      <div
        className="absolute inset-0 animate-fade-in bg-ink-900/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="jobs-panel-title"
        className="absolute inset-0 flex animate-slide-up flex-col bg-canvas shadow-panel sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[min(680px,100vw)] sm:animate-slide-in-right"
      >
        {/* Header */}
        <div className="shrink-0 border-b border-ink-100 bg-white px-4 py-4 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id="jobs-panel-title"
                className="flex items-center gap-2 text-lg font-semibold tracking-tight text-ink-800"
              >
                <span aria-hidden="true">💼</span>
                Jobs &amp; internships
              </h2>
              <p className="mt-0.5 text-[13px] text-ink-400">
                Every open role we track across the Ahmedabad ecosystem, in one place.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close jobs panel"
              className="-mr-1.5 -mt-1 shrink-0 rounded-full p-2.5 text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-700"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M3.7 2.6 8 6.9l4.3-4.3a.78.78 0 1 1 1.1 1.1L9.1 8l4.3 4.3a.78.78 0 1 1-1.1 1.1L8 9.1l-4.3 4.3a.78.78 0 1 1-1.1-1.1L6.9 8 2.6 3.7a.78.78 0 1 1 1.1-1.1Z" />
              </svg>
            </button>
          </div>

          <SearchBar
            id="jobs-search"
            value={filters.q}
            onChange={(q) => set({ q })}
            placeholder="Search roles, companies…"
            className="mt-3.5"
          />

          <div className="mt-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <TypeChip
              label="All roles"
              count={typeCounts.all ?? 0}
              active={filters.jobType === "all"}
              onClick={() => set({ jobType: "all" })}
            />
            {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => {
              const count = typeCounts[value] ?? 0;
              if (count === 0 && filters.jobType !== value) return null;
              return (
                <TypeChip
                  key={value}
                  label={label}
                  count={count}
                  active={filters.jobType === value}
                  onClick={() => set({ jobType: value })}
                />
              );
            })}
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <select
              aria-label="Filter jobs by sector"
              value={filters.sector}
              onChange={(e) => set({ sector: e.target.value })}
              className="field w-full cursor-pointer appearance-none pr-3"
            >
              <option value="all">All sectors</option>
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter jobs by area"
              value={filters.area}
              onChange={(e) => set({ area: e.target.value })}
              className="field w-full cursor-pointer appearance-none pr-3"
            >
              <option value="all">All areas</option>
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <select
              aria-label="Sort jobs"
              value={filters.sort}
              onChange={(e) => set({ sort: e.target.value as JobFilters["sort"] })}
              className="field col-span-2 w-full cursor-pointer appearance-none pr-3 sm:col-span-1"
            >
              <option value="company">Sort: Company</option>
              <option value="title">Sort: Role</option>
              <option value="type">Sort: Job type</option>
            </select>
          </div>

          <div className="mt-2.5 flex items-center justify-between">
            <p aria-live="polite" className="text-[13px] font-medium text-ink-500">
              <span className="tabular-nums text-ink-800">{visible.length}</span>{" "}
              {visible.length === 1 ? "role" : "roles"}
            </p>
            <button
              type="button"
              onClick={() => setFilters(EMPTY_JOB_FILTERS)}
              className="text-[13px] font-medium text-saffron-600 underline-offset-2 hover:underline"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Listings */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {visible.length === 0 ? (
            <EmptyState
              title="No roles match"
              body="Try a different job type, sector or area — or clear the search."
            />
          ) : (
            <>
              <ul className="flex flex-col gap-2.5">
                {visible.slice(0, shown).map((job) => (
                  <JobCard
                    key={`${job.companyId}-${job.title}-${job.type}`}
                    job={job}
                    onOpenCompany={onOpenCompany}
                  />
                ))}
              </ul>
              {visible.length > shown && (
                <div className="mt-4 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShown((n) => n + JOBS_PAGE)}
                    className="h-10 rounded-full border border-ink-100 bg-white px-6 text-[13px] font-semibold text-ink-600 shadow-card hover:bg-ink-50"
                  >
                    Show {Math.min(JOBS_PAGE, visible.length - shown)} more
                  </button>
                  <p className="text-[12px] text-ink-300">
                    Showing {shown} of {visible.length}
                  </p>
                </div>
              )}
            </>
          )}

          <p className="mt-5 rounded-lg bg-ink-50/70 px-3.5 py-3 text-[11.5px] leading-relaxed text-ink-400">
            Listings are curated pointers into each company&rsquo;s own careers page rather
            than a live feed of requisitions. Openings change often — always confirm the role
            on the company site before applying.
          </p>
        </div>
      </div>
    </div>
  );
}
