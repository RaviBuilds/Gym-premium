"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

/**
 * ScrollProgressBar — thin fixed-top indicator of scroll depth through the
 * whole page, sitting directly beneath Navbar in the layout stack.
 *
 * Unlike ParallaxLayer/KineticHeadline (purely decorative), this is
 * informational — it tells a visitor how far through a long homepage they
 * are. Per §13 Accessibility's reduced-motion requirement we still remove
 * the spring *smoothing* (snap directly to scroll position) rather than
 * hiding the bar outright, since the underlying information is orientation,
 * not motion-for-motion's-sake. `aria-hidden` throughout — this is a visual
 * aid with no accessible-name equivalent worth announcing.
 */
export function ScrollProgressBar() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothed = useSpring(scrollYProgress, { stiffness: 300, damping: 40, mass: 0.2 });

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[60] h-[3px] w-full origin-left bg-brand-yellow"
      style={{ scaleX: prefersReducedMotion ? scrollYProgress : smoothed }}
    />
  );
}
