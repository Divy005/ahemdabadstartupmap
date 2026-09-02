"use client";

import { memo, useEffect, useState } from "react";
import type { Startup } from "@/types";
import { logoUrl } from "@/lib/logo";
import {
  JOB_TYPE_LABELS,
  JOB_TYPE_STYLES,
  SECTOR_STYLES,
} from "@/lib/constants";
import { avatarColor, cx, initials } from "@/lib/utils";

/**
 * Company mark. Falls back to a sector-tinted letter avatar, which is what
 * almost every entry uses — we do not ship third-party logo files.
 */
export const CompanyAvatar = memo(function CompanyAvatar({
  company,
  size = 44,
  className,
}: {
  company: Pick<Startup, "name" | "sector" | "logo" | "website">;
  size?: number;
  className?: string;
}) {
  const color = avatarColor(company);
  const src = logoUrl(company, size * 2);
  const [failed, setFailed] = useState(false);

  // A different company can land in the same memoised slot; clear the old
  // failure so its logo gets a fresh attempt.
  useEffect(() => setFailed(false), [src]);

  const letterAvatar = (
    <span
      aria-hidden="true"
      className={cx(
        "inline-flex shrink-0 select-none items-center justify-center rounded-lg font-semibold tracking-tight",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: `${color}14`,
        color,
        border: `1px solid ${color}26`,
        fontSize: Math.round(size * 0.36),
      }}
    >
      {initials(company.name)}
    </span>
  );

  if (!src || failed) return letterAvatar;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading="lazy"
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className={cx(
        "shrink-0 rounded-lg border border-ink-100 bg-white object-contain p-0.5",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
});

export function SectorBadge({ sector }: { sector: string }) {
  return (
    <span className={cx("badge", SECTOR_STYLES[sector] ?? SECTOR_STYLES.Other)}>
      {sector}
    </span>
  );
}

export function StageBadge({ stage }: { stage: string }) {
  return <span className="badge-outline">{stage}</span>;
}

export function JobTypeBadge({ type }: { type: string }) {
  return (
    <span className={cx("badge", JOB_TYPE_STYLES[type] ?? JOB_TYPE_STYLES["full-time"])}>
      {JOB_TYPE_LABELS[type] ?? type}
    </span>
  );
}

export function HiringBadge({ count }: { count: number }) {
  return (
    <span className="badge bg-red-50 text-red-700 ring-red-200">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-red-500" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-600" />
      </span>
      {count} open {count === 1 ? "role" : "roles"}
    </span>
  );
}

/** ● precise office pin · ◌ area-level pin */
export function PinTypeNote({
  pinType,
  className,
}: {
  pinType: "precise" | "area";
  className?: string;
}) {
  const precise = pinType === "precise";
  return (
    <span
      className={cx("inline-flex items-center gap-1.5 text-[11px] text-ink-300", className)}
      title={
        precise
          ? "Mapped to the company's office address"
          : "Mapped to the centre of the neighbourhood, not an exact address"
      }
    >
      <span aria-hidden="true" className={precise ? "text-blue-600" : "text-amber-500"}>
        {precise ? "●" : "◌"}
      </span>
      {precise ? "precise office pin" : "area-level pin"}
    </span>
  );
}

export function TypeBadge({ type }: { type: Startup["type"] }) {
  if (type !== "vc") return null;
  return (
    <span className="badge bg-purple-50 text-purple-700 ring-purple-200">
      VC / Incubator
    </span>
  );
}

export function LocationLine({
  area,
  className,
}: {
  area: string;
  className?: string;
}) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 text-[13px] text-ink-400", className)}>
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" aria-hidden="true" fill="currentColor">
        <path d="M8 1.5a4.5 4.5 0 0 0-4.5 4.5c0 3.2 3.86 7.9 4.03 8.1a.6.6 0 0 0 .94 0C8.64 13.9 12.5 9.2 12.5 6A4.5 4.5 0 0 0 8 1.5Zm0 6.3A1.8 1.8 0 1 1 8 4.2a1.8 1.8 0 0 1 0 3.6Z" />
      </svg>
      {area}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink-200 bg-white/60 px-6 py-16 text-center">
      <p className="text-base font-semibold text-ink-700">{title}</p>
      <p className="max-w-sm text-sm text-ink-400">{body}</p>
      {action}
    </div>
  );
}
