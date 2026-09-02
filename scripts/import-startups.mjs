#!/usr/bin/env node
/**
 * Bulk importer for the Ahmedabad Startup Map.
 *
 *   node scripts/import-startups.mjs <input.csv|input.json> [options]
 *
 * Takes a directory export — Startup India, i-Hub Gujarat, a Tracxn/Crunchbase
 * CSV, or your own spreadsheet — and turns it into data/startups.json.
 *
 * What it does:
 *   - maps loose column names onto the app's schema (see FIELD_ALIASES)
 *   - infers the Ahmedabad area from free-text addresses
 *   - geocodes real addresses via OpenStreetMap Nominatim, with an on-disk
 *     cache and 1.1s rate limiting so repeat runs are fast and polite
 *   - falls back to the area centroid (tagged pinType "area") when geocoding
 *     fails or is switched off
 *   - de-duplicates on website domain, then on normalised name
 *   - validates every row and reports what it dropped and why
 *
 * Options:
 *   --geocode          call Nominatim for rows with a street address
 *   --limit N          only process the first N rows
 *   --out PATH         output file (default data/startups.json)
 *   --merge            keep existing entries in the output file, add new ones
 *   --email you@x.com  contact address sent to Nominatim (their policy asks
 *                      for one on bulk use; required with --geocode)
 *   --dry-run          report only, write nothing
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_PATH = path.join(ROOT, ".geocode-cache.json");

// ---------------------------------------------------------------- schema data

const AREA_CENTROIDS = readTsRecord("lib/areas.ts", "AREA_CENTROIDS");
const AREA_ALIASES = readTsRecord("lib/areas.ts", "AREA_ALIASES");
const AREAS = Object.keys(AREA_CENTROIDS);

const SECTORS = [
  "AI", "SaaS", "Fintech", "EdTech", "HealthTech", "D2C", "DeepTech",
  "CleanTech", "AgriTech", "Logistics", "E-commerce", "IT Services",
  "Gaming", "Other",
];

const STAGES = [
  "Pre-seed", "Seed", "Bootstrapped", "Series A", "Series B", "Series C+",
  "Series D", "Public", "Acquired",
];

/** Keyword -> canonical sector. First match on the row's text wins. */
const SECTOR_KEYWORDS = [
  [/\b(ai|artificial intelligence|machine learning|ml|computer vision|nlp|analytics|data science)\b/i, "AI"],
  [/\b(fintech|lending|payments?|neobank|insurtech|wealth|nbfc|credit)\b/i, "Fintech"],
  [/\b(edtech|education|learning|school|tutoring|upskilling)\b/i, "EdTech"],
  [/\b(health|medical|pharma|biotech|diagnostic|clinic|hospital|wellness)\b/i, "HealthTech"],
  [/\b(d2c|consumer brand|fmcg|apparel|cosmetic|grooming|beverage|food brand)\b/i, "D2C"],
  [/\b(agri|farm|crop|dairy|agtech)\b/i, "AgriTech"],
  [/\b(deeptech|robotic|semiconductor|drone|space|defence|defense|hardware|iot|embedded)\b/i, "DeepTech"],
  [/\b(cleantech|solar|renewable|energy|climate|sustainab|ev\b|electric vehicle)\b/i, "CleanTech"],
  [/\b(logistic|freight|supply chain|trucking|delivery|warehous)\b/i, "Logistics"],
  [/\b(e-?commerce|marketplace|retail tech|d2c platform|shopify|magento)\b/i, "E-commerce"],
  [/\b(gaming|game|esports)\b/i, "Gaming"],
  [/\b(it services|software development|outsourc|consultanc|staff augmentation|web development|app development)\b/i, "IT Services"],
  [/\b(saas|b2b software|platform|crm|erp|software)\b/i, "SaaS"],
];

