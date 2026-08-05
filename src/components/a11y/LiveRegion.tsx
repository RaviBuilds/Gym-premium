"use client";

import { useEffect, useState } from "react";

/**
 * LiveRegion — §13 Accessibility.
 *
 * Announces dynamic content changes to screen readers — needed for the
 * auto-advancing Testimonial Carousel (§Component-Architecture.md
 * "Carousel", §13: "needs live-region consideration if content
 * auto-advances, so screen reader users aren't unexpectedly interrupted").
 *
 * Usage: render one LiveRegion per page (or per auto-advancing widget) and
 * call the returned `announce` setter whenever the visible slide changes.
 * `polite` (default) waits for the screen reader to finish its current
 * sentence rather than interrupting — appropriate for a testimonial slide
 * change, which is not urgent.
 */
export function LiveRegion({ message, politeness = "polite" }: { message: string; politeness?: "polite" | "assertive" }) {
  const [announced, setAnnounced] = useState("");

  useEffect(() => {
    // Re-set on a microtask so identical consecutive messages still announce
    // (screen readers can ignore an unchanged live-region value).
    setAnnounced("");
    const id = requestAnimationFrame(() => setAnnounced(message));
    return () => cancelAnimationFrame(id);
  }, [message]);

  return (
    <div role="status" aria-live={politeness} aria-atomic="true" className="sr-only">
      {announced}
    </div>
  );
}
