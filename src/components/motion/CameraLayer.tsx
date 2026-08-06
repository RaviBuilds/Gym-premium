"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCameraLayer, type DepthLayer } from "@/lib/motion";

/**
 * CameraLayer — the ergonomic wrapper around `useCameraLayer`.
 *
 * Renders the two-element structure the camera requires:
 *
 *   outer  measured, never transformed  (see useCameraLayer's ref contract)
 *   inner  carries y/scale, and the overscan bleed for media planes
 *
 * Sections should reach for this rather than the hook. The hook is for cases
 * that need the raw `progress`/`velocity` MotionValues to drive something other
 * than a wrapper transform.
 *
 * Two modes:
 *
 *   `fill`      absolutely positioned, edge to edge, with system-owned bleed
 *               margin above and below so travel can never expose an edge. This
 *               is what lets background planes use real amplitudes. The inner
 *               element resolves to a concrete height, so `next/image` with
 *               `fill` works without the explicit per-breakpoint heights the old
 *               ParallaxLayer needed.
 *
 *   in-flow     the default. Outer participates in layout as a plain block,
 *               inner carries the transform only. No bleed, since negative
 *               insets on an in-flow element would shift layout.
 *
 * Under reduced motion the hook returns no style and no bleed, so this collapses
 * to two plain nested divs with identical geometry — static, layout unchanged.
 */
export interface CameraLayerProps {
  /** Depth plane. Defines the physics; see camera-tokens.ts. */
  depth: DepthLayer;
  children: ReactNode;
  /** Applied to the measured outer element. */
  className?: string;
  /** Applied to the transformed inner element. */
  innerClassName?: string;
  /**
   * Absolutely position this layer edge to edge and apply the plane's overscan
   * bleed. Required for `background`/`sectionMedia`/`deepBackground` planes —
   * their bleed is what keeps travel from revealing an edge. The nearest
   * positioned ancestor should clip (`relative overflow-hidden`).
   */
  fill?: boolean;
  /** Fine amplitude adjustment. Prefer a different `depth` first. */
  multiplier?: number;
  /**
   * Marks the layer as purely atmospheric: hidden from assistive tech and
   * non-interactive. The common case for `fill` media/glow planes, which carry
   * no content — saves every call site hand-rolling the same two attributes.
   */
  decorative?: boolean;
}

export function CameraLayer({
  depth,
  children,
  className,
  innerClassName,
  fill = false,
  multiplier,
  decorative = false,
}: CameraLayerProps) {
  const { ref, style, overscanPad } = useCameraLayer(depth, { multiplier });

  return (
    <div
      ref={ref}
      aria-hidden={decorative || undefined}
      className={cn(
        fill && "absolute inset-0",
        decorative && "pointer-events-none",
        className
      )}
    >
      <motion.div
        className={cn(fill && "absolute inset-x-0", innerClassName)}
        style={{
          ...style,
          ...(fill ? { top: -overscanPad, bottom: -overscanPad } : null),
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * CameraGroup — one rigid depth plane holding multiple children.
 *
 * This is the primitive the architecture calls for: "a CameraGroup represents
 * one rigid depth plane. Children inside a CameraGroup should not own
 * independent scroll transforms unless they intentionally belong to a
 * different physical depth." One `useCameraLayer` call, one measured ref, one
 * `y`/`scale` — every child rides it as a single tray. A Hero eyebrow +
 * headline, a Programs card row, a whole Statistics composition: each is one
 * `CameraGroup`, not one `CameraLayer` per child.
 *
 * Reach for the plain `CameraLayer` only when an element is deliberately a
 * plane by itself (e.g. a background photograph behind a `CameraGroup` of
 * copy sitting in front of it — two different physical depths, correctly two
 * subscriptions). Reach for `CameraGroup` for everything that should move as
 * one object. This is the whole fix for "29 independently moving layers":
 * grouping is now a first-class primitive instead of something achieved by
 * remembering not to over-wrap.
 *
 * Layout note: children keep their normal flow *inside* the group (the group
 * doesn't flex/grid them itself), so a group can wrap a `<div className="flex
 * flex-col gap-4">` or a `<CardGrid>` unchanged — it's a transform boundary,
 * not a layout primitive.
 */
export function CameraGroup({
  depth,
  children,
  className,
  innerClassName,
  fill = false,
  multiplier,
  decorative = false,
}: CameraLayerProps) {
  return (
    <CameraLayer
      depth={depth}
      className={className}
      innerClassName={innerClassName}
      fill={fill}
      multiplier={multiplier}
      decorative={decorative}
    >
      {children}
    </CameraLayer>
  );
}
