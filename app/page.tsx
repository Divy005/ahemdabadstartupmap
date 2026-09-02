import { Suspense } from "react";
import startups from "@/data/startups.json";
import type { Startup } from "@/types";
import { countJobs } from "@/lib/utils";
import Explorer from "./components/Explorer";

const all = startups as Startup[];

/**
 * Structured data so the directory is legible to search engines even though
 * the interactive surface is client-rendered.
 */
function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ahmedabad Startup Map",
    description: `${all.length} startups, VC firms and incubators based in and around Ahmedabad, Gujarat, with ${countJobs(all)} open roles.`,
    numberOfItems: all.length,
    itemListElement: all.slice(0, 60).map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Organization",
        name: s.name,
        url: s.website,
        description: s.description,
        foundingDate: s.founded ? String(s.founded) : undefined,
        address: {
          "@type": "PostalAddress",
          addressLocality: s.location.area,
          addressRegion: "Gujarat",
          addressCountry: "IN",
        },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function Page() {
  return (
    <>
      <JsonLd />
      <Suspense
        fallback={
          <div className="flex min-h-dvh items-center justify-center">
            <p className="text-sm text-ink-400">Loading the Ahmedabad startup map…</p>
          </div>
        }
      >
        <Explorer />
      </Suspense>
    </>
  );
}
