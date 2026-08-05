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
    <PageSection tone="dark" spacing="standard" className="relative overflow-hidden">
      {/* Visual continuity — Phase 3. Top blend dissolves the light→dark
          transition from Faq (Surface Light → Ink), turning the hard
          white→black cut into a soft twilight. A radial yellow glow behind
          the headline (per the FinalCta spec §5) gives this closing moment
          visual distinction from the flat utility band it shared with Faq.
          All layers are aria-hidden + pointer-events-none atmosphere —
          static CSS, zero motion cost. */}
      {/* Top blend — receives Faq's bottom blend (ink dissolve) and continues
          it into the dark section. Pure ink, no surface-light tint: the
          previous light component painted a visible light strip on the dark
          canvas, which read as "a banner pasted on top" rather than the dark
          arriving naturally. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 sm:h-24 lg:h-32"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,24,29,0.4) 0%, rgba(20,24,29,0.15) 45%, transparent 100%)",
        }}
      />
      {/* Radial yellow glow behind the headline — soft, low-opacity, enough
          to distinguish this section from a plain utility band without
          competing with the photography or adding new color */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 35%, rgba(255,222,1,0.06) 0%, transparent 65%)",
        }}
      />
      {/* Edge vignette — invisible perimeter depth, inherited from the other
          dark sections so the closing band shares the same edge treatment */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 130% 100% at 50% 40%, transparent 55%, rgba(20,24,29,0.22) 100%)",
        }}
      />
      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
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
