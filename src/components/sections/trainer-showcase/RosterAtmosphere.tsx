"use client";

import { CameraLayer } from "@/components/motion/CameraLayer";
import { HEX_CLIP } from "@/lib/shapes";
import { cn } from "@/lib/utils";

/**
 * RosterAtmosphere — the section's far wall: one `deepBackground` camera plane
 * carrying the texture plane, the hex wash and the depth vignette (design.md
 * §5.4, §5.7, §6.1, §6.3; Requirements 2.3, 2.8, 3.5, 5.8, 7.4, 7.6).
 *
 * ## Why this file is the section's only `"use client"` atmosphere
 *
 * The directive at the top is required and is the whole reason this component
 * exists as a separate file: it composes `CameraLayer`, which calls
 * `useCameraLayer` → `useScroll`, and a hook cannot run in the Server tree
 * (design.md §6.2). Splitting it out is what keeps `TrainerShowcase` itself a
 * Server Component — the section's atmosphere hydrates, its content does not.
 *
 * ## Exactly one subscription, and it is the section's only `deepBackground`
 *
 * Requirement 3.5 allows the section three camera subscriptions in total:
 * `deepBackground` here, `sectionMedia` in `LeadCoachStage`, `interactive`
 * around the roster tray. This file therefore contains **one** `CameraLayer`,
 * and all three of its layers ride it as one rigid plane. Giving the texture,
 * the wash and the vignette a plane each would be three subscriptions differing
 * by nothing perceptible — the mistake `camera-tokens.ts` records at length —
 * and would spend two of the section's three planes on decoration.
 *
 * `fill decorative` is the mode the plane needs. `fill` absolutely positions it
 * edge to edge and enables the system-owned overscan bleed, which is what lets
 * `deepBackground`'s real amplitude (lag 0.17, the largest on the page) travel
 * without ever exposing a bare edge. `decorative` is `CameraLayer`'s own
 * shorthand for `aria-hidden` + `pointer-events-none` on the layer, which is
 * exactly what Requirement 6.3 asks of every atmosphere layer — so the two
 * attributes are not hand-rolled here.
 *
 * ## Nothing in this file animates, and nothing in it sets `will-change`
 *
 * The only moving part is the camera's own `y` on the inner element, owned by
 * `useCameraLayer`. Every layer below is a static gradient: no keyframes, no
 * transitions, no `filter`, no `backdrop-filter` (Requirements 3.8, 3.10, 7.5).
 * `will-change` appears nowhere in this file — the camera sets it on its own
 * overscan planes and is the only permitted source (Requirement 7.6). Under
 * reduced motion the plane resolves to `y = 0` with no `will-change` at all and
 * the whole thing collapses to static gradients (Requirement 6.5).
 *
 * ## Accent budget: the hex wash spends no yellow
 *
 * The wash is brand-yellow, and it is deliberately **not** one of the section's
 * three resting yellow accents (Requirement 2.5, design.md §5.6). Those three
 * are the eyebrow, the lead's achievement group and the CTA tile — discrete
 * marks a visitor can point at. A 7% radial spread across a third of the
 * section is *light*, the same category as the lead plinth's warm backlight
 * (`rgba(234,179,8,0.11)`) and the section's existing warm wash
 * (`rgba(255,222,1,0.04)`), neither of which counts either. If a layer here ever
 * hardened into something with an edge, it would start counting, and the budget
 * would need re-reading.
 */

/**
 * Texture plane tuning — duplicated from `TrainerPlinth`, on purpose.
 *
 * The section plane and the in-frame plane have to be the same material or the
 * frames read as pasted onto a different surface, so this is the same asset at
 * the same scale and the same repeat: `SIZE` scales the tile to the plane's full
 * width at its natural aspect ratio so it is never stretched, and `REPEAT`
 * stacks copies downward so the plane stays continuous however tall the section
 * gets.
 *
 * It is copied rather than imported because `TrainerPlinth` keeps its layer
 * constants private, and exporting them would turn one component's internal
 * tuning into a shared API for the sake of three strings — the same call
 * `RosterCtaTile` already made for `PLINTH_SURFACE_GRADIENT`. If these ever need
 * to move together, that is the moment to promote them into `src/lib/`, not now.
 *
 * A CSS `background-image`, never a second `next/image` (Requirement 7.4): the
 * pattern has to TILE, and the section adds this plane on top of six cutouts and
 * a backdrop plate that are already competing for the same lazy-load queue.
 */
