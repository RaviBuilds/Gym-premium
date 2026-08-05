"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useIsBelowDesktop } from "@/lib/use-viewport";

/**
 * HeroAtmosphere — one continuous air layer that lives ABOVE every Hero scene.
 *
 * This is the single most important reason the Hero reads as one film rather
 * than a set of images: haze, dust, grain, bloom and vignette are mounted once,
 * are never keyed to the active scene, and are never restarted. Scenes change
 * underneath them. The air does not.
 *
 * Deliberately restrained — nothing here should be identifiable on its own:
 *   · vignette + grain  one static element, two stacked backgrounds
 *   · haze              two very large, very soft warm/cool blooms on slow,
 *                       out-of-phase drifts
 *   · dust              two tiled fields, seamlessly looped by translating an
 *                       exact whole tile, so there is no visible loop point
 *   · bloom             a single warm key light that breathes on opacity only
 *
 * Everything animates on `transform`/`opacity` via the Web Animations API, so
 * the whole layer composites on the GPU and never triggers layout or paint.
 * The grain is a pre-baked SVG noise tile — rasterised once by the browser as
 * an image, not evaluated as a live filter graph per frame.
 *
 * Static (mounted, unanimated) below the desktop breakpoint and under
 * `prefers-reduced-motion`: the texture still enriches the Hero, but nothing
 * moves.
 */

/** One tile of fractal noise, ~4KB, decoded once. Grain must never be animated — that would repaint. */
const GRAIN_TILE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23g)'/%3E%3C/svg%3E\")";

/** Dust tiles are square so a single diagonal translate of exactly one tile loops seamlessly. */
const DUST_TILE_PX = 420;

const NEAR_DUST = [
  "radial-gradient(1.6px 1.6px at 18% 24%, rgba(255,252,244,0.16), transparent 62%)",
  "radial-gradient(1.3px 1.3px at 63% 11%, rgba(255,252,244,0.12), transparent 62%)",
  "radial-gradient(1.8px 1.8px at 82% 47%, rgba(255,248,232,0.13), transparent 62%)",
  "radial-gradient(1.2px 1.2px at 36% 68%, rgba(255,252,244,0.11), transparent 62%)",
  "radial-gradient(1.5px 1.5px at 8% 88%, rgba(255,248,232,0.10), transparent 62%)",
  "radial-gradient(1.3px 1.3px at 72% 79%, rgba(255,252,244,0.12), transparent 62%)",
].join(", ");

const FAR_DUST = [
  "radial-gradient(1px 1px at 29% 14%, rgba(255,255,255,0.09), transparent 60%)",
  "radial-gradient(1px 1px at 54% 41%, rgba(255,255,255,0.07), transparent 60%)",
  "radial-gradient(1px 1px at 88% 27%, rgba(255,255,255,0.08), transparent 60%)",
  "radial-gradient(1px 1px at 12% 58%, rgba(255,255,255,0.06), transparent 60%)",
  "radial-gradient(1px 1px at 68% 91%, rgba(255,255,255,0.07), transparent 60%)",
].join(", ");

