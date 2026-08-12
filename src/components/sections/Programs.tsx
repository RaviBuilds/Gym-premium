import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CardGrid, Icon, ProgramCard, Eyebrow, Heading, BodyText, ButtonLink } from "@/components/ui";
import { Container } from "@/components/layout";
import { AnimationWrapper, KineticHeadline, ParallaxLayer, MagneticButton } from "@/components/motion";
import { programs } from "@/content/programs";

/**
 * Programs — Homepage-Architecture.md §3 Programs.
 *
 * Opens with a full-width environment image that makes the section feel
 * like walking into a premium luxury gym. The image is architecture, not
 * decoration: layered directional overlays (Ink at reduced opacity as
 * gradient, per §3.1) keep brightness ~35% so the heading stays readable,
 * while a bottom blend dissolves the image into the section's dark canvas
 * so it never ends abruptly. Static — no parallax; the TrainingBanner
 * below is this section's one Tier-2 depth cue.
 */

/**
 * Program card material plane — a quiet under-card texture, scoped
 * INDEPENDENTLY to each card row rather than one continuous backdrop
 * spanning the whole card zone. Train With Purpose sits between the two
 * rows, so each row gets its own plane instance; the banner's own opaque
 * image/overlay sits between them untouched, and neither plane extends up
 * into the environment image/heading above row 1 or down past row 2.
 *
 * Sourced from the already-approved `luxury-grid-pattern.webp`. Rendered as
 * a CSS `background-image` rather than `next/image`, because the pattern
 * must TILE: `PATTERN_SIZE` ("100% auto") scales it to the row's full width
 * at its natural aspect ratio — never stretched — and `PATTERN_REPEAT`
 * ("repeat-y") stacks copies downward so the plane stays continuous however
 * tall that row's wrapper gets. A vertical mask fades the pattern in/out at
 * the row wrapper's own top/bottom edge, so there is never a hard edge, a
 * visible rectangle, or an obvious image boundary. Fully static — no
 * parallax, no animation, no scroll listener.
 *
 * Opacity rationale — READ THIS BEFORE LOWERING IT AGAIN. An earlier pass
 * set this to 0.07 chasing "invisible at rest", which made the hover reveal
 * (ProgramCard's `MATERIAL_BACKDROP_CLASS` veil fading out) physically
 * impossible to perceive: a 7% pattern over the section's ~rgb(30,33,38)
 * backdrop lands its brightest lines around rgb(40) — a ~10-level shift —
 * so clearing the veil moved those pixels roughly rgb(32) → rgb(40) and read
 * as no change at all. A SINGLE static plane cannot be both invisible at
 * rest and clearly visible on hover, because both states share it. The
 * quietness at rest is therefore enforced by the VEIL (which is dense and
 * covers the gutters), not by crushing this value. At 0.25 the pattern's
 * highlights land near rgb(67), so veiled it reads ~rgb(32) (indistinguish-
 * able from the backdrop) and un-veiled it reads ~rgb(67) — a >2x jump that
 * is actually perceptible as a surface being exposed. If the gutters ever
 * read as wallpaper, raise the veil's density (`bg-ink/75`) before touching
 * this.
 *
 * Positioning: `absolute inset-0` inside each row's own `relative` wrapper
 * (see call sites below), at `z-0`. That wrapper's actual content
 * (Container/CardGrid) is itself wrapped in a `relative z-10` div so the
 * cards and any row copy always paint above this plane. `overflow-hidden`
 * on the plane plus its `inset-0` sizing (never wider than its row wrapper)
 * guarantees no horizontal overflow and no visible left/right image edge at
 * any breakpoint. Each `ProgramCard`'s own dark veil (its resting "shadow",
 * see ProgramCard's MATERIAL_BACKDROP_CLASS) still sits above this plane and
 * fades fully out on hover, exposing this material in a band around that one
 * card while every neighbouring card's veil keeps its own area dimmed.
 */
