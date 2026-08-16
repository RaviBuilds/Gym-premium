"use client";

import { useEffect, useState } from "react";

export interface UseAnchorPassedOptions {
  /**
   * Skip observing entirely. Passed `false` while a campaign is still
   * ineligible, so a visitor who has already dismissed it costs zero observers.
   *
   * Flipping this from `false` to `true` after the anchor is already above the
   * viewport fires immediately and correctly — an `IntersectionObserver` reports
   * its target's initial state on the first frame after `observe()`, so a
   * late-mounted observer is not a missed trigger. That is what makes the dwell
   * gate in `useCampaignGate` composable with this hook: the timer can outlast
   * the scroll and still get the right answer.
   */
  enabled?: boolean;
}

/**
 * Fires once, when the element with `anchorId` has scrolled **past the top of
 * the viewport** — i.e. the visitor has read it and moved on.
 *
 * ## Why an anchor and not a pixel depth
 *
 * `FloatingContactDock` uses `window.scrollY > 640`, and that is the right call
 * for what it does: reveal after "roughly one hero". A conversion prompt tied to
 * a *specific section* cannot use a pixel number, because the number is wrong
 * the moment anyone edits a section above it, and wrong differently on a 720px
 * laptop than on a 1440px display. Naming the element makes the trigger a fact
 * about content rather than a guess about layout.
 *
 * ## Why "left through the top", not "is visible"
 *
 * `IntersectionObserver` with `threshold: 0` fires on both entering and leaving.
 * Leaving happens two ways — scrolling down past it, or scrolling back up above
 * it — and only the first means "read it". `boundingClientRect.bottom <= 0` is
 * what separates them: the element's bottom edge is above the viewport's top
 * edge, so it is behind the visitor. Scrolling up above the element leaves
 * `bottom` positive.
 *
 * Once `true`, it stays `true` and the observer disconnects. Scrolling back up
 * does not re-arm it, because "has read the trainers" is a fact about the
 * session, not a property of the current scroll position.
 */
export function useAnchorPassed(
  anchorId: string,
  { enabled = true }: UseAnchorPassedOptions = {}
): boolean {
  const [hasPassed, setHasPassed] = useState(false);

  useEffect(() => {
    if (!enabled || hasPassed) {
      return;
    }

    const anchor = document.getElementById(anchorId);

    /**
     * Absent anchor is a normal outcome, not an error: this hook is consumed by
     * a component mounted in `layout.tsx`, so it runs on every route — including
     * future routes with no trainers section. Returning quietly means the
     * campaign simply never triggers there, which is the desired behaviour and
     * needs no route allowlist to express.
     */
    if (anchor === null) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry === undefined) {
          return;
        }

        if (!entry.isIntersecting && entry.boundingClientRect.bottom <= 0) {
          setHasPassed(true);
          observer.disconnect();
        }
      },
      { threshold: 0 }
    );

    observer.observe(anchor);

    return () => observer.disconnect();
  }, [anchorId, enabled, hasPassed]);

  return hasPassed;
}
