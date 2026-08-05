"use client";

import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";
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
 * ProgramCard / TrainerCard / LocationCard / TestimonialCard (secondary) all
 * compose this base rather than redefining radius/shadow/hover themselves.
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
  return (
    <motion.div
      ref={ref}
      className={cn(
        "rounded-card bg-surface-card shadow-card",
        padding === "default" ? "p-5 lg:p-6" : "p-4",
        className
      )}
      whileHover={
        interactive ? { y: -6, boxShadow: "0 20px 40px rgba(20,24,29,0.2)" } : undefined
      }
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      {...(props as Record<string, unknown>)}
    >
      {children}
    </motion.div>
  );
});

/**
 * Convenience media slot for the "image fills top ~70/75% of the card"
 * pattern shared by ProgramCard/TrainerCard/LocationCard (§6). Composed
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
