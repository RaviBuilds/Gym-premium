"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type TargetAndTransition } from "framer-motion";
import { motion as motionTokens } from "@/lib/design-tokens";
import {
  revealPresets,
  MOTION_EASING,
  SCROLL_TRIGGER_THRESHOLD,
  type RevealPreset,
} from "@/lib/motion-presets";

/**
 * AnimationWrapper — §10 Motion Design / §Component-Architecture.md
 * "AnimationWrapper (Scroll Reveal)".
 *
 * The generic "reveal this content when it scrolls into view" behavior used
 * by nearly every section on the homepage. Fade-up, stagger, and scale-in
 * are all configurations of this one component — no section should
 * hand-roll its own scroll-triggered animation.
 *
 * UPDATED: Now supports preset-based configuration via the motion presets
 * system. Maintains backward compatibility with existing variant prop.
 *
 * Defaults match §10's table exactly: 24px vertical travel, opacity 0→1,
 * 500ms duration, ease-out, triggered once at ~20% into viewport.
 *
 * Reduced motion (§10, §13): when prefers-reduced-motion is active, this
 * renders content in its final state immediately — no fade, no travel,
 * no delay. This is a hard requirement, not a nice-to-have.
 */
export type RevealVariant = "fade-up" | "fade" | "scale-in-settle" | "slide-in-left" | "slide-in-right";

/**
 * The elements this wrapper can render as.
 *
 * Deliberately a closed two-member union rather than `ElementType`, which is
 * what `Heading`/`BodyText` take. Those components render a plain tag, so any
 * element is as cheap as any other; this one renders a *motion* element, and
 * every member of the union has to be resolved to a `motion.*` component ahead
 * of render time (see {@link MOTION_ELEMENTS}). An open `ElementType` would
 * force either a `motion.create()` call in the render body — a fresh component
 * identity on every render, which remounts the whole subtree and kills the
 * animation it exists to run — or a lookup that can miss. A union keeps the
 * table exhaustive and checked by the compiler.
 *
 * `"div"` is the historical element and stays the default. `"li"` exists for one
 * reason: a `<ul>` may contain nothing but `<li>` (plus `script`/`template`), so
 * a per-item reveal inside a real list has to *be* the list item rather than sit
 * between the list and its items. `RosterGrid` is the first caller to need it.
 * Add a member here when a container with the same content model turns up — not
 * pre-emptively.
 */
export type AnimationWrapperElement = "div" | "li";

/**
 * `AnimationWrapperElement` → the `motion` component that renders it.
 *
 * Module scope is load-bearing, not tidiness. `motion.div` and `motion.li` are
 * resolved exactly once for the lifetime of the module, so every render of every
 * `AnimationWrapper` hands React the *same* component identity for a given `as`
 * value. Building these inside the component (via `motion.create(as)` or an
 * inline object) would produce a new type each render, and React unmounts and
 * remounts a subtree whose element type changed — the children would be torn
 * down and rebuilt mid-reveal, losing both the animation and any DOM state
 * inside the cell.
 */
const MOTION_ELEMENTS = {
  div: motion.div,
  li: motion.li,
} as const;

export interface AnimationWrapperProps {
  children: ReactNode;
  /** Legacy variant API — maintained for backward compatibility */
  variant?: RevealVariant;
  /** NEW: Preset-based reveal configuration (alternative to variant) */
  preset?: RevealPreset;
  /** Stagger delay in seconds — used by parent CardGrid to offset each child. */
  delay?: number;
  /** Custom duration override in seconds; defaults per §10 table below. */
  duration?: number;
  className?: string;
  /** Passed to Framer's viewport option — re-trigger on every scroll pass. Default: once. */
  repeat?: boolean;
  /**
   * The element the wrapper renders. Defaults to `"div"`, which is the only
   * thing this component has ever rendered — so every existing call site gets
   * byte-for-byte the same element, the same props and the same component
   * identity it got before this prop existed (the same contract
   * `KineticHeadline`'s `trigger` prop documents for its own default).
   *
   * `"li"` is for a reveal that has to live *inside* a `<ul>`, where a `div`
   * between the list and its items is invalid HTML and can cost the list its
   * role in Safari/VoiceOver. The wrapper becomes the list item, so the child it
   * wraps must not root one of its own.
   *
   * Both branches honour it, including the reduced-motion bypass — otherwise
   * `prefers-reduced-motion` would silently reintroduce the invalid `ul > div`.
   */
  as?: AnimationWrapperElement;
}

// Legacy variant configurations — maintained for backward compatibility
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

/**
 * Get reveal configuration from preset or variant.
 * Presets take precedence over variants when both are provided.
 */
function getRevealConfig(
  variant: RevealVariant,
  preset?: RevealPreset
): { hidden: TargetAndTransition; visible: TargetAndTransition } {
  // Use preset if provided
  if (preset) {
    return revealPresets[preset];
  }

  // Fall back to legacy variant
  return variants[variant];
}

export function AnimationWrapper({
  children,
  variant = "fade-up",
  preset,
  delay = 0,
  duration,
  className,
  repeat = false,
  as: Tag = "div",
}: AnimationWrapperProps) {
  const prefersReducedMotion = useReducedMotion();
  const { hidden, visible } = getRevealConfig(variant, preset);

  if (prefersReducedMotion) {
    // Final state immediately, no wrapper motion at all — §10/§13. `Tag` is a
    // plain intrinsic tag here, so with the `"div"` default this is the same
    // `<div className={className}>` this branch has always rendered.
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = MOTION_ELEMENTS[Tag];

  return (
    <MotionTag
      className={className}
      initial={hidden}
      whileInView={visible}
      viewport={{ once: !repeat, amount: SCROLL_TRIGGER_THRESHOLD }}
      transition={{
        duration: duration ?? motionTokens.duration.standard,
        delay,
        ease: MOTION_EASING,
      }}
    >
      {children}
    </MotionTag>
  );
}