const STAGE_KEYWORDS = [
  [/\bpre-?seed\b/i, "Pre-seed"],
  [/\bseries\s*d\b|\bseries\s*e\b|\blate stage\b/i, "Series D"],
  [/\bseries\s*c\b/i, "Series C+"],
  [/\bseries\s*b\b/i, "Series B"],
  [/\bseries\s*a\b/i, "Series A"],
  [/\bacquired\b|\bacquisition\b/i, "Acquired"],
  [/\b(public|listed|ipo|nse|bse)\b/i, "Public"],
  [/\bbootstrap/i, "Bootstrapped"],
  [/\bseed\b/i, "Seed"],
];

/** Input column name (lowercased, non-alphanumerics stripped) -> our field. */
const FIELD_ALIASES = {
  name: ["name", "companyname", "startupname", "company", "entityname", "title", "legalname"],
  description: ["description", "about", "summary", "shortdescription", "businessdescription", "pitch", "tagline"],
  sector: ["sector", "industry", "category", "vertical", "domain", "industrysector"],
  stage: ["stage", "fundingstage", "startupstage", "roundstage"],
  website: ["website", "url", "weburl", "companywebsite", "domain", "site"],
  address: ["address", "fulladdress", "officeaddress", "location", "registeredaddress", "addressline1"],
  area: ["area", "locality", "neighbourhood", "neighborhood", "region"],
  city: ["city", "town", "district"],
  founded: ["founded", "foundedyear", "yearfounded", "incorporationyear", "startdate", "incorporationdate", "establishedyear"],
  founders: ["founders", "founder", "foundername", "foundernames", "ceo", "cofounders"],
  funding: ["funding", "totalfunding", "fundingraised", "amountraised", "capitalraised"],
  type: ["type", "entitytype", "organisationtype", "organizationtype"],
  tags: ["tags", "keywords", "labels"],
  careers: ["careers", "careersurl", "jobsurl", "jobslink", "careerpage"],
  hiring: ["hiring", "ishiring", "activelyhiring", "openroles"],
};

// ------------------------------------------------------------------ utilities

function readTsRecord(relPath, exportName) {
  // The area tables live in a .ts file the app imports; parse the object
  // literal out of it rather than duplicating the data in two places.
  const src = fs.readFileSync(path.join(ROOT, relPath), "utf8");
  const start = src.indexOf(`${exportName}: Record`);
  if (start === -1) throw new Error(`${exportName} not found in ${relPath}`);
  const open = src.indexOf("{", start);
  let depth = 0;
  let end = open;
  for (let i = open; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  const body = src.slice(open, end + 1)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '$1"$2":')
    .replace(/'/g, '"')
    .replace(/,(\s*[}\]])/g, "$1");
  return JSON.parse(body);
}

const norm = (v) => String(v ?? "").trim();
const key = (v) => norm(v).toLowerCase().replace(/[^a-z0-9]/g, "");

