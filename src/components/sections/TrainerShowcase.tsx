import { PageSection } from "@/components/layout";
import { AnimatedDivider, AnimationWrapper, KineticHeadline } from "@/components/motion";
import { BodyText, Eyebrow } from "@/components/ui";
import { trainers } from "@/content/trainers";

import { LeadCoachStage } from "./trainer-showcase/LeadCoachStage";
import { RosterAtmosphere } from "./trainer-showcase/RosterAtmosphere";
import { RosterFooter } from "./trainer-showcase/RosterFooter";
import { RosterGrid } from "./trainer-showcase/RosterGrid";
import { assembleSection, type SectionModel } from "./trainer-showcase/roster";

/**
 * TrainerShowcase — "Train With Experts": a lit coaching floor. One lead coach
 * on a cinematic plinth beside a full credential column, five coaches in a
 * containment grid, a sixth booking tile, and one closing line of facts
 * (design.md §6.1, §6.4, §13.7).
 *
 * This file is **wiring**. It owns four things and delegates everything else:
 *
 *  1. **The section's box** — `PageSection tone="dark" spacing="standard"` plus
 *     the four preserved background layers in {@link SectionBlends}.
 *  2. **The section's constants** — the roster's presentation order, the one
 *     booking target, the "see all" destination and the header copy.
 *  3. **The header** — eyebrow, `<h2>`, supporting line, header rule.
 *  4. **The vertical rhythm** between the five composed blocks.
 *
 * Who appears where comes from `assembleSection`; the lit frames come from
 * `TrainerPlinth`; the lead's facts come from `TrainerDossier`; the tray's
 * containers, stagger and CTA placement come from `RosterGrid`. Nothing in this
 * file re-decides any of that, so each rule has exactly one owner.
 *
 * ## Server Component, and what that buys (Requirement 7.8)
 *
 * There is no `"use client"` directive here and there must never be one. The
 * section reads `trainers` at build time, resolves its model once at module
 * scope and maps content into JSX — no state, no effects, no handlers. Three
 * client components hydrate inside it, which is the cap Requirement 7.8 sets:
 *
 * | Hydrates | Why |
 * |---|---|
 * | `RosterAtmosphere` | composes `CameraLayer` → `useCameraLayer` → `useScroll` |
 * | `CameraLayer` / `CameraGroup` inside the stage and the tray | same |
 * | `AnimationWrapper` / `MaskedLine` / `KineticHeadline` / `AnimatedDivider` / `CountUp` | reveal primitives, already shipping page-wide |
 *
 * The content itself — all six plinths, five `RosterCard`s, the CTA tile, both
 * dossiers and the footer copy — ships **zero** client JavaScript, because every
 * hover and focus state is a CSS group variant rather than React state
 * (design.md §6.2).
 *
 * ## Three camera subscriptions, not eight (Requirements 3.5, 3.6, 7.9, 7.10)
 *
 * This file adds **none**. The section's three planes live one level down, one
 * per file, which is what makes the count auditable by grep rather than by
 * reading:
 *
 * | Plane | Depth | Owner |
 * |---|---|---|
 * | far | `deepBackground` (lag 0.17) | `RosterAtmosphere` |
 * | mid | `sectionMedia` (lag 0.085, dolly 1.03→1.0) | `LeadCoachStage` |
 * | near | `interactive` (lag 0.012) | `RosterGrid` |
 *
 * There is no `useScroll` anywhere in the section outside the camera system
 * (Requirement 3.6), no scroll or resize listener of this file's own, and every
 * camera transform is driven by a `MotionValue` inside the camera hook — so
 * scrolling the section triggers zero React re-renders (Requirement 7.9). The
 * only other scroll-position reader in the subtree is `CountUp`'s one-shot
 * `useInView` in the footer, which fires once and stops, keeping the section
 * inside Requirement 7.10's four-subscription ceiling.
 *
 * ## Exactly three resting yellow accents (Requirement 2.5)
 *
 * ```
 *   ● eyebrow ......................... this file
 *          ● lead achievement group ... TrainerDossier (badge + its rule)
 *                     ● CTA tile ...... RosterCtaTile (primary button)
 * ```
 *
 * A clean triangle down the section, and the count is independent of how many
 * coaches earn a `signatureAchievement`: the roster variant renders its badge as
 * `Badge variant="informational"` (ink, white text), so a second achievement
 * cannot add a fourth accent (design.md §5.6, Requirement 8.6).
 *
 * **The header rule is deliberately not yellow**, and that is a change from the
 * old implementation. The section previously carried a `bg-brand-yellow` rule in
 * the lead's story stack, which is the *same* rule §5.6 counts as half of the
 * lead's accent group — and it still exists, unchanged, inside `TrainerDossier`.
 * Adding a second yellow rule up here would be a fourth resting accent by any
 * honest reading: it sits at section level, nowhere near the badge it would have
 * to be grouped with, and §5.6's table names the header's one yellow as the
 * eyebrow. So the header rule is a `white/15` hairline. It still draws
 * (`scaleX 0 → 1`) and still terminates the header block; it just does not spend
 * an accent.
 *
 * ## What was retired here
 *
 * The Phase 4 oversized backdrop numeral and the `TrainerImageFrame` /
 * `AnchorBlock` / `SecondaryBlock` helpers are gone rather than deprecated. The
 * numeral is now a single `RosterIndexChip` per coach inside the plinth's label
 * pool (Requirement 2.7), the frame is `TrainerPlinth`, and the two block
 * helpers are `LeadCoachStage` and `RosterCard`. The 58/42 and 3-up row splits,
 * the per-trainer aspect ratios and the mobile `ml-8` insets went with them:
 * every frame is now 4:5 with `object-cover object-bottom`, so frame geometry no
 * longer depends on a source photo's aspect ratio (Requirement 2.9).
 */

