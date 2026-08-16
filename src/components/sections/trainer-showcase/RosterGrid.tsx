import type { ReactElement } from "react";

import { AnimationWrapper } from "@/components/motion/AnimationWrapper";
import { CameraGroup } from "@/components/motion/CameraLayer";
import { CardGrid } from "@/components/ui/CardGrid";
import { RosterCard } from "@/components/ui/RosterCard";
import { RosterCtaTile } from "@/components/ui/RosterCtaTile";
import { getStaggerDelay } from "@/lib/design-tokens";
import type { Trainer } from "@/types/content";

/**
 * RosterGrid — the roster tray: every coach who is not the lead, plus the CTA
 * tile that closes the composition, in the container the viewport calls for
 * (design.md §6.1, §6.2, §6.3, §6.4).
 *
 * ## Server Component, wrapping two client boundaries
 *
 * There is no `"use client"` directive here and there must never be one
 * (design.md §6.2: "`RosterGrid` — **Server**, wrapping client `CameraGroup` /
 * `CardGrid`"). This file resolves no state, runs no effect and binds no
 * handler: it maps content into cells and places those cells in two containers.
 * What hydrates is the primitives inside it — the one `CameraGroup`, the one
 * `CardGrid` (which owns the strip's scroll state and its `StripNavigator`), and
 * the `AnimationWrapper` around each grid cell. `RosterCard` and
 * `RosterCtaTile` carry no directive of their own, so all five cards and the
 * tile ship zero client JavaScript (Requirement 7.8).
 *
 * ## Why it takes the roster array rather than rendered children
 *
 * `CardGrid`'s doc comment states the boundary rule this file obeys: a Client
 * Component cannot receive a function prop across the Server→Client boundary,
 * so call sites map their content arrays into JSX themselves and hand the
 * *elements* in as children. `RosterGrid` is a Server Component, so it is a
 * legal place to do that mapping — and doing it here rather than in
 * `TrainerShowcase` is what makes two of this task's requirements structural
 * instead of conventional:
 *
 * - The CTA tile is appended by {@link buildCells} after the last coach, so it
 *   is "the final cell" because nothing can be pushed after it — not because a
 *   caller remembered to write it last (Requirement 1.8).
 * - The stagger index is the cell's position in one flat array that spans the
 *   cards *and* the tile, so the reveal cannot fragment into one sequence per
 *   row (Requirements 3.2, 3.12).
 *
 * Nothing that crosses into `CardGrid` is anything but a plain `Trainer` object
 * or already-rendered JSX (Requirement 8.10).
 *
 * ## Two trees, one displayed — and why that is the point
 *
 * Below 640px the roster is a horizontally snapping swipe strip; from 640px up
 * it is a grid (Requirements 5.1, 5.2, 5.3). Those are different containers, not
 * one container with different classes, because the strip needs `CardGrid`'s
 * scroll state and `StripNavigator` while the grid needs to be a real `<ul>`
 * riding one camera plane. So both trees exist in the DOM and exactly one of
 * them is ever *displayed*: `sm:hidden` on the strip, `hidden sm:block` on the
 * grid (Requirement 5.7).
 *
 * `display: none` — not `opacity`, not `visibility` — is load-bearing, and it is
 * the same mechanism task 6.3 uses for the backdrop plate. A `display: none`
 * subtree is removed from the accessibility tree, so a screen reader is never
 * offered the same coach twice even though both trees are in the DOM; and it is
 * the only hiding mechanism that also stops `next/image`'s lazy loader, so the
 * hidden tree's six portraits are never fetched. An opacity-0 duplicate would
 * have downloaded a second full set of cutouts at every breakpoint.
 *
 * This is the pattern `Programs` already ships (a `sm:hidden` strip beside two
 * `hidden sm:block` rows, with the same note in its own comments), reused rather
 * than reinvented.
 *
 * ## One plane, and the cards never move relative to each other
 *
 * The grid tree sits inside a single `CameraGroup depth="interactive"` (lag
 * 0.012, no overscan) — the section's third and last subscription to the shared
 * camera, after `RosterAtmosphere`'s `deepBackground` and `LeadCoachStage`'s
 * `sectionMedia` (Requirement 3.5). One group around the whole grid is what
 * holds every card rigid relative to every other card (Requirement 3.7): the
 * transform lands once, on the element above the `<ul>`, so the tray drifts as
 * one object. A `CameraGroup` per card is the failure `camera-tokens.ts`
 * documents — six subscriptions differing by fractions of a pixel, six measured
 * heights, no perceptible depth, and a grid whose cells creep apart. Per-card
 * differentiation belongs to hover, which is a different property with a
 * different owner (`TrainerPlinth`).
 *
 * The camera is used in flow, without `fill`: the tray is real content inside
 * the section's `Container`, not a full-bleed backdrop whose travel could expose
 * an edge. Under reduced motion the group collapses to two nested plain divs
 * with identical geometry — `y = 0`, no dolly, no `will-change` (Requirement
 * 6.5).
 *
 * The strip tree is deliberately **outside** the plane. Its cells are already
 * moving under the visitor's thumb on a native scroll axis, and adding a
 * vertical drift to a surface being dragged horizontally reads as slippage
 * rather than depth.
 *
 * ## List semantics, and the one place they are still imperfect
 *
 * The roster is a real list — a `<ul>` with one `<li>` per card plus the tile,
 * with the lead coach's `<article>` outside it (Requirement 6.6). The grid tree
 * satisfies that literally:
 *
 * 1. **The reveal wrapper is the list item.** `AnimationWrapper as="li"` renders
 *    the `<li>` itself, so the tree is `ul > li > (card)` — the `<ul>`'s only
 *    element children are list items, which is all the element's content model
 *    permits and what Safari/VoiceOver needs to keep announcing the list role.
 *    The per-cell stagger Requirements 3.2 and 3.12 demand needs an element per
 *    cell to carry `getStaggerDelay(i)`, and this is that element, so the
 *    sequence is unchanged; wrapping the whole `<ul>` instead would have
 *    collapsed it to a single event. `RosterCard` and `RosterCtaTile` therefore
 *    root a plain `<div>` rather than an `<li>` of their own — one list item per
 *    cell, not two nested — which also makes them valid inside `CardGrid`'s
 *    `div`s in the strip tree below. The wrapper's reduced-motion branch renders
 *    the same `<li>`, so the structure does not depend on a media query.
 * 2. **The strip tree has no `<ul>` at all.** `CardGrid` builds its strip from
 *    `div`s, and it is a Client Component holding the scroll state
 *    `StripNavigator` needs, so a Server Component cannot substitute its own
 *    list element. Below 640px the strip is the displayed tree, so that is the
 *    tree a phone screen reader walks. It reads as six grouped links with their
 *    names, roles and disciplines intact — no content is lost — but it is not
 *    announced as a list. Fixing it properly means teaching `CardGrid` which
 *    element to render for the strip and its items, which is a change to a
 *    primitive four sections share.
 *
 * ## What this file does not do
 *
 * It pins nothing, listens to no scroll or touch event and calls no
 * `preventDefault` (Requirements 5.9, 3.6). The strip is native overflow scroll
 * with `overscroll-x-contain` (owned by `CardGrid`, so an over-swipe cannot
 * chain to the page or the browser's back gesture), and the only scroll
 * subscription in this subtree is the camera's own.
 *
 * It also holds no count. Nothing here says "five" or "six": the cells come from
 * `roster.length + 1`, the columns come from `grid-cols-2 lg:grid-cols-3` with
 * no explicit placement, and the stagger index runs to whatever the last cell
 * is. A 4-entry roster leaves the tile alone in the final row and a 7-entry
 * roster wraps to a fourth row, with the tile last in both cases and no code
 * change (Requirement 1.8).
 */

