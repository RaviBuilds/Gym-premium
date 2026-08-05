import type { LocationSummary } from "@/types/content";
import { siteConfig } from "@/config/site";

/**
 * Two-branch comparison data — Homepage-Architecture.md §7 Two Locations,
 * One Standard. Pulls real address/hours facts from src/config/site.ts
 * (single source of truth) rather than re-typing them here.
 */
export const locations: LocationSummary[] = [
  {
    branchKey: "gachibowli",
    name: siteConfig.branches.gachibowli.name,
    address: siteConfig.branches.gachibowli.address,
    hoursSummary: `${siteConfig.branches.gachibowli.hours.days} · ${siteConfig.branches.gachibowli.hours.unisex}`,
    imageSrc: "/images/locations/gachibowli.jpg",
    imageAlt: "Infiniti Fitness Gachibowli training floor",
    href: "/locations/gachibowli",
  },
  {
    branchKey: "rethibowli",
    name: siteConfig.branches.rethibowli.name,
    address: siteConfig.branches.rethibowli.address,
    hoursSummary: `${siteConfig.branches.rethibowli.hours.days} · ${siteConfig.branches.rethibowli.hours.unisex}`,
    ladiesOnlySlot: siteConfig.branches.rethibowli.hours.ladiesOnly ?? undefined,
    imageSrc: "/images/locations/rethibowli.jpg",
    imageAlt: "Infiniti Fitness Rethibowli training floor",
    href: "/locations/rethibowli",
  },
];