/**
 * The roster's presentation order — who appears at `02` through `06`, decoupled
 * from declaration order in `src/content/trainers.ts` (Requirement 1.6).
 *
 * Carried over verbatim from the previous implementation's
 * `SECONDARY_PRESENTATION_ORDER`, so the redesign changes the frames without
 * reshuffling the people. The lead is absent by construction: he is resolved
 * from `lead: true` and excluded from the roster by `resolveRoster`.
 *
 * A typo here fails `next build` rather than a visitor's render — see the
 * module-scope call below.
 */
const ROSTER_PRESENTATION_ORDER = [
  "dhanveer-prakash",
  "mohammed-yousuf",
  "mohiuddin-ahmed",
  "anuradh-aleti",
  "ruma-mehar",
] as const;

/**
 * The section's one booking target (Requirement 4.5).
 *
 * `/#free-trial` is the site's existing conversion anchor, not a new one: it is
 * exactly what `Hero`, `Navbar`, `Testimonials`, `FinalCta` and
 * `StickyMobileCTA` already link to, and the `id="free-trial"` it resolves to is
 * the `TrialBookingForm` block in `Footer`. Reusing it means every card, the CTA
 * tile and the lead's dossier land on the one form the site already has, rather
 * than on a `/contact` route that does not exist (design.md §13.7 sketches
 * `/contact?intent=trial`, which would 404 today).
 *
 * It flows to three places and is the same value in all three on purpose: the
 * tile's `href`, each card's fallback when that coach has no `ctaHref`, and the
 * lead dossier's CTA fallback. One owner, so the section's conversion target
 * cannot drift apart.
 */
const BOOKING_HREF = "/#free-trial";

/**
 * Where the footer's secondary action goes.
 *
 * This was `/trainers`, on the reasoning that naming an intended route was better
 * than pointing a link labelled "See all coaches" at a booking form. That
 * reasoning has been overtaken by two facts:
 *
 * 1. **`/trainers` does not exist and is not being built for the demo.** `src/app/`
 *    holds only `page.tsx`, so the link resolved to a 404 — which is strictly
 *    worse than any working destination.
 * 2. **"See all coaches" was already satisfied.** The section renders the lead
 *    plus all five roster coaches; every trainer in the Content_Registry is on
 *    screen. There is no "all" left to see, so the label was describing a page
 *    that would have duplicated this section.
 *
 * So the action becomes the one thing a visitor who has just read six coach
 * profiles can actually do, and `RosterFooter`'s label changes with it. The prop
 * is still named `seeAllHref` — renaming it across the component's interface and
 * doc comments is a wider change than this fix needs, and the value it carries is
 * still "the footer's secondary destination".
 */
const SEE_ALL_HREF = "/#free-trial";

/** The section's eyebrow — resting yellow accent 1 of 3 (Requirement 2.5). */
const EYEBROW = "Train With Experts";

