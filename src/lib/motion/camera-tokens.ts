/**
 * Camera tokens — the single source of truth for the homepage's motion physics.
 *
 * This file replaces `parallaxPresets` as the depth vocabulary. The critical
 * difference is what the numbers *mean*.
 *
 * `parallaxPresets` expressed motion as a **pixel drift over a section's own
 * height** (`maxDrift: 80`). Because section heights vary from ~900px (Hero) to
 * ~2400px (Programs), the same preset produced a 2.7x difference in perceived
 * speed between sections — which is why the page read as a set of unrelated
 * animation islands rather than one continuous space.
 *
 * Here, motion is expressed as `lag`: the **fraction of scroll distance a plane
 * holds back by**. A plane with `lag: 0.12` always moves at 88% of scroll speed,
 * everywhere on the page, regardless of how tall its section happens to be. That
 * is what makes this a shared physical world instead of a set of presets.
 *
 * Amplitude is derived, never authored:
 *
 *     travel    = viewportHeight + min(elementHeight, viewportHeight)
 *     amplitude = lag * travel * intensity
 *     y         = (progress - 0.5) * amplitude
 *
 * `travel` is the element's own passage through the viewport, so the amplitude is
 * spent *while the element is visible*, and `progress - 0.5` centers it so
 * nothing is displaced at rest when it sits mid-screen. Clamping the element term
 * at one viewport height keeps very tall sections from producing absurd
 * amplitudes.
 *
 * Nothing here is a magic number in a component. Sections name a depth; the
 * system computes the physics.
 */

// -----------------------------------------------------------------------------
// Timing
// -----------------------------------------------------------------------------

/**
 * Spring applied to every plane's scroll progress. The single shared
 * "smooth scrolling" lever for the whole page — every `CameraLayer` runs its
 * own `useScroll` (position depends on that element's own place in the
 * document, so that part can't be shared), but every one of them feeds its
 * raw progress through this exact spring before it ever reaches a `y`. Retune
 * this once and the whole page gets heavier or lighter together.
 *
 * Deliberately overdamped (damping ratio ~1.8): it settles, it never
 * overshoots. Bouncing is explicitly off-brief. Softer than the previous
 * tuning (lower stiffness, same intent) — the previous value tracked scroll
 * closely enough that the spring was doing almost no perceptible smoothing;
 * this one holds a visible beat of lag on a fast flick, which is what "the
 * camera has mass" actually feels like, without ever wobbling on settle.
 */
export const CAMERA_SPRING = {
  stiffness: 170,
  damping: 36,
  mass: 0.6,
  restDelta: 0.0005,
} as const;

/** Spring applied to the shared scroll velocity signal. Softer — velocity is a mood, not a position. */
export const VELOCITY_SPRING = {
  stiffness: 90,
  damping: 26,
  mass: 0.5,
} as const;

/**
 * Scroll speed (px/s) that maps to a normalized velocity of 1.0. Roughly a
 * brisk trackpad flick; anything faster clamps.
 */
export const VELOCITY_REFERENCE = 2400;

// -----------------------------------------------------------------------------
// Intensity
// -----------------------------------------------------------------------------

export type MotionIntensityTier = "mobile" | "tablet" | "desktop" | "wide";

/**
 * Global amplitude multiplier per breakpoint.
 *
 * Motion scales down, it is never switched off — a phone gets 45% of the
 * desktop travel, not zero. `prefers-reduced-motion` is the only thing that
 * reaches 0, and it does so through this same multiplier, which is why reduced
 * motion cannot break layout: every transform simply resolves to 0.
 */
export const MOTION_INTENSITY: Record<MotionIntensityTier, number> = {
  mobile: 0.45,
  tablet: 0.7,
  desktop: 1,
  wide: 1,
} as const;

// -----------------------------------------------------------------------------
// Depth planes
// -----------------------------------------------------------------------------

export type DepthLayer =
  | "deepBackground"
  | "background"
  | "sectionMedia"
  | "content"
  | "foreground"
  | "interactive"
  | "cta";

export interface DepthToken {
  /**
   * Fraction of scroll distance this plane holds back by. Higher = farther from
   * the viewer = moves less. This is the only value that defines a plane's depth.
   */
  lag: number;
  /**
   * Whether this plane needs bleed margin above and below its container so its
   * own travel can never expose an edge.
   *
   * This is the constraint that was silently capping the previous system: every
   * background sat on `absolute inset-0` with no headroom, so any drift beyond
   * ~40px would have revealed bare `bg-ink`. Planes that declare `overscan` get
   * sized by the system, which is what makes real amplitudes safe.
   *
   * Only honored on layers rendered with `fill` — a negative inset on an
   * in-flow element would shift layout.
   */
  overscan: boolean;
  /**
   * Optional slow dolly across the element's passage: `[scaleAtEntry, scaleAtExit]`.
   * Media planes only. Monotonic and tiny — a camera easing off a subject, not a
   * zoom effect. Requires `overscan` so the scale can never reveal an edge.
   */
  scale?: readonly [number, number];
}

export const DEPTH_LAYERS: Record<DepthLayer, DepthToken> = {
  /** Textures, grain fields, radial glows. The far wall of the room. */
  deepBackground: {
    lag: 0.17,
    overscan: true,
  },

  /** Full-bleed photography and banners. The dominant depth cue on the page. */
  background: {
    lag: 0.12,
    overscan: true,
    scale: [1.045, 1.0],
  },

  /** Imagery that belongs to a section rather than sitting behind it. */
  sectionMedia: {
    lag: 0.085,
    overscan: true,
    scale: [1.03, 1.0],
  },

  /** Eyebrows, headlines. Close enough to read as attached to the page. */
  content: {
    lag: 0.045,
    overscan: false,
  },

  /** Body copy, supporting text. Just in front of the headline. */
  foreground: {
    lag: 0.022,
    overscan: false,
  },

  /**
   * Cards and other physical objects, as ONE rigid group — not per-card. An
   * earlier version gave each card its own `indexLag`-derived depth (nine
   * separate `useCameraLayer` subscriptions, differing by fractions of a
   * pixel). That produced no perceptible depth and cost nine scroll listeners
   * to do it. Cards must feel like objects resting on one tray, not floating
   * individually — the tray moves, the cards don't move relative to each
   * other. Any per-card differentiation belongs to hover, a different owner
   * on a different property entirely.
   */
  interactive: {
    lag: 0.012,
    overscan: false,
  },

  /** Buttons. Closest plane to the viewer, so it moves most nearly with scroll. */
  cta: {
    lag: 0.005,
    overscan: false,
  },
} as const;

/**
 * Resolve a plane's peak-to-peak travel in pixels.
 *
 * Exported so the layer hook and any future debug overlay agree on the maths
 * rather than each deriving it.
 */
export function resolveAmplitude({
  lag,
  viewportHeight,
  elementHeight,
  intensity,
  multiplier = 1,
}: {
  lag: number;
  viewportHeight: number;
  elementHeight: number;
  intensity: number;
  multiplier?: number;
}): number {
  if (viewportHeight <= 0 || intensity <= 0) return 0;
  // Cap the element term at one viewport: a 3000px section should not earn 3x
  // the amplitude of a 900px one, it should earn the same physics.
  const travel = viewportHeight + Math.min(elementHeight, viewportHeight);
  return lag * travel * intensity * multiplier;
}


