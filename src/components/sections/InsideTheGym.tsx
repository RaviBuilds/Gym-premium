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
 * Refinement pass: the image now breaks out of the Container to reach both
 * viewport edges — the exact `lg:left-[calc(50%-50vw)] lg:w-screen`
 * full-bleed technique WhyInfiniti already uses, so this isn't a new layout
 * mechanism, just the proven one applied here too. `overflow-hidden` on the
 * PageSection (below) is what keeps that breakout from ever causing
 * horizontal scroll. No rounded corners on the frame anymore — corners
 * touching the viewport edge shouldn't be rounded, and the rounding was
 * part of why the image used to read as a floating card rather than an
 * integrated page surface.
 *
 * Image composition note: the photo's only clean, low-contrast band runs
 * across the top third (exposed ceiling, pendant lights) — every other
 * region has a lifter or a loaded rack in it. That's why the title block is
 * top-anchored with a top-down scrim, unlike WhyInfiniti's left-side gradient
 * (that image had a clean left column instead). Different image, different
 * negative space, different treatment — not a copy-paste of the WhyInfiniti
 * pattern. The dominant, sharpest subject (the dumbbell-row lifter) sits
 * right-of-center in the source frame, which is why the mobile crop below
 * biases right instead of using a blind center crop that would lose him on
 * a narrow viewport.
 *
 * Motion: reuses the existing camera depth vocabulary exactly as WhyInfiniti
 * and TrustStrip do — CameraLayer depth="background" already gives a
 * 1.045→1.0 dolly and scroll-linked drift, which is the "subtle scale +
 * crop shift" the brief asks for. No new scroll engine, no sticky/pinned
 * layout: a pinned composition would need a second independent scroll
 * subscription running alongside the camera's own, which is exactly the
 * "two systems own the same transform" problem the camera architecture
 * exists to avoid. The entrance scale (`scale-in-settle`, 1.06→1.0) is
 * nested INSIDE CameraLayer, wrapping only the <Image> — not wrapping
 * CameraLayer itself — for the same reason WhyInfiniti's own comment
 * documents: transforming the element CameraLayer measures would feed the
 * camera's own measurement while the entrance plays. AnimationWrapper
 * handles the one-time entrance for the image and for each line of text,
 * same as every other section; none of that shared file is modified here.
 */
export function InsideTheGym() {
  return (
    <PageSection tone="dark" spacing="compact" className="relative overflow-hidden">
      {/* Short, deliberate emergence out of WhyInfiniti's dark tone — no hard
          edge, no gap-then-band. Tightened from the previous pass's larger
          band now that section spacing itself is also tighter. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-10 sm:h-12 lg:h-16"
        style={{
          background: "linear-gradient(180deg, rgb(20,24,29) 0%, transparent 100%)",
        }}
      />

      <div className="relative -mx-4 h-[56vh] overflow-hidden sm:-mx-6 sm:h-[62vh] lg:left-[calc(50%-50vw)] lg:mx-0 lg:h-[78vh] lg:w-screen">
        {/* Background Plane — the training floor photograph. */}
        <CameraLayer depth="background" fill decorative>
          <AnimationWrapper variant="scale-in-settle" className="relative h-full w-full">
            <Image
              src="/images/sections/inside-gym/inside-gym-hero.webp"
              alt="The training floor at Infiniti Fitness — squat racks, battle ropes, and free weights in use"
              fill
              sizes="100vw"
              priority={false}
              className="object-cover object-[70%_60%] sm:object-[65%_58%] lg:object-[center_55%]"
            />
          </AnimationWrapper>
        </CameraLayer>

        {/* Top scrim — lightened from the previous pass. Only enough to lift
            the eyebrow/headline/body to AA contrast; the gym's own warm
            practical lighting stays visible below it. Purely for text
            readability, not for darkening the photograph. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,24,29,0.68) 0%, rgba(20,24,29,0.32) 45%, transparent 100%)",
          }}
        />

        {/* Content Plane — eyebrow + headline + supporting line as one rigid
            group, aligned to the site's real Container padding scale so the
            text column lines up with WhyInfiniti's and Facilities' copy
            rather than using arbitrary spacing of its own. */}
        <CameraGroup
          depth="content"
          className="absolute inset-x-0 top-0 flex flex-col gap-3 px-4 pt-8 sm:gap-4 sm:px-6 sm:pt-10 lg:max-w-xl lg:gap-5 lg:px-12 lg:pt-14 wide:px-20"
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
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-10 sm:h-12 lg:h-16"
        style={{
          background: "linear-gradient(0deg, rgb(20,24,29) 0%, transparent 100%)",
        }}
      />
    </PageSection>
  );
}
