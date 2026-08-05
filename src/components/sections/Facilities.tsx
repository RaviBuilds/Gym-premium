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
    <PageSection tone="light" spacing="standard">
      <div className="flex flex-col gap-10">
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