/**
 * The grid container — two columns from 640px, three from 1024px (Requirements
 * 5.1, 5.2).
 *
 * The gaps are not free-floating taste: `RosterCard`'s `ROSTER_IMAGE_SIZES`
 * subtracts exactly these gutters from the viewport when it tells the browser
 * how wide a cell will be — `px-6` plus one `gap-8` gutter at `sm:` (80px), and
 * `px-12` plus two `gap-10` gutters at `lg:` (176px). Changing a gap here
 * without changing that string makes every roster portrait over- or
 * under-fetch, so the two are read together.
 *
 * There is no `col-start-*`, no `row-*` and no `grid-flow` override, which is
 * what keeps the tile in the last cell for any roster length: cells fill in DOM
 * order, and the tile is the last one in DOM order (Requirement 1.8).
 */
const GRID_CLASS = "grid grid-cols-2 gap-8 lg:grid-cols-3 lg:gap-10";

/**
 * `StripNavigator`'s accessible group label, rendered by `CardGrid` as
 * `aria-label` on the control bar below the strip.
 *
 * "Trainers" rather than "Roster" because it names what a visitor sees, and it
 * is the noun the section's own heading and eyebrow already use.
 */
const STRIP_NAV_LABEL = "Trainers";

export interface RosterGridProps {
  /**
   * The Roster — every trainer except the Lead_Coach, already in presentation
   * order, exactly as `assembleSection` resolved it.
   *
   * Order is taken on trust and never re-sorted here: `resolveRoster` owns the
   * presentation-order list and its build-time slug check (Requirements 1.6,
   * 1.7), and a second opinion in the view layer would be a second place that
   * decides the same thing. Position `i` in this array is the coach whose
   * numeral is `formatIndex(i + 2)`, which is why `RosterCard` receives `i`
   * unmodified.
   *
   * Length is not constrained to five. See Requirement 1.8 and this file's doc
   * comment.
   */
  roster: Trainer[];
  /**
   * The section's one booking target — `BOOKING_HREF`, passed down by
   * `TrainerShowcase`.
   *
   * It does two jobs, and they are the same value on purpose: it is the CTA
   * tile's `href` (the tile books the gym, not a person) and each card's
   * fallback when that coach has no `ctaHref` of their own, resolved inside
   * `RosterCard` as `trainer.ctaHref ?? fallbackCtaHref` (Requirement 4.5).
   * Taking it as one required prop rather than two is what keeps the section's
   * conversion target to a single owner — two props would let the tile and the
   * cards drift to different destinations without anything failing.
   */
  bookingHref: string;
  /** Extra classes for the tray's root. Layout only. */
  className?: string;
}

