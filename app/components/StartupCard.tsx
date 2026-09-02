"use client";

import { memo } from "react";
import type { Startup } from "@/types";
import {
  CompanyAvatar,
  HiringBadge,
  LocationLine,
  PinTypeNote,
  SectorBadge,
  StageBadge,
  TypeBadge,
} from "./Primitives";

function StartupCard({
  startup,
  onOpen,
}: {
  startup: Startup;
  onOpen: (s: Startup) => void;
}) {
  const openRoles = startup.hiring ? startup.jobs.length : 0;

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`${startup.name} — view details`}
      onClick={() => onOpen(startup)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(startup);
        }
      }}
      className="card group flex cursor-pointer flex-col gap-3 p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <CompanyAvatar company={startup} size={44} />
        {openRoles > 0 && <HiringBadge count={openRoles} />}
      </div>

      <div>
        <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-ink-800 group-hover:text-saffron-600">
          {startup.name}
        </h3>
        <p className="mt-1 line-clamp-2-safe text-[13px] leading-relaxed text-ink-400">
          {startup.description}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <LocationLine area={startup.location.area} />
        {startup.founders.length > 0 && (
          <p className="text-[12.5px] text-ink-400">
            Founded by{" "}
            <span className="font-medium text-ink-600">
              {startup.founders.join(", ")}
            </span>
          </p>
        )}
        <PinTypeNote pinType={startup.location.pinType} />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <SectorBadge sector={startup.sector} />
        <StageBadge stage={startup.stage} />
        {startup.founded && <span className="badge-outline">{startup.founded}</span>}
        <TypeBadge type={startup.type} />
      </div>

      {startup.funding && (
        <p className="mt-auto border-t border-ink-50 pt-3 text-[12.5px] font-medium text-ink-500">
          {startup.funding}
        </p>
      )}
    </article>
  );
}

export default memo(StartupCard);
