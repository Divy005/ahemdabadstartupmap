/** Ahmedabad map defaults. */
export const AHMEDABAD_CENTER: [number, number] = [23.0225, 72.5714];
export const DEFAULT_ZOOM = 11;

/** Every area we recognise, in the order shown in the filter. */
export const AREAS = [
  "SG Highway",
  "Satellite",
  "Prahlad Nagar",
  "Bodakdev",
  "Navrangpura",
  "Ashram Road",
  "CG Road",
  "Vastrapur",
  "Science City",
  "Gandhinagar",
  "Sanand",
  "GIFT City",
  "Bopal",
  "South Bopal",
  "Thaltej",
  "Gurukul",
  "Maninagar",
  "Ellisbridge",
  "Paldi",
  "Ambawadi",
  "Memnagar",
  "IIM Road",
  "University Area",
  "Other",
] as const;

export const SECTORS = [
  "AI",
  "SaaS",
  "Fintech",
  "EdTech",
  "HealthTech",
  "D2C",
  "DeepTech",
  "CleanTech",
  "AgriTech",
  "Logistics",
  "E-commerce",
  "IT Services",
  "Gaming",
  "Other",
] as const;

export const STAGES = [
  "Pre-seed",
  "Seed",
  "Bootstrapped",
  "Series A",
  "Series B",
  "Series C+",
  "Series D",
  "Public",
  "Acquired",
] as const;

export const JOB_TYPES = [
  "full-time",
  "internship",
  "contract",
  "part-time",
] as const;

/**
 * Muted per-sector palettes. Each entry supplies a badge class set that works
 * on white cards and inside the map popup.
 */
export const SECTOR_STYLES: Record<string, string> = {
  AI: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  SaaS: "bg-blue-50 text-blue-700 ring-blue-200",
  Fintech: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  EdTech: "bg-amber-50 text-amber-700 ring-amber-200",
  HealthTech: "bg-rose-50 text-rose-700 ring-rose-200",
  D2C: "bg-violet-50 text-violet-700 ring-violet-200",
  DeepTech: "bg-slate-100 text-slate-700 ring-slate-300",
  CleanTech: "bg-green-50 text-green-700 ring-green-200",
  AgriTech: "bg-lime-50 text-lime-700 ring-lime-300",
  Logistics: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  "E-commerce": "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200",
  "IT Services": "bg-sky-50 text-sky-700 ring-sky-200",
  Gaming: "bg-orange-50 text-orange-700 ring-orange-200",
  Other: "bg-gray-100 text-gray-600 ring-gray-300",
};

/** Hex values mirroring SECTOR_STYLES, for the letter-avatar fallbacks. */
export const SECTOR_HEX: Record<string, string> = {
  AI: "#4F46E5",
  SaaS: "#2563EB",
  Fintech: "#059669",
  EdTech: "#D97706",
  HealthTech: "#E11D48",
  D2C: "#7C3AED",
  DeepTech: "#475569",
  CleanTech: "#16A34A",
  AgriTech: "#65A30D",
  Logistics: "#0891B2",
  "E-commerce": "#C026D3",
  "IT Services": "#0284C7",
  Gaming: "#EA580C",
  Other: "#6B7280",
};

export const JOB_TYPE_STYLES: Record<string, string> = {
  "full-time": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  internship: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  contract: "bg-amber-50 text-amber-700 ring-amber-200",
  "part-time": "bg-cyan-50 text-cyan-700 ring-cyan-200",
};

export const JOB_TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  internship: "Internship",
  contract: "Contract",
  "part-time": "Part-time",
};

/** Marker colours used by both the map and the legend, so they never drift. */
export const MARKER_COLORS = {
  precise: "#1D4ED8",
  area: "#F59E0B",
  vc: "#7C3AED",
} as const;

export const SUBMIT_FORM_URL =
  "mailto:hello@ahmedabadstartupmap.com?subject=Add%20a%20startup%20to%20the%20Ahmedabad%20Startup%20Map";

export const ISSUE_URL =
  "mailto:hello@ahmedabadstartupmap.com?subject=Correction%20for%20the%20Ahmedabad%20Startup%20Map";

/** Bumped by hand whenever data/startups.json is refreshed. */
export const DATA_UPDATED = "2026-09-02";
