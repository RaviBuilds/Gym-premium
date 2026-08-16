import { AnimationWrapper } from "@/components/motion/AnimationWrapper";
import { CameraLayer } from "@/components/motion/CameraLayer";
import { TrainerDossier } from "@/components/ui/TrainerDossier";
import { TrainerPlinth } from "@/components/ui/TrainerPlinth";
import { cn } from "@/lib/utils";
import type { Trainer } from "@/types/content";

/**
 * LeadCoachStage — the Lead_Coach's spread: one lit plinth on the section's
 * `sectionMedia` camera plane, beside the credential column that owns his
 * identity (design.md §6.1, §6.3, §6.4).
 *
 * ## Why this file lives beside the section rather than in `ui/`
 *
 * design.md §6.1's component graph hangs `LeadCoachStage` off `TrainerShowcase`,
 * not off the shared UI layer, and that is the honest place for it: the stage is
 * the section's *layout decision* — a width-capped 48/52 spread, one camera plane,
 * one `<article>` outside the roster list — composed from two components
 * (`TrainerPlinth`, `TrainerDossier`) that are genuinely reusable and do live in
 * `ui/`. Nothing outside this section can use a 48/52 lead spread, so nothing
 * outside this section should be able to import one.
 * `src/components/sections/trainer-showcase/`
 * already holds `roster.ts` for the same reason, so the section's private pieces
 * stay in one folder.
 *
 * ## Server Component, wrapping exactly one client boundary
 *
 * There is no `"use client"` directive here and there must never be one
 * (design.md §6.2: "the stage is layout; only the camera wrapper inside it is
 * client"). The stage resolves no state, runs no effect and binds no handler — it
 * places two boxes and hands each a plain `Trainer` object. What hydrates is the
 * primitives inside it: the one `CameraLayer`, the one `AnimationWrapper` around
 * the plinth, and whatever `TrainerDossier` composes for its own reveal ladder.
 * A server component may import and render a client component; only the reverse
 * needs a directive.
 *
 * ## One camera subscription, and which one
 *
 * The section is allowed exactly three subscriptions to the shared camera, and
 * this file owns the middle one: `sectionMedia` (lag 0.085, dolly 1.03 → 1.0),
 * the section's one Tier-2 depth cue spent on real content rather than on
 * atmosphere (Requirement 3.5, design.md §6.3). There is deliberately **no**
 * second plane for the dossier column: the copy beside the plinth belongs to the
 * same object as the photograph, and giving it its own plane is how the previous
 * implementation ended up with subscriptions differing by fractions of a pixel and
 * producing no perceptible depth at all — the mistake `camera-tokens.ts` records
 * at length. The column simply sits still while the plinth drifts, which is what
 * reads as depth.
 *
 * `CameraLayer` is used **in flow**, without `fill`. That is the correct mode for
 * a plane that is a real 4:5 photograph in a grid cell rather than a full-bleed
 * background: `fill` would absolutely position the plinth and take it out of the
 * spread entirely, and the overscan bleed it enables exists to stop a background
 * plane's travel from exposing a bare edge — a hazard a plinth sitting inside the
 * section's own padding does not have. Under reduced motion the whole thing
 * collapses to two nested plain divs with identical geometry, so `y` is 0, the
 * dolly is gone and no `will-change` is set (Requirement 6.5).
 */

