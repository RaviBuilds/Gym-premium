"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getDisclosureIds, slugify } from "@/lib/a11y";
import { Icon } from "./Icon";
import { BodyText } from "./Heading";

export interface AccordionItemData {
  question: string;
  answer: string;
}

/**
 * Accordion — Component-Architecture.md §6 "Accordion". Used for the FAQ
 * section; each item toggles independently (multi-open), the standard FAQ
 * pattern — not exclusive single-open, which would hide an already-read
 * answer just because the visitor opened a second question.
 *
 * Real ARIA disclosure pattern per §13 Accessibility: each question is a
 * real <button> wrapped in an <h3> (contributing genuine heading structure
 * to the page outline, not just a styled div), with aria-expanded/
 * aria-controls pointing to a role="region" answer panel identified by
 * getDisclosureIds — the same id-pairing helper any future Tabs component
 * will also use, per Design-System.md §11.
 */
export function Accordion({ items, className }: { items: AccordionItemData[]; className?: string }) {
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
    <div className={cn("divide-y divide-border-subtle", className)}>
      {items.map((item, index) => {
        const isOpen = openIndexes.has(index);
        const { triggerId, panelId } = getDisclosureIds(`faq-${slugify(item.question)}`);

        return (
          <div key={triggerId}>
            <h3>
              <button
                id={triggerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="font-body text-subsection font-bold text-ink">{item.question}</span>
                <Icon
                  icon={ChevronDown}
                  size="default"
                  className={cn("shrink-0 text-ink transition-transform duration-[250ms]", isOpen && "rotate-180")}
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  initial={prefersReducedMotion ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={prefersReducedMotion ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <BodyText className="pb-5 text-text-secondary">{item.answer}</BodyText>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
