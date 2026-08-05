"use client";

import { Children, isValidElement } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AnimationWrapper } from "@/components/motion";
import { getStaggerDelay } from "@/lib/design-tokens";

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
 */
export interface CardGridProps {
  children: ReactNode;
  /** Desktop column count. Tablet always shows 2 (except columns=2, which stays 2). */
  columns: 2 | 3 | 4;
  className?: string;
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

export function CardGrid({ children, columns, className }: CardGridProps) {
  let index = 0;

  return (
    <div
      className={cn(
        // Mobile: horizontal scroll-snap strip, each item ~85% of viewport wide
        // so the swipe affordance is visually obvious (§10 Component-Architecture.md).
        "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [&>*]:w-[85%] [&>*]:shrink-0 [&>*]:snap-start",
        "sm:grid sm:gap-6 sm:overflow-visible sm:pb-0 sm:[&>*]:w-auto sm:[&>*]:shrink",
        tabletColsMap[columns],
        desktopColsMap[columns],
        columns >= 3 && "lg:gap-8",
        className
      )}
    >
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child;
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
}
