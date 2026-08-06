"use client";

import Image from "next/image";
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsBelowDesktop } from "@/lib/use-viewport";
import { useCameraLayer } from "@/lib/motion";

/**
 * The handoff has to be set up and torn down *before* the browser paints,
 * otherwise interrupting a scene change leaves the abandoned scene showing its
 * half-finished dissolve opacity for one frame. `useLayoutEffect` is the only
 * hook with that guarantee — guarded because it is meaningless during SSR.
 */
const useBeforePaintEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * CinematicHeroSequence — one continuous fitness film, not a set of images.
 *
 * ── The five-beat story (Phase 5) ────────────────────────────────────────
 * Establish the environment (wide floor) → professional coaching → heavy
 * compound work → intensity in close-up → recovery and premium facilities →
 * repeat. Each beat contributes something the others don't; no subject, and no
 * trainer, appears twice in a cycle.
 *
 * ── Why it doesn't feel like a slideshow ─────────────────────────────────
 * 1. CONTINUOUS CAMERA. Every scene owns a perpetual camera move — drift, pan,
 *    a 1–2% breathing zoom and a sub-0.5° roll — with its own direction and its
 *    own out-of-phase duration. These start once, on mount, and are never
 *    stopped, restarted or re-keyed. So a scene is already mid-move long before
 *    it is visible, and the scene leaving is still moving as it goes: the two
 *    moves overlap and the camera reads as one uninterrupted take (Phase 6).
 * 2. THE LIGHT IS THE EVENT. A scene change is not a fade you notice. A soft
 *    directional shadow sweeps the frame, a warm light follows it across, and
 *    the incoming scene simply becomes true underneath while the light is
 *    passing. The dissolve is weighted into the middle of that pass, so the
 *    thing a visitor registers is travelling light, not a swap (Phase 2).
 * 3. THE AIR NEVER RESETS. Haze, dust, grain, bloom and vignette live in
 *    HeroAtmosphere, mounted once above every scene — see that file.
 *
 * Every animated property here is `transform` or `opacity`, driven through the
 * Web Animations API against wrapper divs rather than CSS `animation` +
 * remount, so nothing composites off the GPU, nothing repaints, and no <Image>
 * is ever re-mounted or re-requested.
 *
 * Below the desktop breakpoint the Hero holds the story's opening frame, still —
 * background motion under one-handed scrolling reads as unstable, not premium.
 * `prefers-reduced-motion` gets the full story, still selectable, with no
 * camera, no sweep and no dissolve.
 */

/**
 * A perpetual camera move. Values are *total* travel: the animation runs from
 * minus-half to plus-half of each, so a scene is never sitting at an extreme
 * of its own move when it appears.
 */
interface HeroCameraMove {
  /** Horizontal drift, % of layer width. Negative pans left. */
  dx: number;
  /** Vertical drift, % of layer height. Positive pushes down. */
  dy: number;
  /** Scale travel on top of CAMERA_BASE_SCALE — the 1–2% breathing zoom. */
  dz: number;
  /** Roll, degrees. Stays far below the 0.5° ceiling; felt, not seen. */
  rotate: number;
  /** One-way length of the move. Mutually non-harmonic so scenes never sync. */
  durationMs: number;
}

interface HeroFrame {
  src: string;
  alt: string;
  /** Individually tuned per breakpoint — no frame reuses another's crop. */
  objectPosition: string;
  /** RGB triplet tinting this beat's readability overlay. Travels with the image, so the grade changes *with* the scene, never as a separate event. */
  tint: string;
  camera: HeroCameraMove;
}

/**
 * Headroom the camera pans/rolls inside. Without it, any translation would
 * expose the layer edge. Every move below stays inside half of this margin.
 */
const CAMERA_BASE_SCALE = 1.05;