export function HeroAtmosphere() {
  const prefersReducedMotion = useReducedMotion();
  const isBelowDesktop = useIsBelowDesktop();
  const motionEnabled = !prefersReducedMotion && !isBelowDesktop;

  const hazeWarmRef = useRef<HTMLDivElement | null>(null);
  const hazeCoolRef = useRef<HTMLDivElement | null>(null);
  const dustNearRef = useRef<HTMLDivElement | null>(null);
  const dustFarRef = useRef<HTMLDivElement | null>(null);
  const bloomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!motionEnabled) return;
    const animations: Animation[] = [];

    // Haze: two soft masses easing past each other on prime-ish durations, so
    // they never fall into a recognisable rhythm.
    const haze: Array<[HTMLDivElement | null, string, string, number]> = [
      [
        hazeWarmRef.current,
        "translate3d(-2.5%, 1.5%, 0) scale(1.06)",
        "translate3d(2.5%, -1.5%, 0) scale(1.12)",
        71000,
      ],
      [
        hazeCoolRef.current,
        "translate3d(3%, -1%, 0) scale(1.1)",
        "translate3d(-3%, 2%, 0) scale(1.04)",
        97000,
      ],
    ];
    for (const [element, from, to, duration] of haze) {
      if (!element) continue;
      animations.push(
        element.animate([{ transform: from }, { transform: to }], {
          duration,
          iterations: Infinity,
          direction: "alternate",
          easing: "ease-in-out",
        })
      );
    }

    // Dust: linear, infinite, and translated by exactly one tile on both axes —
    // the only loop that is mathematically invisible.
    const dust: Array<[HTMLDivElement | null, number, number]> = [
      [dustNearRef.current, -DUST_TILE_PX, 118000],
      [dustFarRef.current, DUST_TILE_PX, 187000],
    ];
    for (const [element, travel, duration] of dust) {
      if (!element) continue;
      animations.push(
        element.animate(
          [
            { transform: "translate3d(0, 0, 0)" },
            { transform: `translate3d(${travel}px, ${-Math.abs(travel)}px, 0)` },
          ],
          { duration, iterations: Infinity, easing: "linear" }
        )
      );
    }

    // Bloom: the key light breathing. Opacity only — never a flash.
    if (bloomRef.current) {
      animations.push(
        bloomRef.current.animate([{ opacity: 0.72 }, { opacity: 1 }], {
          duration: 14500,
          iterations: Infinity,
          direction: "alternate",
          easing: "ease-in-out",
        })
      );
    }

    return () => {
      for (const animation of animations) animation.cancel();
    };
  }, [motionEnabled]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {/* Warm haze mass — sits over the light side of every scene. */}
      <div
        ref={hazeWarmRef}
        className="absolute inset-0 will-change-transform"
        style={{
          backgroundImage:
            "radial-gradient(60% 55% at 74% 22%, rgba(255,226,178,0.075) 0%, rgba(255,226,178,0.03) 45%, rgba(255,226,178,0) 72%)",
        }}
      />
      {/* Cool counter-mass — gives the air depth instead of a single tint. */}
      <div
        ref={hazeCoolRef}
        className="absolute inset-0 will-change-transform"
        style={{
          backgroundImage:
            "radial-gradient(55% 50% at 18% 72%, rgba(150,178,205,0.055) 0%, rgba(150,178,205,0.02) 48%, rgba(150,178,205,0) 74%)",
        }}
      />
      {/* Far dust — smaller, dimmer, slower. Read as depth, not as particles. */}
      <div
        ref={dustFarRef}
        className="absolute will-change-transform"
        style={{
          inset: `-${DUST_TILE_PX}px`,
          backgroundImage: FAR_DUST,
          backgroundSize: `${DUST_TILE_PX}px ${DUST_TILE_PX}px`,
          backgroundRepeat: "repeat",
          opacity: 0.7,
        }}
      />
      {/* Near dust. */}
      <div
        ref={dustNearRef}
        className="absolute will-change-transform"
        style={{
          inset: `-${DUST_TILE_PX}px`,
          backgroundImage: NEAR_DUST,
          backgroundSize: `${DUST_TILE_PX}px ${DUST_TILE_PX}px`,
          backgroundRepeat: "repeat",
          opacity: 0.85,
        }}
      />
      {/* Key-light bloom, top right — the constant light source every scene shares. */}
      <div
        ref={bloomRef}
        className="absolute inset-0"
        style={{
          opacity: 0.86,
          backgroundImage:
            "radial-gradient(38% 42% at 78% 6%, rgba(255,232,190,0.10) 0%, rgba(255,232,190,0.035) 40%, rgba(255,232,190,0) 70%)",
        }}
      />
      {/* Atmospheric depth — a vignette deep enough to seat the scene, shallow
          enough that it never reads as a border. Also quietly protects headline
          contrast on the brighter plates. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(120% 110% at 50% 45%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.16) 74%, rgba(0,0,0,0.34) 100%)",
        }}
      />
      {/* Film grain, static by design: grain that moves has to repaint every frame. */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.045,
          backgroundImage: GRAIN_TILE,
          backgroundSize: "180px 180px",
          backgroundRepeat: "repeat",
        }}
      />
    </div>
  );
}
