"use client";

import { useState } from "react";

import { buildMapsEmbedUrl } from "@/lib/maps";
import { cn } from "@/lib/utils";

/**
 * BranchMap — the embedded Google Map viewport for one branch.
 *
 * ## This is a fragment, not a card
 *
 * It used to render its own outer frame — border, rounded corners, shadow — and a
 * caption bar repeating the branch name and a "Directions" link, so that two maps
 * could sit in a standalone grid of their own beneath the location cards. That grid
 * is gone: a map floating in its own box below the card it belongs to reads as a
 * bolted-on extra rather than part of the branch, which is exactly the complaint
 * that prompted this change.
 *
 * `BranchMap` now renders **only the map viewport** and is meant to be the last
 * child inside `LocationCard`'s own frame, so the border, the rounded corners, the
 * background and the shadow are all `LocationCard`'s — one continuous card: photo,
 * then address and hours, then the map, sharing one boundary. The branch name and
 * a directions link are not repeated here because `LocationCard` already states
 * both, immediately above where this renders; and Google's own keyless embed
 * already draws its own "Open in Google Maps" link inside the iframe, which made
 * this component's old caption redundant twice over.
 *
 * ## Why this must be a sibling of the card's link, never nested inside it
 *
 * `LocationCard`'s photo-and-address zone is one big `<a>` — Requirement:
 * interactive content is nested inside an anchor, and this component's own
 * activation `<button>` is interactive content. The HTML content model
 * disallows interactive descendants inside `<a>` (a link may not contain a
 * button, and — separately — a browser will not let an iframe inside a link
 * receive pointer events reliably either). `LocationCard` therefore renders this
 * component as a **sibling** of its anchor, both inside the same outer frame, so
 * the two never nest.
 *
 * ## The scroll-hijack guard is the important part of this file
 *
 * A live Google Maps iframe captures the wheel event to zoom. On a page this long
 * that is not a minor annoyance — a visitor scrolling from Locations to the FAQ
 * puts their cursor over the map, the page stops moving, and the map silently
 * zooms out to street level instead. It reads as the site being broken, and it is
 * the single most likely way an embedded map ruins a scroll-through demo.
 *
 * So the map ships **inert**: `pointer-events-none` on the iframe, with a
 * transparent activation layer above it. One click arms the map and the layer
 * retires for good. Until then the wheel belongs to the page.
 *
 * This is also why the activation layer is a real `<button>` rather than a `div`
 * with an `onClick`. A keyboard user needs the same ability to arm the map, and a
 * screen reader needs to be told the control exists — "Activate map" is a genuine
 * action with a genuine consequence, not decoration.
 *
 * ## Deferred loading
 *
 * `loading="lazy"` keeps the iframe's network work — Google's map bundle, tiles and
 * cookies — out of the initial page load entirely. It fires only as the section
 * approaches the viewport, which for a section this far down the page means most
 * visitors who bounce early never pay for it at all. That matters more than usual
 * here because there are two of these, one per branch card.
 *
 * ## Why the map is allowed to stay bright
 *
 * The card around it is near-black, and the obvious move is to invert the iframe
 * into a dark theme with a CSS filter. It is not done here, deliberately:
 * `invert()` flips the pin, the route lines and the Google wordmark along with the
 * landmass, which reads as a rendering fault rather than a dark theme, and it makes
 * the one element on the page whose entire job is legibility harder to read.
 *
 * Instead the map is calmed rather than inverted: a `grayscale(0.25)
 * brightness(0.95)` pass takes the glare off Google's default beige without
 * touching hue relationships. A real dark map needs a styled `mapId` through the
 * Maps JavaScript API, which is a different integration and a paid one.
 */

/**
 * The map's own box. `aspect-[16/10]` rather than a fixed height so the map
 * reserves its space before the iframe has loaded anything and contributes no
 * layout shift, and so it matches the photo zone's own aspect ratio above it —
 * the two zones read as the same kind of object stacked in one card, not a photo
 * with an unrelated rectangle bolted beneath it.
 */
const VIEWPORT_CLASSES = "relative aspect-[16/10] w-full";

/**
 * Takes the glare off Google's default palette without inverting it. See this
 * file's doc comment for why a full dark-mode invert is the wrong tool.
 */
const MAP_FILTER = "grayscale(0.25) brightness(0.95) contrast(1.02)";

export interface BranchMapProps {
  /** Branch name, used in the iframe's accessible title. */
  name: string;
  /**
   * The branch's full postal address — the same `siteConfig` string
   * `LocationCard` prints above this component.
   *
   * Taken as the address rather than a pre-built URL so this component owns none
   * of the URL construction: the embed is derived from one input by
   * `src/lib/maps.ts`, the same function every map on the site calls, so this map
   * can never show a different place than the address printed above it.
   */
  address: string;
  /** Extra classes for the viewport box. Layout only — there is no outer frame to style. */
  className?: string;
}

export function BranchMap({ name, address, className }: BranchMapProps) {
  /**
   * Whether the visitor has armed the map. One-way: once `true` it never returns
   * to `false`, because a map that re-locks itself after a moment's inattention is
   * more annoying than one that hijacks scroll.
   */
  const [isActive, setIsActive] = useState(false);

  return (
    <div className={cn(VIEWPORT_CLASSES, "group/map", className)}>
      <iframe
        // A real, meaningful title — this is the iframe's accessible name and the
        // only thing a screen reader has to identify the frame by.
        title={`Map of Infiniti Fitness ${name}`}
        src={buildMapsEmbedUrl(address)}
        loading="lazy"
        // Google's embed needs a referrer to resolve the place; this sends it over
        // HTTPS only and withholds it on a downgrade, which is the tightest policy
        // the embed still works under.
        referrerPolicy="no-referrer-when-downgrade"
        className={cn("absolute inset-0 h-full w-full border-0", !isActive && "pointer-events-none")}
        style={{ filter: MAP_FILTER }}
      />

      {/* THE ACTIVATION LAYER — a real button, so pointer and keyboard users get
          the same control. It covers the map exactly and retires permanently on
          first activation.

          The hint is centred and only fades up on hover so the map is not
          permanently wearing a label. */}
      {!isActive && (
        <button
          type="button"
          onClick={() => setIsActive(true)}
          aria-label={`Activate the ${name} map to zoom and pan`}
          className="absolute inset-0 grid place-items-center bg-ink/10 transition-colors duration-300 hover:bg-ink/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
        >
          <span className="pointer-events-none rounded-sm border border-white/15 bg-ink/85 px-3 py-2 font-body text-caption font-semibold uppercase tracking-[0.12em] text-white opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-opacity duration-300 group-hover/map:opacity-100">
            Click to interact
          </span>
        </button>
      )}
    </div>
  );
}
