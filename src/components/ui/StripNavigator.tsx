"use client";

import { useCallback, useEffect, useState } from "react";
import type { RefObject } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { HEX_CLIP, HEX_CLIP_INSET } from "@/lib/shapes";
import { cn } from "@/lib/utils";

/**
 * StripNavigator — the mobile control bar for a horizontal scroll-snap strip
 * (`CardGrid` with `swipeNav`). It replaces the native scrollbar we hid in
 * `globals.css` with a control built entirely from this site's own vocabulary:
 * the flat-top hexagon "dumbbell head" from `SceneNavigator`, the machined
 * steel rim, 0px hard edges for anything that acts (radius law, §3), and Brand
 * Yellow used only as a spotlight on the active rail segment.
 *
 * Three parts, left → right:
 *   1. Index readout `01 / 09` — echoes the numeral burned into each
 *      ProgramCard's corner, so the nav reads as part of the card system.
 *   2. Segmented rail — one hard-edged 3px segment per card; the active one is
 *      Brand Yellow and wider. Doubles as the position indicator the scrollbar
 *      used to be, and each segment is a real jump-to-card button.
 *   3. Two hex steppers — 44px flat-top hexagons; disabled (35% opacity) at
 *      the corresponding end since a scroll-snap strip must not wrap (looping
 *      means cloning nodes and breaking native scroll semantics).
 *
 * Mobile-only (`sm:hidden`) — above `sm` the grid shows every card, so there
 * is nothing to navigate. Reduced motion is handled upstream in `useSnapStrip`
 * (button scrolls fall back to `behavior: "auto"`, the entrance nudge is
 * skipped); nothing here animates layout.
 */

export interface StripNavigatorProps {
  /** Total number of cards in the strip. */
  count: number;
  /** Index of the card currently snapped closest to the strip's start edge. */
  activeIndex: number;
  /** Strip is scrolled fully left (prev stepper disabled). */
  atStart: boolean;
  /** Strip is scrolled fully right (next stepper disabled). */
  atEnd: boolean;
  /** Scroll the strip so the card at `index` snaps to the start. */
  onSelect: (index: number) => void;
  /** Accessible label for the whole control group. */
  label?: string;
}

