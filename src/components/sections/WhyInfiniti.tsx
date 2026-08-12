import Image from "next/image";
import { PageSection } from "@/components/layout";
import { Eyebrow, Heading, BodyText, PricingTeaserCallout } from "@/components/ui";
import { AnimationWrapper, CameraLayer } from "@/components/motion";

/**
 * WhyInfiniti — Homepage-Architecture.md §4 Philosophy / Value Story.
 *
 * A cinematic editorial pause following Programs: the supplied training image
 * extends across the section while its natural left-side negative space keeps
 * the philosophy statement clear and the athlete remains the visual
 * counterweight on the right. The original philosophy copy and pricing CTA
 * remain intentionally direct.
 */
export function WhyInfiniti() {
  return (
    <PageSection
      tone="dark"
      spacing="standard"
      className="relative overflow-hidden lg:min-h-[34rem] lg:py-28"
    >
      {/* Receives Programs' final charcoal tone without creating a dark-band seam. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-20 sm:h-24 lg:h-32"
        style={{
          background: "linear-gradient(180deg, rgb(28,31,36) 0%, transparent 100%)",
        }}
      />

      <div className="mx-auto flex max-w-2xl flex-col gap-6 lg:max-w-[34rem] lg:gap-7">
        <AnimationWrapper className="relative z-10">
          <Eyebrow tone="dark">Our Philosophy</Eyebrow>
        </AnimationWrapper>

        <AnimationWrapper delay={0.1} className="relative z-10">
          <Heading level="section" as="h2" className="max-w-[12ch] text-white">
            We cut the spa. <span className="block">Not the results.</span>
          </Heading>
        </AnimationWrapper>

        {/*
          On small screens the image follows the headline as a deliberate
          editorial beat. At desktop it becomes a full-section visual plane;
          the subject is right-biased, leaving the original dark negative space
          untouched behind the typography.
        */}
        <AnimationWrapper
          variant="fade"
          delay={0.18}
          className="relative z-0 -mx-4 h-56 overflow-hidden sm:-mx-6 sm:h-72 lg:absolute lg:inset-y-0 lg:left-[calc(50%-50vw)] lg:mx-0 lg:h-auto lg:w-screen"
        >
          {/* Scroll-linked drift on the camera's `background` plane — the same
              plane the Programs environment image and Train With Purpose banner
              use, so all three read as one depth. The entrance is a plain fade
              rather than scale-in-settle on purpose: the wrapper's transform
              would otherwise feed the camera's own measurement while it played.
              Bleed and the dolly are system-owned, and the frame clips them. */}
          <CameraLayer depth="background" fill decorative>
            <div className="relative h-full w-full">
              <Image
                src="/images/sections/philosophy/philosophy-training.webp"
                alt=""
                fill
                sizes="100vw"
                className="object-cover object-[68%_center] lg:object-[74%_center]"
              />
            </div>
          </CameraLayer>

          {/* Mobile image edges dissolve into the surrounding ink rather than reading as a card. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 lg:hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(20,24,29,0.72) 0%, transparent 24%, transparent 68%, rgba(20,24,29,0.94) 100%)",
            }}
          />

          {/* Protects the desktop text field while leaving the athlete and practical lighting visible. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden lg:block"
            style={{
              background:
                "linear-gradient(90deg, rgba(20,24,29,0.98) 0%, rgba(20,24,29,0.88) 31%, rgba(20,24,29,0.54) 48%, rgba(20,24,29,0.12) 67%, transparent 82%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-36 lg:block"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(20,24,29,0.36) 45%, rgb(20,24,29) 100%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 hidden h-24 lg:block"
            style={{
              background: "linear-gradient(180deg, rgb(28,31,36) 0%, transparent 100%)",
            }}
          />
        </AnimationWrapper>

        <AnimationWrapper delay={0.28} className="relative z-10">
          <BodyText size="large" className="max-w-xl text-text-secondary-dark">
            No sauna. No pool. No paper towels. We skip the expensive extras so training stays
            genuinely affordable — real trainers, imported equipment, and honest pricing, without
            the markup that pays for amenities most members never use.
          </BodyText>
        </AnimationWrapper>

        <AnimationWrapper delay={0.38} className="relative z-10">
          <PricingTeaserCallout priceText="Memberships from ₹199/day" className="mt-2" />
        </AnimationWrapper>
      </div>

      {/* Completes the image-to-ink dissolve before Facilities' existing light transition begins. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] hidden h-16 lg:block"
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgb(20,24,29) 100%)",
        }}
      />
    </PageSection>
  );
}