/**
 * `next/image` `sizes` for the lead plinth — the honest widths of the box below,
 * not a convenient round number (Requirement 7.1).
 *
 * Derived the same way `RosterCard`'s `ROSTER_IMAGE_SIZES` is, walking the
 * breakpoints from the widest down because that is the order the browser
 * evaluates them, and subtracting the real `Container` padding, the spread's own
 * `lg:max-w-[980px]` ceiling and the real column gap at each step:
 *
 * | Viewport      | Spread width                          | Plinth width                 |
 * |---------------|---------------------------------------|------------------------------|
 * | ≥ 1124px      | capped at 980 by {@link SPREAD_MAX_W} | `(980 − 48) × 0.48` = 447px  |
 * | 1024–1123px   | `100vw − 144px` (`px-12`), uncapped   | `(100vw − 192px) × 0.48`     |
 * | 640–1023px    | `px-6` (48px total), single column    | `100vw − 48px`               |
 * | < 640px       | `px-4` (32px total), single column    | `100vw − 32px`               |
 *
 * Three things this encodes rather than guesses. The `× 0.48` is the spread's own
 * ratio, so the string tracks {@link SPREAD_COLUMNS_CLASS} — change the split and
 * this changes with it. The gap is subtracted *before* the ratio is applied,
 * because a `48fr 52fr` grid divides the space that is left after the gutter, not
 * the container's full width; multiplying first would over-fetch at every desktop
 * width. And the 1124px switch is where the spread's own cap starts biting rather
 * than a breakpoint from the theme: `100vw − 144px > 980` solves to `100vw > 1124px`,
 * so above that the plinth is a fixed 447px and a viewport-relative expression
 * would describe a width that cannot happen.
 *
 * Below `lg:` there is no ratio and no cap at all: the plinth is the full container
 * width (Requirement 5.2), which is why those two entries are a plain subtraction.
 */
const LEAD_IMAGE_SIZES =
  "(min-width: 1124px) 447px, (min-width: 1024px) calc((100vw - 192px) * 0.48), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)";

/**
 * The spread's width ceiling — the one lever that sizes the lead plinth
 * (Requirement 5.1).
 *
 * ## Why the plinth is capped by width and never by height
 *
 * The plinth's inner frame is `aspect-[4/5]`, so its height is **derived** from
 * its width: `height = width × 1.25`. That single fact decides how this cap has to
 * be written, and it is worth stating plainly because the obvious alternative is
 * wrong in three separate ways.
 *
 * Uncapped, the spread stretched to the full 1280px content column, which put the
 * plinth at `(1280 − 48) × 0.57 = 702px` wide and therefore **878px tall** — taller
 * than the viewport of most laptops on its own, so a visitor scrolled roughly three
 * screens to get past one coach. That is the defect this cap exists to fix.
 *
 * Capping the frame's *height* instead (`max-h-[560px]` on the frame) would fix the
 * scroll and break everything else: `max-height` overrides the derived height, so
 * the frame renders wider than 4:5 and `object-cover object-bottom` re-crops the
 * cutout horizontally — clipping the lead's crossed arms at the elbow. It would
 * also falsify Property 20 (design.md §13.4: the frame's ratio is 4:5 for *every*
 * variant) and the CLS-0 claim in Requirement 7.7, which holds precisely *because*
 * height is derived and never asserted.
 *
 * So the cap goes on the **spread**, and the plinth's height falls out of it:
 * `(980 − 48) × 0.48 = 447px` wide → `447 × 1.25 = 559px` tall. A 36% reduction
 * with the aspect ratio, the crop and the CLS guarantee all untouched, because
 * width is still the only input.
 *
 * 980px rather than a round 1000: it is the width at which the 48/52 split puts the
 * plinth at ~447px, which is the largest frame that still leaves the section header
 * and the top of the roster tray visible together on a 900px viewport. The ~300px
 * it gives back on the right of a 1280px column is deliberate asymmetric
 * whitespace on the same left axis as the section header, not a gap to fill.
 */
const SPREAD_MAX_W = "lg:max-w-[980px]";

