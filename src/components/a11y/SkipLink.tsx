import { cn } from "@/lib/utils";

/**
 * SkipLink — §13 Accessibility, §Homepage-Architecture.md Navbar notes.
 *
 * Standard "skip to main content" link — visually hidden until keyboard
 * focus lands on it, then appears at the top-left of the viewport. Required
 * for any site with a persistent Navbar plus a long homepage scroll: without
 * it, a keyboard user must Tab through every nav link on every single page
 * load before reaching page content.
 *
 * Pairs with the `<main id="main-content">` landmark rendered in the root
 * layout (see src/app/layout.tsx).
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className={cn(
        "sr-only focus:not-sr-only",
        "focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-[100]",
        "focus-visible:rounded-none focus-visible:bg-brand-yellow focus-visible:px-6 focus-visible:py-3",
        "focus-visible:font-body focus-visible:text-button focus-visible:font-semibold focus-visible:text-ink"
      )}
    >
      Skip to main content
    </a>
  );
}
