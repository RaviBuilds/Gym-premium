"use client";

import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { Clock, ArrowUpRight, Sparkles } from "lucide-react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { buildDirectionsLabel } from "@/lib/maps";
import { BranchMap } from "./BranchMap";
import { Badge } from "./Badge";
import { Heading, BodyText } from "./Heading";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";
import type { LocationSummary } from "@/types/content";

/**
 * LocationCard — Premium glassmorphism card with 3D tilt, light sweep,
 * ambient image breathe, and cinematic hover interactions.
 *
 * v2 — Fixes from visual QA pass:
 *   - Glass surface is NOW VISIBLE: stronger border (white/12), lit top edge,
 *     inner gradient surface, resting glow outline
 *   - Content zone: brighter text, border separator, inner gradient
 *   - Breathing: larger scale (1→1.06) + faster cycle (12s) for perceptibility
 *   - Hover overlay: moved to top-right pill (no longer conflicts with name)
 *   - Branch identity: per-branch watermark SVG icon (top-right)
 *   - Resting shadow always visible (not just on hover)
 */

/** Breathing animation — visible scale + brightness shift. */
const BREATHE_ANIMATION = {
  animate: { scale: [1, 1.06, 1] },
  transition: {
    duration: 12,
    ease: "easeInOut" as const,
    times: [0, 0.5, 1],
    repeat: Infinity,
  },
};

/** Premium card reveal choreography. */
export const LOCATION_CARD_REVEAL = {
  hidden: { opacity: 0, y: 48, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      when: "beforeChildren" as const,
      staggerChildren: 0.07,
    },
  },
} as const;

const CONTENT_ITEM = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
} as const;

/** Custom brand map pin — infinity-inspired mark inside. */
function BrandMapPin({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("size-[18px] shrink-0", className)}
      aria-hidden="true"
    >
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/** Branch identity watermark — Gachibowli (strength/dumbbell). */
function GachibowliMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={cn("size-10", className)}
      aria-hidden="true"
    >
      {/* Dumbbell silhouette */}
      <rect x="8" y="18" width="6" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="34" y="18" width="6" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="14" y="22" width="20" height="4" rx="2" stroke="currentColor" strokeWidth="1.2" />
      {/* Weight plates */}
      <rect x="5" y="16" width="3" height="16" rx="1" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
      <rect x="40" y="16" width="3" height="16" rx="1" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
    </svg>
  );
}

/** Branch identity watermark — Rethibowli (feminine strength). */
function RethibowliMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={cn("size-10", className)}
      aria-hidden="true"
    >
      {/* Feminine strength — elegant lotus/flame shape */}
      <path
        d="M24 8c-4 6-8 12-8 18a8 8 0 0016 0c0-6-4-12-8-18z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M24 14c-2 4-4 8-4 12a4 4 0 008 0c0-4-2-8-4-12z"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.5"
      />
      {/* Inner spark */}
      <circle cx="24" cy="26" r="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

/** Animated pulsing availability dot. */
function AvailabilityDot() {
  return (
    <span className="relative mr-1.5 inline-flex">
      <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-success/60 motion-reduce:animate-none" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
    </span>
  );
}