/**
 * The spread — 48% plinth / 52% dossier at `lg:` and above, one stacked column
 * below it (Requirements 5.1, 5.2, design.md §6.4).
 *
 * ## Why a grid with `fr` units rather than two `w-[48%]` flex children
 *
 * The percentages have to hold *including* the gutter, and `w-[48%] + w-[52%] +
 * gap-12` sums to 100% + 48px — an overflow that flex resolves by shrinking both
 * children by whatever `flex-shrink` decides, which is neither 48% nor 52% and
 * changes with the container. `grid-cols-[48fr_52fr]` divides what remains after
 * the gap in exactly 48 : 52, at every width, so the ratio the requirement names is
 * the ratio that renders. It is also what lets {@link LEAD_IMAGE_SIZES} be derived
 * rather than measured.
 *
 * The split was 57/43 through Phase 6. It is now 48/52 for one reason: at 57% the
 * plinth was the thing that made the section three viewports tall (see
 * {@link SPREAD_MAX_W}), and the 43% column it bought was never earning its width.
 * The dossier is architected for five credential rows and renders **one** today —
 * `resolveDossierRows` can only return `Focus`, because `yearsExperience`,
 * `certifications` and `philosophy` are unset on all six coaches by content
 * contract (`src/content/trainers.ts`). Giving a one-row column *more* width would
 * have made design.md's P7 ("a full viewport of empty space around the lead trainer
 * earns nothing") worse, not better, which is why the plinth loses 9 points here
 * rather than the dossier gaining them in isolation.
 *
 * ## What happens below `lg:`
 *
 * A single implicit column, so the plinth is full width and the dossier stacks
 * underneath it (Requirement 5.2) — the DOM order is already plinth-then-dossier,
 * so nothing needs reordering and no source-order/visual-order mismatch is
 * introduced for a screen reader or a keyboard user. There is no `sm:` step: the
 * spread is a desktop composition, and 640–1023px reads better as the stacked
 * layout than as a 48/52 split of a tablet's width. {@link SPREAD_MAX_W} is `lg:`
 * only for the same reason — a cap on a stacked column would just inset the plinth
 * from the container it is supposed to fill.
 *
 * ## `lg:items-center`, and what it fixes
 *
 * The grid's default `stretch` left the dossier column starting at the plinth's top
 * edge, which is the reading order §6.4's diagram draws — and with a full five-row
 * dossier it is the right choice. With today's one-row dossier it pooled every bit
 * of the height difference into one void *below* the text, which is the empty dark
 * area that reads as unfinished. Centring distributes that difference above and
 * below instead, so the short column reads as deliberately seated against the frame
 * rather than as a column that ran out of content.
 *
 * This is explicitly **not** `lg:items-end`, which the pre-Phase-6 implementation
 * used: bottom-alignment pinned the name to the coach's feet and grew the hole
 * upward, which is the same defect pointing the other way.
 *
 * When the owner supplies the three missing fields the dossier's height approaches
 * the plinth's and this alignment stops mattering — centring a column that fills its
 * row is a no-op, so nothing here needs revisiting at that point.
 */
const SPREAD_COLUMNS_CLASS = cn(
  "grid grid-cols-1 gap-8 lg:grid-cols-[48fr_52fr] lg:items-center lg:gap-12",
  SPREAD_MAX_W
);

export interface LeadCoachStageProps {
  /**
   * The Lead_Coach, as resolved by `assembleSection`. Plain JSON-serialisable
   * content, so it crosses the boundary into `CameraLayer`'s client subtree
   * unchanged (Requirement 8.10, design.md §6.2).
   */
  trainer: Trainer;
  /**
   * The lead's two-digit display index — `"01"` for every content set the
   * Section_Assembler can produce.
   *
   * Taken as a prop rather than hard-coded here precisely *because* it is always
   * `"01"`: `assembleSection` is the single source of the section's index map
   * (Requirement 1.2), and a literal in this file would be a second place that
   * decides the same thing and a second place to update if the lead ever stops
   * being first. The chip it lands in is `aria-hidden`, so this is decoration that
   * has to stay contiguous with the roster's `"02"`–`"06"`, not identity.
   */
  index: string;
  /**
   * The section-level booking target, passed straight to the dossier column's
   * per-coach CTA (Requirement 4.5).
   *
   * Required rather than defaulted, matching `RosterCard` and `TrainerDossier`:
   * the section owns its one conversion target in one place, and a default here
   * would let the featured coach's action point somewhere the section never chose.
   * The `trainer.ctaHref ?? fallbackCtaHref` rule itself belongs to the dossier,
   * so this file forwards the fallback and resolves nothing.
   */
  fallbackCtaHref: string;
  /** Extra classes for the stage's `<article>`. Layout only. */
  className?: string;
}

