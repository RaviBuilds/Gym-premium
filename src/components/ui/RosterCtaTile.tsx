import { CalendarCheck } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { BodyText, Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";
import { HEX_CLIP, HEX_CLIP_INSET } from "@/lib/shapes";
import { cn } from "@/lib/utils";

/**
 * RosterCtaTile — the roster grid's final cell, and the section's one primary
 * action (design.md §5.4 application 4, §5.6, §6.4).
 *
 * ## Why this component exists at all
 *
 * It is not decoration bolted onto a grid: it is what makes the grid *resolve*.
 * Concept B lines the roster up in a 3×2 desktop grid, and five coaches in six
 * cells leaves a hole in the bottom-right corner — the one place a lineup can
 * least afford to look unfinished. design.md §Concept B states the trade
 * plainly: "the 6th cell (CTA tile) makes the grid resolve instead of leaving a
 * hole." So the tile earns its place twice over — it closes the composition, and
 * it is the section's answer to P8 (there was previously no conversion
 * affordance anywhere in "Train With Experts").
 *
 * That framing is also why the tile is deliberately *not* a sixth coach-shaped
 * card. It shares the roster's frame geometry, its lit surface, its hairline
 * edge and its hexagon motif so it reads as the same family, but it carries no
 * portrait, no index numeral and no name — because it is not a person, and
 * dressing an action up as a coach would cost the roster its "one numeral per
 * coach" discipline (Requirement 2.7).
 *
 * ## Its yellow is budgeted, and it is the only one in here
 *
 * The whole section spends exactly three resting brand-yellow accents: the
 * eyebrow, the lead coach's achievement group, and *this tile's primary button*
 * (Requirement 2.5, design.md §5.6). Three resting points form a clean triangle
 * down the section; a fourth starts turning the spotlight into wallpaper, which
 * `globals.css` names as the brand's own rule.
 *
 * Two consequences worth stating before anyone reaches for the palette here:
 *
 * 1. **The button is the accent.** That is why this file uses the existing
 *    `ButtonLink variant="primary"` rather than a bespoke yellow link — the
 *    section's one primary action should look exactly like every other primary
 *    action on the site, and the accent budget is spent on a component that is
 *    already audited for contrast, focus and touch-target size.
 * 2. **Nothing else in the tile may be yellow.** The hex icon plate is
 *    therefore built in the neutral machined-steel construction shipped by
 *    `StripNavigator` — a `bg-white/25` rim with a `bg-ink` core and a white
 *    icon. A yellow plate beside a yellow button would read as two accents in
 *    one cell and break the count in Requirement 2.5.
 *
 * ## Layout-agnostic on purpose
 *
 * `RosterGrid` (task 9.2) owns all three containers — the sub-640px swipe
 * strip, the 640–1023px two-column grid and the 1024px-and-up three-column
 * grid — and this tile is simply the last child handed to it (Requirements 5.1,
 * 5.2, 5.3). So there is no `col-start-*`, no `row-*`, no breakpoint-specific
 * placement and no assumption about how many coaches precede it: the tile is
 * "the final cell" because it is passed last, which is what keeps the grid valid
 * for 4–7 roster entries with no code change (Requirement 1.8).
 *
 * The box is sized to resolve against the roster's frames rather than to a fixed
 * height. `TrainerPlinth` fixes every coach frame at `aspect-[4/5]`, so this
 * tile takes the same ratio: when it shares a row with a card, the row's height
 * is already definite and the stretch wins, so the tile fills the row exactly;
 * when a 4-or-7-coach roster leaves it alone in its final row, the aspect ratio
 * gives it an intrinsic height that matches what a card of the same width would
 * have taken. One declaration covers both cases, which is why there is no
 * `min-h-*` guess in here.
 *
 * ## Zero hydration of its own, CSS-only interaction
 *
 * No `"use client"` directive, and there must never be one (design.md §6.2):
 * the tile holds no state, runs no effects and binds no handlers. Its hover and
 * focus craft is a single CSS group variant off the named `group/cta` root, so
 * keyboard users get the same treatment through `group-focus-within/cta:` for
 * free — no second code path. The one hydrated thing in the subtree is
 * `ButtonLink`, which is already a client component everywhere else on the site.
 *
 * Everything animated is `transform` only, gated behind `motion-safe:`. No
 * `filter`, no animated `box-shadow`, no `backdrop-filter` (Requirements 7.5,
 * 7.7).
 *
 * ## A note on `position`
 *
 * design.md §13.7's example call site passes `position={roster.length}`. This
 * component does not accept it, and that is deliberate rather than an omission:
 * the tile renders no index numeral, and its reveal delay is applied by
 * `RosterGrid`'s `getStaggerDelay(i)` wrapper from the outside (Requirement
 * 3.2, 3.12). There is no honest work left for the prop to do, and a prop that
 * is accepted and ignored is worse documentation than no prop at all.
 */

/**
 * Tile copy.
 *
 * Section-level invitation, not a claim about any coach — so it sits here as
 * plain presentation rather than in the Content_Registry, which is reserved for
 * facts the gym owner supplied (Requirement 8.3). The action's label is
 * self-describing on its own, because Requirement 6.4 counts it as one of the
 * section's real tab stops: a screen-reader user landing on it out of context
 * still hears what it books. Per-coach naming ("Book a session with {name},
 * {title}") belongs to `RosterCard`, never here — this tile books the gym, not a
 * person.
 */
const TILE_TITLE = "Not sure who to train with?";
const TILE_BODY = "Book a session and train with the coach who fits your goal.";
const TILE_ACTION_LABEL = "Book a trial session";

/**
 * Plinth surface — byte-identical to the gradient in `TrainerPlinth`, and
 * duplicated on purpose.
 *
 * The tile has to read as the same material as the five frames beside it, so it
 * catches light the same way: a three-stop white gradient dying out at 72%,
 * which reads as a lit vertical face rather than a card fill. It is copied
 * rather than imported because `TrainerPlinth` keeps its layer constants
 * private, and exporting them would turn one component's internal tuning into a
 * shared API for the sake of one string. If these two ever need to move
 * together, that is the moment to promote the value into `src/lib/`, not now.
 */
const PLINTH_SURFACE_GRADIENT =
  "linear-gradient(180deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.015) 45%, transparent 72%)";

export interface RosterCtaTileProps {
  /**
   * The section-level booking target — `BOOKING_HREF`, passed down by
   * `TrainerShowcase` (task 9.4).
   *
   * A prop rather than a constant in this file so the section owns its one
   * conversion target in one place, alongside the per-coach fallback every
   * `RosterCard` resolves against (`trainer.ctaHref ?? fallbackCtaHref`).
   * Hard-coding it here would give that target two owners.
   */
  href: string;
  /** Extra classes for the cell root. Must not introduce grid placement. */
  className?: string;
}

export function RosterCtaTile({ href, className }: RosterCtaTileProps) {
  return (
    // CELL ROOT — a plain <div>, matching `RosterCard`, and container-neutral for
    // the same reason: the tile renders inside a `<ul>` in the grid tree and
    // inside `CardGrid`'s `div`s in the swipe strip, and a `<div>` is valid in
    // both. The grid tree's list item is `RosterGrid`'s reveal wrapper
    // (`AnimationWrapper as="li"`), sitting directly inside the `<ul>` so the
    // list holds list items only (Requirement 6.6); rooting an <li> here too
    // would nest one inside the other.
    //
    // `aspect-[4/5]` is the roster's frame ratio: it yields to the row when the
    // tile shares one, and supplies the height when it does not. See the
    // box-sizing note in this file's doc comment before replacing it with a
    // fixed height.
    <div className={cn("group/cta relative aspect-[4/5]", className)}>
      {/* FRAME — clips, exactly like the plinth's inner frame, so no decorative
          layer can widen the page (Requirement 5.4) and the tile contributes 0
          to CLS (Requirement 7.7). */}
      <div className="relative flex h-full flex-col justify-between overflow-hidden p-5 lg:p-6">
        {/* Plinth surface — the lit face shared with every coach frame. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{ background: PLINTH_SURFACE_GRADIENT }}
        />
        {/* Frame edge light — the 1px hairline on the two edges an overhead-left
            key light would catch. A separate decorative layer rather than a
            border on the frame, because the frame carries real content and so
            cannot itself be aria-hidden. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 border-t border-l border-white/10"
        />
        {/* And the brighter vertical hairline down the light side, which is what
            actually sells "lit edge" rather than "1px outline". */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-0 w-px bg-linear-to-b from-transparent via-white/22 to-transparent"
        />

        {/* Hex icon plate — the hexagon motif's fourth application (design.md
            §5.4). Same machined-steel construction as `StripNavigator`'s
            steppers: a rim clipped to HEX_CLIP with an inset ink core, so the
            rim thickness comes from the box and not from a second polygon.
            Neutral by necessity — the tile's one accent is the button below. */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none relative z-10 size-14 shrink-0 lg:size-16",
            "motion-safe:transition-transform motion-safe:duration-500 ease-out",
            "lg:group-hover/cta:scale-[1.04] group-focus-within/cta:scale-[1.04]"
          )}
          style={{ clipPath: HEX_CLIP }}
        >
          <span className="absolute inset-0 bg-white/25" style={{ clipPath: HEX_CLIP }} />
          <span
            className="absolute inset-[2px] flex items-center justify-center bg-ink"
            style={{ clipPath: HEX_CLIP_INSET }}
          >
            <Icon icon={CalendarCheck} size="lg" className="text-white" />
          </span>
        </div>

        {/* Copy and the action. `as="p"` on the Heading is deliberate: it takes
            the roster's subsection type token without adding a heading to the
            accessibility tree, where every <h3> in this section belongs to a
            coach (Requirements 6.1, 6.6). */}
        <div className="relative z-10 flex flex-col items-start gap-3">
          <Heading level="subsection" as="p" className="text-white tracking-tight">
            {TILE_TITLE}
          </Heading>
          <BodyText className="max-w-[26ch] text-text-secondary-dark">{TILE_BODY}</BodyText>
          {/* The section's one primary action, and its third and last resting
              yellow (Requirement 2.5). `compact` keeps the button inside the
              4:5 cell at the narrowest column the grid produces. */}
          <ButtonLink href={href} variant="primary" size="compact" className="mt-1">
            {TILE_ACTION_LABEL}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
