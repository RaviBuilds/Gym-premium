/**
 * Motion Presets — Reusable motion configuration system.
 *
 * This file establishes a "design system for motion" — unified timing,
 * easing, and distance presets that every homepage section can consume
 * rather than hardcoding animation values. Think of it like Tailwind for
 * motion: declarative presets (revealMedium, parallaxSlow, staggerTight)
 * instead of inline magic numbers.
 *
 * Based on specifications/02-motion-system.md — all values trace back to
 * the motion vocabulary established there. Every preset uses the same
 * easing curve ([0.16, 1, 0.3, 1]) for consistency across the entire
 * homepage motion language.
 *
 * Performance: All presets use GPU-accelerated properties only (transform,
 * opacity, scale). No width/height/margin/padding/filter animations.
 *
 * Accessibility: Every preset is automatically disabled when
 * prefers-reduced-motion is active — components consuming these presets
 * must check useReducedMotion() and render static final state.
 */

import type { Transition } from "framer-motion";

/**
 * Core easing curve used across all motion presets.
 * Spec: [0.16, 1, 0.3, 1] from 02-motion-system.md §1.
 * Character: ease-out, feels like physical inertia (expensive, not bouncy).
 */
export const MOTION_EASING = [0.16, 1, 0.3, 1] as const;

/**
 * Scroll trigger threshold — element reveals when this much has entered viewport.
 * Spec: 0.2 (20%) from 02-motion-system.md §1.
 */
export const SCROLL_TRIGGER_THRESHOLD = 0.2;

// -----------------------------------------------------------------------------
// Reveal Presets
// -----------------------------------------------------------------------------

/**
 * Fade + translateY reveal configurations.
 * All use the same easing and duration — only distance varies.
 */
export const revealPresets = {
  /** Small reveal: 12px vertical travel. Subtle, for secondary content. */
  small: {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
    transition: {
      duration: 0.5,
      ease: MOTION_EASING,
    } as Transition,
  },
  
  /** Medium reveal: 24px vertical travel. Default for most content.
   *  Matches the existing AnimationWrapper fade-up distance. */
  medium: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
    transition: {
      duration: 0.5,
      ease: MOTION_EASING,
    } as Transition,
  },
  
  /** Large reveal: 40px vertical travel. Reserved for hero-scale content. */
  large: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
    transition: {
      duration: 0.5,
      ease: MOTION_EASING,
    } as Transition,
  },
} as const;

/**
 * Fade-only reveal (no movement).
 * Used for content where vertical travel would feel inappropriate
 * (e.g. content already in motion, layered overlays).
 */
export const fadePreset = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  transition: {
    duration: 0.5,
    ease: MOTION_EASING,
  } as Transition,
} as const;

/**
 * Scale-in-settle reveal.
 * Spec: 02-motion-system.md Tier 3 — reserved for Testimonials pull-quotes.
 * Starts slightly larger (1.06) and settles to 1.0 — the one "weightier"
 * entrance that's deliberately distinct from standard fade-up.
 */
export const scaleInSettlePreset = {
  hidden: { opacity: 0, scale: 1.06 },
  visible: { opacity: 1, scale: 1 },
  transition: {
    duration: 0.5,
    ease: MOTION_EASING,
  } as Transition,
} as const;

/**
 * Directional slide reveals (left/right).
 * Spec: 02-motion-system.md — used by Locations section for "two locations,
 * one brand" metaphor. Distance is 2x the standard fade-up (48px horizontal).
 */
export const slidePresets = {
  left: {
    hidden: { opacity: 0, x: -48 },
    visible: { opacity: 1, x: 0 },
    transition: {
      duration: 0.5,
      ease: MOTION_EASING,
    } as Transition,
  },
  right: {
    hidden: { opacity: 0, x: 48 },
    visible: { opacity: 1, x: 0 },
    transition: {
      duration: 0.5,
      ease: MOTION_EASING,
    } as Transition,
  },
} as const;

// -----------------------------------------------------------------------------
// Parallax Presets
// -----------------------------------------------------------------------------

/**
 * Parallax scroll-linked motion configurations.
 * All use 0-1 scroll progress → pixel drift, with varying speeds.
 * Spec: 02-motion-system.md §4 — continuous scroll behavior for sections
 * with full-bleed/banner images only.
 */
