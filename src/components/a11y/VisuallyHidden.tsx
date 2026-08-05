import type { ElementType, ReactNode } from "react";

/**
 * VisuallyHidden — §13 Accessibility.
 *
 * Renders content that's present for screen readers but not visually shown —
 * e.g. the real final value behind an animated CountUp (§10: "final value
 * always present in markup immediately"), or an icon-only button's
 * accessible label on the Sticky Mobile CTA when label text truncates
 * (§Homepage-Architecture.md, Sticky Mobile CTA accessibility note).
 *
 * Uses the same clip-based hiding technique as Tailwind's built-in `sr-only`
 * utility (kept as a component so call sites read intent-first: "this is
 * deliberately screen-reader-only content," not just a utility class).
 */
export function VisuallyHidden({
  children,
  as: Tag = "span",
}: {
  children: ReactNode;
  as?: ElementType;
}) {
  return <Tag className="sr-only">{children}</Tag>;
}