export const HERO_FRAMES: HeroFrame[] = [
  {
    // 1 — Establish. The room does the talking: slow push-in, barely any drift.
    src: "/images/hero/hero-gym-wide.webp",
    alt: "The Infiniti Fitness training floor — racks, free weights and open floor space.",
    objectPosition: "object-[58%_50%] sm:object-[54%_48%] lg:object-center",
    tint: "10,11,13",
    camera: { dx: -0.5, dy: -0.2, dz: 0.018, rotate: 0.26, durationMs: 46000 },
  },
  {
    // 2 — Coaching. Pans left, off the trainer's eyeline, like a dolly following the correction.
    src: "/images/hero/hero-trainer-guidance.webp",
    alt: "A trainer coaching a member through a barbell squat with hands-on guidance.",
    objectPosition: "object-[40%_48%] sm:object-[37%_46%] lg:object-[34%_44%]",
    tint: "36,25,13",
    camera: { dx: -2.4, dy: 0.2, dz: 0.008, rotate: -0.28, durationMs: 41000 },
  },
  {
    // 3 — Heavy compound work. Pushes down with the bar.
    src: "/images/hero/hero-gym-workout.webp",
    alt: "An Infiniti Fitness member locked into a heavy deadlift, mid-lift.",
    objectPosition: "object-[78%_18%] sm:object-[70%_16%] lg:object-[64%_15%]",
    tint: "20,24,29",
    camera: { dx: 0.4, dy: 2.0, dz: 0.014, rotate: 0.2, durationMs: 44000 },
  },
  {
    // 4 — Intensity. Hands, chalk, grip. Tightest push-in of the cycle; no face,
    // because this beat is about effort, not portraiture.
    src: "/images/hero/hero-strength-closeup.webp",
    alt: "A tight close-up on chalked hands gripping a loaded barbell mid-pull.",
    objectPosition: "object-[32%_58%] sm:object-[30%_55%] lg:object-center",
    tint: "42,28,14",
    camera: { dx: 0.8, dy: -0.4, dz: 0.02, rotate: -0.24, durationMs: 38000 },
  },
  {
    // 5 — Recovery. Opens back out, panning right: the exhale that closes the
    // cycle before the room re-establishes it.
    src: "/images/hero/hero-recovery-zone.webp",
    alt: "The Infiniti Fitness recovery zone — steam and cool-down space after training.",
    objectPosition: "object-[50%_42%] sm:object-[50%_45%] lg:object-center",
    tint: "18,22,28",
    camera: { dx: 2.4, dy: 0.3, dz: 0.006, rotate: 0.22, durationMs: 43000 },
  },
];

/** Scene handoff length. Inside the 1.2–1.8s luxury-commercial range. */
export const HERO_TRANSITION_MS = 1500;

/**
 * Inactivity before the film moves itself on, measured from the moment a scene
 * is requested. Deliberately nothing like a 5–7s carousel tick: the Hero must
 * never change under someone who is still reading it, and any manual pick
 * restarts the clock.
 */
export const HERO_DWELL_MS = 18000;

/** Camera phase offset per scene, so no two are ever at the same point in their move. */
const CAMERA_PHASE_STEP_MS = 6500;

function overlayGradient(tint: string) {
  return `linear-gradient(to top, rgba(${tint},1) 0%, transparent 45%), linear-gradient(105deg, rgba(${tint},0.95) 15%, rgba(${tint},0.55) 45%, transparent 65%)`;
}

function cameraTransform(move: HeroCameraMove, direction: -1 | 1) {
  const half = direction / 2;
  return [
    `translate3d(${(move.dx * half).toFixed(3)}%, ${(move.dy * half).toFixed(3)}%, 0)`,
    `scale(${(CAMERA_BASE_SCALE + move.dz * half).toFixed(4)})`,
    `rotate(${(move.rotate * half).toFixed(3)}deg)`,
  ].join(" ");
}

/**
 * The sweep travels *with* the incoming camera: a scene that pans left is
 * lit from the right. One less thing that can read as a canned effect.
 */
function sweepDirection(move: HeroCameraMove): "ltr" | "rtl" {
  return move.dx < 0 ? "rtl" : "ltr";
}

/** Leading shadow — a soft roll of darkness, not a black bar. */
function shadowBand(direction: "ltr" | "rtl") {
  const angle = direction === "ltr" ? "90deg" : "270deg";
  return `linear-gradient(${angle}, rgba(6,7,9,0) 0%, rgba(6,7,9,0.14) 32%, rgba(6,7,9,0.26) 56%, rgba(6,7,9,0.09) 80%, rgba(6,7,9,0) 100%)`;
}

