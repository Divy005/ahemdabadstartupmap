"use client";

import { DATA_UPDATED, ISSUE_URL, SUBMIT_FORM_URL } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default function Footer({ onAbout }: { onAbout: () => void }) {
  return (
    <footer className="mt-12 border-t border-ink-100 bg-white">
      <div className="mx-auto max-w-page px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-ink-800">
              <span aria-hidden="true">📍</span>
              Ahmedabad Startup Map
            </p>
            <p className="mt-1 max-w-md text-[13px] leading-relaxed text-ink-400">
              Built for the Ahmedabad startup ecosystem — an open, community-maintained
              directory of the people and companies building here.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
            <button
              type="button"
              onClick={onAbout}
              className="font-medium text-ink-500 underline-offset-2 hover:text-saffron-600 hover:underline"
            >
              About
            </button>
            <a
              href={SUBMIT_FORM_URL}
              className="font-medium text-ink-500 underline-offset-2 hover:text-saffron-600 hover:underline"
            >
              Submit a startup
            </a>
            <a
              href={ISSUE_URL}
              className="font-medium text-ink-500 underline-offset-2 hover:text-saffron-600 hover:underline"
            >
              Report an issue
            </a>
            <button
              type="button"
              onClick={onAbout}
              className="font-medium text-ink-500 underline-offset-2 hover:text-saffron-600 hover:underline"
            >
              Data methodology
            </button>
          </nav>
        </div>

        <div className="mt-6 flex flex-col gap-1.5 border-t border-ink-50 pt-5 text-[12px] text-ink-300 sm:flex-row sm:items-center sm:justify-between">
          <p>Data last updated {formatDate(DATA_UPDATED)}.</p>
          <p>
            Map data &copy;{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 hover:underline"
            >
              OpenStreetMap
            </a>{" "}
            contributors. A community project — not affiliated with any listed company.
          </p>
        </div>
      </div>
    </footer>
  );
}
