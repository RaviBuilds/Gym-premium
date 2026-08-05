import { PageSection } from "@/components/layout";
import { Heading, BodyText, ButtonLink } from "@/components/ui";
import { AnimationWrapper } from "@/components/motion";
import { siteConfig } from "@/config/site";

/**
 * FinalCta — Homepage-Architecture.md §9 Final CTA Band.
 *
 * Reprise of the live site's existing "commit to health and fitness...
 * challenge yourself" footer-CTA energy (kept — "it already has the right
 * tone" per that section's spec), paired with three CTAs: Free Trial
 * (primary), Membership Plans (secondary), WhatsApp (tertiary) — the third
 * option meeting this audience on a channel they already use, per
 * 08-conversion-strategy.md.
 */
export function FinalCta() {
  return (
    <PageSection tone="dark" spacing="standard">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <AnimationWrapper>
          <Heading level="section" as="h2" className="text-white">
            Commit to health and fitness.
          </Heading>
        </AnimationWrapper>
        <AnimationWrapper delay={0.1}>
          <BodyText size="large" className="text-text-secondary-dark">
            Challenge yourself. Take it to the next level.
          </BodyText>
        </AnimationWrapper>
        <AnimationWrapper delay={0.2}>
          <div className="flex flex-col gap-4 sm:flex-row">
            <ButtonLink href="/#free-trial" variant="primary">
              Book Free Trial
            </ButtonLink>
            <ButtonLink href="/pricing" variant="secondary" className="text-white">
              View Membership Plans
            </ButtonLink>
            <ButtonLink href={siteConfig.links.whatsapp} variant="whatsapp">
              Message Us on WhatsApp
            </ButtonLink>
          </div>
        </AnimationWrapper>
      </div>
    </PageSection>
  );
}