const PATTERN_URL = "url('/images/sections/programs/luxury-grid-pattern.webp')";
const PATTERN_SIZE = "100% auto"; // full width, natural aspect ratio — no stretch
const PATTERN_REPEAT = "repeat-y"; // tile downward for a continuous backdrop within the row
const PATTERN_OPACITY = 0.25; // see doc comment — quietness comes from the scrim, not this value
const PATTERN_FADE_MASK =
  "linear-gradient(to bottom, transparent 0px, #000 56px, #000 calc(100% - 56px), transparent 100%)";

/**
 * Full-bleed ambient scrim alpha. This is the layer that makes the pattern
 * read QUIET, and it spans the plane's entire width — critically including
 * the Container's own horizontal padding (48px at `lg`, 80px at `wide`),
 * which the per-card veils in ProgramCard can never reach because cards only
 * exist inside the Container. Without this, the pattern showed at full
 * strength in those outer margins while the card zone was dimmed, producing
 * two bright vertical bands down the left/right edges of the section.
 *
 * Layer order inside the plane (bottom → top):
 *   1. pattern image  @ PATTERN_OPACITY  — the material itself
 *   2. this scrim     @ PLANE_SCRIM_ALPHA — uniform ambient dimming, full width
 * Then, above the plane entirely, each ProgramCard adds its own soft-edged
 * veil that dims its immediate surroundings further at rest and dissolves on
 * hover — so hover brightens back up to this ambient level, never past it.
 *
 * The scrim must be a SIBLING of the pattern layer, not a wrapper style: if
 * both lived on one element, `opacity: PATTERN_OPACITY` would fade the scrim
 * to 25% too and it would stop dimming anything.
 */
const PLANE_SCRIM_ALPHA = 0.45;

