import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface GridProps {
  children: ReactNode;
  className?: string;
  /**
   * Number of columns at each breakpoint tier — §2 Layout System:
   * "Mobile: 4 columns / Tablet: 8 columns / Desktop: 12 columns".
   * Pass the number of columns you want CONTENT to span into at that tier
   * (e.g. a 3-up card grid on desktop = { mobile: 1, tablet: 2, desktop: 3 }),
   * not the raw 4/8/12 grid-definition numbers — those are the underlying
   * column count this component allocates internally.
   */
  columns: {
    mobile?: 1 | 2 | 4;
    tablet?: 1 | 2 | 3 | 4 | 8;
    desktop?: 1 | 2 | 3 | 4 | 6 | 12;
  };
  /** Gap between grid items. Defaults to the spec's gutter values (§2). */
  gap?: "sm" | "md" | "lg";
}

const gapStyles: Record<NonNullable<GridProps["gap"]>, string> = {
  sm: "gap-4", // 16px — tablet/mobile gutter
  md: "gap-6", // 24px — desktop gutter
  lg: "gap-8", // 32px — generous card-grid gutter (§Homepage-Architecture Programs)
};

const colSpanMap = {
  mobile: { 1: "grid-cols-1", 2: "grid-cols-2", 4: "grid-cols-4" },
  tablet: {
    1: "sm:grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-4",
    8: "sm:grid-cols-8",
  },
  desktop: {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    6: "lg:grid-cols-6",
    12: "lg:grid-cols-12",
  },
} as const;

/**
 * Responsive CSS grid built on the 12/8/4-column system from §2 Layout
 * System. Every CardGrid-style layout in Component-Architecture.md (Program
 * cards, Trainer cards, Location comparison, Extras) is a configuration of
 * this primitive, not a bespoke grid per section.
 *
 * Note: the mobile-swipeable-strip behavior described for CardGrid in
 * Component-Architecture.md §1 is a distinct interaction pattern (horizontal
 * scroll-snap, not a wrapping grid) and belongs in the future CardGrid
 * component built on top of this primitive — this Grid covers the fixed
 * multi-column desktop/tablet cases and simple single/two-column mobile
 * stacking.
 */
export function Grid({ children, className, columns, gap = "md" }: GridProps) {
  const mobileCols = columns.mobile ?? 1;
  const tabletCols = columns.tablet;
  const desktopCols = columns.desktop;

  return (
    <div
      className={cn(
        "grid",
        colSpanMap.mobile[mobileCols],
        tabletCols && colSpanMap.tablet[tabletCols],
        desktopCols && colSpanMap.desktop[desktopCols],
        gapStyles[gap],
        className
      )}
    >
      {children}
    </div>
  );
}
