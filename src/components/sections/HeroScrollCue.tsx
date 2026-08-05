"use client";

import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * HeroScrollCue — a desktop-only shortcut to the next homepage chapter.
 *
 * Its loop is isolated from the Server Component Hero so it can fully honor
 * reduced-motion preferences without affecting the Hero entrance sequence.
 */
export function HeroScrollCue() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.a
      href="#programs"
      aria-label="Scroll to What We Offer"
      className="flex flex-col items-center gap-1 text-text-secondary-dark transition-colors hover:text-white"
      animate={prefersReducedMotion ? undefined : { y: [0, 6, 0], opacity: [1, 0.5, 1] }}
      transition={prefersReducedMotion ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className="font-body text-caption uppercase tracking-wide">Explore training</span>
      <ChevronDown className="size-5" aria-hidden="true" />
    </motion.a>
  );
}
