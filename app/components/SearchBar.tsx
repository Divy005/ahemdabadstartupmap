"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Controlled-with-local-echo search input. Keystrokes render instantly while
 * the parent (and therefore the URL and the map) only updates every 300ms.
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = "Search startups, founders, sectors…",
  className,
  id = "search",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}) {
  const [local, setLocal] = useState(value);
  const latest = useRef(onChange);
  latest.current = onChange;

  // Adopt external resets (e.g. the "Reset" link) without fighting the user.
  useEffect(() => {
    setLocal((cur) => (cur === value ? cur : value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (local === value) return;
    const t = setTimeout(() => latest.current(local), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return (
    <div className={className}>
      <label htmlFor={id} className="sr-only">
        Search
      </label>
      <div className="relative">
        <svg
          viewBox="0 0 16 16"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M7.2 1.8a5.4 5.4 0 1 0 3.28 9.68l2.52 2.52a.85.85 0 0 0 1.2-1.2l-2.52-2.52A5.4 5.4 0 0 0 7.2 1.8Zm0 1.7a3.7 3.7 0 1 1 0 7.4 3.7 3.7 0 0 1 0-7.4Z" />
        </svg>
        <input
          id={id}
          type="search"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="h-9 w-full rounded-full border border-ink-100 bg-white pl-9 pr-8 text-[13px] text-ink-700 placeholder:text-ink-300 transition-colors hover:border-ink-200 focus:border-saffron-400"
        />
        {local && (
          <button
            type="button"
            onClick={() => setLocal("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-300 hover:bg-ink-50 hover:text-ink-600"
          >
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden="true">
              <path d="M3.7 2.6 8 6.9l4.3-4.3a.78.78 0 1 1 1.1 1.1L9.1 8l4.3 4.3a.78.78 0 1 1-1.1 1.1L8 9.1l-4.3 4.3a.78.78 0 1 1-1.1-1.1L6.9 8 2.6 3.7a.78.78 0 1 1 1.1-1.1Z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
