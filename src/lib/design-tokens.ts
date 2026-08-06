/**
 * Design token reference — NOT a runtime stylesheet.
 *
 * The tokens that actually ship to the browser live in `src/app/globals.css`
 * (Tailwind v4 `@theme`). This file exists so TypeScript code (e.g. a
 * `CountUp` duration, a Framer Motion `transition`, a chart, an inline style
 * that can't be a Tailwind class) can reference the *same* values as source
 * of truth rather than a second, driftable copy of a number.
 *
 * Every constant below is traceable to a section of
 * /docs/Visual-Design-Specification.md. If a value doesn't exist there yet,
 * add it there first, then mirror it here — never the other way around.
 */

/** §2 Layout System — base 8px spacing scale. */
export const spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  "2xl": 64,
  "3xl": 96,
  "4xl": 128,
} as const;

/** §2 Layout System — responsive breakpoints (px). */
export const breakpoints = {
  mobile: 0,
  tablet: 640,
  desktop: 1024,
  wide: 1440,
} as const;

/** §2 Layout System — max content width for contained sections. */
export const maxContentWidth = 1280;

/** §4 Color System. Mirrors the CSS custom properties in globals.css. */
export const colors = {
  brandYellow: "#FFDE01",
  ink: "#14181D",
  surfaceLight: "#FAF9F6",
  surfaceCard: "#FFFFFF",
  borderSubtle: "#E5E3DC",
  borderDark: "#2A2F36",
  textPrimary: "#14181D",
  textSecondary: "#5B6069",
  textPrimaryDark: "#FFFFFF",
  textSecondaryDark: "#A8ACB3",
  success: "#1E8E5A",
  warning: "#B7791F",
  error: "#C13B3B",
  whatsapp: "#25D366",
} as const;

/**
 * §10 Motion Design — canonical durations/easings so every animated
 * component (AnimationWrapper, CountUp, ParallaxLayer, button press states)
 * pulls from one shared timing vocabulary instead of inventing its own.
 *
 * NOTE: The motion system has been extended with a comprehensive preset
 * architecture in src/lib/motion-presets.ts. These legacy values are
 * maintained for backward compatibility with existing components.
 * New implementations should use the motion presets system.
 */
export const motion = {
  duration: {
    fast: 0.18, // button color/press transitions — §9
    standard: 0.5, // scroll fade-up entrances — §10
    counter: 1.2, // Trust Strip count-up — §10
    pulse: 1.2, // Final CTA one-time pulse — §10
  },
  stagger: {
    perCard: 0.08, // 80ms per card, capped — §10
    maxCards: 6, // beyond this, remaining cards animate at the capped delay
  },
  distance: {
    fadeUp: 24, // px vertical travel for the default fade-up entrance — §10
    parallaxMax: 40, // px max drift for Hero parallax — §10
    magneticMax: 8, // px max cursor-following travel for MagneticButton — subtle, not gimmicky, same philosophy as parallaxMax
  },
  scrollTriggerThreshold: 0.2, // ~20% into viewport, per §10
  easeOut: [0.16, 1, 0.3, 1] as const, // standard ease-out curve used across §10/§11
} as const;

/** §6 Card Design — shared card geometry. */
export const card = {
  radius: 6, // px — content containers only; buttons/badges stay 0 (brand signature)
  paddingDesktop: 24,
  paddingMobile: 20,
} as const;

/**
 * Stagger delay for the Nth card in a scroll-reveal grid — §10 Motion
 * Design: "80ms per card, capped at a maximum total stagger of 480ms...
 * beyond 6 cards, remaining cards animate simultaneously at the capped
 * delay." A plain, pure function (no hooks, no browser APIs), so it lives
 * here rather than in components/motion/AnimationWrapper.tsx — that file
 * is marked "use client", and a "use client" directive makes *every*
 * export from that module client-only, which breaks Server Components
 * that need to call this during server rendering (e.g. a section mapping
 * a content array into staggered children). Keeping pure helpers in a
 * directive-free module like this one is what lets both Server and Client
 * Components call them safely.
 */
export function getStaggerDelay(index: number): number {
  const cappedIndex = Math.min(index, motion.stagger.maxCards);
  return cappedIndex * motion.stagger.perCard;
}
