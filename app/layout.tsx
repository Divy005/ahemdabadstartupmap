import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import startups from "@/data/startups.json";
import type { Startup } from "@/types";
import { countJobs } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const all = startups as Startup[];
const startupCount = all.filter((s) => s.type === "startup").length;
const vcCount = all.filter((s) => s.type === "vc").length;
const jobCount = countJobs(all);

const title = "Ahmedabad Startup Map";
const description = `Discover ${startupCount} startups, ${vcCount} VC firms and incubators, and ${jobCount} open roles across Ahmedabad — on a map, in a grid, and in one jobs board.`;

export const metadata: Metadata = {
  metadataBase: new URL("https://ahmedabadstartupmap.com"),
  title: {
    default: `${title} — startups, VCs & jobs in Ahmedabad`,
    template: `%s · ${title}`,
  },
  description,
  keywords: [
    "Ahmedabad startups",
    "Gujarat startup ecosystem",
    "Ahmedabad jobs",
    "Ahmedabad internships",
    "GIFT City",
    "startup map",
    "venture capital Ahmedabad",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://ahmedabadstartupmap.com",
    siteName: title,
    title: `${title} — startups, VCs & jobs in Ahmedabad`,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} — startups, VCs & jobs in Ahmedabad`,
    description,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#E85D26",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh">
        <a
          href="#results"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[1200] focus:rounded-md focus:bg-ink-800 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to results
        </a>
        {children}
      </body>
    </html>
  );
}
