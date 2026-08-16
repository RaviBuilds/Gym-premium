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

/** One label/value credential row in a coach's dossier. */
export interface TrainerCredential {
  /** Tracked micro-caps label, e.g. "Certification", "Experience". */
  label: string;
  /** The fact itself, e.g. "ACE CPT", "9 years". */
  value: string;
}

export interface Trainer {
  // ── existing, unchanged ────────────────────────────────────────────
  slug: string;
  name: string;
  title: string;
  /**
   * e.g. "Mr Nizamabad" — Mohammed Wajeed's competitive title. Rendered via
   * <Badge variant="achievement">.
   *
   * Retained for back-compat. Superseded by `signatureAchievement` — prefer
   * that field for new content.
   */
  achievementBadge?: string;
  imageSrc: string;
  imageAlt: string;

  // ── new ───────────────────────────────────────────────────────────
  /** 1–3 speciality tags rendered as hex-pipped micro-caps. REQUIRED:
   *  every coach must be answerable to "what do they actually coach?".
   *  Derived from each coach's existing `title` when nothing richer is
   *  supplied — never invented. */
  discipline: string[];

  /** Whole years on the floor. Renders a credential row + feeds the
   *  section's combined-years CountUp. Omit rather than estimate. */
  yearsExperience?: number;

  /** Named certifications, verbatim. Rendered as credential rows. */
  certifications?: string[];

  /** The one most sellable fact about this coach, e.g. "Mr Nizamabad".
   *  Rendered via <Badge variant="achievement">. */
  signatureAchievement?: string;

  /** One line, first person or declarative, ≤ 90 chars. The dossier's
   *  human beat. */
  philosophy?: string;

  /** Backdrop depth plate — public/back/{slug}.jpg. Revealed at 16%
   *  opacity on hover/focus, desktop only. */
  backdropSrc?: string;

  /** Per-coach CTA target. Falls back to the section-level booking
   *  target when absent. */
  ctaHref?: string;

  /** Exactly one trainer in the array may set this. Drives lead
   *  selection instead of relying on array position. */
  lead?: boolean;
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
