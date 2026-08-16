"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getDisclosureIds, slugify } from "@/lib/a11y";
import { BodyText } from "./Heading";

export interface AccordionItemData {
  question: string;
  answer: string;
}

/**
 * Accordion — Premium glass-panel FAQ with numbered items, yellow active
 * accent, animated plus/minus icon morph, and staggered content reveal.
 *
 * v2 — Visual QA upgrade:
 *   - Glass item panels (translucent bg, border, inner gradient)
 *   - Numbered indices (01, 02...) in display font
 *   - Open state: yellow left accent, brighter border, warm glow
 *   - Custom plus/minus icon with rotation morph (not generic Chevron)
 *   - Expanded content: fade + slide-up with subtle bounce
 *   - Hover state: background warmth + border brighten
 *   - Shimmer gradient dividers between items
 *   - Active item breathing glow on the left accent
 *
 * Accessibility preserved: real ARIA disclosure, h3 buttons, multi-open,
 * role="region", aria-expanded/controls. Reduced motion: instant state.
 */

/** Plus/minus morph icon — replaces generic ChevronDown. */
function ToggleIcon({ isOpen, className }: { isOpen: boolean; className?: string }) {
  return (
    <div className={cn("relative flex size-6 items-center justify-center", className)}>
      {/* Horizontal bar (always visible) */}
      <span
        className={cn(
          "absolute h-[2px] w-3.5 rounded-full transition-[background-color] duration-300",
          isOpen ? "bg-brand-yellow" : "bg-ink/40 group-hover:bg-ink/70"
        )}
      />
      {/* Vertical bar (collapses on open) */}
      <span
        className={cn(
          "absolute h-3.5 w-[2px] rounded-full transition-[transform,opacity,background-color] duration-400 ease-out",
          isOpen
            ? "rotate-90 scale-0 opacity-0 bg-brand-yellow"
            : "rotate-0 scale-100 opacity-100 bg-ink/40 group-hover:bg-ink/70"
        )}
      />
    </div>
  );
}

/** Shimmer divider between items — subtle gold accent. */
function ShimmerDivider() {
  return (
    <div
      aria-hidden="true"
      className="h-px w-full"
      style={{
        background:
          "linear-gradient(90deg, transparent 5%, rgba(20,24,29,0.06) 25%, rgba(255,222,1,0.15) 50%, rgba(20,24,29,0.06) 75%, transparent 95%)",
      }}
    />
  );
}

/** Per-item reveal variant for staggered entrance. */
const ITEM_REVEAL = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.08,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

/** Content expand animation. */
const EXPAND_ANIMATION = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
};

/** Inner content slide-up within the expanding panel. */
const CONTENT_SLIDE = {
  initial: { y: 8, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const },
};

export function Accordion({
  items,
  className,
}: {
  items: AccordionItemData[];
  className?: string;
}) {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());
  const prefersReducedMotion = useReducedMotion();

  function toggle(index: number) {
    setOpenIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {items.map((item, index) => {
        const isOpen = openIndexes.has(index);
        const { triggerId, panelId } = getDisclosureIds(
          `faq-${slugify(item.question)}`
        );
        const number = String(index + 1).padStart(2, "0");

        return (
          <motion.div
            key={triggerId}
            custom={index}
            initial={prefersReducedMotion ? undefined : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={prefersReducedMotion ? undefined : ITEM_REVEAL}
          >
            {/* Shimmer divider (not before first item) */}
            {index > 0 && <ShimmerDivider />}

            {/* Glass panel item — LIGHT SECTION VARIANT */}
            <div
              className={cn(
                "group relative overflow-hidden rounded-card transition-all duration-400 ease-out",
                // Surface treatment for light background
                "border",
                isOpen
                  ? "border-brand-yellow/30 bg-white shadow-[0_4px_20px_rgba(20,24,29,0.08)]"
                  : "border-border-subtle bg-white/80 hover:border-ink/20 hover:bg-white hover:shadow-[0_2px_12px_rgba(20,24,29,0.06)]"
              )}
            >
              {/* Yellow left accent bar (active state) */}
              <div
                aria-hidden="true"
                className={cn(
                  "absolute inset-y-0 left-0 w-[3px] transition-all duration-400 ease-out",
                  isOpen
                    ? "bg-brand-yellow opacity-100"
                    : "bg-brand-yellow/0 opacity-0"
                )}
              />

              {/* Question button */}
              <h3>
                <button
                  id={triggerId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(index)}
                  className={cn(
                    "group flex w-full items-center gap-4 px-5 py-5 text-left sm:px-6",
                    "transition-transform duration-150 ease-out active:scale-[0.995]"
                  )}
                >
                  {/* Index number */}
                  <span
                    className={cn(
                      "hidden shrink-0 font-display text-body-lg transition-colors duration-300 sm:block",
                      isOpen ? "text-brand-yellow" : "text-ink/20 group-hover:text-ink/40"
                    )}
                  >
                    {number}
                  </span>

                  {/* Question text */}
                  <span
                    className={cn(
                      "flex-1 font-body text-body-lg font-semibold transition-colors duration-300 sm:text-subsection",
                      isOpen
                        ? "text-ink"
                        : "text-ink/75 group-hover:text-ink"
                    )}
                  >
                    {item.question}
                  </span>

                  {/* Plus/minus morph icon */}
                  <ToggleIcon isOpen={isOpen} className="shrink-0" />
                </button>
              </h3>

              {/* Expandable answer panel */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                    initial={
                      prefersReducedMotion
                        ? { height: "auto", opacity: 1 }
                        : EXPAND_ANIMATION.initial
                    }
                    animate={EXPAND_ANIMATION.animate}
                    exit={
                      prefersReducedMotion
                        ? { height: "auto", opacity: 1 }
                        : EXPAND_ANIMATION.exit
                    }
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : EXPAND_ANIMATION.transition
                    }
                    className="overflow-hidden"
                  >
                    <motion.div
                      initial={prefersReducedMotion ? undefined : CONTENT_SLIDE.initial}
                      animate={CONTENT_SLIDE.animate}
                      transition={
                        prefersReducedMotion ? { duration: 0 } : CONTENT_SLIDE.transition
                      }
                      className="px-5 pb-5 sm:px-6 sm:pb-6"
                    >
                      {/* Answer text — indented past the number column.
                          Uses the light-surface secondary token: this panel
                          is white, so dark-section classes are invisible. */}
                      <div className="sm:pl-[calc(1.25rem+1rem)]">
                        <BodyText className="max-w-2xl leading-relaxed text-text-secondary">
                          {item.answer}
                        </BodyText>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
