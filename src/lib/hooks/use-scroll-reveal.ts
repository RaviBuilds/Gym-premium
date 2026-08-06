"use client";

/**
 * useScrollReveal — Viewport intersection detection for scroll reveals.
 *
 * Provides a reusable hook for detecting when an element enters the viewport,
 * used to trigger scroll-reveal animations. Wraps Framer Motion's viewport
 * detection with our motion system's defaults.
 *
 * Based on specifications/02-motion-system.md — standardized scroll trigger
 * behavior across all homepage sections.
 */

import { useInView } from "framer-motion";
import { useRef } from "react";
import { SCROLL_TRIGGER_THRESHOLD } from "../motion-presets";

export interface UseScrollRevealOptions {
  /** Trigger threshold (0-1). Default: 0.2 (20% into viewport) */
  amount?: number;
  /** Re-trigger on every scroll pass. Default: false (once) */
  repeat?: boolean;
  /** Delay before triggering in seconds. Default: 0 */
  delay?: number;
}

export interface UseScrollRevealReturn {
  /** Ref to attach to the element being watched */
  ref: React.RefObject<HTMLElement | null>;
  /** Whether element is in view */
  isInView: boolean;
}

/**
 * Detect when an element enters the viewport.
 *
 * @param options - Reveal configuration
 * @returns Ref and in-view state
 *
 * @example
 * const { ref, isInView } = useScrollReveal();
 * 
 * return (
 *   <motion.div
 *     ref={ref}
 *     initial={{ opacity: 0, y: 24 }}
 *     animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
 *   >
 *     Content
 *   </motion.div>
 * );
 */
export function useScrollReveal(
  options: UseScrollRevealOptions = {}
): UseScrollRevealReturn {
  const {
    amount = SCROLL_TRIGGER_THRESHOLD,
    repeat = false,
  } = options;

  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, {
    once: !repeat,
    amount,
  });

  return { ref, isInView };
}
