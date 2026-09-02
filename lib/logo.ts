import type { Startup } from "@/types";

/**
 * Logo strategy, in order:
 *   1. An explicit `logo` path in the dataset (a file under /public/logos).
 *   2. Clearbit's logo endpoint, keyed on the company's own domain. It returns
 *      a real 404 for unknown domains, so the <img> onError fallback fires and
 *      the letter avatar takes over — unlike favicon services, which hand back
 *      a generic globe and leave you unable to tell a hit from a miss.
 *   3. Nothing, and the caller renders a sector-tinted letter avatar.
 *
 * Nothing is bundled or fetched at build time: 1,000+ logo files would bloat
 * the repo, so these resolve in the browser and degrade cleanly when offline.
 */
export function logoUrl(
  company: Pick<Startup, "logo" | "website">,
  size = 128,
): string | null {
  if (company.logo) return company.logo;
  try {
    const host = new URL(company.website).hostname.replace(/^www\./, "");
    if (!host || !host.includes(".")) return null;
    return `https://logo.clearbit.com/${host}?size=${size}`;
  } catch {
    return null;
  }
}
