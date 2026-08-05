import Image from "next/image";
import { PageSection } from "@/components/layout";
import { SectionHeader, Heading, BodyText, Icon } from "@/components/ui";
import { AnimationWrapper, ParallaxLayer } from "@/components/motion";
import { getStaggerDelay } from "@/lib/design-tokens";
import { facilities } from "@/content/facilities";

/**
 * Facilities — Homepage-Architecture.md nav calls for a distinct
 * "Facilities" section separate from the Programs (training disciplines)
 * grid. Covers physical amenities — equipment, steam room, café, lockers,
 * biometric entry, parking — real facts already documented in the FAQ
 * audit (01-business-analysis.md), not training content.
 *
 * The banner between the heading and icon grid uses a real, individually
 * verified Infiniti Fitness photo (Rethibowli's functional/crossfit zone —
 * pull-up rig, battle ropes, kettlebells) rather than another icon or stock
 * image, per the elevation brief's "immersive photography" mandate. Kept at
 * the section's content width (not a viewport-edge bleed) to avoid the
 * horizontal-scroll risk of the `100vw` full-bleed trick when a vertical
 * scrollbar is present — still reads as a large, dramatic banner relative
 * to the icon grid beneath it. ParallaxLayer gives it the same subtle
 * scroll-linked drift as the Hero photo, disabled on mobile/reduced-motion
 * like every other use of that component.
 */
export function Facilities() {
  return (
    <PageSection tone="light" spacing="standard" className="relative overflow-hidden">
      {/* Visual continuity — Phase 3. Top blend dissolves the dark→light
          transition from WhyInfiniti (Ink → Surface Light), bottom blend
          dissolves the light→dark transition into TrainerShowcase. A faint
          neutral vignette gives this flat light section depth parity with
          the premium sections above/below. All layers are aria-hidden +
          pointer-events-none atmosphere — static CSS, zero motion cost. */}
      {/* Top blend — receives WhyInfiniti's dark tone and dissolves into the
          light section, turning the hard black→white cut into a soft twilight.
          Peak opacity lowered so the dark hand-off reads as a gradual lift
          out of shadow rather than a visible dark band parked on white. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 sm:h-24 lg:h-32"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,24,29,0.45) 0%, rgba(20,24,29,0.1) 40%, transparent 100%)",
        }}
      />
      {/* Bottom blend — carries the light section into TrainerShowcase's dark
          top. Strength matches TrainerShowcase's top blend so the dark return
          is anticipated here, not pasted on below. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 sm:h-24 lg:h-32"
        style={{
          background:
            "linear-gradient(0deg, rgba(20,24,29,0.18) 0%, transparent 100%)",
        }}
      />
      {/* Edge vignette — invisible perimeter depth so the section reads as a
          contained volume rather than a flat white field */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 130% 100% at 50% 35%, transparent 55%, rgba(20,24,29,0.06) 100%)",
        }}
      />
      {/* Warm radial wash — inherited from the Testimonials light section so
          every light section shares the same warm ambient light source, not a
          different temperature per band. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 35%, rgba(255,222,1,0.03) 0%, transparent 65%)",
        }}
      />
      <div className="relative z-10 flex flex-col gap-10">
        <SectionHeader
          eyebrow="Inside The Gym"
          heading="Everything you need, nothing you're paying extra for"
          tone="light"
        />

        <AnimationWrapper variant="fade">
          <ParallaxLayer
            className="relative h-56 overflow-hidden rounded-card sm:h-72 lg:h-96"
            disableOnMobile
          >
            <Image
              src="/images/atmosphere/rethibowli-functional.jpg"
              alt="The functional training zone at Infiniti Fitness Rethibowli — pull-up rig, battle ropes, and kettlebells"
              fill
              sizes="(min-width: 1024px) 1152px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-ink/15" />
          </ParallaxLayer>
        </AnimationWrapper>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((facility, index) => (
            <AnimationWrapper key={facility.title} delay={getStaggerDelay(index)}>
              <div className="flex flex-col gap-3">
                <Icon icon={facility.icon} size="lg" className="text-brand-yellow" />
                <Heading level="subsection" as="h3" className="text-ink">
                  {facility.title}
                </Heading>
                <BodyText size="standard" className="text-text-secondary">
                  {facility.description}
                </BodyText>
              </div>
            </AnimationWrapper>
          ))}
        </div>
      </div>
    </PageSection>
  );
}
