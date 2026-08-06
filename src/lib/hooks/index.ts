/**
 * Motion Hooks — Reusable scroll and animation hooks.
 *
 * Centralized export for all motion-related custom hooks used across
 * the homepage. All hooks respect prefers-reduced-motion automatically.
 */

export { useScrollProgress } from "./use-scroll-progress";
export type { UseScrollProgressOptions, UseScrollProgressReturn } from "./use-scroll-progress";

export { useParallax } from "./use-parallax";
export type { UseParallaxOptions, UseParallaxReturn } from "./use-parallax";

export { useScrollReveal } from "./use-scroll-reveal";
export type { UseScrollRevealOptions, UseScrollRevealReturn } from "./use-scroll-reveal";
