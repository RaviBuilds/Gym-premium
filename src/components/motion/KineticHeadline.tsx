"use client";

import { useReducedMotion, motion } from "framer-motion";
import type { ElementType } from "react";
import { motion as motionTokens } from "@/lib/design-tokens";
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
export function KineticHeadline({
  text,
  as: Tag = "span",
  className,
}: {
  text: string;
  as?: ElementType;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const words = text.split(" ");

  if (prefersReducedMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={cn("flex flex-wrap", className)}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="mr-[0.25em] overflow-hidden pb-[0.1em]">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{
              duration: motionTokens.duration.standard,
              delay: 0.1 + index * 0.06,
              ease: motionTokens.easeOut,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