const TEXTURE_URL = "url('/images/sections/programs/luxury-grid-pattern.webp')";
const TEXTURE_SIZE = "100% auto"; // full width, natural aspect ratio — no stretch
const TEXTURE_REPEAT = "repeat-y"; // tile downward so the plane never runs out

/**
 * Responsive texture opacity (Requirement 5.8): 0.045 below 640px, 0.055 from
 * 640–1023px, 0.06 at 1024px and above. Byte-identical to `TrainerPlinth`'s
 * ramp, for the same reason the tiling constants are.
 *
 * The `lg:` value, 0.06, is the one design.md §5.1 and §5.7 both name, and it is
 * the one Requirement 2.3 counts as the section's third shared motif alongside
 * the two-digit index numerals and the flat-top hexagon. The two lower steps are
 * the same number tuned down for smaller viewports, where the tile is scaled to
 * a narrower box, its lines land closer together, and a flat 6% starts to read
 * as noise rather than material.
 */
const TEXTURE_OPACITY_CLASS = "opacity-[0.045] sm:opacity-[0.055] lg:opacity-[0.06]";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * The Blend_Zone mask — Requirement 2.8's hard constraint, and the one thing in
 * this file that has to be pixel-exact
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * design.md §5.7: **no new layer may paint within the top or bottom 128px of the
 * section**, because that is where the Facilities→dark and dark→Testimonials
 * dissolve hand-offs live. Every layer in this file is new, so all three are
 * masked, as one unit, by the wrapper below.
 *
 * ## Why the mask cannot live on the camera plane itself
 *
 * This is the trap worth spelling out. A `fill` `CameraLayer` positions its inner
 * element at `top: -overscanPad; bottom: -overscanPad` and then translates it by
 * `y ∈ [−amplitude/2, +amplitude/2]`, where `overscanPad = ceil(amplitude/2 + 2)`
 * for a plane with no dolly (`use-camera-layer.ts`). The plane's box is therefore
 * *taller than the section* and *moving*. A `128px` stop measured from the
 * plane's own top edge lands at `128 − overscanPad + y` in section coordinates —
 * i.e. anywhere from roughly `128 − amplitude` to `126`. At `deepBackground`'s
 * lag of 0.17 on a 900px viewport that amplitude is ≈ 306px, so the "128px band"
 * would spend most of the scroll sitting *above* the section's top edge, leaving
 * the Blend_Zone painted. A mask authored inside the plane is not an
 * approximation of the constraint; it fails it outright.
 *
 * ## Why the wrapper makes it exact rather than approximate
 *
 * So the mask goes on a static wrapper whose box **is** the section box
 * (`absolute inset-0`, never transformed, never overscanned). CSS masking applies
 * to the composited result of an element's whole subtree, in the masked element's
 * own coordinate space: whatever the camera does to its descendants happens
 * first, and is then cut by a mask that cannot move. `128px` from this wrapper's
 * top edge is therefore `128px` from the section's top edge, at every scroll
 * position, at every amplitude, at every breakpoint — exact, not
 * approximated. This is also why the wrapper exists at all rather than the mask
 * riding `CameraLayer`'s `className`: `CameraLayer` takes classes, not a style
 * object, and mask properties have no Tailwind expression.
 *
 * `mask-repeat: no-repeat` is load-bearing, not tidiness. The default is
 * `repeat`, which would tile this gradient vertically past the wrapper's box and
 * hand the overscan bleed above and below it a fresh opaque band — re-painting
 * the very region the mask exists to clear. With `no-repeat`, everything outside
 * the wrapper's box is unmasked and therefore fully transparent, so the mask both
 * enforces the Blend_Zone and confines the plane to the section box.
 * `overflow-hidden` on the wrapper is belt and braces over the same guarantee.
 *
 * ## The feather, and the one degenerate case
 *
 * Alpha is exactly 0 through the first and last {@link BLEND_ZONE_PX}, then ramps
 * over the following {@link BLEND_ZONE_FEATHER_PX} — the constraint is "paints
 * nothing inside 128px", and a hard cut at exactly 128px would satisfy it while
 * drawing a visible horizontal seam across the section. The feather buys the
 * dissolve without moving where the paint starts.
 *
 * Degenerate case, stated rather than hidden: on a section shorter than
 * `2 × (128 + 64) = 384px` the stops would cross, and CSS clamps each stop to the
 * one before it. The plane then fades to nothing instead of painting past the
 * band — it paints *less*, never more, so the constraint still holds. This
 * section is thousands of pixels tall at every breakpoint, so the case is
 * theoretical.
 */
