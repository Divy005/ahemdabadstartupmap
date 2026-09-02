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
