"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  useScroll,
  useSpring,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "framer-motion";
import {
  CAMERA_SPRING,
  DEPTH_LAYERS,
  resolveAmplitude,
  type DepthLayer,
} from "./camera-tokens";
import { useMotionCamera } from "./MotionCameraProvider";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export interface UseCameraLayerOptions {
  /** Fine adjustment to this instance's amplitude. Prefer choosing a different depth first. */
  multiplier?: number;
}

export interface UseCameraLayerResult {
  /**
   * Attach to the **measured** element. This element is never transformed —
   * transforming the element you measure feeds `getBoundingClientRect` its own
   * output and corrupts the progress calculation. Apply `style` to a child.
   */
  ref: React.RefObject<HTMLDivElement | null>;
  /** Transform style for the child element. `undefined` when the camera is parked. */
  style: MotionStyle | undefined;
  /** Bleed margin in px this plane needs above and below to hide its own travel. */
  overscanPad: number;
  /** True when this layer is not moving (reduced motion, or pre-measurement). */
  isStatic: boolean;
  /** Peak-to-peak travel in px, for debugging. */
  amplitude: number;
  /** Spring-smoothed passage through the viewport: 0 entering bottom, 0.5 centered, 1 exited top. */
  progress: MotionValue<number>;
  /** The shared normalized scroll velocity, passed through for convenience. */
  velocity: MotionValue<number>;
}

/**
 * useCameraLayer — the only scroll hook a section should ever call.
 *
 * Name a depth plane; the system resolves the physics. The two things that make
 * this behave differently from the `useParallax`/`useScrollProgress` pair it
 * replaces:
 *
 * 1. **Viewport passage, not section lifetime.** The offset is
 *    `["start end", "end start"]`, so progress runs from the moment the element's
 *    top touches the viewport bottom to the moment its bottom clears the viewport
 *    top. The previous system used `["start start", "end start"]`, which pins
 *    progress at 0 for the element's entire arrival and then spends the whole
 *    amplitude while it exits off the top — motion scheduled where nobody can see
 *    it. That single offset is the reason the page felt dead.
 *
 * 2. **Centered output.** `y` is `(progress - 0.5) * amplitude`, so an element
 *    sitting mid-screen is at its true layout position and the travel is spent
 *    symmetrically around it, in view.
 *
 * Scroll up is not a separate animation: `y` is a pure function of scroll
 * position, so reversing the scroll retraces the identical curve. There is
 * nothing to replay, reverse, or re-trigger.
 *
 * ── One camera per rigid group, not per element ───────────────────────────
 * This hook is the primitive for exactly ONE measured element on ONE plane.
 * A section with an eyebrow, headline, and description that should all move
 * together as one depth plane must NOT call this three times — that was the
 * previous mistake (three separate `useScroll` subscriptions, three separate
 * `ResizeObserver`s, for what was conceptually one rigid group, drifting
 * apart from each other by fractions of a pixel because each measured a
 * different element height). Reach for `<CameraGroup>` for that case; it
 * calls this hook exactly once and wraps every child in the group. Only call
 * this hook directly for an element that is a plane by itself.
 */
export function useCameraLayer(
  depth: DepthLayer,
  options: UseCameraLayerOptions = {}
): UseCameraLayerResult {
  const { multiplier = 1 } = options;
  const token = DEPTH_LAYERS[depth];

  const { viewportHeight, intensity, isStatic: cameraIsStatic, velocity } = useMotionCamera();

  const ref = useRef<HTMLDivElement>(null);
  const [elementHeight, setElementHeight] = useState(0);

  // Measured before paint so amplitude is correct on the first frame — a
  // post-paint measurement would visibly re-seat every layer on mount.
  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const read = () => {
      const next = element.getBoundingClientRect().height;
      setElementHeight((previous) => (Math.abs(previous - next) < 1 ? previous : next));
    };

    read();

    const observer = new ResizeObserver(read);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const progress = useSpring(scrollYProgress, CAMERA_SPRING);

  const amplitude = resolveAmplitude({
    lag: token.lag,
    viewportHeight,
    elementHeight,
    intensity,
    multiplier,
  });

  const isStatic = cameraIsStatic || amplitude === 0;

  const y = useTransform(progress, [0, 1], [-amplitude / 2, amplitude / 2]);
  const scale = useTransform(
    progress,
    [0, 1],
    token.scale ? [token.scale[0], token.scale[1]] : [1, 1]
  );

  const overscanPad = useMemo(() => {
    if (!token.overscan || isStatic) return 0;
    const scaleMax = token.scale ? Math.max(token.scale[0], token.scale[1]) : 1;
    // Scale is applied about the centre, so it needs half the growth on each
    // edge; 2px absorbs subpixel rounding at fractional device pixel ratios.
    const scalePad = ((scaleMax - 1) / 2) * (elementHeight || viewportHeight);
    return Math.ceil(amplitude / 2 + scalePad + 2);
  }, [token.overscan, token.scale, isStatic, amplitude, elementHeight, viewportHeight]);

  const style = useMemo<MotionStyle | undefined>(() => {
    if (isStatic) return undefined;
    return {
      y,
      ...(token.scale ? { scale } : {}),
      // Only the overscan planes (full-bleed media, a handful per page) get a
      // permanent compositing hint. Blanket `will-change` on every text layer
      // costs memory for no gain.
      ...(token.overscan ? { willChange: "transform" as const } : {}),
    };
  }, [isStatic, y, scale, token.scale, token.overscan]);

  return { ref, style, overscanPad, isStatic, amplitude, progress, velocity };
}
