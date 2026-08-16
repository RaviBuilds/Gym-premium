"use client";

import { useEffect, useState } from "react";

export interface UseElementInViewOptions {
  /**
   * Shrinks the observed viewport. `"0px 0px -20% 0px"` means "count it as in
   * view only once it is 20% up from the bottom edge", which stops a component
   * from reacting to an element that has merely peeked into the last few pixels
   * of the screen.
   */
  rootMargin?: string;
  threshold?: number | number[];
}

/**
 * Live "is the element with this id on screen right now" — unlike
 * {@link useAnchorPassed}, this tracks continuously and flips back to `false`.
 *
 * Exists because two different fixed-position components need the same answer
 * about the same element: both `FloatingContactDock` and the trial-intercept
 * campaign suppress themselves while the `#free-trial` form is visible. Their
 * shared reasoning is that both exist to *deliver* a visitor to that form, so
 * once the visitor is looking at it, both are noise — and in the dock's case it
 * would additionally sit on top of the footer's own back-to-top button.
 *
 * Matched by `id` rather than by a ref on purpose. The form is rendered by
 * `Footer`; its observers are viewport-fixed elements in unrelated subtrees.
 * Threading a ref from the footer up through `layout.tsx` and back down into two
 * fixed siblings would couple components that today share nothing but a URL
 * fragment — and that fragment is already the site's one conversion anchor, linked
 * by `Hero`, `Navbar`, `Testimonials`, `FinalCta` and both docks.
 *
 * Returns `false` when the element does not exist. An observer that never fires
 * is better than one that throws on a null target: a future route could omit the
 * footer entirely.
 */
export function useElementInView(
  elementId: string,
  { rootMargin, threshold }: UseElementInViewOptions = {}
): boolean {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = document.getElementById(elementId);

    if (element === null) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry !== undefined) {
          setIsInView(entry.isIntersecting);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [elementId, rootMargin, threshold]);

  return isInView;
}
