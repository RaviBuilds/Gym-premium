"use client";

import { useReducedMotion, motion } from "framer-motion";
import type { ElementType } from "react";
import { motion as motionTokens } from "@/lib/design-tokens";
import { SCROLL_TRIGGER_THRESHOLD } from "@/lib/motion-presets";
import { cn } from "@/lib/utils";

/**
 * KineticHeadline — word-by-word masked reveal for the Hero headline.
 *
 * Splits `text` on whitespace, wraps each word in an `overflow-hidden` mask
 * so it can be translated up into view rather than simply fading — reads as
 * a more deliberate, editorial entrance than AnimationWrapper's shared
 * fade-up (which every other headline on the page still uses; this is a
 * one-off reserved for the single highest-impact headline on the site).
 *
 * Stagger/duration/easing all pull from the same shared `motion` token
 * vocabulary AnimationWrapper uses — no new timing invented. Hard
 * reduced-motion bypass renders the plain final text immediately, matching
 * every other motion primitive's contract.
 */
export interface KineticHeadlineProps {
  text: string;
  as?: ElementType;
  className?: string;
  /**
   * When the word sequence runs. `"mount"` is the default because the Hero
   * sits above the fold and has always revealed on load — keeping it the
   * default means existing call sites get byte-for-byte the same animation
   * config they got before this prop existed. `"inView"` swaps the
   * container's `animate` for `whileInView` at `SCROLL_TRIGGER_THRESHOLD`,
   * which is required for any below-fold heading: on `"mount"` the reveal
   * would fire while the text is still off-screen and the visitor would
   * only ever see the settled state.
   */
  trigger?: "mount" | "inView";
  /**
   * Seconds. Offsets the whole word sequence so a heading can take its slot in
   * a section's choreography. Composes with — never replaces — the per-word
   * stagger, so `delay={0}` reduces exactly to the original timing.
   */
  delay?: number;
}

/**
 * The only two container elements any call site renders today (Hero's
 * default `"span"`, Programs'/TrainerShowcase's `"h2"`). A lookup table
 * rather than `motion.create(as)` at render time for the same reason
 * AnimationWrapper's `MOTION_ELEMENTS` is one: building the motion
 * component inline gives React a new component identity every render,
 * which remounts the whole word list mid-reveal instead of animating it.
 */
const MOTION_CONTAINERS = {
  span: motion.span,
  h2: motion.h2,
} as const;

type KineticHeadlineTag = keyof typeof MOTION_CONTAINERS;

function isKnownTag(value: ElementType): value is KineticHeadlineTag {
  return value === "span" || value === "h2";
}

/**
 * One shared hidden/visible pair. Every word reads the *same* variant
 * object, so the container's own `initial`/`animate`/`whileInView` state is
 * the single source of truth — a word never runs its own intersection
 * observation. This is the standard Framer Motion variant-propagation
 * pattern and is what every other `whileInView` reveal on this site already
 * relies on (see `AnimationWrapper`); the previous per-word `whileInView`
 * attached the observer to elements that start life translated 110% out of
 * their own mask, which could leave the reveal never firing for a
 * below-fold heading.
 */
const WORD_VARIANTS = {
  hidden: { y: "110%" },
  visible: { y: "0%" },
};

export function KineticHeadline({
  text,
  as = "span",
  className,
  trigger = "mount",
  delay = 0,
}: KineticHeadlineProps) {
  const prefersReducedMotion = useReducedMotion();
  const words = text.split(" ");

  if (prefersReducedMotion) {
    const Tag = as;
    return <Tag className={className}>{text}</Tag>;
  }

  const MotionTag = MOTION_CONTAINERS[isKnownTag(as) ? as : "span"];

  // Only the trigger mechanism differs between the two modes; the target
  // variant is identical, so `"mount"` resolves to the same reveal the
  // component has always rendered.
  const containerRevealProps =
    trigger === "inView"
      ? {
          whileInView: "visible",
          viewport: { once: true, amount: SCROLL_TRIGGER_THRESHOLD },
        }
      : { animate: "visible" };

  return (
    <MotionTag
      className={cn("flex flex-wrap", className)}
      initial="hidden"
      {...containerRevealProps}
    >
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="mr-[0.25em] overflow-hidden pb-[0.1em]">
          <motion.span
            className="inline-block"
            variants={WORD_VARIANTS}
            transition={{
              duration: motionTokens.duration.standard,
              delay: delay + 0.1 + index * 0.06,
              ease: motionTokens.easeOut,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
