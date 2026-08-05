/**
 * Primary navigation — /docs/05-information-architecture.md "Navigation
 * Recommendation": 5-7 items max, replacing the current site's 14-item flat
 * nav. Free Trial / Join Now stay as persistent CTA buttons in the Navbar,
 * not nav items — they're actions, not destinations to browse.
 */
export const primaryNav = [
  { label: "Programs", href: "/programs" },
  { label: "Locations", href: "/locations" },
  { label: "Trainers", href: "/trainers" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;