export function LocationCard({ location }: { location: LocationSummary }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // 3D tilt spring values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 200, damping: 20, mass: 0.5 });
  const springY = useSpring(mouseY, { stiffness: 200, damping: 20, mass: 0.5 });

  // Transform mouse position to rotation (max ±2.5°)
  const rotateX = useTransform(springY, [-0.5, 0.5], [2.5, -2.5]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-2.5, 2.5]);

  // Light sweep position (linked to mouse X)
  const sweepX = useTransform(springX, [-0.5, 0.5], [-120, 120]);

  // Hover glow
  const isHovered = useMotionValue(0);
  const springHover = useSpring(isHovered, { stiffness: 300, damping: 25 });
  const glowOpacity = useTransform(springHover, [0, 1], [0, 1]);

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const bounds = cardRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const x = (e.clientX - bounds.left) / bounds.width - 0.5;
    const y = (e.clientY - bounds.top) / bounds.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handlePointerEnter = () => {
    isHovered.set(1);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    isHovered.set(0);
  };

  const tiltEnabled = !prefersReducedMotion;

  const BranchIcon =
    location.branchKey === "gachibowli" ? GachibowliMark : RethibowliMark;

  return (
    /**
     * The outer frame — border, rounded corners, shadow — is now owned by THIS
     * element rather than by the `<a>` below it, and that one change is the whole
     * fix for the map reading as bolted-on.
     *
     * The frame used to be the anchor's only child, so a card was "photo + info",
     * full stop, and the map rendered afterward in a second, unrelated grid with
     * its own separate border. Now the frame wraps **both** the anchor (photo,
     * address, hours, "Get Directions") and `BranchMap` (the map viewport) as
     * siblings, so a branch is one continuous card — photo, then facts, then the
     * map, sharing one boundary — and the map is the last section of the card
     * rather than a second card that happens to be about the same place.
     *
     * The two must be siblings, not nested, because `BranchMap` renders a real
     * `<button>` to arm the map (see its own doc comment on the scroll-hijack
     * guard), and the HTML content model forbids interactive elements inside an
     * `<a>`. Group-hover styling that used to key off the anchor's own `group`
     * class (the branch watermark, the light sweep, the "Explore" pill) now keys
     * off this frame instead, so hovering the photo zone still triggers all of
     * it — the anchor no longer needs to be the thing carrying `group`.
     */
    <motion.div
      ref={cardRef}
      className="group relative h-full"
      style={
        tiltEnabled
          ? {
              perspective: 800,
              rotateX,
              rotateY,
              transformStyle: "preserve-3d" as const,
            }
          : undefined
      }
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {/* Glass card body — VISIBLE glass: strong border, lit edge, inner surface gradient */}
      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-card",
          // Visible glass border at rest
          "border border-white/[0.12]",
          // Hover border brightens to gold
          "transition-[border-color,box-shadow] duration-500 ease-out",
          "group-hover:border-brand-yellow/30"
        )}
        style={{
            // Resting: visible presence on the page (always-on subtle glow)
            // Hover: expanded warm glow
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 50%, rgba(20,24,29,0.2) 100%)",
            boxShadow: [
              // Lit top edge
              "inset 0 1px 0 rgba(255,255,255,0.1)",
              // Inner subtle depth
              "inset 0 -1px 0 rgba(0,0,0,0.2)",
              // Resting outer glow — card is always perceivable
              "0 0 0 1px rgba(255,255,255,0.05)",
              "0 8px 32px rgba(0,0,0,0.5)",
              "0 2px 8px rgba(0,0,0,0.3)",
            ].join(", "),
          }}
        >
          {/* Hover glow expansion — warm gold border + soft outer glow */}
          {tiltEnabled && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-50 rounded-card"
              style={{
                opacity: glowOpacity,
                boxShadow: [
                  "inset 0 0 0 1px rgba(255,222,1,0.25)",
                  "0 0 30px rgba(255,222,1,0.08)",
                  "0 12px 48px rgba(0,0,0,0.4)",
                ].join(", "),
              }}
            />
          )}

          {/* Light sweep — traveling highlight band following pointer */}
          {tiltEnabled && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-40 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  "linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.03) 40%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 60%, transparent 75%)",
                x: sweepX,
              }}
            />
          )}

          {/*
            The anchor now wraps ONLY the photo-and-facts zone below, not the
            whole card. It used to be the outermost element with the frame
            inside it; here it is a plain block-level child of the frame, sized
            to `flex-1` by the two zones inside it, with `BranchMap` following as
            its sibling. A plain `<a>`, not `next/link`: `location.href` is an
            external Google Maps URL (see src/content/locations.ts), and `Link`
            would neither prefetch it usefully nor add the `target`/`rel` pair an
            external destination needs.
          */}
          <a
            href={location.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-yellow"
            aria-label={buildDirectionsLabel(location.name)}
          >
          {/* ─── IMAGE ZONE ─── */}
          <div className="relative aspect-[16/10] overflow-hidden">
            {/* Ambient breathing image (visible scale shift) */}
            {!prefersReducedMotion ? (
              <motion.div
                className="absolute inset-0 will-change-transform"
                animate={BREATHE_ANIMATION.animate}
                transition={BREATHE_ANIMATION.transition}
              >
                <Image
                  src={location.imageSrc}
                  alt={location.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 45vw, 90vw"
                  className={cn(
                    "object-cover transition-[transform,filter] duration-700 ease-out",
                    "group-hover:scale-[1.05] group-hover:brightness-110"
                  )}
                />
              </motion.div>
            ) : (
              <Image
                src={location.imageSrc}
                alt={location.imageAlt}
                fill
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover"
              />
            )}

            {/* Warm color shift on hover */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-amber-800/0 transition-colors duration-700 ease-out group-hover:bg-amber-800/[0.08]"
            />

            {/* Depth vignette */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background: [
                  "linear-gradient(to top, rgba(20,24,29,0.8) 0%, rgba(20,24,29,0.2) 40%, transparent 70%)",
                  "radial-gradient(ellipse at center, transparent 40%, rgba(20,24,29,0.35) 100%)",
                ].join(", "),
              }}
            />

            {/* Branch identity watermark (top-right) */}
            <div className="absolute right-3 top-3 z-10">
              <BranchIcon className="text-white/30 transition-[color,opacity] duration-500 group-hover:text-white/50" />
            </div>

            {/* Location name overlay (bottom-left of image) */}
            <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
              <div className="flex items-end justify-between gap-3">
                <Heading level="subsection" as="h3" className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                  {location.name}
                </Heading>
                {location.ladiesOnlySlot && (
                  <Badge variant="informational" icon={<Sparkles className="size-3" />}>
                    {`Ladies Only · ${location.ladiesOnlySlot}`}
                  </Badge>
                )}
              </div>
            </div>

            {/* Hover overlay — compact pill, top-right area (below branch mark) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-14 z-20"
            >
              <div
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5",
                  "bg-white/10 backdrop-blur-md border border-white/20 rounded-sm",
                  "font-body text-caption font-semibold text-white",
                  "opacity-0 scale-90 transition-all duration-400 ease-out",
                  "group-hover:opacity-100 group-hover:scale-100"
                )}
              >
                Explore
                <ArrowUpRight className="size-3.5" />
              </div>
            </div>
          </div>

          {/* ─── CONTENT ZONE ─── */}
          {/* Separator line between image and content */}
          <div
            aria-hidden="true"
            className="h-px w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.08) 30%, rgba(255,222,1,0.12) 50%, rgba(255,255,255,0.08) 70%, transparent 95%)",
            }}
          />

          {/* Inner content with subtle surface gradient */}
          <motion.div
            className="relative flex flex-1 flex-col gap-3 p-5 lg:p-6"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 60%)",
            }}
          >
            <motion.div variants={CONTENT_ITEM} className="flex items-start gap-2.5">
              <BrandMapPin className="mt-0.5 text-brand-yellow" />
              <BodyText size="standard" className="text-white/80">
                {location.address}
              </BodyText>
            </motion.div>

            <motion.div variants={CONTENT_ITEM} className="flex items-center gap-2.5">
              <Icon icon={Clock} size="sm" className="text-white/50" />
              <div className="flex items-center">
                <AvailabilityDot />
                <BodyText size="caption" className="font-medium text-white/65">
                  {location.hoursSummary}
                </BodyText>
              </div>
            </motion.div>

            <motion.div
              variants={CONTENT_ITEM}
              className="mt-auto flex items-center gap-2 border-t border-white/[0.06] pt-4 font-body text-caption font-semibold uppercase tracking-wide text-brand-yellow"
            >
              <span className="relative">
                {/* "Get Directions", not "View Details" — the card now opens Google
                    Maps rather than a branch detail page that was never built. The
                    label has to describe where the link actually goes. */}
                Get Directions
                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-brand-yellow transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </span>
              <ArrowUpRight className="size-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.div>
          </motion.div>
          </a>

          {/* ─── MAP ZONE ───
              A sibling of the anchor above, inside the same frame, so the map is
              the card's third section rather than a second card. See BranchMap's
              doc comment for why it cannot be nested inside the anchor. The
              hairline echoes the one already separating the image zone from the
              content zone, so the card reads as three consistently-divided
              sections rather than "the real card" plus an add-on. */}
          <div
            aria-hidden="true"
            className="h-px w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.08) 30%, rgba(255,222,1,0.12) 50%, rgba(255,255,255,0.08) 70%, transparent 95%)",
            }}
          />
          <BranchMap name={location.name} address={location.address} />
        </div>
      </motion.div>
  );
}