function ProgramMaterialPlane() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{
        // The fade mask lives on the wrapper so it applies to the pattern and
        // the scrim together — they dissolve into the section background at
        // the row's top/bottom edge as one unit, with no seam between them.
        WebkitMaskImage: PATTERN_FADE_MASK,
        maskImage: PATTERN_FADE_MASK,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: PATTERN_URL,
          backgroundSize: PATTERN_SIZE,
          backgroundRepeat: PATTERN_REPEAT,
          backgroundPosition: "top center",
          opacity: PATTERN_OPACITY,
        }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgb(20 24 29 / ${PLANE_SCRIM_ALPHA})` }}
      />
    </div>
  );
}

export function Programs() {
  const firstRow = programs.slice(0, 3);
  const secondRow = programs.slice(3);

  return (
    <div
      className="relative"
      style={{
        background: `
          linear-gradient(180deg, 
            rgb(20, 24, 29) 0%, 
            rgb(25, 28, 33) 8%,
            rgb(28, 31, 36) 15%,
            rgb(30, 33, 38) 25%,
            rgb(32, 35, 40) 40%,
            rgb(33, 36, 41) 60%,
            rgb(32, 35, 40) 75%,
            rgb(30, 33, 38) 90%,
            rgb(28, 31, 36) 100%
          )
        `,
      }}
    >
      {/* Environment image — establishing shot, not a second hero. Reduced
          height (~28% shorter than V1) so it reads as atmosphere, not a
          competing focal point. All overlays are directional gradients using
          Ink at reduced opacity (§3.1) — each tuned to be individually
          invisible while collectively creating perceived depth: top fade
          blends from TrustStrip, base veil holds brightness ~35%, amber glow
          warms the heading area, vignette adds edge depth, a left-side depth
          gradient adds perceived lighting, and the bottom blend uses a
          5-stop gradual dissolve so the image completely disappears into the
          section background with zero visible edge. Static — no parallax. */}
      <div className="relative h-[280px] w-full overflow-hidden sm:h-[320px] lg:h-[380px]">
        <Image
          src="/images/programs/programs-environment.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />

        {/* Top fade — soft blend from the dark TrustStrip above */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-16 sm:h-20 lg:h-24"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,24,29,0.45) 0%, transparent 100%)",
          }}
        />

        {/* Base brightness veil — keeps image visible at ~35-40% brightness */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-ink/25"
        />

        {/* Warm amber radial glow — diffuse, low opacity, warms heading area */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 25% 70%, rgba(255,222,1,0.06) 0%, transparent 65%)",
          }}
        />

        {/* Soft vignette — invisible edge depth */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 130% 100% at 50% 35%, transparent 55%, rgba(20,24,29,0.22) 100%)",
          }}
        />

        {/* Left-side depth gradient — subtle perceived lighting from the
            right, adds depth without a visible effect */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(20,24,29,0.12) 0%, transparent 45%)",
          }}
        />

        {/* Bottom blend — 5-stop gradual dissolve so the image completely
            disappears into the section background (rgb(20,24,29)) with zero
            visible horizontal edge */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 sm:h-28 lg:h-32"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(20,24,29,0.2) 30%, rgba(20,24,29,0.55) 60%, rgba(20,24,29,0.85) 80%, rgba(20,24,29,1) 100%)",
          }}
        />

        {/* Section heading — positioned higher inside the image for breathing
            room. Typography unchanged, only bottom padding increased. */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-12 sm:px-6 sm:pb-14 lg:px-12 lg:pb-16 wide:px-20">
          <div className="flex flex-col gap-3 text-left sm:text-center lg:items-start lg:text-left">
            <AnimationWrapper variant="fade-up">
              <Eyebrow tone="dark">What We Offer</Eyebrow>
            </AnimationWrapper>
            <KineticHeadline
              as="h2"
              text="Nine ways to get after it"
              className="font-display text-section text-white lg:text-section-lg"
            />
            <AnimationWrapper variant="fade-up" delay={0.35}>
              <BodyText size="large" className="text-text-secondary-dark">
                From crossfit to rock climbing, every discipline is coached, not
                just supervised.
              </BodyText>
            </AnimationWrapper>
          </div>
        </div>
      </div>

      {/* Emergence gradient — soft shadow slightly darker than the section bg
          that cards appear to rise out of. Bridges the image dissolve into
          the card area without a hard cut. Fades to transparent within
          80-96px so it never creates a visible band. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[280px] z-0 h-20 sm:top-[320px] sm:h-24 lg:top-[380px] lg:h-24"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,10,13,0.3) 0%, transparent 100%)",
        }}
      />

      {/* Row 1 material plane — scoped to this row's own wrapper only (not
          the heading/environment image above, not Train With Purpose
          below). Positioned first so it sits behind the row's z-10 content
          within this same relative wrapper. */}
      <div className="relative pt-10">
        <ProgramMaterialPlane />
        <div className="relative z-10">
          <Container>
            <div className="flex flex-col gap-10">
              <p className="-mt-4 flex items-center gap-2 font-body text-caption font-semibold uppercase tracking-wide text-text-secondary-dark sm:hidden">
                Swipe to explore all 9 programs
                <Icon icon={ArrowRight} size="sm" aria-hidden />
              </p>
              <CardGrid columns={3} reveal="premium" className="relative z-10">
                {firstRow.map((program, index) => (
                  <ProgramCard
                    key={program.slug}
                    program={program}
                    index={index}
                    featured={program.slug === "crossfit"}
                    motion="premium"
                  />
                ))}
              </CardGrid>
            </div>
          </Container>
        </div>
      </div>

      <TrainingBanner />

      {/* Row 2 material plane — its own independent instance, scoped to this
          row's own wrapper only. Train With Purpose's banner sits between
          this and row 1 above and is untouched by either plane. */}
      <div className="relative">
        <ProgramMaterialPlane />
        <div className="relative z-10">
          <Container>
            <CardGrid columns={3} reveal="premium" className="relative z-10">
              {secondRow.map((program, index) => (
                <ProgramCard
                  key={program.slug}
                  program={program}
                  index={index + firstRow.length}
                  featured={program.slug === "crossfit"}
                  motion="premium"
                />
              ))}
            </CardGrid>
          </Container>
        </div>
      </div>
    </div>
  );
}

/**
 * TrainingBanner — full-width cinematic pause between the two Programs
 * rows. Reuses Facilities.tsx's exact banner pattern (ParallaxLayer +
 * Image + overlay, same height scale) rather than inventing a new one, so
 * this section's "movement" comes from an established, already-verified
 * technique. Negative margins pull it out to the PageSection's own edges
 * (its parent PageSection uses the default "full" bleed with an inner
 * Container, so the banner needs to escape that Container's max-width/
 * padding to read as full-bleed) without needing bleed="content" on the
 * whole section, which would also strip the Container from the card grids
 * above/below it. Short static top/bottom seam blends (see below) soften
 * the hand-off to/from the card rows so the banner reads as an intentional
 * transition rather than a hard-edged cut.
 */
function TrainingBanner() {
  return (
    <div className="relative -mx-4 my-14 h-56 overflow-hidden sm:-mx-6 sm:h-72 lg:-mx-12 lg:my-20 lg:h-[26rem] wide:-mx-20">
      <ParallaxLayer className="absolute inset-0" disableOnMobile>
        {/* Explicit height per breakpoint, not a % — ParallaxLayer's own
            motion.div wrapper has no set height (auto), so a percentage
            here would resolve against that auto height and collapse to 0
            (exactly the Next Image "fill + height 0" warning). Hero.tsx's
            banner uses the same explicit-height approach for the same
            reason. The lg value adds parallaxMax's 40px as a buffer so the
            image never reveals a gap at the extremes of its scroll drift. */}
        <div className="relative h-56 w-full sm:h-72 lg:h-114">
          <Image
            src="/training-energy-banner.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </ParallaxLayer>

      <div aria-hidden="true" className="absolute inset-0 bg-ink/55" />
      {/* Cinematic vignette — tuned so the copy block (vertically AND
          horizontally centered, see the closing content wrapper below)
          sits on guaranteed contrast rather than the gradient's brightest
          point. Previously fully transparent at center (a "hole" right
          behind the headline) with density only building toward the
          edges — technically a vignette, but backwards for legibility
          since the text lives exactly where the gradient was doing the
          least work. Now holds a moderate density at center (0.32,
          matching the same Ink token used everywhere else in this
          section) that eases slightly at the mid-radius before deepening
          toward the edges as before — still reads as a lens vignette
          framing the shot, just no longer undermines its own text-safety
          job. Values stay moderate throughout (max 0.75, same as the
          original edge value) so the photo never goes muddy/flat. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(20,24,29,0.32) 0%, rgba(20,24,29,0.22) 45%, rgba(20,24,29,0.5) 78%, rgba(20,24,29,0.75) 100%)",
        }}
      />

      {/* Top seam blend — softens the hard cut where this full-bleed banner
          begins immediately below row 1's card zone above. Same technique
          as this file's environment-image "top fade"/"emergence gradient":
          a short, static Ink gradient, no animation, no parallax. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-10 sm:h-12 lg:h-16"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,24,29,0.55) 0%, transparent 100%)",
        }}
      />

      {/* Bottom seam blend — mirrors the top blend so the banner's lower
          edge dissolves into row 2's card zone below instead of cutting
          off sharply. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 sm:h-12 lg:h-16"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(20,24,29,0.55) 100%)",
        }}
      />

      <div className="relative flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <AnimationWrapper variant="fade-up">
          <Eyebrow tone="dark">Train With Purpose</Eyebrow>
        </AnimationWrapper>
        <AnimationWrapper variant="fade-up" delay={0.1}>
          <Heading level="section" as="h3" className="text-white">
            Real Coaching.
            <br />
            Real Results.
          </Heading>
        </AnimationWrapper>
        <AnimationWrapper variant="fade-up" delay={0.2}>
          <BodyText size="large" className="max-w-md text-white/80">
            Every discipline on this page is led by a coach who knows your name, not just your
            membership number.
          </BodyText>
        </AnimationWrapper>
        <AnimationWrapper variant="fade-up" delay={0.3} className="mt-2">
          <MagneticButton>
            <ButtonLink href="/programs" variant="primary">
              Explore Training
            </ButtonLink>
          </MagneticButton>
        </AnimationWrapper>
      </div>
    </div>
  );
}
