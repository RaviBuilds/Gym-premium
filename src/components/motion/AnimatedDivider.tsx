"use client";

import { motion, useReducedMotion } from "framer-motion";
import { motion as motionTokens } from "@/lib/design-tokens";

/**
 * AnimatedDivider — thin rule that grows into place (scale 0→1, anchored
 * center) rather than simply appearing. Used between Trust Strip stats so
 * the row reads as something assembling deliberately, not a static border
 * that was just always there. `orientation="horizontal"` supports the same
 * effect for a rule that draws outward left-right instead of top-bottom.
 *
 * Reduced motion: renders the final rule immediately, no scale-in.
 */
export interface AnimatedDividerProps {
  delay?: number;
  className?: string;
  orientation?: "vertical" | "horizontal";
}

export function AnimatedDivider({ delay = 0, className, orientation = "vertical" }: AnimatedDividerProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className} />;
  }

  const axis = orientation === "vertical" ? "scaleY" : "scaleX";

  return (
    <motion.div
      className={className}
      style={{ transformOrigin: "center" }}
      initial={{ [axis]: 0, opacity: 0 }}
      whileInView={{ [axis]: 1, opacity: 1 }}
      viewport={{ once: true, amount: motionTokens.scrollTriggerThreshold }}
      transition={{
        duration: motionTokens.duration.standard,
        delay,
        ease: motionTokens.easeOut,
      }}
    />
  );
}
