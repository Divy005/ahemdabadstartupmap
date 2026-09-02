export type EntityType = "startup" | "vc";

export type PinType = "precise" | "area";

export type JobType = "full-time" | "internship" | "contract" | "part-time";

export interface Job {
  title: string;
  type: JobType;
  link: string;
  /** Optional free-text team/department, shown as a secondary label. */
  team?: string;
}

export interface StartupLocation {
  area: string;
  address: string;
  lat: number;
  lng: number;
  pinType: PinType;
}

export interface Startup {
  id: string;
  name: string;
  logo?: string;
  description: string;
  sector: string;
  stage: string;
  type: EntityType;
  founded?: number;
  founders: string[];
  funding?: string;
  website: string;
  location: StartupLocation;
  hiring: boolean;
  jobs: Job[];
  tags: string[];
  featured?: boolean;
}

/** A job flattened together with the company it belongs to. */
export interface JobListing extends Job {
  companyId: string;
  companyName: string;
  companyLogo?: string;
  companyWebsite: string;
  sector: string;
  area: string;
  stage: string;
}

export interface Filters {
  q: string;
  type: string;
  area: string;
  sector: string;
  stage: string;
  hiring: boolean;
}

export type SortKey = "alphabetical" | "newest" | "funding" | "jobs";

export interface JobFilters {
  q: string;
  jobType: string;
  sector: string;
  area: string;
  sort: "company" | "title" | "type";
}
