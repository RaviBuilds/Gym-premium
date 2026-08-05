import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CardGrid, Icon, ProgramCard, Eyebrow, Heading, BodyText, ButtonLink } from "@/components/ui";
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

      <div className="relative z-10 flex flex-col gap-10 pt-10">
        <p className="-mt-4 flex items-center gap-2 font-body text-caption font-semibold uppercase tracking-wide text-text-secondary-dark sm:hidden">
          Swipe to explore all 9 programs
          <Icon icon={ArrowRight} size="sm" aria-hidden />
        </p>
        <CardGrid columns={3} reveal="premium">
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

      <TrainingBanner />

      <div className="relative z-10 flex flex-col gap-10">
        <CardGrid columns={3} reveal="premium">
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
 * above/below it.
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
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 35%, rgba(20,24,29,0.35) 75%, rgba(20,24,29,0.7) 100%)",
        }}
      />

      <div className="relative flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <AnimationWrapper variant="fade-up">
          <Eyebrow tone="dark">Train With Purpose</Eyebrow>
        </AnimationWrapper>
        <AnimationWrapper variant="fade-up" delay={0.1}>
          <Heading level="section" as="p" className="text-white">
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
