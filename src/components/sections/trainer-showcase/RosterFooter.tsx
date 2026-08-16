import { ArrowRight } from "lucide-react";

import { AnimationWrapper } from "@/components/motion/AnimationWrapper";
import { CountUp } from "@/components/motion/CountUp";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * RosterFooter — the section's closing line: how many coaches the gym employs,
 * how long they have collectively been on the floor, and one quiet way out to
 * the full roster (design.md §6.1, §6.4's footer row, §8.3 row 20;
 * Requirements 3.11, 8.1).
 *
 * ```
 * │ 6 coaches · 42 years on the floor between them        See all coaches → │
 * ```
 *
 * ## Two facts, one of which the gym may not have supplied
 *
 * The coach count is **derived** — it is `trainers.length`, a number the content
 * registry cannot fail to have — so it is stated unconditionally. The combined
 * years figure is **owner input**: `resolveCombinedYears` returns the exact sum
 * only when every coach supplies `yearsExperience` and `null` the moment one
 * does not, because a sum over the coaches who happen to carry the field reads
 * as the team's full experience while actually being a floor on it. This
 * component therefore drops the figure **and the sentence around it** when
 * `combinedYears` is `null` (Requirement 8.1) rather than rendering "0 years" or
 * a hedge like "40+ years": there is no honest short version of a number you do
 * not have.
 *
 * **That is today's shipping state.** All six coaches deliberately omit
 * `yearsExperience` (design.md §7.2 forbids estimating it), so the footer
 * currently renders `6 coaches` beside `See all coaches →` and nothing else.
 * The row is built to look deliberate in exactly that state — which is why the
 * count is a real typographic figure rather than a fragment of a longer
 * sentence, and why the link sits at the far end of a `justify-between` row
 * instead of trailing the copy. Nothing here is a placeholder waiting to be
 * filled; supplying six numbers later *adds* a clause to a line that already
 * reads as finished.
 *
 * ## Composed from `CountUp` rather than `StatCounter`
 *
 * `StatCounter` is the closest existing component — a `CountUp` plus a label —
 * and it is deliberately not reused, for two reasons that are both about this
 * section rather than about that component:
 *
 * 1. **Accent budget.** `StatCounter` hardcodes `text-brand-yellow` on its
 *    figure, and it does so for a documented reason (the Trust Strip's figures
 *    *are* the accent). The section's three resting yellows are already spent on
 *    the eyebrow, the lead's achievement group and the CTA tile (Requirement
 *    2.5), so a yellow footer figure would be a fourth.
 * 2. **Shape.** `StatCounter` is a centred column — figure stacked over a
 *    micro-caps caption, with its own hover lift. The footer is one horizontal
 *    sentence in which the figure is a word (`42 years on the floor between
 *    them`), not a headline with a label under it. Reusing it would mean
 *    overriding its colour, its layout, its alignment and its interaction, which
 *    is not reuse.
 *
 * So the figure is `CountUp` directly. Everything Requirement 3.11 asks for is
 * already that component's contract: **1.2 seconds** (its default duration is
 * `motion.duration.counter`, the Closed_Motion_Vocabulary's 1.2s value) at
 * **viewport threshold 0.4** (its internal `useInView(ref, { amount: 0.4 })` —
 * deliberately later than the section's usual 0.2, so the number starts moving
 * once the line is properly on screen rather than as it clears the fold). Both
 * are read from the primitive rather than restated here: passing
 * `duration={1200}` would put a second copy of a closed-vocabulary value in this
 * file and let the two drift.
 *
 * `CountUp` also keeps the real final number in the DOM as `sr-only` text at all
 * times and animates only `aria-hidden` digits, so a screen-reader user hears
 * the true figure immediately and a reduced-motion user sees it without an
 * animation (Requirements 6.5, 3.8 — the count is a text swap, not a transform).
 *
 * ## No `"use client"`, and no fourth yellow
 *
 * There is no directive here and there must not be one. This file composes two
 * client components (`AnimationWrapper`, `CountUp`) and imports both from the
 * Server tree, which the App Router allows: a Server Component may render a
 * Client Component, only the reverse needs the directive. The footer itself
 * holds no state, runs no effect and binds no handler (Requirement 7.8).
 *
 * The "See all" link is a **secondary** action and is styled as one — white
 * micro-caps with a 4px arrow nudge, the same treatment as the lead dossier's
 * CTA — so the section's resting yellow count stays at three (Requirement 2.5).
 * The section's one primary action lives in `RosterCtaTile`. Yellow appears here
 * only as the focus ring, which is a state rather than a resting accent.
 */

