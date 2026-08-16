"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { PageSection } from "@/components/layout";
import { Eyebrow } from "@/components/ui";
import { LocationCard, LOCATION_CARD_REVEAL } from "@/components/ui/LocationCard";
import {
  AnimationWrapper,
  CameraLayer,
  KineticHeadline,
} from "@/components/motion";
import { locations } from "@/content/locations";

/**
 * Locations — Premium cinematic section, v2.
 *
 * Fixes from visual QA:
 *   - Background image boosted (opacity-40 + ink/65 overlay = ~14% perceived)
 *   - Layout tightened: removed dead-space divider, reduced gaps
 *   - Brand accent mark: larger, bolder, actual infinity loop path
 *   - City silhouette: bumped to 4% opacity with drop-shadow
 *   - Bottom tagline: brighter with brand-colored interpuncts
 */

/**
 * The section's backdrop media — a looping gym clip on the `background` camera
 * plane, replacing the `rethibowli-floor.jpg` still that used to sit here.
 *
 * ## This is a re-encode, and the original could not play
 *
 * The source `athelete-video.mp4` is **52MB: 3840×2160, H.264 High profile level
 * 5.2, 12.9 Mbps, 32s**. It is kept in `public/` as the master but is deliberately
 * not the file referenced here, because at that size and profile it did not play
 * as a backdrop — a browser has to buffer enough of a 12.9 Mbps stream to satisfy
 * `canplay` before a single frame shows, and it was decoding 4K to fill a plane
 * sitting at 40% opacity under nine tinting layers, where no 4K detail survives.
 *
 * `locations-backdrop.mp4` is the same clip at **1.76MB: 1280×720, Main profile
 * level 4.0, 458 kbps, audio stripped, `+faststart`**. A 96% reduction, and every
 * part of that matters for playback rather than just for weight:
 *
 * | Change | Why it was needed |
 * |---|---|
 * | 4K → 720p | The plane is at 40% opacity under nine overlays; 4K detail is unresolvable here, and 4K decode is what stalled cheaper devices |
 * | High 5.2 → Main 4.0 | Widest possible hardware-decode support, including older mobile |
 * | 12.9 Mbps → 458 kbps | `canplay` fires in a fraction of the time, which is what makes autoplay actually start |
 * | `+faststart` | Moves the `moov` atom to the front. Without it a browser may need the whole file before it can begin — the single likeliest reason the 52MB original never started |
 * | `-an` | The master has no audio track anyway, and a muted background video has no use for one |
 *
 * Regenerate from the master with:
 *
 * ```
 * ffmpeg -y -i public/athelete-video.mp4 -vf "scale=1280:-2" -c:v libx264 \
 *   -crf 28 -preset medium -profile:v main -level 4.0 -pix_fmt yuv420p \
 *   -an -movflags +faststart public/locations-backdrop.mp4
 * ```
 *
 * ## Why the treatment is byte-identical to the still it replaces
 *
 * `object-cover object-center opacity-40` is exactly what the `<Image>` carried.
 * Every layer stacked above this plane — the `ink/65` overlay, the `blue-950/12`
 * tint, the cool ambient radial, the dot grid and the deep vignette — was tuned
 * against a backdrop at 40% opacity, and the section's whole "cool night-city"
 * identity is that composite. Swapping the media without changing its opacity
 * means the nine layers above it keep working untouched. Raising it to make the
 * video "more visible" would blow out the vignette and turn a legible dark section
 * into a busy one, so the opacity is the last thing to reach for here.
 */
const BACKDROP_VIDEO_SRC = "/locations-backdrop.mp4";

/**
 * The poster, and the reduced-motion still — frame 1.5s of the clip above,
 * extracted with ffmpeg and encoded to a 13kB WebP at 1600px wide.
 *
 * Generated rather than picked from `public/`, because neither existing candidate
 * works. `rethibowli-floor.jpg` is the photograph this change exists to remove, so
 * using it as a poster would put it back on screen for the first second of every
 * visit. `athelete.png` sits beside the clip in `public/` and looks like a match by
 * name, but it is a 3280×4374 **portrait** cutout already used by `CommitCta` — at
 * `object-cover` across a 16:9 section it would crop to a slab of torso and read as
 * a different asset entirely.
 *
 * A real frame is the only thing that makes the poster→video swap invisible: same
 * subject, same framing, same grade, so the cross-fade has nothing to give away.
 * 1600px and quality 72 because it sits at 40% opacity under nine overlay layers —
 * there is no detail budget here worth spending bytes on.
 *
 * Re-extract it with the video if the clip is ever replaced or re-encoded:
 *
 * ```
 * ffmpeg -y -ss 1.5 -i public/athelete-video.mp4 -frames:v 1 \
 *   -vf "scale=1600:-2" -c:v libwebp -quality 72 \
 *   public/images/atmosphere/locations-backdrop-poster.webp
 * ```
 */