export const parallaxPresets = {
  /** Background layer: 0.25x scroll speed, 80px max drift.
   *  For full-bleed background images that should feel physically distant. */
  background: {
    speed: 0.25,
    maxDrift: 80,
  },
  
  /** Slow parallax: 0.4x scroll speed, 60px max drift.
   *  For mid-ground layers and secondary content. */
  slow: {
    speed: 0.4,
    maxDrift: 60,
  },
  
  /** Medium parallax: 0.6x scroll speed, 45px max drift.
   *  For primary content layers - perceptible but not exaggerated. */
  medium: {
    speed: 0.6,
    maxDrift: 45,
  },
  
  /** Fast parallax: 0.8x scroll speed, 30px max drift.
   *  For foreground layers - moves almost with scroll but with subtle lag. */
  fast: {
    speed: 0.8,
    maxDrift: 30,
  },
  
  /** Micro depth: Subtle per-card layering (2-8px range based on index).
   *  Creates depth without noticeable independent movement. */
  micro: {
    speed: 0.92,
    maxDrift: 8,
  },
} as const;

// -----------------------------------------------------------------------------
// Stagger Presets
// -----------------------------------------------------------------------------

/**
 * Stagger timing for card grid reveals.
 * Spec: 02-motion-system.md §1 — base is 80ms per card, capped at 6 cards.
 */
export const staggerPresets = {
  /** Tight stagger: 50ms per item. For dense grids or fast reveals. */
  tight: {
    perItem: 0.05,
    maxItems: 6,
  },
  
  /** Medium stagger: 80ms per item. Current default, most card grids. */
  medium: {
    perItem: 0.08,
    maxItems: 6,
  },
  
  /** Wide stagger: 120ms per item. For premium, deliberate reveals. */
  wide: {
    perItem: 0.12,
    maxItems: 6,
  },
} as const;

/**
 * Calculate stagger delay for the Nth item in a grid.
 * Applies the maxItems cap per spec — items beyond cap animate at cap delay.
 * 
 * @param index - 0-based item position
 * @param preset - stagger timing preset
 * @returns delay in seconds
 */
export function getStaggerDelay(
  index: number,
  preset: keyof typeof staggerPresets = "medium"
): number {
  const config = staggerPresets[preset];
  const cappedIndex = Math.min(index, config.maxItems);
  return cappedIndex * config.perItem;
}

// -----------------------------------------------------------------------------
// Scale/Hover Presets
// -----------------------------------------------------------------------------

/**
 * Scale values for hover/focus interactions.
 * GPU-accelerated (scale transform only), subtle intensity.
 */
export const scalePresets = {
  /** Subtle scale: 1.02x. For text-heavy cards, buttons. */
  subtle: 1.02,
  
  /** Medium scale: 1.04x. Default for image-heavy cards (ProgramCard). */
  medium: 1.04,
  
  /** Large scale: 1.06x. Reserved for featured/hero-scale items. */
  large: 1.06,
} as const;

// -----------------------------------------------------------------------------
// Duration Presets
// -----------------------------------------------------------------------------

/**
 * Duration values for different interaction types.
 * Spec: 02-motion-system.md §1 — closed vocabulary, don't invent new numbers.
 */
export const durationPresets = {
  /** Fast: 180ms. Button press, color transitions. */
  fast: 0.18,
  
  /** Standard: 500ms. Scroll-reveal entrances, most motion. */
  standard: 0.5,
  
  /** Counter: 1200ms. CountUp number roll, Final CTA pulse. */
  counter: 1.2,
} as const;

// -----------------------------------------------------------------------------
// Type Exports
// -----------------------------------------------------------------------------

export type RevealPreset = keyof typeof revealPresets;
export type ParallaxPreset = keyof typeof parallaxPresets;
export type StaggerPreset = keyof typeof staggerPresets;
export type ScalePreset = keyof typeof scalePresets;
export type DurationPreset = keyof typeof durationPresets;

/**
 * Combined reveal configuration — used by components to apply presets.
 */
export interface RevealConfig {
  preset?: RevealPreset;
  delay?: number;
  stagger?: StaggerPreset;
}
