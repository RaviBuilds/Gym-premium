"use client";

import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Card — §6 Card Design (base rules shared by every card type).
 *
 *  radius            6px (rounded-card) — soft edges mean content, never 0
 *  padding           24px desktop / 20px mobile
 *  resting shadow    0 2px 8px rgba(20,24,29,0.08)
 *  hover shadow      0 16px 32px rgba(20,24,29,0.16)
 *  hover transform   translateY(-4px)
 *  transition        220ms ease-out, transform + shadow together
 *
 * ProgramCard / LocationCard / TestimonialCard (secondary) all compose this
 * base rather than redefining radius/shadow/hover themselves.
 * TestimonialPullQuote deliberately does NOT use this component — per §6 it
 * has no shadow/border at all, styled as a magazine pull-quote instead.
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Disables the hover lift/shadow — use for cards inside a Carousel where
   *  hover competes with swipe/drag intent (§6: TestimonialCard note), or
   *  for the deliberately-quiet ExtraFeatureCard (§6). */
  interactive?: boolean;
  /** Compact padding variant for the Extras section (§6: "reduce padding to 20px"). */
  padding?: "default" | "compact";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { children, className, interactive = true, padding = "default", ...props },
  ref
) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={cn(
        "rounded-card bg-surface-card",
        padding === "default" ? "p-5 lg:p-6" : "p-4",
        className
      )}
      style={{
        // Premium soft shadow at rest — larger blur, lower opacity
        boxShadow: "0 8px 24px rgba(20,24,29,0.12)",
      }}
      whileHover={
        interactive && !prefersReducedMotion
          ? {
              y: -6,
              // Softer shadow on hover — reveals more background beneath
              boxShadow: "0 12px 32px rgba(20,24,29,0.08)",
              // Exit-easing asymmetry (hover-in): lift fast at 0.22s with
              // easeOut so the card rises with the premium ease curve.
              transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
            }
          : undefined
      }
      transition={
        // Exit-easing asymmetry — the card lifts at 0.22s with easeOut, then
        // settles back at 0.3s with the same ease so it reads as having
        // inertia rather than snapping to rest. Transform + shadow only (no
        // layout-affecting properties). Collapses to no transition under
        // reduced motion (whileHover is undefined above, so this transition
        // simply has nothing to animate).
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }
      }
      {...(props as Record<string, unknown>)}
    >
      {children}
    </motion.div>
  );
});

/**
 * Convenience media slot for the "image fills top ~70/75% of the card"
 * pattern shared by ProgramCard/LocationCard (§6). Composed
 * inside Card by those higher-level components — kept here since the
 * overflow-clipping + radius-matching behavior is identical across all of
 * them and shouldn't be reimplemented per card type.
 */
export function CardMedia({
  children,
  className,
  ratio = "landscape",
}: {
  children: ReactNode;
  className?: string;
  /** 16:10 Program/Location, 4:5 Trainer portrait, 1:1 Gallery — §7 Photography Direction. */
  ratio?: "landscape" | "portrait" | "square";
}) {
  const ratioStyles = {
    landscape: "aspect-[16/10]",
    portrait: "aspect-[4/5]",
    square: "aspect-square",
  } as const;

  return (
    <div
      className={cn(
        "relative -m-5 mb-4 overflow-hidden rounded-t-card lg:-m-6 lg:mb-4",
        ratioStyles[ratio],
        className
      )}
    >
      {children}
    </div>
  );
}
