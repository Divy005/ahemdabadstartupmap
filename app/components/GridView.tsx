"use client";

import type { Startup } from "@/types";
import StartupCard from "./StartupCard";
import { EmptyState } from "./Primitives";

export default function GridView({
  startups,
  onOpen,
  onReset,
}: {
  startups: Startup[];
  onOpen: (s: Startup) => void;
  onReset: () => void;
}) {
  if (startups.length === 0) {
    return (
      <EmptyState
        title="Nothing matches those filters"
        body="Try widening the area or sector, or clear the filters to see the whole ecosystem again."
        action={
          <button
            type="button"
            onClick={onReset}
            className="mt-2 h-9 rounded-full bg-saffron-500 px-4 text-[13px] font-semibold text-white hover:bg-saffron-600"
          >
            Reset filters
          </button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {startups.map((s) => (
        <StartupCard key={s.id} startup={s} onOpen={onOpen} />
      ))}
    </div>
  );
}