/**
 * The `<h2>` (Requirement 6.6). Unchanged copy from the previous
 * implementation — the redesign is a visual and structural rebuild, not a
 * rewrite of the section's claim.
 */
const HEADING = "Six trainers. Zero guesswork.";

/**
 * The supporting line, stated once.
 *
 * The old implementation rendered this twice — a stacked mobile copy and a
 * right-aligned desktop copy, toggled with `hidden`/`lg:hidden` — because the
 * desktop version had to sit beside the anchor photo rather than in the header.
 * The new header is a two-column row at `lg:`, so one element in one place
 * covers both readings via `lg:text-right`, and the section stops carrying two
 * copies of one sentence that could drift apart.
 */
const SUPPORTING_LINE = "Different strengths. One coaching standard.";

/**
 * The header's reveal ladder — design.md §8.3 rows 4–7, in seconds, relative to
 * the header group's own `whileInView` at threshold 0.2 (Requirement 3.1).
 *
 * Every value is from the Closed_Motion_Vocabulary (Requirement 3.9); durations
 * and easing are not named here at all, because each primitive reads them from
 * the shared `motion` tokens. Only the offsets belong to the section.
 *
 * One honest note on `heading`: `KineticHeadline` adds its own 0.1s base to
 * whatever `delay` it is given (`delay + 0.1 + 0.06·i`), which is the Hero's
 * existing behaviour and was deliberately left untouched when the `trigger` and
 * `delay` props were added. So `heading: 0.1` puts the first word at 0.20s
 * rather than §8.3's 0.10s. The value matches design.md §13.7's call-site sketch
 * and keeps the intended reading order (eyebrow, then heading, then the
 * supporting line, then the rule); the 100ms is a documented offset from the
 * table, not a second timing system.
 */
const HEADER_DELAYS = {
  eyebrow: 0,
  heading: 0.1,
  supportingLine: 0.2,
  rule: 0.3,
} as const;

/**
 * The `<h2>`'s type classes — `Heading level="section"`'s own styles, inlined
 * because `KineticHeadline` needs to *be* the heading element (it splits the
 * text into per-word masks, so it cannot be nested inside a `Heading`).
 *
 * These are the existing section-heading tokens verbatim, not new values
 * (Requirement 2.10).
 */
const HEADING_CLASSES = "font-display text-section text-white lg:text-section-lg";

/**
 * The header's terminating rule — the same `h-px w-12 lg:w-16` geometry already
 * shipping in `Facilities`, `TrustStrip` and the lead dossier, in `white/15`
 * rather than `bg-brand-yellow`. See the accent-budget note in this file's
 * header for why the colour is the one thing that changed.
 */
const HEADER_RULE_CLASSES = "h-px w-12 bg-white/15 lg:w-16";

/**
 * The section's vertical rhythm — one stack, one owner.
 *
 * `LeadCoachStage`, `RosterGrid`, `TrainerDossier` and `RosterFooter` all
 * deliberately set no outer margin of their own, so this `gap` is the only thing
 * deciding the space between the section's blocks (design.md §13.7).
 */
const CONTENT_STACK_CLASSES = "relative z-10 flex flex-col gap-10 lg:gap-14";

/**
 * The header row — the main heading stays on the left, while the eyebrow and
 * supporting line form one right-aligned section-title block from `md:` upward.
 * Below `md:` the three pieces return to the reading order eyebrow → heading →
 * supporting line.
 */
const HEADER_ROW_CLASSES =
  "flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-8";

/**
 * SectionBlends — the four background layers this section has always painted,
 * preserved byte for byte (Requirement 2.8, design.md §5.7).
 *
 * A module-local component rather than a shared one, and rather than four divs
 * inline in `TrainerShowcase`: design.md §13.7 names `SectionBlends` at the call
 * site, no such component exists anywhere in the codebase, and inventing a
 * shared one would mean generalising four hand-tuned gradients that only make
 * sense between `Facilities` and `Testimonials`. Naming them as a unit here is
 * the useful half of the idea — it makes "these layers are frozen" a property of
 * a named thing rather than a comment on a stack of divs.
 *
 * ## Why these are frozen
 *
 * Two of them are half of a hand-off. `Facilities` (`tone="light"`) paints a
 * matching `rgba(20,24,29,0.18)` bottom blend that this section's top blend
 * receives, and `Testimonials` (`tone="light"`) paints a matching top blend that
 * receives this section's bottom blend. Retuning either end here would break a
 * transition that is authored in two files, so the gradients, the stops, the
 * heights and the ordering below are exactly what shipped before this rewrite.
 *
 * Everything is `aria-hidden` + `pointer-events-none` atmosphere with no motion
 * of any kind (Requirements 6.3, 3.10). All four are `absolute` against the
 * `PageSection`'s `relative` box rather than the `Container` they sit inside, so
 * they span the section edge to edge while the content column stays padded.
 *
 * ## The Blend_Zone stays clear
 *
 * Requirement 2.8's hard constraint is that **no new layer** may paint within
 * the section's top or bottom 128px. This file adds none: the only new
 * atmosphere is `RosterAtmosphere`'s camera plane, which masks itself to
 * transparent through both bands. Nothing here changed, so nothing here can
 * violate it.
 */
