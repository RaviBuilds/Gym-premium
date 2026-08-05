import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CardGrid, Icon, ProgramCard, Eyebrow, Heading, BodyText, ButtonLink } from "@/components/ui";
import { AnimationWrapper, KineticHeadline, ParallaxLayer, MagneticButton } from "@/components/motion";
import { programs } from "@/content/programs";

/**
 * Programs — Homepage-Architecture.md §3 Programs.
 *
 * The entire section is wrapped in ProgramsEnvironment, which creates a
 * premium, cinematic backdrop that continues the Hero's immersive feel. It
 * establishes a fixed background image with atmospheric overlays, ensuring a
 * seamless visual transition from the preceding TrustStrip section.
 *
 * The content itself remains unchanged, preserving the original layout of
 * program cards and the mid-section TrainingBanner. Text and UI elements have
 * had their tones adjusted to maintain high contrast and readability against
 * the new dark background.
 */
export function Programs() {
  const firstRow = programs.slice(0, 3);
  const secondRow = programs.slice(3);

  return (
    <div>
      <div className="flex flex-col gap-10">
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
        <p className="-mt-4 flex items-center gap-2 font-body text-caption font-semibold uppercase tracking-wide text-text-secondary-dark sm:hidden">
          Swipe to explore all 9 programs
          <Icon icon={ArrowRight} size="sm" aria-hidden />
        </p>
        <CardGrid columns={3}>
          {firstRow.map((program, index) => (
            <ProgramCard
              key={program.slug}
              program={program}
              index={index}
              featured={program.slug === "crossfit"}
            />
          ))}
        </CardGrid>
      </div>

      <TrainingBanner />

      <div className="flex flex-col gap-10">
        <CardGrid columns={3}>
          {secondRow.map((program, index) => (
            <ProgramCard
              key={program.slug}
              program={program}
              index={index + firstRow.length}
              featured={program.slug === "crossfit"}
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