const BLEND_ZONE_PX = 128;
const BLEND_ZONE_FEATHER_PX = 64;
const BLEND_ZONE_EDGE_PX = BLEND_ZONE_PX + BLEND_ZONE_FEATHER_PX;
const ATMOSPHERE_MASK = `linear-gradient(to bottom, transparent 0px, transparent ${BLEND_ZONE_PX}px, #000 ${BLEND_ZONE_EDGE_PX}px, #000 calc(100% - ${BLEND_ZONE_EDGE_PX}px), transparent calc(100% - ${BLEND_ZONE_PX}px), transparent 100%)`;

/**
 * Hex wash — design.md §5.4's second application of the hexagon motif: a
 * hex-clipped brand-yellow radial at ≤7% opacity behind the lead coach's
 * head and shoulder.
 *
 * Three stops rather than two, matching the plinth backlight's falloff, so the
 * field dies out well inside its own box and the clip's edges never carry a flat
 * tint that would read as a shape with a border. 0.07 is the ceiling design.md
 * names, not a starting point: this sits behind a photographed person, and
 * anything stronger stops being light on a wall and starts being a graphic.
 */
const HEX_WASH_GRADIENT =
  "radial-gradient(circle at 50% 50%, rgba(255,222,1,0.07) 0%, rgba(255,222,1,0.03) 45%, transparent 72%)";

/**
 * The wash's box — square, and approximate on purpose.
 *
 * `aspect-square` because `RosterIndexChip` clips `HEX_CLIP` inside a square box
 * (`size-8 sm:size-9 lg:size-10`), and a non-square box shears the polygon: the
 * flats and points would sit on different angles from the chip's, which is
 * precisely the echo §5.4 asks for ("sized so its flats echo the chip's").
 *
 * The placement is a soft field, not a pinned halo, and the percentages say so.
 * Two reasons to keep them coarse. The lead spread occupies roughly the section's
 * first third at every breakpoint — full-width plinth with the coach centred
 * below `lg:`, a 48% left column capped at 447px above it — which is what the
 * `lg:` left offset tracks. And percentages resolve against the *plane's* box,
 * which is overscanned and drifting, so a stop authored here lands within a
 * hundred-odd pixels of where the same percentage of the section would be,
 * varying with amplitude. For a 7% radial hundreds of pixels across that is
 * invisible; for the Blend_Zone mask it would be disqualifying, which is why that
 * one is measured from the static wrapper instead. Pretending to more precision
 * here with a breakpoint ramp would imply a measurement no one has taken.
 *
 * ## The `lg:` values moved when the lead spread was capped
 *
 * They were `lg:left-[7%] lg:w-[46%]`, a box centred at 30% of the container —
 * which is where the lead's head sat while the plinth was 57% of a full 1280px
 * column (702px wide, head near 30% of that). Capping the spread at 980px and the
 * split at 48/52 puts the plinth at 447px, so its centre moved from ~27% of the
 * container to ~17%, and a wash still centred at 30% would have sat off his
 * shoulder against bare wall — visible as a bright patch in the gutter rather than
 * as light behind a person.
 *
 * `lg:left-[2%] lg:w-[32%]` re-centres it at 18% and narrows the box to ~410px at
 * a 1280px container, which tracks the plinth's 447px rather than the old column's
 * width. This is the one thing in this file that is downstream of the spread's
 * geometry, so it is the one thing that has to move with it.
 */