function SectionBlends() {
  return (
    <>
      {/* Top blend — receives Facilities' light→dark hand-off (Surface Light →
          Ink), turning a hard cut into a dissolve. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 sm:h-24 lg:h-32"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,24,29,0.4) 0%, rgba(20,24,29,0.15) 45%, transparent 100%)",
        }}
      />
      {/* Bottom blend — hands the dark section into Testimonials' light top. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 sm:h-24 lg:h-32"
        style={{
          background:
            "linear-gradient(0deg, rgba(20,24,29,0.35) 0%, transparent 100%)",
        }}
      />
      {/* Warm radial wash — depth parity with Hero/TrustStrip/Programs. At 4%
          this is light rather than an accent, so it spends no yellow. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(255,222,1,0.04) 0%, transparent 65%)",
        }}
      />
      {/* Section vignette — the section's own edge falloff. Distinct from, and
          underneath, the depth vignette that rides the atmosphere plane. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 130% 100% at 50% 40%, transparent 55%, rgba(20,24,29,0.22) 100%)",
        }}
      />
    </>
  );
}

/**
 * The section's render model, resolved **once at module scope** — not per
 * render, and not inside the component (design.md §13.6, §13.7).
 *
 * This is the whole reason `resolveRoster` throws instead of degrading. A typo
 * in {@link ROSTER_PRESENTATION_ORDER}, a coach missing from it, a duplicated
 * slug or two coaches sharing a slug all fail during this module's evaluation,
 * which happens while `next build` prerenders the page — so the failure is a red
 * build on a developer's machine rather than a hole in the roster on a
 * visitor's screen (Requirement 1.7). Moving this call into the component body
 * would move that failure to render time and buy nothing: the model is a pure
 * function of content that cannot change at runtime.
 */
const SECTION: SectionModel = assembleSection(
  trainers,
  ROSTER_PRESENTATION_ORDER,
  BOOKING_HREF
);

/**
 * The lead's display index, read from the assembler's map rather than written as
 * `"01"` here.
 *
 * `assembleSection` is the single owner of the section's index numerals
 * (Requirement 1.2), and a literal in this file would be a second place that
 * decides the same thing — silently wrong the day the lead stops being first.
 *
 * The lookup is a function rather than an inline `??` fallback for two reasons.
 * `indices` is a `Record<string, string>` and the project compiles with
 * `noUncheckedIndexedAccess`, so the read is `string | undefined` however it is
 * written; and the honest handling of "the assembler indexed every coach but
 * somehow not the lead it just returned" is a loud build failure, not a default
 * value papering over a broken invariant. A fallback would also reintroduce the
 * second owner this exists to avoid.
 */
function resolveLeadIndex(model: SectionModel): string {
  const index = model.indices[model.lead.slug];

  if (index === undefined) {
    throw new Error(
      `[trainer-showcase] assembleSection returned no index for the lead coach "${model.lead.slug}". Every coach is indexed by assembleSection, so this means its index map and its resolved lead disagree — check src/components/sections/trainer-showcase/roster.ts.`
    );
  }

  return index;
}

const LEAD_INDEX = resolveLeadIndex(SECTION);

export function TrainerShowcase() {
  const { lead, roster, combinedYears } = SECTION;

  return (
    <PageSection id="trainers" tone="dark" spacing="standard" className="relative overflow-hidden">
      {/* Frozen background layers, then the one new camera plane above them.
          Order matters: the plane's texture and hex wash are meant to read as
          material sitting on top of the warm wash, and both are underneath the
          `z-10` content column below. */}
      <SectionBlends />
      <RosterAtmosphere />

      <div className={CONTENT_STACK_CLASSES}>
        {/* ── Header ────────────────────────────────────────────────────────
            §8.3 rows 4–7. Each element carries its own trigger at threshold
            0.2 and its own offset from {@link HEADER_DELAYS}, so the header
            arrives as a sequence rather than as one block — and the header as a
            whole arrives before the lead stage, which is Requirement 3.1's
            group order. */}
        <header className={HEADER_ROW_CLASSES}>
          {/* Left column: eyebrow stacked directly above the `<h2>`, the
              standard eyebrow-then-heading pairing used everywhere else on
              the site (Facilities, InsideTheGym, Programs). */}
          <div className="flex flex-col gap-3">
            <AnimationWrapper preset="small" delay={HEADER_DELAYS.eyebrow}>
              {/* Resting yellow accent 1 of 3. `tone="dark"` is the
                  yellow-on-ink treatment, which is the accessible pairing on
                  this background (≥12:1, Requirement 6.8). */}
              <Eyebrow tone="dark">{EYEBROW}</Eyebrow>
            </AnimationWrapper>

            {/* The section's `<h2>` (Requirement 6.6), and the one place the
                Hero's kinetic treatment is reused below the fold.
                `trigger="inView"` is mandatory here: on the default `"mount"`
                the words would reveal while the section is still far off-screen
                and a visitor would only ever meet the settled state. Each word
                animates `transform` inside its own `overflow-hidden` mask
                (Requirement 3.8), the sequence runs once, and reduced motion
                renders the plain final text (Requirement 6.5). */}
            <KineticHeadline
              as="h2"
              trigger="inView"
              delay={HEADER_DELAYS.heading}
              text={HEADING}
              className={HEADING_CLASSES}
            />
          </div>

          {/* Right column: the supporting line, right-aligned at `md:` and
              stacked beneath the left column below it. */}
          <AnimationWrapper preset="small" delay={HEADER_DELAYS.supportingLine}>
            <BodyText size="large" className="text-text-secondary-dark md:text-right">
              {SUPPORTING_LINE}
            </BodyText>
          </AnimationWrapper>
        </header>

        {/* The header's terminating rule — white, not yellow. Draws
            `scaleX 0 → 1` from centre; renders immediately under reduced
            motion. Decorative, so it has no accessible name. */}
        <AnimatedDivider
          orientation="horizontal"
          delay={HEADER_DELAYS.rule}
          className={HEADER_RULE_CLASSES}
        />

        {/* ── The lead coach ────────────────────────────────────────────────
            An `<article>` outside the roster's `<ul>` (Requirement 6.6), owning
            the section's `sectionMedia` plane and its own reveal at delay 0.10.
            Deliberately **not** wrapped in an `AnimationWrapper` here: the stage
            runs that reveal internally, and a second wrapper would compound the
            delay and fade the spread in twice. */}
        <LeadCoachStage
          trainer={lead}
          index={LEAD_INDEX}
          fallbackCtaHref={BOOKING_HREF}
        />

        {/* ── The roster tray ──────────────────────────────────────────────
            Takes the array rather than rendered children: `RosterGrid` maps it
            itself and appends the CTA tile after the last coach, so the tile is
            structurally last for any roster length (Requirement 1.8) and the
            stagger is one continuous sequence across every cell (Requirement
            3.12). It also owns the swipe-strip / grid switch and the section's
            `interactive` plane. */}
        <RosterGrid roster={roster} bookingHref={BOOKING_HREF} />

        {/* ── The closing line ─────────────────────────────────────────────
            Rendered unconditionally. design.md §13.7's sketch guards this with
            `combinedYears !== null &&`, which would drop the coach count and the
            "See all" link along with the figure — and today, with all six
            coaches missing `yearsExperience`, would mean no footer at all.
            Requirement 8.1 scopes the omission to the figure and its sentence,
            and `RosterFooter` makes that decision internally.

            `coachCount` is `trainers.length` — the whole team, lead included —
            for the same reason `combinedYears` sums over the whole team: the
            footer states a fact about the coaching staff, not about the grid. */}
        <RosterFooter
          coachCount={trainers.length}
          combinedYears={combinedYears}
          seeAllHref={SEE_ALL_HREF}
        />
      </div>
    </PageSection>
  );
}
