"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  motionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion";
import { breakpoints } from "@/lib/design-tokens";
import {
  MOTION_INTENSITY,
  VELOCITY_REFERENCE,
  VELOCITY_SPRING,
  type MotionIntensityTier,
} from "./camera-tokens";

/**
 * MotionCameraProvider — the one virtual camera the whole page shares.
 *
 * Before this existed, every section called its own `useScroll()` and normalized
 * progress against its own height. That is the architectural reason the page
 * read as separate animation islands: there were seven independent clocks, each
 * with a different pixel length, all fed the same preset numbers.
 *
 * This provider owns the things that must be global and singular:
 *
 *   · one document-level scroll position
 *   · one spring-smoothed velocity signal, shared by every layer
 *   · one viewport height, measured once for all layers
 *   · one intensity multiplier (breakpoint x reduced-motion)
 *
 * It owns no per-element logic. Layers derive their own viewport passage via
 * `useCameraLayer`, which is what keeps the physics identical everywhere while
 * the geometry stays local.
 *
 * Nothing here re-renders on scroll. Scroll position and velocity are
 * MotionValues, so they update outside React. The only state that triggers a
 * render is viewport size and breakpoint tier.
 */

export interface MotionCameraState {
  /** Live viewport height in px. 0 until first client measurement. */
  viewportHeight: number;
  /** Live viewport width in px. 0 until first client measurement. */
  viewportWidth: number;
  /** Current breakpoint tier driving `intensity`. */
  tier: MotionIntensityTier;
  /**
   * Global amplitude multiplier. 0 means the camera is parked: every layer
   * resolves to a zero transform and the page is static with layout untouched.
   */
  intensity: number;
  /** True when no layer should move (reduced motion, or not yet measured). */
  isStatic: boolean;
  /** Raw document scroll position in px. */
  scrollY: MotionValue<number>;
  /**
   * Scroll velocity, spring-smoothed and normalized to roughly -1..1
   * (negative = scrolling up). Decays to 0 on its own when scrolling stops,
   * which is how layers can express "the camera has mass" without any keyframes
   * to reverse or replay.
   */
  velocity: MotionValue<number>;
}

/**
 * Fallback so a stray `useCameraLayer` outside the provider degrades to static
 * instead of throwing. `motionValue()` is a plain factory, safe at module scope.
 */
const FALLBACK_STATE: MotionCameraState = {
  viewportHeight: 0,
  viewportWidth: 0,
  tier: "desktop",
  intensity: 0,
  isStatic: true,
  scrollY: motionValue(0),
  velocity: motionValue(0),
};

const MotionCameraContext = createContext<MotionCameraState | null>(null);

function resolveTier(width: number): MotionIntensityTier {
  if (width >= breakpoints.wide) return "wide";
  if (width >= breakpoints.desktop) return "desktop";
  if (width >= breakpoints.tablet) return "tablet";
  return "mobile";
}

/**
 * Mobile browsers resize the viewport as the URL bar collapses. Feeding those
 * small height changes into amplitude would make every layer jump mid-scroll, so
 * height updates are ignored below this threshold unless the width also changed.
 */
const HEIGHT_CHANGE_THRESHOLD = 120;

export function MotionCameraProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  const [{ width, height }, setViewport] = useState({ width: 0, height: 0 });

  const { scrollY } = useScroll();

  // Velocity: raw px/s from framer, softened, then normalized and clamped so
  // consumers get a stable -1..1 signal regardless of input device.
  const rawVelocity = useVelocity(scrollY);
  const smoothedVelocity = useSpring(rawVelocity, VELOCITY_SPRING);
  const velocity = useTransform(smoothedVelocity, (v) => {
    const normalized = v / VELOCITY_REFERENCE;
    return Math.max(-1, Math.min(1, normalized));
  });

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      setViewport((previous) => {
        const nextWidth = window.innerWidth;
        const nextHeight = window.innerHeight;
        const widthChanged = nextWidth !== previous.width;
        const heightChanged =
          Math.abs(nextHeight - previous.height) >= HEIGHT_CHANGE_THRESHOLD;

        if (!widthChanged && !heightChanged) return previous;
        // On a width change, take the height too — it's a genuine layout change
        // (rotation, window resize), not a URL-bar collapse.
        return {
          width: nextWidth,
          height: widthChanged || heightChanged ? nextHeight : previous.height,
        };
      });
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("orientationchange", schedule);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
  }, []);

  const value = useMemo<MotionCameraState>(() => {
    const tier = resolveTier(width);
    const measured = height > 0;
    const intensity = prefersReducedMotion || !measured ? 0 : MOTION_INTENSITY[tier];

    return {
      viewportHeight: height,
      viewportWidth: width,
      tier,
      intensity,
      isStatic: intensity === 0,
      scrollY,
      velocity,
    };
  }, [width, height, prefersReducedMotion, scrollY, velocity]);

  return (
    <MotionCameraContext.Provider value={value}>{children}</MotionCameraContext.Provider>
  );
}

/**
 * Read the shared camera. Returns a static fallback (and warns in development)
 * when no provider is mounted, so a missing provider degrades to a still page
 * rather than a crash.
 */
export function useMotionCamera(): MotionCameraState {
  const context = useContext(MotionCameraContext);

  if (!context) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[motion] useMotionCamera called outside MotionCameraProvider — motion is disabled for this subtree. Mount <MotionCameraProvider> in the root layout."
      );
    }
    return FALLBACK_STATE;
  }

  return context;
}
