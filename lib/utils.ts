import type {
  Filters,
  Job,
  JobFilters,
  JobListing,
  SortKey,
  Startup,
} from "@/types";
import { SECTOR_HEX } from "./constants";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const EMPTY_FILTERS: Filters = {
  q: "",
  type: "all",
  area: "all",
  sector: "all",
  stage: "all",
  hiring: false,
};

export const EMPTY_JOB_FILTERS: JobFilters = {
  q: "",
  jobType: "all",
  sector: "all",
  area: "all",
  sort: "company",
};

/** Fields a free-text search should look through. */
function searchCorpus(s: Startup) {
  return [
    s.name,
    s.description,
    s.sector,
    s.stage,
    s.location.area,
    ...s.founders,
    ...s.tags,
    ...s.jobs.map((j) => j.title),
  ]
    .join(" ")
    .toLowerCase();
}

export function filterStartups(all: Startup[], f: Filters): Startup[] {
  const q = f.q.trim().toLowerCase();
  return all.filter((s) => {
    if (f.type !== "all" && s.type !== f.type) return false;
    if (f.area !== "all" && s.location.area !== f.area) return false;
    if (f.sector !== "all" && s.sector !== f.sector) return false;
    if (f.stage !== "all" && s.stage !== f.stage) return false;
    if (f.hiring && !(s.hiring && s.jobs.length > 0)) return false;
    if (q && !searchCorpus(s).includes(q)) return false;
    return true;
  });
}

/**
 * Rough ordering key for the "most funded" sort. We only have human-written
 * funding strings, so this reads the largest currency figure it can find and
 * otherwise falls back to a stage ranking.
 */
const STAGE_RANK: Record<string, number> = {
  "Pre-seed": 1,
  Bootstrapped: 2,
  Seed: 3,
  "Series A": 4,
  "Series B": 5,
  "Series C+": 6,
  "Series D": 7,
  Acquired: 8,
  Public: 9,
};

function fundingScore(s: Startup): number {
  const raw = s.funding ?? "";
  const match = raw.match(/([\d.]+)\s*(million|billion|crore|M\b|B\b)/i);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    if (unit.startsWith("b")) return value * 1000;
    if (unit.startsWith("cr")) return value / 8.3; // crore INR -> ~USD millions
    return value;
  }
  return (STAGE_RANK[s.stage] ?? 0) * 0.001;
}

export function sortStartups(list: Startup[], key: SortKey): Startup[] {
  const out = [...list];
  switch (key) {
    case "newest":
      return out.sort(
        (a, b) => (b.founded ?? 0) - (a.founded ?? 0) || a.name.localeCompare(b.name),
      );
    case "funding":
      return out.sort(
        (a, b) => fundingScore(b) - fundingScore(a) || a.name.localeCompare(b.name),
      );
    case "jobs":
      return out.sort(
        (a, b) => b.jobs.length - a.jobs.length || a.name.localeCompare(b.name),
      );
    case "alphabetical":
    default:
      return out.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export function flattenJobs(all: Startup[]): JobListing[] {
  const out: JobListing[] = [];
  for (const s of all) {
    if (!s.hiring) continue;
    for (const job of s.jobs) {
      out.push({
        ...job,
        companyId: s.id,
        companyName: s.name,
        companyLogo: s.logo,
        companyWebsite: s.website,
        sector: s.sector,
        area: s.location.area,
        stage: s.stage,
      });
    }
  }
  return out;
}

export function filterJobs(all: JobListing[], f: JobFilters): JobListing[] {
  const q = f.q.trim().toLowerCase();
  const filtered = all.filter((j) => {
    if (f.jobType !== "all" && j.type !== f.jobType) return false;
    if (f.sector !== "all" && j.sector !== f.sector) return false;
    if (f.area !== "all" && j.area !== f.area) return false;
    if (q && !`${j.title} ${j.companyName} ${j.team ?? ""}`.toLowerCase().includes(q))
      return false;
    return true;
  });

  return filtered.sort((a, b) => {
    if (f.sort === "title") return a.title.localeCompare(b.title);
    if (f.sort === "type")
      return a.type.localeCompare(b.type) || a.companyName.localeCompare(b.companyName);
    return a.companyName.localeCompare(b.companyName) || a.title.localeCompare(b.title);
  });
}

export function countJobs(all: Startup[]): number {
  return all.reduce((n, s) => n + (s.hiring ? s.jobs.length : 0), 0);
}

export function jobTypeCounts(jobs: Job[]): Record<string, number> {
  return jobs.reduce<Record<string, number>>((acc, j) => {
    acc[j.type] = (acc[j.type] ?? 0) + 1;
    return acc;
  }, {});
}

/** Deterministic accent colour for a company without a logo file. */
export function avatarColor(s: Pick<Startup, "sector" | "name">) {
  return SECTOR_HEX[s.sector] ?? SECTOR_HEX.Other;
}

export function initials(name: string) {
  const words = name.replace(/[^A-Za-z0-9 ]/g, " ").trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Filters -> URLSearchParams, omitting anything still at its default. */
export function filtersToParams(f: Filters, extra: Record<string, string> = {}) {
  const params = new URLSearchParams();
  if (f.q.trim()) params.set("q", f.q.trim());
  if (f.type !== "all") params.set("type", f.type);
  if (f.area !== "all") params.set("area", f.area);
  if (f.sector !== "all") params.set("sector", f.sector);
  if (f.stage !== "all") params.set("stage", f.stage);
  if (f.hiring) params.set("hiring", "true");
  for (const [k, v] of Object.entries(extra)) {
    if (v) params.set(k, v);
  }
  return params;
}

export function paramsToFilters(params: URLSearchParams): Filters {
  return {
    q: params.get("q") ?? "",
    type: params.get("type") ?? "all",
    area: params.get("area") ?? "all",
    sector: params.get("sector") ?? "all",
    stage: params.get("stage") ?? "all",
    hiring: params.get("hiring") === "true",
  };
}

export function activeFilterCount(f: Filters): number {
  let n = 0;
  if (f.q.trim()) n++;
  if (f.type !== "all") n++;
  if (f.area !== "all") n++;
  if (f.sector !== "all") n++;
  if (f.stage !== "all") n++;
  if (f.hiring) n++;
  return n;
}

export function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
