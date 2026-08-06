/**
 * Responsive Motion Utilities — Scale motion distances by breakpoint.
 *
 * Large desktop movement should not become excessive on mobile. This module
 * provides utilities to scale motion distances (translateY, parallax drift,
 * etc.) proportionally across breakpoints.
 *
 * Scaling strategy:
 * - Desktop (≥1024px): 100% of specified distance
 * - Tablet (640-1023px): 75% of specified distance
 * - Mobile (<640px): 50% of specified distance
 *
 * Example: A 40px desktop translateY becomes 30px tablet, 20px mobile.
 *
 * Based on specifications/03-responsive-system.md — motion should scale
 * gracefully across devices, not feel excessive on small screens.
 */

import { breakpoints } from "./design-tokens";

export type Breakpoint = "mobile" | "tablet" | "desktop" | "wide";

/**
 * Responsive distance scale factors.
 * Desktop and wide use 100% (no scaling), tablet 75%, mobile 50%.
 */
const DISTANCE_SCALE: Record<Breakpoint, number> = {
  mobile: 0.5,
  tablet: 0.75,
  desktop: 1.0,
  wide: 1.0,
} as const;

/**
 * Scale a motion distance by breakpoint.
 * 
 * @param baseDistance - The base distance in pixels (desktop reference)
 * @param breakpoint - Target breakpoint
 * @returns Scaled distance in pixels
 * 
 * @example
 * getResponsiveDistance(40, "mobile") // 20
 * getResponsiveDistance(40, "desktop") // 40
 */
export function getResponsiveDistance(
  baseDistance: number,
  breakpoint: Breakpoint
): number {
  return baseDistance * DISTANCE_SCALE[breakpoint];
}

/**
 * Get the current breakpoint based on window width.
 * Client-side only — requires window object.
 * 
 * @returns Current breakpoint
 */
export function getCurrentBreakpoint(): Breakpoint {
  if (typeof window === "undefined") return "desktop";
  
  const width = window.innerWidth;
  
  if (width >= breakpoints.wide) return "wide";
  if (width >= breakpoints.desktop) return "desktop";
  if (width >= breakpoints.tablet) return "tablet";
  return "mobile";
}

/**
 * Create responsive motion distances for all breakpoints.
 * Returns an object with scaled distances for each breakpoint.
 * 
 * @param baseDistance - The base distance in pixels (desktop reference)
 * @returns Object with distance for each breakpoint
 * 
 * @example
 * const distances = createResponsiveDistances(40);
 * // { mobile: 20, tablet: 30, desktop: 40, wide: 40 }
 */
export function createResponsiveDistances(baseDistance: number): Record<Breakpoint, number> {
  return {
    mobile: getResponsiveDistance(baseDistance, "mobile"),
    tablet: getResponsiveDistance(baseDistance, "tablet"),
    desktop: getResponsiveDistance(baseDistance, "desktop"),
    wide: getResponsiveDistance(baseDistance, "wide"),
  };
}

/**
 * Media query strings for each breakpoint.
 * Matches the breakpoint values in design-tokens.ts.
 */
export const mediaQueries = {
  mobile: `(max-width: ${breakpoints.tablet - 1}px)`,
  tablet: `(min-width: ${breakpoints.tablet}px) and (max-width: ${breakpoints.desktop - 1}px)`,
  desktop: `(min-width: ${breakpoints.desktop}px)`,
  wide: `(min-width: ${breakpoints.wide}px)`,
} as const;

/**
 * Check if the current viewport matches a specific breakpoint.
 * Client-side only — requires window.matchMedia.
 * 
 * @param breakpoint - Breakpoint to check
 * @returns True if viewport matches breakpoint
 */
export function matchesBreakpoint(breakpoint: Breakpoint): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(mediaQueries[breakpoint]).matches;
}