/**
 * The footer row — stacked on narrow viewports, a single justified line from
 * `sm:` up (design.md §6.4).
 *
 * `items-start` in the stacked case rather than `items-center`: the two items
 * are a sentence and a link, and left-aligning them keeps them on the same
 * reading axis as everything above. From `sm:` the row switches to
 * `items-baseline`, which is what puts the link's cap-height on the same line as
 * the stat's — `items-center` would sit the two blocks' centres level and leave
 * the text visibly off-baseline, since the link's `min-h-11` touch target is
 * taller than the copy it wraps.
 *
 * No top border, and deliberately so. A hairline above this row is the obvious
 * way to seat a footer, but the section's bottom 128px is the Blend_Zone where
 * the dark→Testimonials dissolve lives, and Requirement 2.8 forbids painting any
 * new layer inside it. The row is separated by the section's own vertical rhythm
 * instead, which `TrainerShowcase` owns via the `className` prop.
 */
const FOOTER_ROW_CLASSES =
  "flex flex-col items-start gap-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6";

/**
 * The stat line's copy — tracked micro-caps, the same treatment as the dossier's
 * credential labels and the roster's role line, so the footer reads as part of
 * the section rather than as page furniture (Requirement 2.10: existing type
 * tokens and the two existing families only).
 *
 * `text-white/70` for the words against `text-white` for the figures below: the
 * numbers are the content, the sentence is the frame.
 */
const FOOTER_COPY_CLASSES =
  "font-body text-caption font-semibold uppercase tracking-[0.14em] text-white/70 lg:text-caption-lg";

/**
 * The figures — `font-display` numerals at the copy's own size, matching
 * `RosterIndexChip`'s numeral treatment exactly.
 *
 * `tabular-nums` is Requirement 2.10's numeric alignment rule, and it earns its
 * place even in a single line: `CountUp` animates through every integer from 0 to
 * the total, and proportional digits would make the sentence after the number
 * jitter left and right for the whole 1.2 seconds. Locking the digit advance
 * width holds the following words still — the same job a monospace face would do
 * in a system that had one, which this two-family system deliberately does not.
 */
const FOOTER_FIGURE_CLASSES = "font-display tabular-nums text-white";

/**
 * The "See all" link — a secondary action, and the section's only footer tab
 * stop (Requirement 6.4).
 *
 * Every part of this is borrowed rather than invented: the focus-ring trio is
 * byte-identical to `RosterCard`, `TrainerDossier`, `StripNavigator` and
 * `SceneNavigator`, so the section introduces no second focus treatment;
 * `min-h-11` is the 44px touch-target floor the button system enforces, needed
 * because this link is styled as text and would otherwise be a ~16px-tall tap
 * target; and the arrow's 4px nudge is the link's only interaction cue —
 * `transform` only, `motion-safe:`-gated, 500ms from the Closed_Motion_Vocabulary
 * (Requirements 3.8, 3.9, 7.5).
 *
 * A colour change to yellow on hover was the obvious alternative and is exactly
 * what the accent budget in Requirement 2.5 forbids.
 */
const SEE_ALL_CLASSES = cn(
  "group/see-all inline-flex min-h-11 items-center gap-2",
  "font-body text-caption font-semibold uppercase tracking-[0.14em] text-white lg:text-caption-lg",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
);
const SEE_ALL_ARROW_CLASSES =
  "ease-out motion-safe:transition-transform motion-safe:duration-500 lg:group-hover/see-all:translate-x-1";

/**
 * The link's visible label, which is also its accessible name.
 *
 * design.md §6.4's diagram reads "See all", and this said "See all coaches" for
 * the same reason the extra word exists there — a link's accessible name has to
 * make sense read out of context, and "See all" alone does not say all of *what*.
 *
 * It now reads "Book a session", because the destination changed. Every coach in
 * the Content_Registry is already rendered above this line (the lead plus five
 * roster cards), so there was never an unseen remainder for "see all" to reveal,
 * and the `/trainers` route it pointed at does not exist — see `SEE_ALL_HREF` in
 * `TrainerShowcase`. "Book a session" describes where the link actually goes and
 * still reads correctly out of context.
 */
const SEE_ALL_LABEL = "Book a session";

