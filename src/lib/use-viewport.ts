"use client";

import { useEffect, useState } from "react";
import { breakpoints } from "@/lib/design-tokens";

/**
 * True below the `desktop` breakpoint, tracked live.
 *
 * The Hero and its atmosphere both need this: the full camera/atmosphere
 * system is a desktop/tablet experience, because continuous background motion
 * under one-handed mobile scrolling reads as unstable, not premium. Shared here
 * so the 1024px line is stated once, from the same token the CSS uses, instead
 * of being re-typed in every component that cares.
 *
 * Returns `false` on the server and on first client paint, then corrects itself
 * in an effect — matching how the Hero already behaved before this hook
 * existed, so hydration output is unchanged.
 */
export function useIsBelowDesktop(): boolean {
  const [isBelowDesktop, setIsBelowDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoints.desktop - 1}px)`);
    setIsBelowDesktop(mediaQuery.matches);
    const handleChange = (event: MediaQueryListEvent) => setIsBelowDesktop(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isBelowDesktop;
}
