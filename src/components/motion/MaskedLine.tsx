"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MOTION_EASING, SCROLL_TRIGGER_THRESHOLD, durationPresets } from "@/lib/motion-presets";
import { cn } from "@/lib/utils";

/**
 * MaskedLine — single-line masked reveal (design §13.4).
 *
 * One `overflow-hidden` wrapper plus one `translateY` 110% → 0%. This is the
 * line-level counterpart to KineticHeadline's per-word treatment: coach names
 * and index numerals must arrive as a single event, because splitting on
 * whitespace would reveal "Mohammed" and "Wajeed" as two separate reveals.
 *
 * Duration, easing and trigger threshold all come from the closed motion
 * vocabulary (`@/lib/motion-presets`) — no new timing invented here.
 *
 * Only `transform` animates. Never `clip-path`, never `height`, never
 * `opacity` — the mask does the hiding, so the text stays at opacity 1 and
 * contributes 0 to CLS.
 *
 * Element choice: both branches render `span`s, so a MaskedLine is safe inside
 * a heading (`<h3><MaskedLine>{name}</MaskedLine></h3>`) without producing
 * invalid HTML. There is deliberately no `as` prop — callers own the semantic
 * element, this primitive owns only the mask.
 *
 * Accessibility (requirement 6.5, hard requirement): under
 * `prefers-reduced-motion: reduce` this returns `children` in a plain `span` —
 * no mask, no transform, no delay — so every element is at rest with an
 * identity computed transform. In both branches the text content is in the DOM
 * at its final content at all times, so screen readers and no-JS get it too.
 */
export interface MaskedLineProps {
  children: ReactNode;
  /** Delay before the reveal starts, in seconds. Must be >= 0. */
  delay?: number;
  className?: string;
}

export function MaskedLine({ children, delay = 0, className }: MaskedLineProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    // Final state, plain element — no mask wrapper, no transform, no delay.
    return <span className={className}>{children}</span>;
  }

  return (
    // pb-[0.1em] keeps descenders from being shaved by the mask, matching
    // KineticHeadline's per-word wrapper.
    <span className={cn("inline-block overflow-hidden pb-[0.1em]", className)}>
      <motion.span
        className="inline-block"
        initial={{ y: "110%" }}
        whileInView={{ y: "0%" }}
        viewport={{ once: true, amount: SCROLL_TRIGGER_THRESHOLD }}
        transition={{
          duration: durationPresets.standard,
          delay,
          ease: MOTION_EASING,
        }}
      >
        {children}
      </motion.span>
    </span>
  );
}
