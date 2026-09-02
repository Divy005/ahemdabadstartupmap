# Ahmedabad Startup Map

An open directory of the startups, VC firms and incubators building out of
Ahmedabad, Gujarat — on an interactive map, in a browsable grid, and with a
dedicated jobs board for every open role in the ecosystem.

Built with Next.js 14 (App Router), Tailwind CSS and Leaflet. No API keys, no
paid services: map tiles come from OpenStreetMap and the dataset is a plain
JSON file.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

Deploys to Vercel as-is — it is a fully static export of one route.

## What's in it

| Surface | What it does |
| --- | --- |
| **Map view** | Leaflet + OpenStreetMap, clustered markers, colour-coded by pin precision and entity type. Respects every active filter. |
| **Grid view** | Responsive card grid with sorting by name, founding year, funding or number of open roles. |
| **Filters** | Free-text search (debounced), plus type, area, sector, stage and "hiring now". All of it is client-side and reflected in the URL. |
| **Detail panel** | Full company record — founders, funding, address, pin precision, tags, and every open role with an apply link. |
| **Jobs panel** | Every open role across the ecosystem in one place, filterable by job type, sector and area. This is the piece the other city maps don't have. |

### Shareable URLs

Filter state lives in the query string, so any view can be linked:

```
/?sector=AI&hiring=true
/?area=SG+Highway&view=grid&sort=newest
/?company=petpooja
/?jobs=open
```

Recognised params: `q`, `type`, `area`, `sector`, `stage`, `hiring`, `view`,
`sort`, `company`, `jobs`.

## Project layout

```
app/
  layout.tsx            root layout, fonts, metadata
  page.tsx              server shell + JSON-LD
  opengraph-image.tsx   generated OG card
  globals.css           Tailwind layers + Leaflet overrides
  components/
    Explorer.tsx        client orchestration: state, URL sync, data wiring
    Header.tsx  FilterBar.tsx  SearchBar.tsx  ViewToggle.tsx
    MapView.tsx  MapLegend.tsx
    GridView.tsx  StartupCard.tsx  StartupModal.tsx
    JobsPanel.tsx  JobCard.tsx
    StatsBar.tsx  AboutModal.tsx  Footer.tsx  Primitives.tsx
data/startups.json      the dataset
lib/constants.ts        areas, sectors, stages, palettes, marker colours
lib/utils.ts            filtering, sorting, URL <-> state, formatting
types/index.ts          shared interfaces
```

## Bulk import (getting to 1,000+ entries)

`data/startups.json` ships with a small hand-checked seed. To scale it up, get a
directory export and run it through the importer:

```bash
npm run import -- path/to/export.csv --merge
```

### Getting to 1,000+: the Startup India register

Public funding datasets top out at a few dozen Ahmedabad companies. The only
source at the thousands scale is the **DPIIT / Startup India register** (~13,600
recognised startups in Gujarat), and it is behind a JavaScript-rendered search
page with no public bulk export.

`scripts/startup-india-extract.js` harvests it from your own browser:

1. Open `startupindia.gov.in/content/sih/en/search.html`, filter to
   Role = Startup, State = Gujarat, City = Ahmedabad.
2. DevTools → Console → paste the whole file → Enter.
3. It pages through the results at one page per 1.5s and downloads
   `startup-india-ahmedabad.csv`.
4. `npm run import -- startup-india-ahmedabad.csv --merge --geocode --email you@example.com`

Keep the pacing as it is — it holds the request rate to roughly what a person
clicking through would generate. If the site's markup has changed, the script
says so and points at the selector block to update.

Other sources you can export or scrape:

- **Startup India (DPIIT)** — `startupindia.gov.in`, filter State=Gujarat,
  City=Ahmedabad, Role=Startup. The official recognised-startup register.
- **i-Hub Gujarat** — `ihubgujarat.in/startupdirectory`, the state government's
  own directory.
- **StartupBlink** — ~900 Ahmedabad entries.
- Any Tracxn / Crunchbase / LinkedIn export, or your own spreadsheet.

The importer accepts CSV or JSON and is tolerant about column names — it maps
`Company Name`, `startup_name`, `entityName` and friends onto the schema (see
`FIELD_ALIASES` in the script). What it does per row:

| Step | Behaviour |
| --- | --- |
| Sector | Uses the input column when it matches a known sector, else infers from the description via keyword rules. |
| Stage | Same: explicit value wins, else inferred from funding/description text. |
| Area | Matches the address against the 24 known areas plus ~40 aliases (`Isanpur` → Maninagar, `Sola` → Science City). Sub-localities win over their parent, so "GIFT City, Gandhinagar" resolves to GIFT City. |
| Coordinates | With `--geocode`, calls OpenStreetMap Nominatim (cached on disk, 1 req/sec) and tags the pin `precise`. Otherwise — or on a miss, or a hit outside Ahmedabad's bounding box — falls back to the area centroid with a deterministic sub-km offset and tags the pin `area`. |
| Dedupe | By website domain first, then normalised name. |
| Validation | Rows without a usable name or website are dropped and reported. |

Options:

