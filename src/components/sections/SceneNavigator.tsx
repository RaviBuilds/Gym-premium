"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { HEX_CLIP, HEX_CLIP_INSET } from "@/lib/shapes";
import { cn } from "@/lib/utils";

/**
 * SceneNavigator — desktop-only Hero scene picker.
 *
 * Deliberately not a slider/carousel/dots. Each upcoming Hero beat is
 * represented as a hex dumbbell head: a solid forged block with a thin
 * machined rim, the upcoming photograph clipped inside. One shape language,
 * no labels, no numbers — the photography and the shape do the talking.
 *
 * Layout, sizing and styling here are approved and locked. The one behavioural
 * addition is `progressMs`: a hairline gold stroke tracing slowly around the
 * *inside* of the active thumbnail for the length of that scene's dwell — a
 * progress trace, not a spinner or a countdown. It resets by remounting
 * whenever the active scene changes, and isn't drawn at all under reduced
 * motion, where the Hero doesn't advance itself.
 */

/**
 * `HEX_CLIP`'s hexagon pulled 12% toward the centre, so the trace floats on the
 * photograph a few pixels clear of the gold rim instead of thickening it.
 */
const TRACE_PATH = "M31 12 L69 12 L88 50 L69 88 L31 88 L12 50 Z";

/**
 * SceneProgressTrace — one slow gold pass around the active thumbnail.
 *
 * `pathLength={1}` normalises the hexagon so the dash maths is just 1 → 0,
 * independent of the thumbnail's rendered size (56px vs 64px at `wide`).
 * Mounted only while a scene is active, so a scene change *is* the reset.
 */
function SceneProgressTrace({ durationMs }: { durationMs: number }) {
  const pathRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const animation = path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
      duration: durationMs,
      easing: "linear",
      fill: "forwards",
    });
    return () => animation.cancel();
  }, [durationMs]);

  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <path
        ref={pathRef}
        d={TRACE_PATH}
        pathLength={1}
        fill="none"
        stroke="#FFDE01"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 1"
        strokeDashoffset={1}
        opacity={0.8}
        // 1px shadow only — keeps the hairline legible over a bright plate
        // without paying for a real SVG filter graph.
        style={{ filter: "drop-shadow(0 0 1px rgba(0,0,0,0.55))" }}
      />
    </svg>
  );
}

interface SceneNavigatorFrame {
  src: string;
  alt: string;
}

interface SceneNavigatorProps {
  frames: SceneNavigatorFrame[];
  activeIndex: number;
  onSelect: (index: number) => void;
  /** Dwell length of the active scene. Omit (or 0) to draw no progress trace. */
  progressMs?: number;
}

export function SceneNavigator({
  frames,
  activeIndex,
  onSelect,
  progressMs = 0,
}: SceneNavigatorProps) {
  const prefersReducedMotion = useReducedMotion();
  const showProgress = progressMs > 0 && !prefersReducedMotion;

  return (
    <div
      /* `z-30`, and it must stay below 50. At `z-[60]` this bar painted OVER the
         sticky `Navbar` (`z-50`): the navigator is `absolute` inside a tall hero,
         so as the hero scrolls up its bottom-right corner passes straight through
         the pinned header, and a higher z-index put the hex thumbnails and the
         scroll cue on top of the navigation. 30 keeps it clear of the navbar while
         staying well above `HeroAtmosphere`'s `z-[5]`. */
      className="absolute bottom-6 right-6 z-30 hidden items-center gap-3 lg:right-8 lg:flex wide:right-10 wide:gap-4"
      role="group"
      aria-label="Hero scene selector"
    >
      {frames.map((frame, i) => {
        const isActive = i === activeIndex;
        return (
          <button
            key={frame.src}
            type="button"
            aria-label={frame.alt}
            aria-current={isActive}
            onClick={() => onSelect(i)}
            className={cn(
              // Exit-easing asymmetry: hover-in at 300ms, settle-back at
              // 400ms. active:scale-[0.97] is the transform-only press
              // affordance (no bounce/wobble).
              "relative h-14 w-14 shrink-0 cursor-pointer transition-[transform,filter,opacity] duration-400 ease-out hover:duration-300 active:scale-[0.97] wide:h-16 wide:w-16",
              "hover:-translate-y-1 hover:scale-105 hover:brightness-110 hover:contrast-110",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow",
              isActive ? "z-10 scale-110" : "opacity-80"
            )}
            style={{
              clipPath: HEX_CLIP,
              filter: isActive
                ? "drop-shadow(0 6px 10px rgba(0,0,0,0.45))"
                : "drop-shadow(0 3px 6px rgba(0,0,0,0.35))",
            }}
          >
            {/* Rim — the machined edge. Gold on the active scene, steel otherwise. */}
            <span
              className={cn(
                "absolute inset-0 transition-colors duration-300",
                isActive ? "bg-brand-yellow" : "bg-white/25"
              )}
              style={{ clipPath: HEX_CLIP }}
              aria-hidden="true"
            />
            {/* Inner face — the upcoming scene's photography, inset from the rim. */}
            <span
              className="absolute inset-[2.5px] overflow-hidden wide:inset-[3px]"
              style={{ clipPath: HEX_CLIP_INSET }}
            >
              <Image
                src={frame.src}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </span>
            {isActive && showProgress ? <SceneProgressTrace durationMs={progressMs} /> : null}
          </button>
        );
      })}
    </div>
  );
}
