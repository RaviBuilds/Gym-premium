"use client";

import { useRef } from "react";
import type { ReactNode, PointerEvent as ReactPointerEvent } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { motion as motionTokens } from "@/lib/design-tokens";

/**
 * MagneticButton — wraps a Button/ButtonLink so it drifts a few px toward
 * the cursor on hover, then springs back on leave. Desktop-fine-pointer only
 * (`matchMedia("(pointer: fine)")` isn't needed here since pointer events
 * themselves already only fire meaningfully for mouse-class input — touch
 * taps don't hover long enough to accumulate movement, but we still gate on
 * reduced-motion to skip the spring physics entirely).
 *
 * Travel is capped at `motionTokens.distance.magneticMax` (8px) — same
 * "subtle, not gimmicky" philosophy ParallaxLayer applies to its 40px cap.
 * The wrapped element's own :focus-visible outline is untouched since this
 * only ever translates a wrapping span, never the focusable child itself.
 */
export function MagneticButton({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    const relX = event.clientX - (bounds.left + bounds.width / 2);
    const relY = event.clientY - (bounds.top + bounds.height / 2);
    const cap = motionTokens.distance.magneticMax;
    x.set(Math.max(-cap, Math.min(cap, relX * 0.35)));
    y.set(Math.max(-cap, Math.min(cap, relY * 0.35)));
  };

  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </motion.div>
  );
}
