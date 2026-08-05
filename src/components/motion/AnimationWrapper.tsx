"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type TargetAndTransition } from "framer-motion";
import { motion as motionTokens } from "@/lib/design-tokens";

/**
 * AnimationWrapper — §10 Motion Design / §Component-Architecture.md
 * "AnimationWrapper (Scroll Reveal)".
 *
 * The generic "reveal this content when it scrolls into view" behavior used
 * by nearly every section on the homepage. Fade-up, stagger, and scale-in
 * are all configurations of this one component — no section should
 * hand-roll its own scroll-triggered animation.
 *
 * Defaults match §10's table exactly: 24px vertical travel, opacity 0→1,
 * 500ms duration, ease-out, triggered once at ~20% into viewport.
 *
 * Reduced motion (§10, §13): when prefers-reduced-motion is active, this
 * renders content in its final state immediately — no fade, no travel,
 * no delay. This is a hard requirement, not a nice-to-have.
 */
export type RevealVariant = "fade-up" | "fade" | "scale-in-settle" | "slide-in-left" | "slide-in-right";

export interface AnimationWrapperProps {
  children: ReactNode;
  variant?: RevealVariant;
  /** Stagger delay in seconds — used by parent CardGrid to offset each child. */
  delay?: number;
  /** Custom duration override in seconds; defaults per §10 table below. */
  duration?: number;
  className?: string;
  /** Passed to Framer's viewport option — re-trigger on every scroll pass. Default: once. */
  repeat?: boolean;
}

const variants: Record<RevealVariant, { hidden: TargetAndTransition; visible: TargetAndTransition }> = {
  "fade-up": {
    hidden: { opacity: 0, y: motionTokens.distance.fadeUp },
    visible: { opacity: 1, y: 0 },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  "scale-in-settle": {
    // Testimonial pull-quotes (§10): "scale in slightly larger... then settle"
    hidden: { opacity: 0, scale: 1.06 },
    visible: { opacity: 1, scale: 1 },
  },
  // Locations section (§10): "cards slide in from opposite sides... a
  // lightweight visual metaphor for two locations, one brand." Distance
  // matches the horizontal equivalent of the standard fade-up travel.
  "slide-in-left": {
    hidden: { opacity: 0, x: -motionTokens.distance.fadeUp * 2 },
    visible: { opacity: 1, x: 0 },
  },
  "slide-in-right": {
    hidden: { opacity: 0, x: motionTokens.distance.fadeUp * 2 },
    visible: { opacity: 1, x: 0 },
  },
};

export function AnimationWrapper({
  children,
  variant = "fade-up",
  delay = 0,
  duration,
  className,
  repeat = false,
}: AnimationWrapperProps) {
  const prefersReducedMotion = useReducedMotion();
  const { hidden, visible } = variants[variant];

  if (prefersReducedMotion) {
    // Final state immediately, no wrapper motion at all — §10/§13.
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={hidden}
      whileInView={visible}
      viewport={{ once: !repeat, amount: motionTokens.scrollTriggerThreshold }}
      transition={{
        duration: duration ?? motionTokens.duration.standard,
        delay,
        ease: motionTokens.easeOut,
      }}
    >
      {children}
    </motion.div>
  );
}
