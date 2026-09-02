"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Startup } from "@/types";
import { hostname } from "@/lib/utils";
import {
  CompanyAvatar,
  HiringBadge,
  JobTypeBadge,
  PinTypeNote,
  SectorBadge,
  StageBadge,
  TypeBadge,
} from "./Primitives";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-300">
        {label}
      </dt>
      <dd className="mt-0.5 text-[13.5px] text-ink-700">{children}</dd>
    </div>
  );
}

export default function StartupModal({
  startup,
  onClose,
}: {
  startup: Startup | null;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const nodes = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
    ).filter((n) => n.offsetParent !== null);
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  useEffect(() => {
    if (!startup) return;
    restoreTo.current = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      trapFocus(e);
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the dialog itself rather than its first link: screen readers still
    // land inside the dialog, but mouse users do not get a stray focus ring.
    const t = window.setTimeout(() => panelRef.current?.focus(), 30);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
      restoreTo.current?.focus?.();
    };
  }, [startup, onClose, trapFocus]);

  if (!startup) return null;

  const openRoles = startup.hiring ? startup.jobs : [];

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
        tabIndex={-1}
        aria-labelledby="startup-modal-title"
        className="absolute inset-0 flex animate-slide-up flex-col bg-white shadow-panel sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[min(520px,100vw)] sm:animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-ink-100 px-5 py-4">
          <CompanyAvatar company={startup} size={48} />
          <div className="min-w-0 flex-1">
            <h2
              id="startup-modal-title"
              className="truncate text-lg font-semibold tracking-tight text-ink-800"
            >
              {startup.name}
            </h2>
            {startup.website ? (
            <a
              href={startup.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 text-[13px] font-medium text-saffron-600 hover:underline"
            >
              {hostname(startup.website)}
              <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden="true">
                <path d="M6.25 3.5a.75.75 0 0 0 0 1.5h2.19L4.22 9.22a.75.75 0 1 0 1.06 1.06L9.5 6.06v2.19a.75.75 0 0 0 1.5 0V4.25a.75.75 0 0 0-.75-.75H6.25Z" />
                <path d="M3.5 5.75A2.25 2.25 0 0 1 5.75 3.5h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 0-.75.75v4.5c0 .41.34.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.5a.75.75 0 0 1 1.5 0v.5a2.25 2.25 0 0 1-2.25 2.25h-4.5A2.25 2.25 0 0 1 3.5 10.25v-4.5Z" />
              </svg>
            </a>
            ) : (
              <p className="mt-0.5 text-[12.5px] text-ink-300">No website on record</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="-mr-1.5 -mt-1 shrink-0 rounded-full p-2.5 text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-700"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M3.7 2.6 8 6.9l4.3-4.3a.78.78 0 1 1 1.1 1.1L9.1 8l4.3 4.3a.78.78 0 1 1-1.1 1.1L8 9.1l-4.3 4.3a.78.78 0 1 1-1.1-1.1L6.9 8 2.6 3.7a.78.78 0 1 1 1.1-1.1Z" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="flex flex-wrap items-center gap-1.5">
            <SectorBadge sector={startup.sector} />
            <StageBadge stage={startup.stage} />
            <TypeBadge type={startup.type} />
            {openRoles.length > 0 && <HiringBadge count={openRoles.length} />}
          </div>

          <p className="mt-4 text-[14px] leading-relaxed text-ink-600">
            {startup.description}
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 rounded-lg border border-ink-100 bg-ink-50/40 p-4">
            <InfoRow label="Sector">{startup.sector}</InfoRow>
            <InfoRow label="Stage">{startup.stage}</InfoRow>
            <InfoRow label="Founded">{startup.founded ?? "—"}</InfoRow>
            <InfoRow label="Type">
              {startup.type === "vc" ? "VC firm / Incubator" : "Startup"}
            </InfoRow>
            <div className="col-span-2">
              <InfoRow label="Location">
                {startup.location.area}
                <span className="mt-0.5 block text-[12.5px] text-ink-400">
                  {startup.location.address}
                </span>
                <PinTypeNote pinType={startup.location.pinType} className="mt-1" />
              </InfoRow>
            </div>
            {startup.founders.length > 0 && (
              <div className="col-span-2">
                <InfoRow label={startup.founders.length > 1 ? "Founders" : "Founder"}>
                  {startup.founders.join(", ")}
                </InfoRow>
              </div>
            )}
            {startup.funding && (
              <div className="col-span-2">
                <InfoRow label="Funding">{startup.funding}</InfoRow>
              </div>
            )}
          </dl>

          {openRoles.length > 0 && (
            <section className="mt-6" aria-labelledby="modal-jobs">
              <h3
                id="modal-jobs"
                className="flex items-center gap-2 text-[13px] font-semibold text-ink-700"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
                {openRoles.length} open {openRoles.length === 1 ? "position" : "positions"}
              </h3>
              <ul className="mt-2.5 divide-y divide-ink-50 overflow-hidden rounded-lg border border-ink-100">
                {openRoles.map((job) => (
                  <li
                    key={`${job.title}-${job.type}`}
                    className="flex items-center justify-between gap-3 bg-white px-3.5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-medium text-ink-700">
                        {job.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <JobTypeBadge type={job.type} />
                        {job.team && (
                          <span className="text-[11.5px] text-ink-300">{job.team}</span>
                        )}
                      </div>
                    </div>
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 shrink-0 items-center rounded-full border border-ink-100 px-3 text-[12.5px] font-semibold text-ink-600 transition-colors hover:border-saffron-300 hover:bg-saffron-50 hover:text-saffron-700"
                    >
                      Apply →
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11.5px] text-ink-300">
                Roles link to the company&rsquo;s careers page. Confirm the opening there
                before applying.
              </p>
            </section>
          )}

          {startup.source && (
            <p className="mt-5 rounded-lg bg-ink-50/70 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-ink-400">
              Source: {startup.source}
            </p>
          )}

          {startup.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {startup.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-ink-50 px-2.5 py-1 text-[11.5px] font-medium text-ink-500"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {startup.website && (
          <div className="border-t border-ink-100 px-5 py-3.5">
            <a
              href={startup.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-full items-center justify-center rounded-full bg-ink-600 text-sm font-semibold text-white transition-colors hover:bg-ink-700"
            >
              Visit {startup.name}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