/**
 * Builds the tray's cells once, in the order they render: every coach, then the
 * CTA tile.
 *
 * Both trees render this same array — legal, and deliberate, because React
 * elements are immutable descriptors rather than mounted instances. Building it
 * once is what guarantees the two trees can never disagree about which coaches
 * exist, what order they are in, or which cell is last; the only difference
 * between the trees is the container around them.
 *
 * Every cell roots a plain `<div>` (both `RosterCard` and `RosterCtaTile`), which
 * is what lets the same array serve both trees: in the grid tree each cell is
 * placed inside an `AnimationWrapper as="li"`, so the `<ul>` holds one list item
 * per card plus the tile (Requirement 6.6), and in the strip tree each cell sits
 * inside `CardGrid`'s `div`s, where an `<li>` would have been stray.
 * `RosterCtaTile` takes no `position`: it renders no numeral, and its reveal
 * delay is applied from outside by the caller.
 */
function buildCells(roster: Trainer[], bookingHref: string): ReactElement[] {
  return [
    ...roster.map((trainer, position) => (
      <RosterCard
        key={trainer.slug}
        trainer={trainer}
        position={position}
        fallbackCtaHref={bookingHref}
      />
    )),
    <RosterCtaTile key="cta" href={bookingHref} />,
  ];
}

export function RosterGrid({ roster, bookingHref, className }: RosterGridProps) {
  const cells = buildCells(roster, bookingHref);

  return (
    <div className={className}>
      {/* ── Below 640px: the swipe strip ─────────────────────────────────────
          `CardGrid` with `swipeNav` is the pattern already shipping in
          `Programs`, and it carries everything Requirement 5.3 asks for without
          this file hand-rolling any of it: a `snap-x snap-mandatory` strip whose
          items are 85% wide so the next card peeks, `overscroll-x-contain` so an
          over-swipe cannot chain to the page or the browser's back gesture, a
          retracting edge fade, and a `StripNavigator` underneath carrying the
          index readout, the segmented rail and the hex steppers. The navigator
          is where mobile gets the index parity the desktop hex chips provide.

          `columns={3}` describes the grid `CardGrid` would build above `sm:` —
          which this wrapper never lets it reach, since `sm:hidden` hides the
          whole tree exactly where those column classes would start applying.
          The grid below owns every breakpoint from 640px up.

          `reveal="standard"` is what gives the strip its stagger, and it is the
          same sequence the grid tree runs: `CardGrid` wraps each child in an
          `AnimationWrapper` with `getStaggerDelay(index)` from this same module,
          across the cards and the tile in one pass (Requirements 3.2, 3.12).
          Passing it explicitly rather than relying on the default is the point —
          `"premium"` or `"none"` would silently drop the strip's reveal. */}
      <div className="sm:hidden">
        <CardGrid columns={3} reveal="standard" swipeNav swipeNavLabel={STRIP_NAV_LABEL}>
          {cells}
        </CardGrid>
      </div>

      {/* ── 640px and up: one rigid tray on the `interactive` plane ───────────
          `hidden sm:block` sits on the camera's measured outer element, so the
          whole subtree — plane included — is `display: none` on phones. */}
      <CameraGroup depth="interactive" className="hidden sm:block">
        {/* The roster is a real list: one `<ul>`, one `<li>` per card plus the
            tile, and the lead coach's `<article>` deliberately outside it
            (Requirement 6.6, design.md §12).

            `as="li"` is what makes that literal rather than approximate — the
            reveal wrapper *is* the list item, so the `<ul>`'s only element
            children are `<li>`s and nothing sits between the list and its
            items. The cards are the wrapper's content, not the list's.

            That wrapper is also the section's per-cell reveal (design.md §13.7):
            `preset="medium"` is the 24px travel from
            the Closed_Motion_Vocabulary, and duration, easing and the 0.2
            viewport threshold all come from the primitive, so no timing is
            invented here (Requirements 3.1, 3.9). `getStaggerDelay(i)` over the
            flat cell array yields 0, 0.08 … 0.40 for a five-coach roster —
            monotonic in `i`, capped by the helper at 0.48s, and one continuous
            sequence across both rows rather than one per row (Requirements 3.2,
            3.12). Each wrapper animates `transform` and `opacity` only, and
            renders its final state statically under reduced motion. */}
        <ul className={GRID_CLASS}>
          {cells.map((cell, i) => (
            <AnimationWrapper
              key={cell.key}
              as="li"
              preset="medium"
              delay={getStaggerDelay(i)}
            >
              {cell}
            </AnimationWrapper>
          ))}
        </ul>
      </CameraGroup>
    </div>
  );
}
