import Image from "next/image";
import { PageSection } from "@/components/layout";
import { Eyebrow, Heading, BodyText } from "@/components/ui";
import { AnimationWrapper, CameraGroup, CameraLayer } from "@/components/motion";

/**
 * InsideTheGym — a single cinematic editorial beat between WhyInfiniti
 * (Our Philosophy) and Facilities (Everything You Need).
 *
 * Deliberately NOT a card/grid section — Programs and TrainerShowcase
 * already own that pattern. This is one full-bleed photograph of the real
 * training floor (squat rack, battle ropes, dumbbell row all visible in a
 * single frame) with one title block, answering "what does it feel like to
 * train here" purely through composition + a single scroll reveal rather
 * than a multi-stage narrative — the supplied image already shows three
 * simultaneous forms of training, so the story doesn't need to be told in
 * sequential beats.
 *
 * Image composition note: the photo's only clean, low-contrast band runs
 * across the top third (exposed ceiling, pendant lights) — every other
 * region has a lifter or a loaded rack in it. That's why the title block is
 * top-anchored with a top-down scrim, unlike WhyInfiniti's left-side gradient
 * (that image had a clean left column instead). Different image, different
 * negative space, different treatment — not a copy-paste of the WhyInfiniti
 * pattern.
 *
 * Motion: reuses the existing camera depth vocabulary exactly as WhyInfiniti
 * and TrustStrip do — CameraLayer depth="background" already gives a
 * 1.045→1.0 dolly and scroll-linked drift, which is the "subtle scale +
 * crop shift" the brief asks for. No new scroll engine, no sticky/pinned
 * layout: a pinned composition would need a second independent scroll
 * subscription running alongside the camera's own, which is exactly the
 * "two systems own the same transform" problem the camera architecture
 * exists to avoid. AnimationWrapper handles the one-time entrance fade for
 * both the image and the text block, same as every other section.
 */
export function InsideTheGym() {
  return (
    <PageSection tone="dark" spacing="standard" className="relative overflow-hidden">
      {/* Receives WhyInfiniti's own bottom blend (dark→dark, no seam) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-16 sm:h-20 lg:h-24"
        style={{
          background: "linear-gradient(180deg, rgb(20,24,29) 0%, transparent 100%)",
        }}
      />

      <div className="relative h-[58vh] w-full overflow-hidden rounded-card sm:h-[65vh] lg:h-[82vh]">
        {/* Background Plane — the training floor photograph. */}
        <AnimationWrapper variant="fade" className="absolute inset-0">
          <CameraLayer depth="background" fill decorative>
            <div className="relative h-full w-full">
              <Image
                src="/images/sections/inside-gym/inside-gym-hero.webp"
                alt="The training floor at Infiniti Fitness — squat racks, battle ropes, and free weights in use"
                fill
                sizes="100vw"
                priority={false}
                className="object-cover object-[center_60%] sm:object-[center_58%] lg:object-[center_55%]"
              />
            </div>
          </CameraLayer>
        </AnimationWrapper>

        {/* Top scrim — only the ceiling band needs contrast help; the training
            floor itself stays fully visible below it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-2/3"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,24,29,0.85) 0%, rgba(20,24,29,0.5) 32%, rgba(20,24,29,0.15) 55%, transparent 75%)",
          }}
        />

        {/* Content Plane — eyebrow + headline + supporting line as one rigid group. */}
        <CameraGroup
          depth="content"
          className="absolute inset-x-0 top-0 flex flex-col gap-3 px-6 pt-8 sm:gap-4 sm:px-10 sm:pt-10 lg:max-w-xl lg:gap-5 lg:px-14 lg:pt-14"
        >
          <AnimationWrapper variant="fade-up">
            <Eyebrow tone="dark">Inside The Gym</Eyebrow>
          </AnimationWrapper>

          <AnimationWrapper variant="fade-up" delay={0.1}>
            <Heading level="section" as="h2" className="max-w-[16ch] text-white">
              This is where the work gets done.
            </Heading>
          </AnimationWrapper>

          <AnimationWrapper variant="fade-up" delay={0.2}>
            <BodyText size="large" className="max-w-[36ch] text-text-secondary-dark">
              Squat racks. Battle ropes. Free weights. No filler.
            </BodyText>
          </AnimationWrapper>
        </CameraGroup>
      </div>

      {/* Hands off to Facilities' own top blend (dark→light) with no gap. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-16 sm:h-20 lg:h-24"
        style={{
          background: "linear-gradient(0deg, rgb(20,24,29) 0%, transparent 100%)",
        }}
      />
    </PageSection>
  );
}