function slugify(value) {
  return norm(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function titleCase(value) {
  return norm(value).replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
}

/** RFC4180-ish CSV parser: handles quoted fields, embedded commas and newlines. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += ch;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }

  const nonEmpty = rows.filter((r) => r.some((c) => norm(c) !== ""));
  if (nonEmpty.length === 0) return [];
  const headers = nonEmpty[0].map((h) => key(h));
  return nonEmpty.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = r[i] ?? ""; });
    return obj;
  });
}

function pick(row, field) {
  for (const alias of FIELD_ALIASES[field] ?? []) {
    const v = row[alias];
    if (v != null && norm(v) !== "") return norm(v);
  }
  return "";
}

// ------------------------------------------------------------- normalisation

function normaliseWebsite(raw) {
  let v = norm(raw);
  if (!v) return "";
  v = v.split(/[\s,;]+/)[0];
  if (!/^https?:\/\//i.test(v)) v = `https://${v.replace(/^\/+/, "")}`;
  try {
    const u = new URL(v);
    if (!u.hostname.includes(".")) return "";
    return u.origin + (u.pathname === "/" ? "" : u.pathname.replace(/\/$/, ""));
  } catch {
    return "";
  }
}

function domainOf(website) {
  try { return new URL(website).hostname.replace(/^www\./, "").toLowerCase(); }
  catch { return ""; }
}

/**
 * Sub-localities that sit inside a broader area and must be tested first —
 * "GIFT City, Gandhinagar" is GIFT City, not Gandhinagar, and "South Bopal"
 * is not Bopal. Everything else falls back to longest-name-first.
 */
const AREA_PRECEDENCE = [
  "GIFT City", "South Bopal", "Science City", "IIM Road", "University Area",
  "Prahlad Nagar", "CG Road", "Ashram Road",
];

/** Longest alias first, so "south bopal" wins over "bopal". */
const ALIAS_ENTRIES = Object.entries(AREA_ALIASES).sort((a, b) => b[0].length - a[0].length);
const AREA_ENTRIES = [
  ...AREA_PRECEDENCE,
  ...AREAS.filter((a) => a !== "Other" && !AREA_PRECEDENCE.includes(a))
    .sort((a, b) => b.length - a.length),
];

function inferArea(...texts) {
  const hay = texts.filter(Boolean).join(" ").toLowerCase();
  if (!hay) return "Other";
  for (const canonical of AREA_ENTRIES) {
    if (hay.includes(canonical.toLowerCase())) return canonical;
  }
  for (const [alias, canonical] of ALIAS_ENTRIES) {
    if (hay.includes(alias)) return canonical;
  }
  return "Other";
}

function inferSector(...texts) {
  const hay = texts.filter(Boolean).join(" ");
  for (const [re, sector] of SECTOR_KEYWORDS) if (re.test(hay)) return sector;
  return "Other";
}

function inferStage(...texts) {
  const hay = texts.filter(Boolean).join(" ");
  for (const [re, stage] of STAGE_KEYWORDS) if (re.test(hay)) return stage;
  return "Bootstrapped";
}

function inferFounded(raw) {
  const m = norm(raw).match(/(19|20)\d{2}/);
  if (!m) return undefined;
  const year = Number(m[0]);
  const nowYear = new Date().getFullYear();
  return year >= 1850 && year <= nowYear ? year : undefined;
}

function splitList(raw) {
  return norm(raw)
    .split(/[,;|/]|\band\b|&/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 60)
    .slice(0, 6);
}

/**
 * Deterministic sub-kilometre offset so companies sharing an area centroid do
 * not stack into a single unclickable pin. Seeded by id, so it is stable
 * across runs rather than jittering on every import.
 */
function jitter(id, [lat, lng]) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const a = ((h >>> 0) % 1000) / 1000;
  const b = ((h >>> 10) % 1000) / 1000;
  return [
    Number((lat + (a - 0.5) * 0.012).toFixed(6)),
    Number((lng + (b - 0.5) * 0.012).toFixed(6)),
  ];
}

// ---------------------------------------------------------------- geocoding

function loadCache() {
  try { return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8")); }
  catch { return {}; }
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function geocode(address, cache, email) {
  const cacheKey = address.toLowerCase();
  if (cacheKey in cache) return cache[cacheKey];

  const url =
    "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=" +
    encodeURIComponent(address);

  try {
    const res = await fetch(url, {
      headers: {
        // Nominatim's usage policy requires an identifying User-Agent.
        "User-Agent": `ahmedabad-startup-map/1.0 (${email})`,
        "Accept-Language": "en",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const hit = json[0];
    const result = hit
      ? [Number(Number(hit.lat).toFixed(6)), Number(Number(hit.lon).toFixed(6))]
      : null;
    cache[cacheKey] = result;
    return result;
  } catch {
    cache[cacheKey] = null;
    return null;
  } finally {
    await sleep(1100); // max 1 request/second, per Nominatim's policy
  }
}

/** Ahmedabad's rough bounding box — rejects geocoder hits from elsewhere. */
function inAhmedabad([lat, lng]) {
  return lat > 22.6 && lat < 23.45 && lng > 72.2 && lng < 72.95;
}

// -------------------------------------------------------------------- mapping

function toStartup(row, seenIds) {
  const name = pick(row, "name");
  if (!name || name.length < 2) return { error: "missing name" };

  const website = normaliseWebsite(pick(row, "website"));
  if (!website) return { error: `no usable website (${name})` };

  let id = slugify(name);
  if (!id) return { error: `name does not slugify (${name})` };
  if (seenIds.has(id)) {
    let n = 2;
    while (seenIds.has(`${id}-${n}`)) n++;
    id = `${id}-${n}`;
  }
  seenIds.add(id);

  const description = pick(row, "description");
  const address = pick(row, "address");
  const areaRaw = pick(row, "area");
  const blob = [description, pick(row, "sector"), pick(row, "tags"), name].join(" ");

  const declaredSector = titleCase(pick(row, "sector"));
  const sector =
    SECTORS.find((s) => s.toLowerCase() === declaredSector.toLowerCase()) ||
    inferSector(blob);

  const declaredStage = pick(row, "stage");
  const stage =
    STAGES.find((s) => s.toLowerCase() === declaredStage.toLowerCase()) ||
    inferStage([declaredStage, pick(row, "funding"), description].join(" "));

  const area =
    AREAS.find((a) => a.toLowerCase() === areaRaw.toLowerCase()) ||
    inferArea(areaRaw, address);

  const careers = normaliseWebsite(pick(row, "careers"));
  const hiringRaw = pick(row, "hiring").toLowerCase();
  const hiring = /^(1|y|yes|true|hiring)/.test(hiringRaw) || Boolean(careers);

  return {
    startup: {
      id,
      name,
      description: description || `${sector} company based in ${area}, Ahmedabad.`,
      sector,
      stage,
      type: /\b(vc|venture|incubat|accelerat|fund)\b/i.test(pick(row, "type") + " " + name)
        ? "vc"
        : "startup",
      founded: inferFounded(pick(row, "founded")),
      founders: splitList(pick(row, "founders")),
      funding: pick(row, "funding") || undefined,
      website,
      location: {
        area,
        address: address || `${area}, Ahmedabad, Gujarat`,
        lat: 0, // filled in by placeAll()
        lng: 0,
        pinType: "area",
      },
      hiring,
      jobs: hiring
        ? [{ title: "Open roles", type: "full-time", link: careers || website }]
        : [],
      tags: splitList(pick(row, "tags")).map((t) => slugify(t)).filter(Boolean),
    },
    address,
  };
}

async function placeAll(entries, { useGeocode, email }) {
  const cache = loadCache();
  let geocoded = 0;
  let centroid = 0;

  for (const [i, entry] of entries.entries()) {
    const s = entry.startup;
    let coords = null;

    if (useGeocode && entry.address && entry.address.length > 12) {
      const query = /ahmedabad|gandhinagar|gujarat/i.test(entry.address)
        ? entry.address
        : `${entry.address}, Ahmedabad, Gujarat, India`;
      coords = await geocode(query, cache, email);
      if (coords && !inAhmedabad(coords)) coords = null;
      if (coords) {
        s.location.lat = coords[0];
        s.location.lng = coords[1];
        s.location.pinType = "precise";
        geocoded++;
      }
      if ((i + 1) % 25 === 0) {
        saveCache(cache);
        process.stderr.write(`  geocoded ${i + 1}/${entries.length}\n`);
      }
    }

    if (!coords) {
      const base = AREA_CENTROIDS[s.location.area] ?? AREA_CENTROIDS.Other;
      const [lat, lng] = jitter(s.id, base);
      s.location.lat = lat;
      s.location.lng = lng;
      s.location.pinType = "area";
      centroid++;
    }
  }

  if (useGeocode) saveCache(cache);
  return { geocoded, centroid };
}

// ----------------------------------------------------------------------- main

function parseArgs(argv) {
  const opts = { geocode: false, limit: Infinity, out: "data/startups.json", merge: false, dryRun: false, email: "" };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--geocode") opts.geocode = true;
    else if (a === "--merge") opts.merge = true;
    else if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--limit") opts.limit = Number(argv[++i]);
    else if (a === "--out") opts.out = argv[++i];
    else if (a === "--email") opts.email = argv[++i];
    else if (a.startsWith("--")) throw new Error(`unknown option ${a}`);
    else positional.push(a);
  }
  opts.input = positional[0];
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.input) {
    console.error("usage: node scripts/import-startups.mjs <input.csv|input.json> [--geocode --email you@example.com] [--limit N] [--merge] [--out PATH] [--dry-run]");
    process.exit(1);
  }
  if (opts.geocode && !opts.email) {
    console.error("--geocode requires --email (Nominatim's usage policy asks for a contact address)");
    process.exit(1);
  }

  const raw = fs.readFileSync(path.resolve(ROOT, opts.input), "utf8");
  let rows;
  if (opts.input.toLowerCase().endsWith(".json")) {
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : parsed.data ?? parsed.results ?? parsed.items ?? [];
    rows = list.map((o) => {
      const flat = {};
      for (const [k, v] of Object.entries(o)) {
        flat[key(k)] = v && typeof v === "object" ? JSON.stringify(v) : v;
      }
      return flat;
    });
  } else {
    rows = parseCsv(raw);
  }

  console.log(`read ${rows.length} rows from ${opts.input}`);
  if (rows.length === 0) { console.error("nothing to import"); process.exit(1); }

  const limited = rows.slice(0, opts.limit);
  const seenIds = new Set();
  const byDomain = new Map();
  const byName = new Map();
  const entries = [];
  const problems = [];
  let dupes = 0;

  for (const row of limited) {
    const mapped = toStartup(row, seenIds);
    if (mapped.error) { problems.push(mapped.error); continue; }

    const s = mapped.startup;
    const domain = domainOf(s.website);
    const nameKey = key(s.name);

    if (domain && byDomain.has(domain)) { dupes++; continue; }
    if (byName.has(nameKey)) { dupes++; continue; }
    if (domain) byDomain.set(domain, s.id);
    byName.set(nameKey, s.id);
    entries.push(mapped);
  }

  console.log(`mapped ${entries.length} entries (${dupes} duplicates, ${problems.length} unusable)`);
  if (problems.length) {
    console.log("  first few problems:");
    for (const p of problems.slice(0, 5)) console.log(`    - ${p}`);
  }

  if (opts.geocode) console.log(`geocoding via Nominatim (~${Math.ceil(entries.length * 1.1 / 60)} min at 1 req/sec)…`);
  const placed = await placeAll(entries, { useGeocode: opts.geocode, email: opts.email });
  console.log(`placed: ${placed.geocoded} precise, ${placed.centroid} area-level`);

  let output = entries.map((e) => e.startup);

  if (opts.merge) {
    const outPath = path.resolve(ROOT, opts.out);
    if (fs.existsSync(outPath)) {
      const existing = JSON.parse(fs.readFileSync(outPath, "utf8"));
      const have = new Set(existing.map((s) => domainOf(s.website) || key(s.name)));
      const added = output.filter((s) => !have.has(domainOf(s.website) || key(s.name)));
      console.log(`merging: ${existing.length} existing + ${added.length} new`);
      output = [...existing, ...added];
    }
  }

  output.sort((a, b) => a.name.localeCompare(b.name));

  const stats = {
    total: output.length,
    startups: output.filter((s) => s.type === "startup").length,
    vcs: output.filter((s) => s.type === "vc").length,
    hiring: output.filter((s) => s.hiring).length,
    precise: output.filter((s) => s.location.pinType === "precise").length,
    areas: new Set(output.map((s) => s.location.area)).size,
    sectors: new Set(output.map((s) => s.sector)).size,
  };
  console.log("result:", JSON.stringify(stats));

  if (opts.dryRun) { console.log("--dry-run: nothing written"); return; }

  const outPath = path.resolve(ROOT, opts.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");
  console.log(`wrote ${outPath}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
