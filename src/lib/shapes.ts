/**
 * shapes.ts — shared CSS `clip-path` geometry.
 *
 * No `"use client"` directive on purpose: these are plain string constants, so
 * both Server and Client Components can import them.
 */

/**
 * Flat-top hexagon — the "dumbbell head" silhouette, not a "rounded card".
 * The site's one non-rectangular shape: Hero scene thumbnails, the strip
 * navigator's steppers, and the roster index chip all forge from this.
 *
 * Byte-identical to the string previously inlined in `SceneNavigator.tsx` and
 * `StripNavigator.tsx`, both of which now import it from here.
 */
export const HEX_CLIP = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";

/**
 * The inner core of a hexagon chip — the ink or photographic face that floats
 * inside the machined steel rim.
 *
 * Deliberately the same polygon as `HEX_CLIP`. Every shipping call site builds
 * its core by clipping this same path inside a pixel-inset box — `inset-[2px]`
 * in `StripNavigator`, `inset-[2.5px] wide:inset-[3px]` in `SceneNavigator` —
 * so the rim thickness comes from the box, not from a second polygon. Scaling
 * the path instead would thin the rim unevenly along the diagonals and change
 * the rendered edge, so there is no honest single inset polygon to name here.
 * Where a graphic genuinely needs a pulled-in path (the `SceneNavigator`
 * progress trace), it carries its own SVG geometry.
 *
 * Consume this token wherever an inner core is clipped, so the intent reads at
 * the call site and a future geometry change lands in one place.
 */
export const HEX_CLIP_INSET = HEX_CLIP;