/** Warm rim light following it. Screened, so it behaves like light rather than paint. */
function lightBand(direction: "ltr" | "rtl") {
  const angle = direction === "ltr" ? "90deg" : "270deg";
  return `linear-gradient(${angle}, rgba(255,226,178,0) 0%, rgba(255,226,178,0.05) 28%, rgba(255,238,205,0.15) 52%, rgba(255,214,150,0.07) 74%, rgba(255,214,150,0) 100%)`;
}

/**
 * Keeps the sweep off the headline: full strength through the upper frame,
 * rolling away toward the bottom where the copy lives. Static relative to the
 * band, so it travels with it and never costs a repaint.
 */
const SWEEP_VERTICAL_FALLOFF =
  "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,1) 26%, rgba(0,0,0,0.72) 64%, rgba(0,0,0,0.2) 100%)";

interface Transition {
  id: number;
  /** Scene coming true underneath the light. */
  to: number;
  /** Scene still holding the frame until the handoff completes. */
  from: number;
  direction: "ltr" | "rtl";
}

interface CinematicHeroSequenceProps {
  /** Active scene index, driven by the Scene Navigator. */
  activeIndex: number;
  /** Fired when the film advances itself, so the Hero stays the single source of truth. */
  onFrameChange: (index: number) => void;
}

