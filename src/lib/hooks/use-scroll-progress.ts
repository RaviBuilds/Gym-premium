"use client";

/**
 * useScrollProgress — Track scroll progress of an element.
 *
 * Returns a MotionValue representing scroll progress (0-1) for the target
 * element. Used for scroll-linked animations like parallax, progress bars,
 * or any continuous scroll-driven effect.
 *
 * Based on Framer Motion's useScroll hook with sensible defaults for
 * the homepage's scroll-linked motion needs.
 */

import { useRef } from "react";
import { useScroll, type MotionValue, type UseScrollOptions } from "framer-motion";

export interface UseScrollProgressOptions {
  /**
   * Offset configuration for scroll tracking.
   * Default: ["start start", "end start"] — track from when element enters
   * viewport top until it exits viewport top.
   */
  offset?: UseScrollOptions["offset"];
}

export interface UseScrollProgressReturn {
  /** Ref to attach to the element being tracked */
  ref: React.RefObject<HTMLElement | null>;
  /** Scroll progress from 0 to 1 */
  scrollYProgress: MotionValue<number>;
}

/**
 * Track scroll progress of an element from 0 to 1.
 *
 * @param options - Configuration for scroll tracking
 * @returns Ref and scroll progress MotionValue
 *
 * @example
 * const { ref, scrollYProgress } = useScrollProgress();
 * const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
 * 
 * return <motion.div ref={ref} style={{ y }} />;
 */
export function useScrollProgress(
  options: UseScrollProgressOptions = {}
): UseScrollProgressReturn {
  const ref = useRef<HTMLElement>(null);
  const { offset = ["start start", "end start"] as UseScrollOptions["offset"] } = options;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset,
  });

  return { ref, scrollYProgress };
}
