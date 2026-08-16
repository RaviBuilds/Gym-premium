/**
 * maps.ts — Google Maps deep links built from the addresses already in
 * `siteConfig`.
 *
 * No `"use client"` directive: these are pure string functions, so both the
 * Server and Client trees can import them.
 *
 * ## Why this exists
 *
 * The two location cards and the footer's two branch cards used to link to
 * `/locations/gachibowli` and `/locations/rethibowli`. Neither route exists —
 * `src/app/` holds only `page.tsx` — so all four links resolved to a 404.
 *
 * "Get directions" is the honest replacement rather than a same-page anchor,
 * because it is what a visitor reading a gym's address actually wants next, and
 * unlike a detail page it needs nothing built to work. A local gym's address is
 * also the highest-intent element on the page: someone checking whether
 * Gachibowli is on their commute is much closer to walking in than someone
 * browsing programme copy.
 *
 * ## Search, not directions-from-here
 *
 * `/maps/search/` is used rather than `/maps/dir/`, deliberately. A directions
 * URL needs an origin, and the only origin available without asking for the
 * visitor's location is nothing at all — which renders as a half-filled
 * directions form. The search URL opens Maps pinned on the gym, where the
 * visitor's own "Directions" button is one tap away and already knows where they
 * are.
 *
 * Both helpers use the documented `api=1` URL scheme, which Google supports as a
 * stable contract across web, Android and iOS rather than as an internal format
 * that can change.
 */

/**
 * A Google Maps link pinned on `address`.
 *
 * `encodeURIComponent` is not optional here: every address in `siteConfig`
 * contains commas and spaces, and the Rethibowli one contains `No. 53` — a
 * literal `#`-free string today, but any unencoded `#` would silently truncate
 * the query at the fragment and drop the visitor somewhere near Hyderabad
 * rather than at the gym.
 */
export function buildMapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/**
 * The accessible name for a directions link.
 *
 * Centralised because it is rendered in two places — `LocationCard` and the
 * footer's branch cards — and a link's accessible name has to make sense read
 * out of context. "Get directions" alone does not say *to where*, which is
 * exactly the shrug a screen-reader user hears when four such links share one
 * page.
 */
export function buildDirectionsLabel(branchName: string): string {
  return `Get directions to Infiniti Fitness ${branchName} on Google Maps`;
}

/**
 * The optional Google Maps Embed API key.
 *
 * Read once at module scope from a `NEXT_PUBLIC_` variable so it is inlined at
 * build time and available in the Client tree, which is where the `<iframe>`
 * lives. Absent today — see {@link buildMapsEmbedUrl} for what happens then.
 */
const MAPS_EMBED_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

/**
 * An embeddable Google Maps URL for `address`, for use as an `<iframe src>`.
 *
 * ## Two endpoints, and why the fallback exists
 *
 * With a key set, this returns the **official Maps Embed API** URL
 * (`/maps/embed/v1/place`). That is the documented, supported, stable contract and
 * is what production should use: Google versions it, guarantees its parameters,
 * and it is free at the volumes a two-branch gym site will ever see.
 *
 * Without a key, it falls back to `maps.google.com/maps?q=…&output=embed`. This is
 * the long-lived keyless embed endpoint. It is **not** part of the documented API,
 * and that is a real trade-off worth stating plainly rather than burying: it works
 * today, it is used very widely, and Google could change it without notice. It is
 * here because the alternative is a blank rectangle where the map should be until
 * somebody provisions a key — and a demo cannot wait on a billing account.
 *
 * The switch is deliberately automatic rather than a separate function. Setting
 * `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env` upgrades every map on the site to
 * the supported endpoint with no code change, which is the smallest possible path
 * from "works for the demo" to "correct in production".
 *
 * ## The host in the fallback is `maps.google.com`, and it is load-bearing
 *
 * `www.google.com/maps?q=…&output=embed` — the more obvious spelling, and the one
 * most snippets use — **does not frame**. Checked against the live endpoint rather
 * than assumed:
 *
 * ```
 * www.google.com/maps?q=…&output=embed   -> 301, X-Frame-Options: SAMEORIGIN
 * maps.google.com/maps?q=…&output=embed  -> 301 -> 200, no X-Frame-Options
 * ```
 *
 * Both redirect to the same real embed document
 * (`www.google.com/maps/embed?origin=mfe&pb=…`), but only the `maps.` host's chain
 * ends on a response a browser will render inside an iframe. The `www.` version
 * renders as a blank or refused frame.
 *
 * That final `…/maps/embed?pb=!1m3!2m1!1s…!6i15` URL is deliberately **not** used
 * directly, even though it would skip one redirect. Its `pb` parameter is an opaque
 * protobuf blob — an internal encoding with no stability promise at all, whereas the
 * `?q=` form is the human-facing surface Google keeps the redirect mapping for. One
 * extra hop inside a lazily-loaded iframe is a fair price for not hand-assembling a
 * private wire format.
 *
 * `z=15` frames a neighbourhood rather than a rooftop — close enough to place the
 * gym on a recognisable street, wide enough to show the landmarks the addresses
 * themselves cite ("Near HDFC Bank", "Pillar No. 53"). The redirect preserves it,
 * re-encoded as `!6i15`.
 */
export function buildMapsEmbedUrl(address: string): string {
  const query = encodeURIComponent(address);

  if (MAPS_EMBED_KEY !== undefined && MAPS_EMBED_KEY.length > 0) {
    return `https://www.google.com/maps/embed/v1/place?key=${MAPS_EMBED_KEY}&q=${query}&zoom=15`;
  }

  return `https://maps.google.com/maps?q=${query}&z=15&output=embed`;
}
