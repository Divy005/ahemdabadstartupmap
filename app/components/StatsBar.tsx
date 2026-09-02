"use client";

export interface Stats {
  startups: number;
  vcs: number;
  jobs: number;
  areas: number;
  sectors: number;
}

const ITEMS: { key: keyof Stats; label: string }[] = [
  { key: "startups", label: "Startups" },
  { key: "vcs", label: "VC firms & incubators" },
  { key: "jobs", label: "Open roles" },
  { key: "areas", label: "Areas covered" },
  { key: "sectors", label: "Sectors" },
];

export default function StatsBar({ stats }: { stats: Stats }) {
  return (
    <dl className="flex divide-x divide-ink-100 overflow-x-auto rounded-xl border border-ink-100 bg-white no-scrollbar lg:grid lg:grid-cols-5 lg:overflow-visible">
      {ITEMS.map((item) => (
        <div key={item.key} className="min-w-[132px] shrink-0 px-4 py-3 lg:min-w-0">
          <dt className="truncate text-[11px] font-semibold uppercase tracking-wide text-ink-300">
            {item.label}
          </dt>
          <dd className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-ink-800">
            {stats[item.key]}
          </dd>
        </div>
      ))}
    </dl>
  );
}
