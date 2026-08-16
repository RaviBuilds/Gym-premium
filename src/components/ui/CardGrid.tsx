"use client";

import { Children, isValidElement, useRef } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AnimationWrapper } from "@/components/motion";
import { getStaggerDelay } from "@/lib/design-tokens";
import { StripNavigator, useSnapStrip } from "./StripNavigator";

/**
 * CardGrid — Component-Architecture.md §1 "CardGrid".
 *
 * Fixed multi-column grid on tablet/desktop; horizontally swipeable,
 * scroll-snapped strip on mobile (§12 Mobile Experience: "Program and
 * trainer cards become horizontally swipeable strips rather than a cramped
 * multi-column grid"). This is the one addition beyond the base `Grid`
 * primitive that Design-System.md §5 flagged as a planned, not-yet-built
 * component — built here specifically for the homepage's card sections.
 *
 * Takes pre-rendered `children` rather than an `items` + `renderItem`
 * function prop. This is a deliberate correction from an earlier draft:
 * CardGrid is a Client Component (it needs the stagger/scroll-reveal
 * wiring, which is motion-hook-driven), and function props cannot cross
 * the Server→Client Component serialization boundary in the App Router —
 * only data and already-rendered JSX can. Server Component section
 * components (Programs, TrainerShowcase, etc.) map their content arrays
 * into JSX themselves and pass the resulting elements in as children;
 * CardGrid then wraps each one in AnimationWrapper for the staggered
 * reveal, using each child's own `key` for React's reconciliation *and* as
 * the stagger index source (via Children.forEach), so call sites don't
 * need to pass a separate getKey function either.
 *
 * The `reveal` prop adds a choreography escape hatch for premium card
 * sections (Programs). `"standard"` (the default) is the exact historical
 * behavior — every child wrapped in `AnimationWrapper` with a
 * `getStaggerDelay` stagger. `"premium"` renders children unwrapped and
 * lets each card own its own scroll-triggered reveal (ProgramCard does
 * this via its own `motion="premium"` mode, using its `index` to compute
 * the same `getStaggerDelay` delay, so the continuous 0–8 stagger across
 * both Programs rows is preserved). `"none"` renders with no reveal
 * wrapper at all.
 */
export interface CardGridProps {
  children: ReactNode;
  /** Desktop column count. Tablet always shows 2 (except columns=2, which stays 2). */
  columns: 2 | 3 | 4;
  className?: string;
  /** Reveal choreography for the wrapped children. Defaults to `"standard"`.
   *  - `"standard"`: every child wrapped in `AnimationWrapper` + `getStaggerDelay`
   *    stagger (the original, unchanged shared reveal).
   *  - `"premium"`: children render unwrapped; each child owns its own
   *    scroll-triggered reveal (ProgramCard's `motion="premium"` mode).
   *  - `"none"`: children render with no reveal wrapper. */
  reveal?: "standard" | "premium" | "none";
  /** Opt into the mobile `StripNavigator` control bar (index readout +
   *  segmented rail + hex steppers) beneath the swipe strip, plus a dynamic
   *  edge-fade on the strip itself. Off by default so existing CardGrids are
   *  unchanged. The control bar is `sm:hidden`; above `sm` the grid shows
   *  everything, so there is nothing to navigate. */
  swipeNav?: boolean;
  /** Accessible label for the `swipeNav` control group (e.g. "Programs"). */
  swipeNavLabel?: string;
}

const desktopColsMap = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
} as const;

const tabletColsMap = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2",
  4: "sm:grid-cols-2",
} as const;

/** Width of the strip's dynamic edge fade, in px. Sits on the 8px scale (x4). */
const EDGE_FADE = 32;

export function CardGrid({
  children,
  columns,
  className,
  reveal = "standard",
  swipeNav = false,
  swipeNavLabel,
}: CardGridProps) {
  let index = 0;

  const scrollRef = useRef<HTMLDivElement>(null);
  const count = Children.count(children);
  // Passing `count = 0` disables the hook entirely for non-swipe grids.
  const { activeIndex, atStart, atEnd, scrollToIndex } = useSnapStrip(
    scrollRef,
    swipeNav ? count : 0
  );

  // Edge fade communicates "there's more this way" continuously, and retracts
  // at each end so the first/last card is never clipped at rest. Only built
  // for `swipeNav`; the strip is `sm:hidden`, so this never affects desktop.
  const maskImage = !swipeNav
    ? undefined
    : atStart && atEnd
      ? undefined
      : atStart
        ? `linear-gradient(to right, #000 calc(100% - ${EDGE_FADE}px), transparent 100%)`
        : atEnd
          ? `linear-gradient(to right, transparent 0, #000 ${EDGE_FADE}px)`
          : `linear-gradient(to right, transparent 0, #000 ${EDGE_FADE}px, #000 calc(100% - ${EDGE_FADE}px), transparent 100%)`;

  const strip = (
    <div
      ref={scrollRef}
      className={cn(
        // Mobile: horizontal scroll-snap strip, each item ~85% of viewport wide
        // so the swipe affordance is visually obvious (§10 Component-Architecture.md).
        // `scrollbar-none` (globals.css) drops the native scrollbar track — on
        // Windows/desktop viewports that track renders as a classic inset bar
        // with arrow buttons, which reads as OS chrome rather than design. The
        // swipe affordance is carried by the peeking next card, the edge fade,
        // and (when `swipeNav`) the StripNavigator below. `overscroll-x-contain`
        // stops an over-swipe from chaining to the page / browser back-swipe.
        // `pb-2` is kept for card shadow breathing room, not for the removed track.
        "flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scrollbar-none pb-2 [&>*]:w-[85%] [&>*]:shrink-0 [&>*]:snap-start",
        "sm:grid sm:gap-6 sm:overflow-visible sm:pb-0 sm:[&>*]:w-auto sm:[&>*]:shrink",
        tabletColsMap[columns],
        desktopColsMap[columns],
        columns >= 3 && "lg:gap-8",
        className
      )}
      style={maskImage ? { maskImage, WebkitMaskImage: maskImage } : undefined}
    >
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child;
        // Premium/none: render the child as-is — the card owns its own reveal
        // (premium) or none is wanted. Standard: the original shared wrap.
        if (reveal !== "standard") return child;
        const delay = getStaggerDelay(index);
        index += 1;
        return (
          <AnimationWrapper key={child.key} delay={delay}>
            {child}
          </AnimationWrapper>
        );
      })}
    </div>
  );

  if (!swipeNav) return strip;

  return (
    <div>
      {strip}
      <StripNavigator
        count={count}
        activeIndex={activeIndex}
        atStart={atStart}
        atEnd={atEnd}
        onSelect={scrollToIndex}
        label={swipeNavLabel}
      />
    </div>
  );
}