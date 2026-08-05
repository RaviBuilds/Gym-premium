"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { motion as motionTokens } from "@/lib/design-tokens";

/**
 * CountUp — §10 Motion Design, §Component-Architecture.md "CountUp".
 *
 * Numeric rolling-count animation for StatCounter (Trust Strip). Isolated
 * from AnimationWrapper because it animates a *value*, not element opacity/
 * position — 0 to final value over 1200ms, ease-out (fast start, slow
 * settle), triggered once on scroll entry (§10).
 *
 * Accessibility (§10/§13, hard requirement): the final value must be
 * present in the DOM immediately, not solely revealed via animation, so
 * screen readers and reduced-motion users aren't waiting on/parsing an
 * animation. This component renders the real final number as the element's
 * accessible text at all times — see the `aria-label` below — and only
 * animates the *visual* digits, which are marked `aria-hidden`.
 */
export interface CountUpProps {
  /** Final numeric value to count up to. */
  end: number;
  /** Optional prefix/suffix text, e.g. "+" or "since ". */
  prefix?: string;
  suffix?: string;
  /** Duration in ms; defaults to the spec's 1200ms. */
  duration?: number;
  className?: string;
}

export function CountUp({ end, prefix = "", suffix = "", duration, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const prefersReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(prefersReducedMotion ? end : 0);
  const animatedRef = useRef(false);

  useEffect(() => {
    if (!isInView || animatedRef.current) return;
    animatedRef.current = true;

    if (prefersReducedMotion) {
      setDisplayValue(end);
      return;
    }

    const totalDuration = duration ?? motionTokens.duration.counter * 1000;
    const startTime = performance.now();

    // Ease-out cubic — fast start, slow settle onto the final number (§10).
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    let frameId: number;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      const eased = easeOutCubic(progress);
      setDisplayValue(Math.round(eased * end));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, end, duration, prefersReducedMotion]);

  return (
    <span ref={ref} className={className}>
      {/* Real final value, always in the DOM — screen readers read this. */}
      <span className="sr-only">{`${prefix}${end}${suffix}`}</span>
      {/* Visual-only animated digits, hidden from assistive tech. */}
      <span aria-hidden="true">
        {prefix}
        {displayValue}
        {suffix}
      </span>
    </span>
  );
}