```
--geocode           resolve real addresses through Nominatim
--email you@x.com   contact address for Nominatim (required with --geocode)
--limit N           only process the first N rows
--merge             add to the existing dataset instead of replacing it
--out PATH          output file (default data/startups.json)
--dry-run           report only, write nothing
```

Geocoding 1,000 rows takes roughly 20 minutes at Nominatim's 1 req/sec policy
limit. The cache in `.geocode-cache.json` means re-runs are instant, so start
with `--dry-run`, check the reported sector/area distribution, then commit to a
full geocoding pass.

A dry run first is worth it:

```bash
npm run import -- export.csv --dry-run
```

### Logos

Logos are not bundled. `lib/logo.ts` resolves them at render time from each
company's own domain via Clearbit, and falls back to a sector-tinted letter
avatar when there's no match — so a 1,000-entry dataset needs no logo files and
no broken images. An explicit `"logo": "/logos/name.png"` in the dataset always
wins if you'd rather self-host one.

## Editing the data

Everything lives in `data/startups.json`. One object per company:

```jsonc
{
  "id": "petpooja",                 // stable slug, used in URLs
  "name": "Petpooja",
  "description": "…",               // 1–2 sentences
  "sector": "SaaS",                 // must be in lib/constants.ts SECTORS
  "stage": "Series B",              // must be in STAGES
  "type": "startup",                // "startup" | "vc"
  "founded": 2011,
  "founders": ["…"],                // may be empty if unverified
  "funding": "Backed by …",          // free text, not parsed except for sorting
  "website": "https://…",
  "location": {
    "area": "SG Highway",           // must be in AREAS
    "address": "…",
    "lat": 23.0341,
    "lng": 72.5062,
    "pinType": "area"               // "precise" | "area"
  },
  "hiring": true,
  "jobs": [{ "title": "…", "type": "full-time", "link": "https://…" }],
  "tags": ["…"],
  "featured": true                  // optional
}
```

Filter dropdowns are built from the values actually present in the data, so
adding a new area or sector to `lib/constants.ts` and using it in the JSON is
all that's needed. Bump `DATA_UPDATED` in `lib/constants.ts` when you refresh
the dataset.

Add a logo by dropping a file in `public/logos/` and setting `"logo":
"/logos/name.png"`. Without one, the card renders a sector-tinted letter
avatar — which is what every entry currently uses.

## Where the current data came from

The dataset mixes two tiers, and every entry says which it belongs to:

| Tier | Count | What it means |
| --- | --- | --- |
| Hand-checked | 60 | Compiled entry by entry, with area-level or precise pins, founders, funding and curated job links. |
| Imported | 32 | Pulled from public Indian startup funding datasets on GitHub (Kaggle mirrors). City-level location only, no website, founders and year not independently verified. Each carries a `source` note shown in its detail panel. |

The imported tier came from these public repositories:

- [`MainakRepositor/Datasets`](https://github.com/MainakRepositor/Datasets) — Indian startups funding 2021
- [`DeepakKumarGS/Indian-Startup-Funding-`](https://github.com/DeepakKumarGS/Indian-Startup-Funding-) — the Kaggle 2015–2020 funding set
- [`Laxmisneha05/Indian_Startups_Analysis`](https://github.com/Laxmisneha05/Indian_Startups_Analysis) — top-300 profiles
- [`MahabhoiAryan/Startup_India-EDA`](https://github.com/MahabhoiAryan/Startup_India-EDA) — Startup India EDA

Rows those datasets place in Ahmedabad but that are headquartered elsewhere
(BillDesk, BluSmart) were dropped by hand. They are a reminder that these sets
carry their own errors — verify before treating any imported row as fact.

One deliberate exclusion: [`mratanusarkar/Dataset-Indian-Companies`](https://github.com/mratanusarkar/Dataset-Indian-Companies)
has 8,302 rows mentioning Ahmedabad, which looks like an easy route to 1,000+.
It is not usable here: its `location` column lists every city a company
operates in, alphabetically, so "Ahmedabad + 434 more" is a Mumbai company
sorting first. Names are also truncated mid-string and there are no websites or
street addresses. Importing it would have padded the map with tyre factories
and hospitals rather than improving it.

## Data methodology

Entries are compiled from public sources: company websites, press coverage,
exchange filings and public incubator portfolios.

- **Pin precision is explicit.** A *precise pin* means a published office
  address was mapped. An *area-level pin* means only the neighbourhood is
  known, so the marker sits at its centre — it is not the company's doorstep.
  Both the cards and the map legend say which is which.
- **Funding lines describe what has been publicly reported.** Where no reliable
  figure exists, the backing is described rather than a number invented.
- **Job listings are curated pointers** into each company's careers page, not a
  live requisition feed. Openings change constantly; confirm on the company
  site before applying.
- **Scope is Ahmedabad-headquartered companies** (plus the immediate
  Gandhinagar / GIFT City / Sanand belt). Companies with a satellite office
  here but headquarters elsewhere are deliberately excluded, to keep the map
  honest about what is actually built in the city.
- **Founders are listed only where attribution is well established.** A few
  entries — mostly institutions and incubators — carry no founder line rather
  than a guessed one.

This is a community dataset and will contain errors. Corrections are the point.

## Licence & attribution

Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright)
contributors. A community project, not affiliated with any listed company.
