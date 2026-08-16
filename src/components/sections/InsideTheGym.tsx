import Image from "next/image";
import { PageSection } from "@/components/layout";
import { Eyebrow, Heading, BodyText } from "@/components/ui";
import { AnimationWrapper, CameraGroup, CameraLayer } from "@/components/motion";

/**
 * InsideTheGym — V2 cinematic editorial beat between WhyInfiniti and
 * Facilities.
 *
 * The section is a single full-bleed photograph of the real training floor
 * with editorial text composition, answering "what does it feel like to
 * train here" through atmosphere rather than information. The dominant
 * subject (the dumbbell-row lifter) sits right-of-center; text anchors
 * to the upper-left where the image has natural low-contrast negative space
 * (exposed ceiling, pendant lights).
 *
 * V2 refinements over the prior implementation:
 *  - Scrims reworked: top-down rectangle replaced with a diagonal editorial
 *    gradient that feels like natural shadow falling across the left wall,
 *    plus a localized left-column text protector. The right-side athlete
 *    and equipment stay visually unobscured.
 *  - One editorial metadata detail: "01 — TRAINING FLOOR" at the bottom-left
 *    in tiny caption type with a short yellow rule, giving the composition
 *    a designed/branded touch without floating cards or badge stacks.
 *  - Section transitions tightened: top fade shorter/smoother; bottom dissolve
 *    uses a longer, multi-stop ramp through the Ink tone so the image melts
 *    into the next section with no visible band.
 *  - Image height slightly increased on desktop for more cinematic presence.
 *  - All motion unchanged: CameraLayer `depth="background"` handles the
 *    subtle parallax; AnimationWrapper handles entrance reveals. No new
 *    motion primitives introduced.
 */
export function InsideTheGym() {
  return (
    <PageSection
      tone="dark"
      spacing="compact"
      className="relative overflow-hidden pt-4 pb-0 lg:pt-6 lg:pb-0"
    >
      {/* Top transition — subtle emergence from the preceding dark section.
          Minimal height so there's no visible dead band. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-6 sm:h-8 lg:h-10"
        style={{
          background: "linear-gradient(180deg, rgb(20,24,29) 0%, transparent 100%)",
        }}
      />

      {/* Full-bleed image frame — breaks out of Container to reach viewport
          edges. Height tuned for cinematic presence on desktop (82vh) while
          staying practical on mobile (58vh). */}
      <div className="relative -mx-4 h-[58vh] overflow-hidden sm:-mx-6 sm:h-[64vh] lg:left-[calc(50%-50vw)] lg:mx-0 lg:h-[82vh] lg:w-screen">
        {/* Background Plane — the training floor photograph with camera-
            driven subtle parallax (depth="background" → lag 0.12, scale
            1.045→1.0). The image entrance is a plain fade — no scale pop,
            which would read as "website animation" on a full-viewport photo. */}
        <CameraLayer depth="background" fill decorative>
          <AnimationWrapper variant="fade" className="relative h-full w-full">
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

        {/* Editorial gradient — diagonal scrim that feels like natural shadow
            falling across the left wall of the gym (135deg direction) rather
            than a rectangular top-down overlay. Only darkens the text region;
            the right 50%+ stays fully transparent so the athlete and
            equipment are unobscured. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(20,24,29,0.72) 0%, rgba(20,24,29,0.45) 28%, rgba(20,24,29,0.15) 48%, transparent 65%)",
          }}
        />

        {/* Subtle top veil — just enough to ensure the eyebrow clears AA
            contrast against the brightest pendant lights in the ceiling zone.
            Shorter and lighter than V1's full-height rectangle. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[35%]"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,24,29,0.4) 0%, transparent 100%)",
          }}
        />

        {/* Content Plane — editorial text block, left-aligned with the site's
            Container padding scale. CameraGroup depth="content" gives it a
            slightly different scroll rate than the background, reinforcing
            the spatial depth without any explicit parallax animation. */}
        <CameraGroup
          depth="content"
          className="absolute inset-x-0 top-0 flex h-full flex-col justify-between px-4 pt-10 pb-8 sm:px-6 sm:pt-12 sm:pb-10 lg:max-w-2xl lg:px-12 lg:pt-16 lg:pb-14 wide:px-20"
        >
          {/* Upper text cluster */}
          <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5">
            <AnimationWrapper variant="fade-up">
              <Eyebrow tone="dark">Inside The Gym</Eyebrow>
            </AnimationWrapper>

            <AnimationWrapper variant="fade-up" delay={0.1}>
              <Heading level="section" as="h2" className="max-w-[16ch] text-white">
                This is where the work gets done.
              </Heading>
            </AnimationWrapper>

            <AnimationWrapper variant="fade-up" delay={0.2}>
              <BodyText size="standard" className="max-w-[28ch] text-text-secondary-dark">
                Squat racks. Battle ropes. Free weights. No filler.
              </BodyText>
            </AnimationWrapper>
          </div>

          {/* Editorial detail — one restrained metadata line anchored at the
              bottom-left. Tiny caption type + short yellow rule, integrated
              into the composition. This single detail lifts the section from
              "banner with text" to "designed editorial chapter" without
              introducing floating cards, badge stacks, or extra decoration. */}
          <AnimationWrapper variant="fade-up" delay={0.4}>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block h-px w-5 bg-brand-yellow"
              />
              <span className="font-body text-[11px] font-medium uppercase tracking-[0.14em] text-white/50 sm:text-xs">
                01 — Training Floor
              </span>
            </div>
          </AnimationWrapper>
        </CameraGroup>
      </div>

      {/* Bottom dissolve — multi-stop ramp through Ink so the photograph
          melts into the next section naturally. Longer than V1 (h-16→h-20
          on desktop) and uses 4 stops rather than 2 for a more gradual,
          invisible transition. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-10 sm:h-14 lg:h-20"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(20,24,29,0.4) 30%, rgba(20,24,29,0.8) 65%, rgb(20,24,29) 100%)",
        }}
      />
    </PageSection>
  );
}
