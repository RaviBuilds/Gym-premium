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
    <PageSection tone="light" spacing="standard" className="relative overflow-hidden">
      {/* Visual continuity — Phase 3. A faint neutral vignette gives this
          light section depth parity with the premium sections — the pricing
          cards read as grounded rather than floating on a flat white field.
          No edge blends needed (both neighbors are light → light). All
          layers are aria-hidden + pointer-events-none atmosphere — static
          CSS, zero motion cost. */}
      {/* Top blend — receives Testimonials' bottom blend (light ink kiss) and
          continues the light→light seam so the two light bands read as one
          continuous surface rather than two stacked panels. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 sm:h-24 lg:h-32"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,24,29,0.05) 0%, transparent 100%)",
        }}
      />
      {/* Bottom blend — carries the light section toward Locations. Both are
          light, so a pure ink kiss keeps the base grounded. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 sm:h-24 lg:h-32"
        style={{
          background:
            "linear-gradient(0deg, rgba(20,24,29,0.05) 0%, transparent 100%)",
        }}
      />
      {/* Edge vignette — invisible perimeter depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 130% 100% at 50% 35%, transparent 55%, rgba(20,24,29,0.04) 100%)",
        }}
      />
      {/* Warm radial wash — inherited from Facilities/Testimonials so every
          light section shares the same warm ambient light source. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 35%, rgba(255,222,1,0.03) 0%, transparent 65%)",
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-10 text-center">
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
