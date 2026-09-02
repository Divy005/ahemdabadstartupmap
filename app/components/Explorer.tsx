"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import startupData from "@/data/startups.json";
import type { Filters, SortKey, Startup } from "@/types";
import { AREAS, SECTORS, STAGES } from "@/lib/constants";
import {
  EMPTY_FILTERS,
  countJobs,
  filterStartups,
  filtersToParams,
  flattenJobs,
  paramsToFilters,
  sortStartups,
} from "@/lib/utils";
import AboutModal from "./AboutModal";
import FilterBar, { type Facets } from "./FilterBar";
import Footer from "./Footer";
import GridView from "./GridView";
import Header from "./Header";
import JobsPanel from "./JobsPanel";
import StartupModal from "./StartupModal";
import StatsBar from "./StatsBar";
import type { ViewMode } from "./ViewToggle";

// Leaflet touches window on import, so the map only ever loads in the browser.
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[52vh] w-full items-center justify-center rounded-xl border border-ink-100 bg-ink-50 sm:h-[60vh]">
      <p className="text-[13px] font-medium text-ink-400">Loading map…</p>
    </div>
  ),
});

const ALL = startupData as Startup[];

/** Only offer filter values that actually exist, in the canonical order. */
function buildFacets(all: Startup[]): Facets {
  const present = <T extends readonly string[]>(canonical: T, values: Set<string>) => {
    const known = canonical.filter((v) => values.has(v));
    const extra = [...values].filter((v) => !canonical.includes(v)).sort();
    return [...known, ...extra];
  };

  return {
    areas: present(AREAS, new Set(all.map((s) => s.location.area))),
    sectors: present(SECTORS, new Set(all.map((s) => s.sector))),
    stages: present(STAGES, new Set(all.map((s) => s.stage))),
  };
}

const FACETS = buildFacets(ALL);
const ALL_JOBS = flattenJobs(ALL);
const TOTALS = {
  startups: ALL.filter((s) => s.type === "startup").length,
  vcs: ALL.filter((s) => s.type === "vc").length,
  jobs: countJobs(ALL),
  areas: new Set(ALL.map((s) => s.location.area)).size,
  sectors: new Set(ALL.map((s) => s.sector)).size,
};

export default function Explorer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The URL is the source of truth on first paint; after that we push to it.
  const [filters, setFilters] = useState<Filters>(() =>
    paramsToFilters(new URLSearchParams(searchParams.toString())),
  );
  const [view, setView] = useState<ViewMode>(() =>
    searchParams.get("view") === "grid" ? "grid" : "map",
  );
  const [sort, setSort] = useState<SortKey>(
    () => (searchParams.get("sort") as SortKey) || "alphabetical",
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    () => searchParams.get("company"),
  );
  const [jobsOpen, setJobsOpen] = useState(() => searchParams.get("jobs") === "open");
  const [aboutOpen, setAboutOpen] = useState(false);

  // Write state back to the query string so any view can be shared as a link.
  const firstRun = useRef(true);
  useEffect(() => {
    const params = filtersToParams(filters, {
      view: view === "grid" ? "grid" : "",
      sort: sort === "alphabetical" ? "" : sort,
      company: selectedId ?? "",
      jobs: jobsOpen ? "open" : "",
    });
    const qs = params.toString();
    const next = qs ? `${pathname}?${qs}` : pathname;
    if (firstRun.current) {
      firstRun.current = false;
      if (next === `${pathname}?${searchParams.toString()}`.replace(/\?$/, "")) return;
    }
    router.replace(next, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, view, sort, selectedId, jobsOpen, pathname]);

  const filtered = useMemo(() => filterStartups(ALL, filters), [filters]);
  const sorted = useMemo(() => sortStartups(filtered, sort), [filtered, sort]);
  const visibleJobCount = useMemo(() => countJobs(filtered), [filtered]);

  const selected = useMemo(
    () => ALL.find((s) => s.id === selectedId) ?? null,
    [selectedId],
  );

  const patchFilters = useCallback((patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
  }, []);

  const reset = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const openCompany = useCallback((s: Startup) => setSelectedId(s.id), []);
  const openCompanyById = useCallback((id: string) => {
    setJobsOpen(false);
    setSelectedId(id);
  }, []);
  const closeCompany = useCallback(() => setSelectedId(null), []);

  const stats = useMemo(
    () => ({
      startups: filtered.filter((s) => s.type === "startup").length,
      vcs: filtered.filter((s) => s.type === "vc").length,
      jobs: visibleJobCount,
      areas: new Set(filtered.map((s) => s.location.area)).size,
      sectors: new Set(filtered.map((s) => s.sector)).size,
    }),
    [filtered, visibleJobCount],
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <Header
        startupCount={TOTALS.startups}
        vcCount={TOTALS.vcs}
        jobCount={TOTALS.jobs}
        onAbout={() => setAboutOpen(true)}
      />

      <FilterBar
        filters={filters}
        facets={FACETS}
        resultCount={filtered.length}
        jobCount={visibleJobCount}
        view={view}
        sort={sort}
        onFilters={patchFilters}
        onView={setView}
        onSort={setSort}
        onReset={reset}
        onOpenJobs={() => setJobsOpen(true)}
      />

      <main
        id="results"
        className="mx-auto w-full max-w-page flex-1 px-4 py-5 sm:px-6 lg:px-8"
      >
        <StatsBar stats={stats} />

        <div className="mt-5">
          {view === "map" ? (
            <MapView startups={filtered} onOpen={openCompany} />
          ) : (
            <GridView startups={sorted} onOpen={openCompany} onReset={reset} />
          )}
        </div>

        {view === "map" && filtered.length > 0 && (
          <p className="mt-3 text-[12.5px] text-ink-300">
            Showing {filtered.length} of {ALL.length} entries. Markers cluster when zoomed
            out — click a cluster to expand it, or switch to grid view to browse the cards.
          </p>
        )}
      </main>

      <Footer onAbout={() => setAboutOpen(true)} />

      <StartupModal startup={selected} onClose={closeCompany} />
      <JobsPanel
        open={jobsOpen}
        jobs={ALL_JOBS}
        onClose={() => setJobsOpen(false)}
        onOpenCompany={openCompanyById}
      />
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
