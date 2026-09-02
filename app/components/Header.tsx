"use client";

import { SUBMIT_FORM_URL } from "@/lib/constants";

export default function Header({
  startupCount,
  vcCount,
  jobCount,
  onAbout,
}: {
  startupCount: number;
  vcCount: number;
  jobCount: number;
  onAbout: () => void;
}) {
  return (
    <header className="border-b border-ink-100 bg-white">
      <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-[17px] font-semibold tracking-tight text-ink-800 sm:text-lg">
            <span aria-hidden="true">📍</span>
            Ahmedabad Startup Map
          </h1>
          <p className="mt-0.5 truncate text-[12.5px] text-ink-400">
            Discover{" "}
            <strong className="font-semibold text-ink-600">{startupCount}</strong> startups,{" "}
            <strong className="font-semibold text-ink-600">{vcCount}</strong> VC firms &amp;{" "}
            <strong className="font-semibold text-ink-600">{jobCount}</strong> open positions
            across Ahmedabad
          </p>
        </div>

        <nav className="flex shrink-0 items-center gap-1.5" aria-label="Primary">
          <button
            type="button"
            onClick={onAbout}
            className="hidden h-9 items-center rounded-full px-3.5 text-[13px] font-medium text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-700 sm:inline-flex"
          >
            About
          </button>
          <a
            href={SUBMIT_FORM_URL}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-saffron-500 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-saffron-600"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
              <path d="M8 2.5a.75.75 0 0 1 .75.75v4h4a.75.75 0 0 1 0 1.5h-4v4a.75.75 0 0 1-1.5 0v-4h-4a.75.75 0 0 1 0-1.5h4v-4A.75.75 0 0 1 8 2.5Z" />
            </svg>
            Submit
          </a>
        </nav>
      </div>
    </header>
  );
}