const HEX_WASH_BOX_CLASSES =
  "absolute left-1/2 top-[14%] aspect-square w-[86%] -translate-x-1/2 sm:w-[68%] lg:left-[2%] lg:w-[32%] lg:translate-x-0";

/**
 * Depth vignette — the plane's own edge falloff, and a different layer from the
 * section vignette `TrainerShowcase` already paints.
 *
 * That one is static, sits under this whole plane, and stays exactly as it is
 * (Requirement 2.8, design.md §5.7). This one rides the camera and exists to
 * close the texture plane's *horizontal* edges: the Blend_Zone mask fades the
 * plane's top and bottom, but nothing fades its left and right, where the
 * Container's own padding leaves the material fully exposed against bare Ink. A
 * tile that terminates on a straight vertical edge reads as an image boundary —
 * the same failure Phase 5 fixed inside the plinth frames by replacing a linear
 * band with a radial. So this is a radial, its transparent core covers the
 * content column, and it only bites in the outer margins and corners.
 *
 * 0.18 sits under the section vignette's own 0.22 for the same reason: the two
 * composite, and this one is the far wall's falloff, not a second attempt at the
 * section's edge.
 */
const DEPTH_VIGNETTE_GRADIENT =
  "radial-gradient(ellipse 120% 90% at 50% 45%, transparent 60%, rgba(20,24,29,0.18) 100%)";

export function RosterAtmosphere() {
  return (
    // THE MASK WRAPPER — static, exactly the section box, and the only element
    // here whose geometry has to be trusted. See ATMOSPHERE_MASK above for why
    // the Blend_Zone cut cannot live on the moving plane inside it.
    //
    // `aria-hidden` and `pointer-events-none` are set explicitly rather than
    // inherited: `CameraLayer decorative` marks the layer, not this wrapper, and
    // every layer in this file is atmosphere (Requirement 6.3). `z-0` seats the
    // whole plane behind the section's `z-10` content column.
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{
        WebkitMaskImage: ATMOSPHERE_MASK,
        maskImage: ATMOSPHERE_MASK,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
      }}
    >
      {/* The section's ONE deepBackground plane (Requirement 3.5). Layers stack
          in source order inside it, bottom → top: texture, hex wash, vignette —
          which is the order design.md §5.7 asks for, the new material sitting
          between the section's preserved warm wash below and a vignette above. */}
      <CameraLayer depth="deepBackground" fill decorative>
        {/* Texture plane — the material pass. Opacity is a class rather than an
            inline value so the three-step ramp in Requirement 5.8 is expressed
            once, in the same form `TrainerPlinth` expresses it. */}
        <div
          className={cn("absolute inset-0 z-0", TEXTURE_OPACITY_CLASS)}
          style={{
            backgroundImage: TEXTURE_URL,
            backgroundSize: TEXTURE_SIZE,
            backgroundRepeat: TEXTURE_REPEAT,
            backgroundPosition: "top center",
          }}
        />

        {/* Hex wash — the hexagon motif as light. Clipped, never bordered. */}
        <div
          className={cn(HEX_WASH_BOX_CLASSES, "z-[1]")}
          style={{ background: HEX_WASH_GRADIENT, clipPath: HEX_CLIP }}
        />

        {/* Depth vignette — closes the plane's left/right edges and corners. */}
        <div
          className="absolute inset-0 z-[2]"
          style={{ background: DEPTH_VIGNETTE_GRADIENT }}
        />
      </CameraLayer>
    </div>
  );
}
