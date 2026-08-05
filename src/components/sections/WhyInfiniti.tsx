import { PageSection } from "@/components/layout";
import { Eyebrow, Heading, BodyText, PricingTeaserCallout } from "@/components/ui";
import { AnimationWrapper } from "@/components/motion";

/**
 * WhyInfiniti — Homepage-Architecture.md §4 Philosophy / Value Story.
 *
 * Converts the live site's defensive FAQ answer ("what's the catch?" / "our
 * main motto is to focus on providing best fitness benefits... rather than
 * fancy services like sauna, spa, pool") into a confident, proactive
 * statement — per 06-storytelling-blueprint.md: "say the quiet part out
 * loud... own it." Pricing surfaces here, on the homepage itself, rather
 * than staying hidden behind a Pricing-page click — the single highest-
 * leverage content change identified in 12-redesign-recommendations.md.
 */
export function WhyInfiniti() {
  return (
    <PageSection tone="dark" spacing="standard">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <AnimationWrapper>
          <Eyebrow tone="dark">Our Philosophy</Eyebrow>
        </AnimationWrapper>
        <AnimationWrapper delay={0.1}>
          <Heading level="section" as="h2" className="text-white">
            We cut the spa. Not the results.
          </Heading>
        </AnimationWrapper>
        <AnimationWrapper delay={0.2}>
          <BodyText size="large" className="text-text-secondary-dark">
            No sauna. No pool. No paper towels. We skip the expensive extras so training stays
            genuinely affordable — real trainers, imported equipment, and honest pricing, without
            the markup that pays for amenities most members never use.
          </BodyText>
        </AnimationWrapper>
        <AnimationWrapper delay={0.3}>
          <PricingTeaserCallout priceText="Memberships from ₹199/day" className="mt-2" />
        </AnimationWrapper>
      </div>
    </PageSection>
  );
}
