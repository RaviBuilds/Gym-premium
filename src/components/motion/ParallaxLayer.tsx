"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion, useMotionValue, MotionValue } from "framer-motion";
import { motion as motionTokens } from "@/lib/design-tokens";

/**
 * ParallaxLayer — §10 Motion Design, §Component-Architecture.md "ParallaxLayer".
 *
 * The subtle background-drift effect specifically for the Hero's
 * MediaBackground. Isolated from AnimationWrapper because parallax is a
 * continuous, scroll-position-linked transform (the only genuinely
 * continuous animation in the system) rather than a one-time trigger.
 *
 * §10: "should move no more than 40px of total travel across the entire
 * scrollable hero height — subtle enough to add depth, not enough to feel
 * gimmicky." §12/§10: disabled on mobile and under prefers-reduced-motion,
 * where the performance cost is higher and the payoff lower.
 *
 * `disableOnMobile` actually gates the transform itself (via a matchMedia
 * check against the `lg` breakpoint), not just a `will-change` CSS hint —
 * an earlier version of this component only toggled `will-change-transform`
 * while still running the scroll-linked `y` transform on every breakpoint,
 * which meant mobile got the full continuous-scroll cost with none of the
 * "disabled" behavior the doc comment and Visual-Design-Specification.md §10
 * both promise. Defaults to `false` (parallax active) before the
 * client-side media-query check resolves — an SSR/hydration-safe fallback,
 * since the transform has no visual effect until the user actually scrolls,
 * so a one-frame default has no visible consequence either way.
 */
export function ParallaxLayer({
  children,
  className,
  disableOnMobile = true,
  mouseX,
  mouseY,
}: {
  children: ReactNode;
  className?: string;
  disableOnMobile?: boolean;
  mouseX?: MotionValue<number>;
  mouseY?: MotionValue<number>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isBelowDesktop, setIsBelowDesktop] = useState(false);

  useEffect(() => {
    if (!disableOnMobile) return;
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    setIsBelowDesktop(mediaQuery.matches);
    const handleChange = (event: MediaQueryListEvent) => setIsBelowDesktop(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [disableOnMobile]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const fallbackMouseX = useMotionValue(0);
  const fallbackMouseY = useMotionValue(0);

  const scrollYTransform = useTransform(scrollYProgress, [0, 1], [0, motionTokens.distance.parallaxMax]);
  const mouseXShift = useTransform(mouseX ?? fallbackMouseX, [-500, 500], [-8, 8]);
  const mouseYShift = useTransform(mouseY ?? fallbackMouseY, [-500, 500], [-8, 8]);

  const parallaxDisabled = prefersReducedMotion || (disableOnMobile && isBelowDesktop);

  if (parallaxDisabled) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y: scrollYTransform }} className="will-change-transform">
        <motion.div style={{ x: mouseXShift, y: mouseYShift }}>
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
