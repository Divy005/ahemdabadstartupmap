"use client";

import { useEffect } from "react";
import { DATA_UPDATED, ISSUE_URL, SUBMIT_FORM_URL } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default function AboutModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 animate-fade-in bg-ink-900/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
        className="relative max-h-[88vh] w-full max-w-lg animate-slide-up overflow-y-auto rounded-t-2xl bg-white p-6 shadow-panel sm:rounded-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-2 text-ink-400 hover:bg-ink-50 hover:text-ink-700"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M3.7 2.6 8 6.9l4.3-4.3a.78.78 0 1 1 1.1 1.1L9.1 8l4.3 4.3a.78.78 0 1 1-1.1 1.1L8 9.1l-4.3 4.3a.78.78 0 1 1-1.1-1.1L6.9 8 2.6 3.7a.78.78 0 1 1 1.1-1.1Z" />
          </svg>
        </button>

        <h2 id="about-title" className="text-lg font-semibold tracking-tight text-ink-800">
          About this map
        </h2>

        <div className="mt-3 space-y-3.5 text-[13.5px] leading-relaxed text-ink-500">
          <p>
            An open directory of the companies, investors and incubators building out of
            Ahmedabad — for founders looking for peers, students looking for a first job,
            and investors looking for deal flow.
          </p>

          <div>
            <h3 className="text-[13px] font-semibold text-ink-700">How the data is put together</h3>
            <ul className="mt-1.5 list-disc space-y-1 pl-4">
              <li>
                Entries are compiled from public sources: company websites, press coverage,
                exchange filings and public incubator portfolios.
              </li>
              <li>
                A <strong className="font-semibold text-ink-600">precise pin</strong> means we
                mapped a published office address. An{" "}
                <strong className="font-semibold text-ink-600">area-level pin</strong> means we
                only know the neighbourhood, so the marker sits at its centre — it is not the
                company&rsquo;s doorstep.
              </li>
              <li>
                Funding lines describe what has been publicly reported. Where no reliable figure
                exists we describe the backing instead of inventing a number.
              </li>
              <li>
                Job listings are curated pointers into each company&rsquo;s careers page, not a
                live requisition feed. Confirm the role on the company site before applying.
              </li>
              <li>
                Only companies headquartered in or around Ahmedabad are included. Companies with
                a satellite office here but headquarters elsewhere are deliberately left out.
              </li>
            </ul>
          </div>

          <p>
            Something wrong, missing or out of date? That is expected in a community dataset —
            please tell us and it gets fixed.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <a
            href={SUBMIT_FORM_URL}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-saffron-500 text-[13px] font-semibold text-white hover:bg-saffron-600"
          >
            Submit a startup
          </a>
          <a
            href={ISSUE_URL}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-ink-100 text-[13px] font-semibold text-ink-600 hover:bg-ink-50"
          >
            Report a correction
          </a>
        </div>

        <p className="mt-4 text-[11.5px] text-ink-300">
          Data last updated {formatDate(DATA_UPDATED)}. Map tiles &copy; OpenStreetMap
          contributors.
        </p>
      </div>
    </div>
  );
}
