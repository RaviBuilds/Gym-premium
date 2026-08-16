import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Every custom font-size token declared in the `--text-*` namespace of
 * globals.css's `@theme` block, without the `text-` prefix.
 *
 * This list has to exist because tailwind-merge cannot read a Tailwind v4 CSS
 * theme — it ships a static config, and its `font-size` group only recognises
 * t-shirt sizes (`text-sm`, `text-2xl`, ...) and arbitrary values
 * (`text-[18px]`). Anything else matching `text-<word>` falls through to the
 * `text-color` group, which accepts any value so it can support custom palette
 * entries like `text-ink`.
 *
 * Left unregistered, that misclassification silently deleted the mobile half of
 * the entire type scale. `Heading`/`BodyText`/`Eyebrow` all compose through
 * `cn()`, and nearly every call site passes a colour:
 *
 *   cn("font-display text-section lg:text-section-lg", "text-white")
 *     -> "font-display lg:text-section-lg text-white"
 *
 * tailwind-merge saw `text-section` and `text-white` as two colours in the same
 * scope, kept the last one, and dropped the size. `lg:text-section-lg` survived
 * only because a `lg:`-prefixed class never conflicts with an unprefixed one —
 * which is exactly why the bug was invisible on desktop and total below 1024px:
 * section headings, subsection headings, eyebrows and captions all rendered at
 * the inherited 16px with no font-size, weight, line-height or letter-spacing,
 * so headings and body copy came out the same size. The Hero was the one
 * headline that looked right, because its spans set `text-hero`/
 * `text-hero-display` as literal className strings that never pass through
 * `cn()`.
 *
 * Keep in sync with the `--text-*` tokens in globals.css. utils.test.ts asserts
 * every entry here survives a merge with a colour class, so a token added to
 * the theme but missed here fails a test rather than quietly losing its size on
 * mobile.
 */
const CUSTOM_FONT_SIZES = [
  "hero",
  "hero-lg",
  "hero-display",
  "hero-display-lg",
  "section",
  "section-lg",
  "subsection",
  "subsection-lg",
  "eyebrow",
  "eyebrow-lg",
  "body",
  "body-lg",
  "body-lg-desktop",
  "caption",
  "caption-lg",
  "button",
  "stat",
  "stat-lg",
  "result",
  "result-lg",
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...CUSTOM_FONT_SIZES] }],
    },
  },
});

/**
 * Merge Tailwind class lists safely — clsx handles conditional/falsy values,
 * tailwind-merge resolves conflicting utilities (e.g. a component default of
 * "px-4" overridden by a caller's "px-6") so the last one wins instead of
 * both landing in the DOM. Every component in this system should compose
 * classes through this helper rather than raw string concatenation.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export { CUSTOM_FONT_SIZES };
