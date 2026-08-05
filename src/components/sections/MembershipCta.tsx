import { PageSection } from "@/components/layout";
import { SectionHeader, ButtonLink, PricingTierCard } from "@/components/ui";
import { AnimationWrapper } from "@/components/motion";
import { getStaggerDelay } from "@/lib/design-tokens";
import { homepagePricingTiers } from "@/content/pricing";

/**
 * MembershipCta — distinct from WhyInfiniti's single-line price teaser.
 * Where WhyInfiniti makes the "we're cheaper on purpose" argument once,
 * this section shows the actual tiers (Daily/Monthly/Yearly) so a
 * comparison shopper can see real numbers without leaving the homepage,
 * per 08-conversion-strategy.md's "surface pricing before the click"
 * guidance. Links through to the full per-branch/couples Pricing page for
 * the complete breakdown.
 */
export function MembershipCta() {
  return (
    <PageSection tone="light" spacing="standard">
      <div className="flex flex-col items-center gap-10 text-center">
        <SectionHeader
          eyebrow="Membership"
          heading="Pick your pace. Not your poison."
          body="No hidden fees, no surprise add-ons — just a straightforward plan that fits how often you train."
          tone="light"
          align="center"
        />

        <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-3">
          {homepagePricingTiers.map((tier, index) => (
            <AnimationWrapper key={tier.duration} delay={getStaggerDelay(index)}>
              <PricingTierCard tier={tier} />
            </AnimationWrapper>
          ))}
        </div>

        <AnimationWrapper>
          <ButtonLink href="/pricing" variant="primary">
            See Full Membership Plans
          </ButtonLink>
        </AnimationWrapper>
      </div>
    </PageSection>
  );
}
