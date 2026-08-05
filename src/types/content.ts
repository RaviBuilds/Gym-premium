/**
 * Shared content types — model the real data structures the homepage
 * sections will consume (Programs, Trainers, Testimonials, Locations),
 * per Homepage-Architecture.md's per-section "Content" fields. Defined now,
 * ahead of the homepage build, so section components and their eventual
 * data sources (local content file, CMS, etc.) agree on shape from the
 * start.
 */

export interface Program {
  slug: string;
  name: string;
  /** One-line hook pulled from the program's existing page copy — §Homepage-Architecture.md Programs section. */
  hook: string;
  imageSrc: string;
  imageAlt: string;
}

export interface Trainer {
  slug: string;
  name: string;
  title: string;
  /** e.g. "Mr Nizamabad" — Mohammed Wajeed's competitive title. Rendered via <Badge variant="achievement">. */
  achievementBadge?: string;
  imageSrc: string;
  imageAlt: string;
}

export interface Testimonial {
  id: string;
  reviewerName: string;
  quote: string;
  /** Set true for the 2-3 testimonials promoted to TestimonialPullQuote treatment (§6, §Visual-Design-Specification.md §6). */
  featured?: boolean;
  /** Optional short attribute tag, e.g. "2-year member" — derived from quote content where identifiable. */
  attributeTag?: string;
}

export interface LocationSummary {
  branchKey: "gachibowli" | "rethibowli";
  name: string;
  address: string;
  hoursSummary: string;
  ladiesOnlySlot?: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
}
