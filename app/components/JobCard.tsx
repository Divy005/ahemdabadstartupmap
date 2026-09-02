"use client";

import { memo } from "react";
import type { JobListing } from "@/types";
import { CompanyAvatar, JobTypeBadge, LocationLine } from "./Primitives";

function JobCard({
  job,
  onOpenCompany,
}: {
  job: JobListing;
  onOpenCompany: (companyId: string) => void;
}) {
  return (
    <li className="card flex items-center gap-3.5 p-3.5 transition-shadow hover:shadow-card-hover">
      <CompanyAvatar
        company={{ name: job.companyName, sector: job.sector, logo: job.companyLogo }}
        size={40}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold leading-snug text-ink-800">
          {job.title}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <button
            type="button"
            onClick={() => onOpenCompany(job.companyId)}
            className="text-[13px] font-medium text-ink-500 underline-offset-2 hover:text-saffron-600 hover:underline"
          >
            {job.companyName}
          </button>
          <LocationLine area={job.area} className="text-[12.5px]" />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <JobTypeBadge type={job.type} />
          <span className="badge-outline">{job.sector}</span>
          {job.team && (
            <span className="hidden text-[11.5px] text-ink-300 sm:inline">{job.team}</span>
          )}
        </div>
      </div>

      <a
        href={job.link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 shrink-0 items-center rounded-full bg-saffron-500 px-3.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-saffron-600"
        aria-label={`Apply for ${job.title} at ${job.companyName}`}
      >
        Apply →
      </a>
    </li>
  );
}

export default memo(JobCard);