export function StripNavigator({
  count,
  activeIndex,
  atStart,
  atEnd,
  onSelect,
  label,
}: StripNavigatorProps) {
  // A single card needs no navigation.
  if (count <= 1) return null;

  const current = String(activeIndex + 1).padStart(2, "0");
  const total = String(count).padStart(2, "0");

  return (
    <div
      className="mt-6 flex items-center gap-4 sm:hidden"
      role="group"
      aria-label={label ?? "Card navigation"}
    >
      {/* Index readout — Archivo Black numerals, matching the card corner. */}
      <p className="font-display text-base leading-none tabular-nums" aria-hidden="true">
        <span className="text-white">{current}</span>
        <span className="text-white/40"> / {total}</span>
      </p>

      {/* Segmented rail — hard-edged (0px) machined track; active = spotlight. */}
      <div className="flex flex-1 items-center justify-center gap-1.5">
        {Array.from({ length: count }).map((_, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Go to card ${i + 1}`}
              aria-current={isActive}
              // h-11 (44px) is an invisible touch target around the 3px bar.
              className="group flex h-11 items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
            >
              <span
                className={cn(
                  "h-[3px] transition-all duration-400 ease-out",
                  isActive ? "w-6 bg-brand-yellow" : "w-3 bg-white/20 group-hover:bg-white/40"
                )}
              />
            </button>
          );
        })}
      </div>

      {/* Position change announced once per settle, politely. */}
      <span className="sr-only" aria-live="polite">{`Card ${activeIndex + 1} of ${count}`}</span>

      {/* Hex steppers — no wrap-around; each disables at its own end. */}
      <div className="flex items-center gap-2">
        <HexStepper direction="prev" disabled={atStart} onClick={() => onSelect(activeIndex - 1)} />
        <HexStepper direction="next" disabled={atEnd} onClick={() => onSelect(activeIndex + 1)} />
      </div>
    </div>
  );
}

function HexStepper({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const ChevronIcon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous card" : "Next card"}
      className={cn(
        // Exit-easing asymmetry + transform-only press, matching SceneNavigator.
        "relative h-11 w-11 shrink-0 transition-[transform,opacity] duration-400 ease-out",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow",
        disabled
          ? "pointer-events-none opacity-35"
          : "cursor-pointer hover:duration-300 active:scale-[0.97]"
      )}
      style={{ clipPath: HEX_CLIP }}
    >
      {/* Machined steel rim. */}
      <span
        className="absolute inset-0 bg-white/25"
        style={{ clipPath: HEX_CLIP }}
        aria-hidden="true"
      />
      {/* Ink face, inset from the rim, chevron centred. */}
      <span
        className="absolute inset-[2px] flex items-center justify-center bg-ink"
        style={{ clipPath: HEX_CLIP_INSET }}
      >
        <ChevronIcon
          className="size-4 text-white transition-colors group-hover:text-brand-yellow"
          aria-hidden="true"
        />
      </span>
    </button>
  );
}

/**
 * useSnapStrip — derives navigation state for a horizontal scroll-snap strip
 * from the DOM, never from a hardcoded card width (the strip's per-item width
 * changes across breakpoints, so the "stride" must be measured from the actual
 * laid-out children).
 *
 * Returns the active index (card nearest the start edge), start/end flags for
 * disabling the steppers, and a `scrollToIndex` that snaps a card into view —
 * smoothly, or instantly under `prefers-reduced-motion` (smooth scrolling is
 * itself animation).
 *
 * The scroll listener is passive and rAF-throttled. A `ResizeObserver` keeps
 * the measurement correct through breakpoint/orientation changes. A one-time
 * entrance nudge (drift right, settle back) demonstrates swipeability the first
 * time the strip enters view in a session; it is skipped entirely under reduced
 * motion and never repeats.
 *
 * Pass `count = 0` to fully disable the hook (used by non-swipe CardGrids so
 * the same component can carry the feature opt-in without side effects).
 */
const NUDGE_SESSION_KEY = "infiniti:strip-nudged";

export function useSnapStrip(ref: RefObject<HTMLDivElement | null>, count: number) {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const measureStride = useCallback((el: HTMLElement) => {
    const first = el.children[0] as HTMLElement | undefined;
    const second = el.children[1] as HTMLElement | undefined;
    if (!first) return 0;
    return second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || count <= 0) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const stride = measureStride(el);
      const index = stride > 0 ? Math.round(el.scrollLeft / stride) : 0;
      setActiveIndex(Math.max(0, Math.min(count - 1, index)));
      setAtStart(el.scrollLeft <= 1);
      setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 1);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(el);
    update();

    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      resizeObserver.disconnect();
    };
  }, [ref, count, measureStride]);

  // One-time entrance nudge — teach the swipe, once per session, motion only.
  useEffect(() => {
    const el = ref.current;
    if (!el || count <= 0 || prefersReducedMotion) return;

    let alreadyNudged = false;
    try {
      alreadyNudged = sessionStorage.getItem(NUDGE_SESSION_KEY) === "1";
    } catch {
      // sessionStorage can throw in private/blocked contexts — treat as nudged.
      alreadyNudged = true;
    }
    if (alreadyNudged) return;

    let timer = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          try {
            sessionStorage.setItem(NUDGE_SESSION_KEY, "1");
          } catch {
            /* ignore */
          }
          el.scrollTo({ left: 14, behavior: "smooth" });
          timer = window.setTimeout(() => el.scrollTo({ left: 0, behavior: "smooth" }), 450);
        });
      },
      { threshold: 0.6 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, [ref, count, prefersReducedMotion]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = ref.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(count - 1, index));
      const child = el.children[clamped] as HTMLElement | undefined;
      el.scrollTo({
        left: child ? child.offsetLeft : 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    },
    [ref, count, prefersReducedMotion]
  );

  return { activeIndex, atStart, atEnd, scrollToIndex };
}
