"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * PricingPanel — premium editorial pricing unit for Membership section.
 *
 * Key design decisions:
 * - Border-first, not card-first: 1px hairline border, no radius, no shadow
 * - Hard editorial edges (brand signature: hard edges = action signal)
 * - Decorative numerals (01/02/03) AND a decorative plan glyph (icon) as
 *   structural design elements — never implying a feature/benefit
 * - Best Value panel gets 2px yellow top rule, an inline label, a soft
 *   ambient glow, and a slightly stronger entrance (scale-in-settle)
 * - Large display pricing with tabular numerals
 *
 * Reuses existing design tokens but does NOT use the shared Card component,
 * which brings inappropriate radius/shadow/lift for pricing panels.
 *
 * Dark-surface variant: Membership sits on a photographic dark ground (ink
 * scrim over an atmospheric gym interior), so every color here is the
 * dark-tone half of the site's existing palette — the same white/ink-mix
 * treatment Hero and FinalCta already use for text and hairlines on a dark
 * background (`border-white/…`, `text-white`, `text-white/60`) — rather than
 * a new color invented for this component.
 */

export interface PricingPanelProps {
  /** Decorative numeral: 01, 02, or 03 */
  numeral: string;
  /** Plan duration: Daily, Monthly, or Yearly */
  duration: string;
  /** Current/offer price: ₹199, ₹1,999, or ₹9,499 */
  price: string;
  /** Original/list price for strikethrough: ₹2,799 or ₹15,999 */
  originalPrice?: string;
  /** If true, this is the recommended Best Value plan */
  isBestValue?: boolean;
  /** Delay for entrance animation */
  delay?: number;
  /**
   * Decorative plan glyph (Sunrise/CalendarDays/Crown), pre-rendered by the
   * caller as `<Icon icon={...} />` rather than passed as a raw component
   * reference — this file is a Client Component, and a function value
   * (the Lucide component itself) isn't serializable across the Server →
   * Client boundary. Purely symbolic, paired with the numeral so each panel
   * carries both an index and an icon, the same "numeral + icon" header
   * pairing AmenityItem (Facilities.tsx) already establishes elsewhere on
   * the page.
   */
  icon: ReactNode;
}

/**
 * Entrance variants. The Best Value panel gets the sitewide
 * "scale-in-settle" treatment (opacity 0 → 1, scale 1.06 → 1, per
 * motion-presets.ts) layered onto the standard fade-up travel — the one
 * "slightly stronger" beat the motion plan calls for, built from the exact
 * numbers the rest of the site already uses for emphasis (TestimonialPullQuote),
 * not a new value invented for this component.
 */
const standardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const bestValueVariants = {
  hidden: { opacity: 0, y: 24, scale: 1.06 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const transition = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1] as const,
};

export function PricingPanel({
  numeral,
  duration,
  price,
  originalPrice,
  isBestValue = false,
  delay = 0,
  icon,
}: PricingPanelProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="group relative"
      initial={prefersReducedMotion ? undefined : "hidden"}
      animate={prefersReducedMotion ? undefined : "visible"}
      variants={prefersReducedMotion ? undefined : isBestValue ? bestValueVariants : standardVariants}
      transition={prefersReducedMotion ? { duration: 0 } : { ...transition, delay }}
    >
      {/* Ambient glow — Best Value only. A soft, contained aura (not a
          spotlight, not a hover-only effect) that gives the recommended
          plan a felt warmth at rest and a touch more on hover/focus. Sits
          behind the panel (`-z-10`), blurred so it reads as stage lighting
          on the panel rather than a colored blob. Visible at rest (0.18),
          intensifies on hover (0.28). */}
      {isBestValue && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-6 -z-10 bg-brand-yellow/[0.18] blur-xl transition-opacity duration-500 ease-out group-hover:bg-brand-yellow/[0.28] motion-reduce:hidden"
        />
      )}

      <div
        className={cn(
          "relative flex min-h-[220px] flex-col items-center gap-3 border border-white/15 bg-white/[0.03] p-6 pb-8 backdrop-blur-[2px] sm:min-h-[260px] lg:gap-4 lg:p-8 lg:pb-10",
          "transition-colors duration-300 ease-out",
          // Hover states — border brightens toward brand yellow, background
          // warms very slightly. No lift, no shadow, no scale on the panel
          // itself (the glow behind it carries the emphasis instead).
          "hover:border-brand-yellow/50 hover:bg-white/[0.05]",
          "focus-within:border-brand-yellow/50",
          isBestValue &&
            "border-white/25 bg-white/[0.05] hover:border-brand-yellow hover:bg-brand-yellow/[0.06]"
        )}
      >
        {/* Yellow top rule for Best Value panel — the primary visual emphasis */}
        {isBestValue && (
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-0 h-0.5 bg-brand-yellow"
          />
        )}

        {/* Header row — decorative numeral (left) paired with the plan's
            symbolic glyph (right), the same numeral+icon pairing pattern
            AmenityItem uses in Facilities.tsx. Both are aria-hidden;
            neither is content, only structure. */}
        <div className="flex w-full items-center justify-between">
          <span
            aria-hidden="true"
            className="select-none font-display text-stat tabular-nums text-white/20 transition-transform duration-300 ease-out group-hover:translate-x-1 lg:text-stat-lg"
          >
            {numeral}
          </span>
          <span
            className={cn(
              "transition-all duration-300 ease-out group-hover:-translate-y-0.5",
              isBestValue
                ? "text-brand-yellow/70 group-hover:text-brand-yellow"
                : "text-white/50 group-hover:text-white/80"
            )}
          >
            {icon}
          </span>
        </div>

        {/* Duration label — small uppercase, tracked, muted */}
        <span className="font-body text-caption font-semibold uppercase tracking-widest text-white/60 lg:text-caption-lg">
          {duration}
        </span>

        {/* Hairline separator — a quiet editorial rule between the label
            and the price, reinforcing "duration → price" as two distinct
            beats within one panel rather than a single stacked label. */}
        <span aria-hidden="true" className="h-px w-8 bg-white/15" />

        {/* Current/offer price — large display typography, immediately
            scannable, with a subtle hover pop (transform only) so the
            number itself feels responsive, not just its container. */}
        <span className="font-display text-3xl font-black tracking-tight text-white tabular-nums transition-transform duration-300 ease-out group-hover:scale-[1.03] lg:text-4xl">
          {price}
        </span>

        {/* Original price with strikethrough — muted, not competitive with offer */}
        {originalPrice && (
          <span className="font-body text-caption text-white/45 line-through tabular-nums lg:text-caption-lg">
            {originalPrice}
          </span>
        )}

        {/* Best Value label — inline editorial label, not a floating badge */}
        {isBestValue && (
          <span className="mt-1 font-body text-caption font-semibold uppercase tracking-widest text-brand-yellow">
            Best Value
          </span>
        )}
      </div>
    </motion.div>
  );
}
