/**
 * Shared hooks — scroll, animation, and viewport-observation primitives.
 *
 * Centralized export for the custom hooks used across the homepage. The motion
 * hooks all respect prefers-reduced-motion automatically; the observation hooks
 * below them are motion-agnostic (they report position, they do not animate).
 */

export { useScrollProgress } from "./use-scroll-progress";
export type { UseScrollProgressOptions, UseScrollProgressReturn } from "./use-scroll-progress";

export { useParallax } from "./use-parallax";
export type { UseParallaxOptions, UseParallaxReturn } from "./use-parallax";

export { useScrollReveal } from "./use-scroll-reveal";
export type { UseScrollRevealOptions, UseScrollRevealReturn } from "./use-scroll-reveal";

// -----------------------------------------------------------------------------
// Viewport observation — no motion, no reduced-motion concern. These report
// where the visitor is in the page so other components can decide what to show.
// -----------------------------------------------------------------------------

export { useAnchorPassed } from "./use-anchor-passed";
export type { UseAnchorPassedOptions } from "./use-anchor-passed";

export { useElementInView } from "./use-element-in-view";
export type { UseElementInViewOptions } from "./use-element-in-view";

export { useCampaignGate } from "./use-campaign-gate";
export type { UseCampaignGateOptions, CampaignGate } from "./use-campaign-gate";