const BACKDROP_POSTER_SRC = "/images/atmosphere/locations-backdrop-poster.webp";

/**
 * How early the video is allowed to start buffering — one viewport of runway
 * before the section arrives.
 *
 * Large enough that the clip is playing by the time a normal scroll brings the
 * section into view, small enough that a visitor who never scrolls this far never
 * pays for it. `useInView`'s `margin` takes a `root-margin` string, so this is the
 * same unit CSS uses.
 */
const BACKDROP_PREFETCH_MARGIN = "600px";

/** Section entrance — fade in on viewport entry. */
const SECTION_ENTRANCE = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/**
 * Brand accent — true infinity (∞) loop path, larger and bolder than v1's
 * two disconnected circles. Drop-shadow gives it presence on the dark bg.
 */
function InfinityAccent({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 40"
      fill="none"
      className={className}
      aria-hidden="true"
      style={{ filter: "drop-shadow(0 0 8px rgba(255,222,1,0.25))" }}
    >
      {/* True infinity loop — one continuous path */}
      <path
        d="M80 20c0 0-12-14-28-14C36 6 24 14 24 20s12 14 28 14c16 0 28-14 28-14s12 14 28 14c16 0 28-8 28-14s-12-14-28-14C92 6 80 20 80 20z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
      {/* Inner echo — depth */}
      <path
        d="M80 20c0 0-8-8-20-8-8 0-16 4-16 8s8 8 16 8c12 0 20-8 20-8s8 8 20 8c8 0 16-4 16-8s-8-8-16-8c-12 0-20 8-20 8z"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.25"
      />
      {/* Flanking lines */}
      <path d="M4 20h14M142 20h14" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <circle cx="2" cy="20" r="1.5" fill="currentColor" opacity="0.35" />
      <circle cx="158" cy="20" r="1.5" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

/** Abstract Hyderabad city silhouette — subtle geographic context. */
function CitySilhouette({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 120"
      fill="none"
      preserveAspectRatio="xMidYMax meet"
      className={className}
      aria-hidden="true"
      style={{ filter: "drop-shadow(0 -2px 4px rgba(255,222,1,0.03))" }}
    >
      <path
        d="M0 120 L0 90 L30 90 L30 70 L35 65 L40 70 L40 90 L80 90 L80 60 L85 55 L90 60 L90 90 
           L130 90 L130 50 L135 45 L140 40 L145 45 L150 50 L150 90 L200 90 L200 75 L205 70 L210 75 L210 90
           L260 90 L260 55 L265 50 L270 45 L275 40 L278 35 L280 30 L282 35 L285 40 L290 45 L295 50 L300 55 L300 90
           L350 90 L350 65 L355 60 L360 65 L360 90 L400 90 L400 45 L405 40 L410 35 L412 25 L414 35 L420 40 L425 45 L425 90
           L470 90 L470 70 L475 65 L480 70 L480 90 L520 90 L520 80 L525 75 L530 80 L530 90
           L580 90 L580 55 L585 50 L590 45 L595 50 L600 55 L600 90 L650 90 L650 60 L660 55 L665 50 L670 55 L680 60 L680 90
           L730 90 L730 75 L735 70 L740 75 L740 90 L800 90 L800 120 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Locations() {
  const prefersReducedMotion = useReducedMotion();

  /**
   * The gate on the 52MB backdrop clip.
   *
   * `once: true` so the video is mounted exactly once and never torn down and
   * re-fetched as the visitor scrolls back and forth past the section — with an
   * asset this size a re-fetch is the difference between a warm cache hit and
   * another 52MB off someone's data plan.
   *
   * `prefersReducedMotion === true` rather than a truthiness check: framer-motion's
   * hook returns `null` until it has read the media query, and `null` has to mean
   * "not yet known", not "reduce". Treating it as falsy here is the safe direction —
   * the video mounts, which is the default experience — while an explicit `true`
   * keeps the element out of the DOM entirely.
   */
  const backdropRef = useRef<HTMLDivElement>(null);
  const backdropIsNear = useInView(backdropRef, {
    once: true,
    margin: BACKDROP_PREFETCH_MARGIN,
  });
  const showBackdropVideo = backdropIsNear && prefersReducedMotion !== true;

  /**
   * Whether the decoder has reported it can play, which is what drives the
   * cross-fade from poster to video.
   *
   * Real state rather than a `classList` toggle in the `onCanPlay` handler. The
   * imperative version works right up until anything re-renders this section — a
   * reduced-motion preference change is enough — at which point React reconciles
   * `className` back to its declared value and the video snaps invisible with no
   * second `canplay` event coming to fix it. One boolean is cheaper than that bug.
   */
  const [backdropCanPlay, setBackdropCanPlay] = useState(false);
  const backdropVideoRef = useRef<HTMLVideoElement>(null);

  /**
   * Start the clip, and reveal it — the two things the `autoPlay` attribute alone
   * could not be trusted to do.
   *
   * ## Bug 1: a missed `canplay` leaves the video invisible forever
   *
   * The reveal used to hang entirely off the `onCanPlay` prop, which is a race. The
   * element is mounted by a state change, so there is a window between the browser
   * creating it and React attaching the listener — and on a warm cache or over
   * localhost, `canplay` fires inside that window. Miss it and no second event is
   * coming: the video plays perfectly at `opacity-0` for the rest of the visit,
   * which looks exactly like "the video is not playing".
   *
   * Reading `readyState` directly closes it. `HAVE_FUTURE_DATA` (3) is the same
   * condition `canplay` reports, so checking the property *and* subscribing to the
   * event covers both orderings — whichever happens first wins and the other is a
   * harmless no-op against the same boolean.
   *
   * ## Bug 2: `autoPlay` is a request, not a guarantee
   *
   * Browsers decline it for their own reasons even when a video is muted — a
   * background tab at mount, a data-saver mode, Safari's stricter accounting. The
   * attribute stays for the no-JS path, but asking explicitly is what makes it
   * reliable. The rejection is swallowed deliberately: a blocked autoplay is not an
   * error worth surfacing, it just means the visitor keeps the poster, which is a
   * perfectly good backdrop.
   *
   * `playing` is subscribed alongside `canplay` for that reason too — if playback
   * starts by any route, the video is visible.
   */
  useEffect(() => {
    const video = backdropVideoRef.current;

    if (video === null) {
      return;
    }

    const reveal = () => setBackdropCanPlay(true);

    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      reveal();
    }

    video.addEventListener("canplay", reveal);
    video.addEventListener("playing", reveal);
    void video.play().catch(() => {
      /* Autoplay declined — the poster stays, which is the intended fallback. */
    });

    return () => {
      video.removeEventListener("canplay", reveal);
      video.removeEventListener("playing", reveal);
    };
  }, [showBackdropVideo]);

  return (
    <PageSection
      id="locations"
      tone="dark"
      spacing="standard"
      className="relative overflow-hidden"
      bleed="content"
    >
      {/* ═══════════════════════════════════════════════════════════════════
          ATMOSPHERE — COOL NIGHT-CITY GEOGRAPHIC DEPTH
          Unique identity: blue-teal tint, dot grid, no warm glow, warm
          only on cards. Distinct from Membership (warm spotlight) and
          FAQ (clean anthracite).
          ═══════════════════════════════════════════════════════════════════ */}

      {/* Background atmosphere — looping gym footage with scroll parallax.
          Was `rethibowli-floor.jpg`; see BACKDROP_VIDEO_SRC for the swap and for
          why the 40% opacity treatment carried over unchanged.

          The poster renders first and stays mounted underneath, so the plane is
          never empty: the video fades in over it once it has enough data to play,
          and a visitor who never reaches the section (or who asked for reduced
          motion) sees only the still and never fetches the clip. */}
      <CameraLayer depth="background" fill decorative>
        <div ref={backdropRef} className="relative h-full w-full">
          <Image
            src={BACKDROP_POSTER_SRC}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center opacity-40"
          />

          {showBackdropVideo && (
            /* Decorative by every available means: `aria-hidden` keeps it out of
               the accessibility tree, no `controls` and `tabIndex={-1}` keep it
               out of the tab order, and `pointer-events-none` stops it swallowing
               clicks meant for the cards above it. `muted` is not a preference —
               it is what makes `autoPlay` legal in every current browser, and
               `playsInline` is what stops iOS Safari hijacking the clip into its
               native fullscreen player.

               The cross-fade is `backdropCanPlay`: the element mounts transparent
               and only reveals itself once the decoder reports it can actually
               play, so a slow connection shows a steady poster rather than a
               half-buffered stutter. It lands on `opacity-40` — the same value the
               poster underneath it carries and the value all nine overlay layers
               were tuned against. */
            <video
              ref={backdropVideoRef}
              src={BACKDROP_VIDEO_SRC}
              poster={BACKDROP_POSTER_SRC}
              autoPlay
              muted
              loop
              playsInline
              /* `auto`, not `none`. `preload="none"` and `autoPlay` are a
                 contradiction — one says fetch nothing, the other says start
                 playing — and browsers resolve it inconsistently, which is the
                 other half of why this never started. The lazy-loading job is
                 already done by the `showBackdropVideo` gate: this element does
                 not exist until the section is one viewport away, so by the time
                 `preload` is read, eager buffering is exactly what is wanted. */
              preload="auto"
              aria-hidden="true"
              tabIndex={-1}
              disablePictureInPicture
              onCanPlay={() => setBackdropCanPlay(true)}
              className={`pointer-events-none absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ease-out motion-reduce:transition-none ${
                backdropCanPlay ? "opacity-40" : "opacity-0"
              }`}
            />
          )}
        </div>
      </CameraLayer>

      {/* Ink overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-ink/65"
      />

      {/* COOL BLUE TINT — night-city geographic temperature (unique to Locations) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-blue-950/[0.12]"
      />

      {/* Top blend — receives Membership's ink fade + gold rule */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 sm:h-28 lg:h-36"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,24,29,1) 0%, rgba(20,24,29,0.6) 50%, transparent 100%)",
        }}
      />

      {/* Cool entry wash — signals temperature shift from Membership's warm */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-16 sm:h-20 lg:h-24"
        style={{
          background:
            "linear-gradient(180deg, rgba(80,120,170,0.04) 0%, transparent 100%)",
        }}
      />

      {/* Bottom blend — transitions into FAQ's lighter anthracite */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 sm:h-28 lg:h-36"
        style={{
          background:
            "linear-gradient(0deg, rgba(28,32,38,1) 0%, rgba(24,28,34,0.6) 50%, transparent 100%)",
        }}
      />

      {/* Cool white ambient — moonlight/city-light glow (replaces warm radial) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 55%, rgba(160,190,220,0.035) 0%, transparent 65%)",
        }}
      />

      {/* DOT GRID — geographic/HUD map texture (unique to Locations) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Deep vignette — cooler tone than other sections */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 100% at 50% 45%, transparent 40%, rgba(8,12,20,0.55) 100%)",
        }}
      />

      {/* City silhouette — cool blue, higher visibility */}
      <CitySilhouette className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-20 text-blue-200/[0.06] sm:h-24 lg:h-32" />

      {/* ═══════════════════════════════════════════════════════════════════
          CONTENT — tightened layout (gap-8/10/12 down from 10/14/16)
          ═══════════════════════════════════════════════════════════════════ */}

      <motion.div
        className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 sm:gap-10 sm:px-6 lg:gap-12 lg:px-12 wide:px-20"
        initial={prefersReducedMotion ? undefined : SECTION_ENTRANCE.hidden}
        whileInView={SECTION_ENTRANCE.visible}
        viewport={{ once: true, amount: 0.1 }}
      >
        {/* ─── SECTION HEADER ─── */}
        <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
          <AnimationWrapper variant="fade-up">
            <Eyebrow tone="dark">Two Locations</Eyebrow>
          </AnimationWrapper>

          <KineticHeadline
            as="h2"
            text="Two gyms. One standard."
            trigger="inView"
            className="font-display text-section text-white lg:text-section-lg"
          />

          {/* Brand infinity accent — larger and bolder */}
          <AnimationWrapper variant="fade" delay={0.35}>
            <InfinityAccent className="mt-1 h-7 w-40 text-brand-yellow sm:h-8 sm:w-48" />
          </AnimationWrapper>
        </div>

        {/* ─── LOCATION CARDS ─── */}
        <div className="grid w-full gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-8">
          {locations.map((location, index) => (
            <motion.div
              key={location.branchKey}
              initial={
                prefersReducedMotion
                  ? undefined
                  : LOCATION_CARD_REVEAL.hidden
              }
              whileInView={LOCATION_CARD_REVEAL.visible}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.15 }}
            >
              <LocationCard location={location} />
            </motion.div>
          ))}
        </div>

        {/* The branch map used to render here, in its own grid mirroring the one
            above. It now renders INSIDE each LocationCard, as that card's third
            section beneath the photo/facts zone — so a branch is one continuous
            card (photo, then facts, then map) rather than two separately-framed
            objects about the same place. See LocationCard's and BranchMap's own
            doc comments. */}

        {/* ─── BOTTOM TAGLINE — brighter with brand-colored dots ─── */}
        <AnimationWrapper variant="fade-up" delay={0.4}>
          <p className="text-center font-body text-caption font-medium uppercase tracking-[0.14em] text-white/50">
            Same equipment
            <span className="mx-2 text-brand-yellow/70">·</span>
            Same coaches
            <span className="mx-2 text-brand-yellow/70">·</span>
            Same standards
          </p>
        </AnimationWrapper>
      </motion.div>
    </PageSection>
  );
}
