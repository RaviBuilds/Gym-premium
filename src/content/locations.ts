import type { LocationSummary } from "@/types/content";
import { siteConfig } from "@/config/site";
import { buildMapsSearchUrl } from "@/lib/maps";

/**
 * Two-branch comparison data — Homepage-Architecture.md §7 Two Locations,
 * One Standard. Pulls real address/hours facts from src/config/site.ts
 * (single source of truth) rather than re-typing them here.
 *
 * ## `href` is a Google Maps link, not a route
 *
 * These were `/locations/gachibowli` and `/locations/rethibowli`, and neither
 * route exists — `src/app/` holds only `page.tsx`, so both cards 404'd. They now
 * open Google Maps pinned on the branch's real address, derived from the same
 * `siteConfig` string the card already displays, so the link can never disagree
 * with the address printed above it. See `src/lib/maps.ts`.
 */
export const locations: LocationSummary[] = [
  {
    branchKey: "gachibowli",
    name: siteConfig.branches.gachibowli.name,
    address: siteConfig.branches.gachibowli.address,
    hoursSummary: `${siteConfig.branches.gachibowli.hours.days} · ${siteConfig.branches.gachibowli.hours.unisex}`,
    imageSrc: "/images/locations/gachibowli.jpg",
    imageAlt: "Infiniti Fitness Gachibowli training floor",
    href: buildMapsSearchUrl(siteConfig.branches.gachibowli.address),
  },
  {
    branchKey: "rethibowli",
    name: siteConfig.branches.rethibowli.name,
    address: siteConfig.branches.rethibowli.address,
    hoursSummary: `${siteConfig.branches.rethibowli.hours.days} · ${siteConfig.branches.rethibowli.hours.unisex}`,
    ladiesOnlySlot: siteConfig.branches.rethibowli.hours.ladiesOnly ?? undefined,
    imageSrc: "/images/locations/rethibowli.jpg",
    imageAlt: "Infiniti Fitness Rethibowli training floor",
    href: buildMapsSearchUrl(siteConfig.branches.rethibowli.address),
  },
];