export function CinematicHeroSequence({ activeIndex, onFrameChange }: CinematicHeroSequenceProps) {
  const prefersReducedMotion = useReducedMotion();
  const isBelowDesktop = useIsBelowDesktop();

  const [committedIndex, setCommittedIndex] = useState(0);
  const [transition, setTransition] = useState<Transition | null>(null);
  const [seenIndex, setSeenIndex] = useState(activeIndex);

  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const cameraRefs = useRef<Array<HTMLDivElement | null>>([]);
  const shadowRef = useRef<HTMLDivElement | null>(null);
  const lightRef = useRef<HTMLDivElement | null>(null);

  const motionEnabled = !prefersReducedMotion && !isBelowDesktop;

  /**
   * Background parallax through the shared virtual camera (depth="background",
   * ~0.12 lag + a 1.045→1.0 dolly). The critical fix over the previous version:
   * `useCameraLayer`'s ref sits on a wrapper that is NEVER transformed, and the
   * y/scale style is applied to a child. The old code put its `useScroll` target
   * on the same motion.div it then transformed — `getBoundingClientRect` reads
   * transforms, so the progress calculation was feeding on its own output. The
   * system also owns the overscan bleed, so the drift can't reveal an edge.
   */
  const {
    ref: backgroundRef,
    style: backgroundStyle,
    overscanPad,
  } = useCameraLayer("background");

  /**
   * Open the handoff *during* render, not in an effect: the incoming layer has
   * to be painted at opacity 0 before its dissolve starts, or it would flash
   * full-strength for a frame. React's documented "adjust state when a prop
   * changes" pattern.
   */
  if (activeIndex !== seenIndex) {
    setSeenIndex(activeIndex);
    const onScreen = transition ? transition.to : committedIndex;
    if (activeIndex !== onScreen) {
      const frame = HERO_FRAMES[activeIndex];
      if (motionEnabled && frame) {
        setTransition({
          // Only consecutive ids need to differ; the element remounts either way.
          id: (transition?.id ?? 0) + 1,
          to: activeIndex,
          from: onScreen,
          direction: sweepDirection(frame.camera),
        });
      } else {
        setTransition(null);
        setCommittedIndex(activeIndex);
      }
    }
  }

  /**
   * The camera system. Started once, cancelled only on unmount — never on a
   * scene change, which is precisely why the motion never appears to reset.
   * Each scene is nudged to a different point in its own cycle so the five
   * moves stay permanently out of phase.
   */
  useEffect(() => {
    if (!motionEnabled) return;
    const animations: Animation[] = [];

    HERO_FRAMES.forEach((frame, i) => {
      const element = cameraRefs.current[i];
      if (!element) return;
      const animation = element.animate(
        [
          { transform: cameraTransform(frame.camera, -1) },
          { transform: cameraTransform(frame.camera, 1) },
        ],
        {
          duration: frame.camera.durationMs,
          iterations: Infinity,
          direction: "alternate",
          easing: "ease-in-out",
        }
      );
      animation.currentTime = (i * CAMERA_PHASE_STEP_MS) % frame.camera.durationMs;
      animations.push(animation);
    });

    return () => {
      for (const animation of animations) animation.cancel();
    };
  }, [motionEnabled]);

  /** The handoff: light crossing the frame, with the dissolve hidden inside it. */
  useBeforePaintEffect(() => {
    if (!transition) return;

    const commit = () => {
      setCommittedIndex(transition.to);
      setTransition(null);
    };

    const layer = layerRefs.current[transition.to];
    if (!motionEnabled || !layer) {
      commit();
      return;
    }

    const animations: Animation[] = [];

    /**
     * Weighted so almost nothing happens in the first fifth, the scene turns
     * over while the warm light is mid-frame, and it finishes settling before
     * the light leaves. A linear fade would announce itself; this doesn't.
     */
    const dissolve = layer.animate(
      [
        { offset: 0, opacity: 0, easing: "ease-in" },
        { offset: 0.2, opacity: 0.04, easing: "ease-in-out" },
        { offset: 0.62, opacity: 0.74, easing: "ease-out" },
        { offset: 0.9, opacity: 1 },
        { offset: 1, opacity: 1 },
      ],
      { duration: HERO_TRANSITION_MS, fill: "forwards" }
    );
    animations.push(dissolve);

    // Travel is expressed in the band's own width. The shadow leads; the light
    // trails it by about a quarter of a band, which is what makes the pass read
    // as a single moving source rather than two effects.
    const sweeps: Array<[HTMLDivElement | null, number]> = [
      [shadowRef.current, 0],
      [lightRef.current, -26],
    ];
    for (const [element, lag] of sweeps) {
      if (!element) continue;
      const skew = transition.direction === "ltr" ? -9 : 9;
      const start = transition.direction === "ltr" ? -105 + lag : 150 - lag;
      const end = transition.direction === "ltr" ? 150 + lag : -105 - lag;
      animations.push(
        element.animate(
          [
            { transform: `translate3d(${start}%, 0, 0) skewX(${skew}deg)` },
            { transform: `translate3d(${end}%, 0, 0) skewX(${skew}deg)` },
          ],
          {
            duration: HERO_TRANSITION_MS,
            easing: "cubic-bezier(0.38, 0.05, 0.3, 0.96)",
            fill: "forwards",
          }
        )
      );
      // Faded in and out at the frame edges so the band never pops into or out
      // of existence at a boundary.
      animations.push(
        element.animate(
          [
            { offset: 0, opacity: 0 },
            { offset: 0.14, opacity: 1 },
            { offset: 0.76, opacity: 1 },
            { offset: 1, opacity: 0 },
          ],
          { duration: HERO_TRANSITION_MS, easing: "ease-in-out", fill: "forwards" }
        )
      );
    }

    let superseded = false;
    dissolve.finished
      .then(() => {
        if (!superseded) commit();
      })
      .catch(() => {
        /* superseded by a newer pick — nothing to commit */
      });

    // Runs before the next paint: on a clean finish this swaps one fully-opaque
    // state for an identical one, and on an interruption the abandoned scene is
    // already back at full strength by the time anything is drawn.
    return () => {
      superseded = true;
      for (const animation of animations) animation.cancel();
    };
  }, [transition, motionEnabled]);

  /** Inactivity advance, keyed to the request so the navigator's trace stays in lockstep. */
  useEffect(() => {
    if (!motionEnabled) return;
    const timer = setTimeout(
      () => onFrameChange((activeIndex + 1) % HERO_FRAMES.length),
      HERO_DWELL_MS
    );
    return () => clearTimeout(timer);
  }, [activeIndex, motionEnabled, onFrameChange]);

  if (isBelowDesktop) {
    // Deliberately the story's opening frame, and deliberately the same image
    // desktop marks `priority`. Only one Hero photograph can be preloaded from a
    // single SSR document, so the frame mobile holds has to be that photograph
    // or mobile loses its LCP preload entirely.
    const frame = HERO_FRAMES[0]!;
    return (
      <div className="absolute inset-0 z-0">
        <Image
          src={frame.src}
          alt={frame.alt}
          fill
          priority
          sizes="100vw"
          className={cn("object-cover", frame.objectPosition)}
        />
        <div className="absolute inset-0" style={{ backgroundImage: overlayGradient(frame.tint) }} />
      </div>
    );
  }

  return (
    // Outer wrapper is the camera's *measured* element — never transformed, and
    // clips the overscan bleed the background plane extends past the frame.
    <div ref={backgroundRef} className="absolute inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute inset-x-0"
        style={{
          isolation: "isolate",
          ...(backgroundStyle ?? {}),
          // System-owned bleed: the plane extends above/below the frame so its
          // drift + dolly can never expose an edge. Collapses to a flush fill
          // when the camera is parked (reduced motion / pre-measurement).
          top: backgroundStyle ? -overscanPad : 0,
          bottom: backgroundStyle ? -overscanPad : 0,
        }}
      >
        <div className="absolute inset-0 will-change-transform">
        {HERO_FRAMES.map((frame, i) => {
          const isIncoming = transition ? i === transition.to : i === committedIndex;
          const isOutgoing = transition
            ? i === transition.from && transition.from !== transition.to
            : false;
          const isDissolving = isIncoming && transition !== null;

          return (
            <div
              key={frame.src}
              ref={(el) => {
                layerRefs.current[i] = el;
              }}
              aria-hidden={!isIncoming}
              className="absolute inset-0"
              style={{
                // Handoff opacity is owned by the dissolve animation; everything
                // else is a hard 1 or 0. No CSS transitions anywhere in the stack.
                opacity: isDissolving ? 0 : isIncoming || isOutgoing ? 1 : 0,
                zIndex: isDissolving ? 2 : isIncoming || isOutgoing ? 1 : 0,
                willChange: isDissolving ? "opacity" : undefined,
              }}
            >
              <div
                ref={(el) => {
                  cameraRefs.current[i] = el;
                }}
                className="absolute inset-0 will-change-transform"
                // Pre-animation resting pose. Reduced motion keeps the approved
                // 1:1 framing; the camera otherwise opens from its own start pose.
                style={{
                  transform: motionEnabled ? cameraTransform(frame.camera, -1) : undefined,
                }}
              >
                {/* All five scenes stay mounted, so the next one is decoded long
                    before it is needed and a handoff never waits on the network. */}
                <Image
                  src={frame.src}
                  alt={frame.alt}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className={cn("object-cover", frame.objectPosition)}
                />
              </div>
              <div
                className="absolute inset-0"
                style={{ backgroundImage: overlayGradient(frame.tint) }}
              />
            </div>
          );
        })}

        {/* Lighting handoff. Mounted only while a scene is changing hands, and
            mounted as direct children on purpose: an extra wrapper would risk
            becoming a blending boundary and flatten the screened light into paint.
            Both bands overflow the frame and are clipped by the Hero section. */}
        {transition ? (
          <Fragment key={transition.id}>
            <div
              ref={shadowRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-[72%] will-change-transform"
              style={{
                zIndex: 3,
                opacity: 0,
                backgroundImage: shadowBand(transition.direction),
                maskImage: SWEEP_VERTICAL_FALLOFF,
                WebkitMaskImage: SWEEP_VERTICAL_FALLOFF,
              }}
            />
            <div
              ref={lightRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-[72%] will-change-transform"
              style={{
                zIndex: 3,
                opacity: 0,
                mixBlendMode: "screen",
                backgroundImage: lightBand(transition.direction),
                maskImage: SWEEP_VERTICAL_FALLOFF,
                WebkitMaskImage: SWEEP_VERTICAL_FALLOFF,
              }}
            />
          </Fragment>
        ) : null}
        </div>
      </motion.div>
    </div>
  );
}