export function LeadCoachStage({
  trainer,
  index,
  fallbackCtaHref,
  className,
}: LeadCoachStageProps) {
  return (
    // The stage is an `<article>`, and it sits OUTSIDE the roster's `<ul>`
    // (Requirement 6.6). Both halves of that matter: the lead is a self-contained
    // composition about one person, which is what `<article>` means, and it is not
    // one of the roster's list items — folding it in would make a screen reader
    // announce "list, 6 items" over a set of cells where one is twice the size of
    // the others and carries a different structure entirely.
    //
    // It is not labelled here: the `<h3>` inside `TrainerDossier` is the coach's
    // name and gives the region its accessible name, once (Requirement 6.10).
    <article className={cn(SPREAD_COLUMNS_CLASS, className)}>
      {/* THE PLINTH COLUMN — 48% at `lg:` (447px once the spread's 980px cap
          bites), full width below, and the section's one `sectionMedia` camera
          plane (Requirement 3.5).

          The camera's outer element is the grid child, so the cell is what gets
          measured and the transform lands on its inner child — the split
          `useCameraLayer`'s ref contract requires, since transforming the element
          being measured would feed `getBoundingClientRect` its own output. */}
      <CameraLayer depth="sectionMedia">
        {/* The plinth's own arrival — §8.3 row 10: `y 40 → 0` at delay 0.10, on
            this group's own `whileInView` at threshold 0.2 (Requirement 3.1).

            It is the stage's reveal, so it belongs here rather than around the
            whole spread: the dossier column runs its own five-rung ladder from
            0.25 to 0.57 (§8.3 rows 11–15) and wrapping both in one reveal would
            fade the column in twice. Whatever composes this stage should therefore
            render it directly, without another `AnimationWrapper` around it, or
            the two delays compound.

            `preset="large"` is the 40px distance from the Closed_Motion_Vocabulary
            and the value §8.3 gives this row; the duration and easing come from
            the primitive, so no timing is invented here (Requirement 3.9). Under
            reduced motion it renders a plain div in the final state with no
            delay. */}
        <AnimationWrapper preset="large" delay={0.1}>
          {/* `suppressName` — the reason this whole spread reads as one person
              rather than two (Requirements 6.10, 8.7). The dossier column beside
              it owns the lead's identity and credentials, so the frame carries the
              role alone: no `<h3>`, no discipline pips, no achievement badge, and
              therefore exactly one name and one "Mr Nizamabad" in the accessibility
              tree and on screen. */}
          <TrainerPlinth
            trainer={trainer}
            variant="lead"
            index={index}
            imageSizes={LEAD_IMAGE_SIZES}
            suppressName
          />
        </AnimationWrapper>
      </CameraLayer>

      {/* THE DOSSIER COLUMN — 52% at `lg:`, stacked below the plinth otherwise.

          Deliberately outside the `CameraLayer`: it is the same object as the
          plinth, not a second depth, and the section's third subscription belongs
          to the roster tray (Requirement 3.5).

          It takes no layout classes from here. Its own root is
          `flex flex-col items-start` with per-block top margins, and the spacing
          between it and the plinth — beside it or under it — is the spread's own
          `gap-8 lg:gap-12`. Anything added here would be a second owner of the same
          rhythm. */}
      <TrainerDossier trainer={trainer} variant="lead" fallbackCtaHref={fallbackCtaHref} />
    </article>
  );
}
