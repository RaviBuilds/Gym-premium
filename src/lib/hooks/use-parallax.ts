"use client";

/**
 * useParallax — Scroll-linked parallax transform with preset configurations.
 *
 * Provides a simple API for applying parallax motion to elements using
 * the motion presets system. Automatically handles reduced motion and
 * responsive scaling.
 *
 * Based on specifications/02-motion-system.md §4 — continuous scroll
 * behavior for sections with full-bleed/banner images.
 */

import { useTransform, useReducedMotion, type MotionValue } from "framer-motion";
import { parallaxPresets, type ParallaxPreset } from "../motion-presets";
import { useScrollProgress } from "./use-scroll-progress";

export interface UseParallaxOptions {
  /** Parallax speed preset. Default: "medium" */
  preset?: ParallaxPreset;
  /** Custom max drift in pixels. Overrides preset if provided. */
  maxDrift?: number;
  /** Disable parallax below desktop breakpoint. Default: true */
  disableOnMobile?: boolean;
}

export interface UseParallaxReturn {
  /** Ref to attach to the parallax container */
  ref: React.RefObject<HTMLElement | null>;
  /** Y transform value to apply to parallax element */
  y: MotionValue<number>;
  /** Whether parallax is currently disabled */
  isDisabled: boolean;
}

/**
 * Apply parallax scroll effect to an element.
 *
 * @param options - Parallax configuration
 * @returns Ref, transform value, and disabled state
 *
 * @example
 * const { ref, y, isDisabled } = useParallax({ preset: "medium" });
 * 
 * return (
 *   <div ref={ref}>
 *     {!isDisabled ? (
 *       <motion.div style={{ y }}>
 *         <img src="..." alt="..." />
 *       </motion.div>
 *     ) : (
 *       <img src="..." alt="..." />
 *     )}
 *   </div>
 * );
 */
export function useParallax(options: UseParallaxOptions = {}): UseParallaxReturn {
  const {
    preset = "medium",
    maxDrift: customMaxDrift,
    // disableOnMobile handled by consuming component
  } = options;

  const prefersReducedMotion = useReducedMotion();
  const { ref, scrollYProgress } = useScrollProgress();

  // Get max drift from preset or custom value
  const maxDrift = customMaxDrift ?? parallaxPresets[preset].maxDrift;

  // Transform scroll progress (0-1) to parallax drift (0 to maxDrift px)
  const y = useTransform(scrollYProgress, [0, 1], [0, maxDrift]);

  // Check if we should disable parallax
  // Note: Mobile check handled by consuming component via disableOnMobile prop
  const isDisabled = prefersReducedMotion ?? false;

  return { ref, y, isDisabled };
}
