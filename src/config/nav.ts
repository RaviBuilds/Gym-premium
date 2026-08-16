/**
 * Primary navigation — /docs/05-information-architecture.md "Navigation
 * Recommendation": 5-7 items max, replacing the current site's 14-item flat
 * nav. Free Trial / Join Now stay as persistent CTA buttons in the Navbar,
 * not nav items — they're actions, not destinations to browse.
 *
 * ## These are same-page anchors, not routes, and that is deliberate
 *
 * `src/app/` contains exactly one route: `page.tsx`. There is no `/programs`,
 * `/locations`, `/trainers`, `/pricing`, `/about` or `/contact` — so every item
 * in this list previously resolved to a Next.js 404. Six nav items, all dead.
 *
 * The homepage already contains a full section for each of these six subjects,
 * so the honest fix is to point the nav at the content that exists rather than
 * at pages that do not. Each `href` below targets an `id` rendered by a real
 * section:
 *
 * | Item     | Anchor       | Rendered by                    |
 * |----------|--------------|--------------------------------|
 * | Programs | `#programs`  | `Programs`                     |
 * | Locations| `#locations` | `Locations`                    |
 * | Trainers | `#trainers`  | `TrainerShowcase`              |
 * | Pricing  | `#pricing`   | `MembershipCta`                |
 * | About    | `#about`     | `WhyInfiniti`                  |
 * | Contact  | `#contact`   | `Footer`'s nav/brand zone      |
 *
 * The leading `/` is kept on each so the links resolve from any future route,
 * not just from `/` — `#programs` alone would break the moment a second page
 * exists, while `/#programs` always returns to the homepage section.
 *
 * `html { scroll-padding-top: 96px }` in `globals.css` is what stops these
 * landing behind the sticky navbar. When real routes are built, swap the values
 * here back to paths — every consumer reads this one list, so nothing else
 * needs to change.
 */
export const primaryNav = [
  { label: "Programs", href: "/#programs" },
  { label: "Locations", href: "/#locations" },
  { label: "Trainers", href: "/#trainers" },
  { label: "Pricing", href: "/#pricing" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
] as const;
