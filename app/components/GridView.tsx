"use client";

import { useEffect, useMemo, useState } from "react";
import type { Startup } from "@/types";
import StartupCard from "./StartupCard";
import { EmptyState } from "./Primitives";

const PAGE = 60;

export default function GridView({
  startups,
  onOpen,
  onReset,
}: {
  startups: Startup[];
  onOpen: (s: Startup) => void;
  onReset: () => void;
}) {
  // Render in pages so a few thousand entries don't all hit the DOM at once.
  const [shown, setShown] = useState(PAGE);

  // Any change to the result set starts the paging over.
  const signature = useMemo(
    () => `${startups.length}:${startups[0]?.id ?? ""}:${startups[startups.length - 1]?.id ?? ""}`,
    [startups],
  );
  useEffect(() => setShown(PAGE), [signature]);

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

  const visible = startups.slice(0, shown);
  const remaining = startups.length - visible.length;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((s) => (
          <StartupCard key={s.id} startup={s} onOpen={onOpen} />
        ))}
      </div>

      {remaining > 0 && (
        <div className="mt-6 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setShown((n) => n + PAGE)}
            className="h-10 rounded-full border border-ink-100 bg-white px-6 text-[13px] font-semibold text-ink-600 shadow-card transition-colors hover:border-ink-200 hover:bg-ink-50"
          >
            Show {Math.min(PAGE, remaining)} more
          </button>
          <p className="text-[12px] text-ink-300">
            Showing {visible.length} of {startups.length}
          </p>
        </div>
      )}
    </>
  );
}