export interface RosterFooterProps {
  /**
   * How many coaches the section presents — `trainers.length`, straight from the
   * Content_Registry via `assembleSection`'s call site.
   *
   * Taken as a prop rather than recomputed here: the Section_Assembler is the
   * single owner of who the section renders (Requirement 1.1), and a second
   * count derived in this file could disagree with the grid above it.
   */
  coachCount: number;
  /**
   * The team's exact combined years on the floor, or `null` when any coach omits
   * `yearsExperience` — `SectionModel.combinedYears`, unchanged.
   *
   * `null` is a first-class value here, not an error state: it is the honest
   * answer whenever the data is partial, and this component's job is to render a
   * complete-looking footer without the figure in that case (Requirement 8.1).
   * The `null` check therefore lives **inside** this component. Note that
   * design.md §13.7's call-site sketch guards the whole `<RosterFooter>` with
   * `combinedYears !== null &&`, which would drop the coach count and the "See
   * all" link along with the figure — and today, with all six coaches missing the
   * field, would mean no footer at all. Task 9.3 and Requirement 8.1 scope the
   * omission to the figure and its sentence, so the component renders
   * unconditionally and decides for itself.
   */
  combinedYears: number | null;
  /**
   * Where "See all coaches" goes.
   *
   * A prop rather than a constant in this file, because the section owns its
   * destinations in one place (`TrainerShowcase`, beside `BOOKING_HREF`) and a
   * literal here would be a second owner.
   *
   * **There is no trainers index route today.** `src/app/` holds only the
   * homepage, so this should point at a destination the site actually resolves,
   * or at `/trainers` once that page exists. Worth knowing before choosing:
   * `Programs`, `Hero` and `FinalCta` already link to `/programs` and `/pricing`,
   * which are equally unbuilt — so `/trainers` would be consistent with the
   * site's existing forward-links rather than an outlier. That is a call for the
   * section wiring (task 9.4) to make, not for this component.
   */
  seeAllHref: string;
  /**
   * Layout classes from the container — the section's vertical rhythm above the
   * row, and nothing else.
   *
   * The footer sets no outer margin of its own for the same reason
   * `TrainerDossier` takes none: `TrainerShowcase` composes its children in one
   * `flex flex-col gap-10 lg:gap-14` stack, and spacing owned in two places
   * drifts.
   */
  className?: string;
}

export function RosterFooter({
  coachCount,
  combinedYears,
  seeAllHref,
  className,
}: RosterFooterProps) {
  // Requirement 8.1's gate, stated once. `!== null` rather than a truthiness
  // check, because a genuinely-supplied total of 0 is a number the registry can
  // produce (every coach at `yearsExperience: 0`) and `0` is falsy — the same
  // trap `resolveCombinedYears` and `resolveDossierRows` document.
  const hasCombinedYears = combinedYears !== null;

  return (
    // The footer's own reveal — §8.3's fourth and last group, on its own
    // `whileInView` at threshold 0.2 (Requirement 3.1). `preset="small"` is the
    // 12px travel from the Closed_Motion_Vocabulary; duration and easing come
    // from the primitive, so no timing is invented here (Requirement 3.9).
    //
    // This is a group reveal and the counter's 0.4 trigger inside it is a
    // separate, later one — which is the intended pair, not a conflict: the line
    // fades up as it enters, and the number starts counting once 40% of the row
    // is on screen. Under reduced motion `AnimationWrapper` renders a plain div
    // in the final state, keeping these layout classes (Requirement 6.5).
    <AnimationWrapper preset="small" className={cn(FOOTER_ROW_CLASSES, className)}>
      <p className={FOOTER_COPY_CLASSES}>
        {/* Always stated: the count is derived from the roster, so there is no
            content state in which it is absent. */}
        <span className={FOOTER_FIGURE_CLASSES}>{coachCount}</span>{" "}
        {coachCount === 1 ? "coach" : "coaches"}
        {/* Stated only when every coach supplied their years (Requirement 8.1).
            The separator is part of the clause it introduces, so it disappears
            with it — leaving "6 coaches" as a clean, finished line rather than a
            sentence with a dangling middot. It is `aria-hidden` because a
            middot is decoration between two facts, and screen readers announce
            it inconsistently. */}
        {hasCombinedYears && (
          <>
            <span aria-hidden="true" className="px-1 text-white/40">
              ·
            </span>
            <CountUp end={combinedYears} className={FOOTER_FIGURE_CLASSES} />{" "}
            {combinedYears === 1 ? "year" : "years"} on the floor between them
          </>
        )}
      </p>

      {/* The way out to the full roster. A plain `<a>` rather than `next/link`
          or `ButtonLink`, matching the lead dossier's CTA: the section's one
          primary, hydrated action is the CTA tile, and a secondary text link
          needs neither a client boundary nor a yellow fill. The arrow is
          decorative — `Icon` is `aria-hidden` by default. */}
      <a href={seeAllHref} className={SEE_ALL_CLASSES}>
        {SEE_ALL_LABEL}
        <Icon icon={ArrowRight} size="sm" className={SEE_ALL_ARROW_CLASSES} />
      </a>
    </AnimationWrapper>
  );
}
