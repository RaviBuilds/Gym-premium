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
    <PageSection tone="dark" spacing="standard" className="relative overflow-hidden">
      {/*
        Visual continuity — Phase 3. Receives Programs' ending tone
        (rgb(28,31,36), the last stop of Programs' section gradient) via a
        top fade so the dark→dark step dissolves instead of landing as a flat
        band beside Programs' richer atmospheric canvas. A low-opacity warm
        radial glow gives this otherwise-flat dark section depth parity with
        Hero/TrustStrip/Programs (per 01 §1 "Depth overlays": directional
        gradients of Ink/Brand Yellow at reduced opacity, never flat tints).
        All layers are aria-hidden + pointer-events-none atmosphere — they
        never affect content, spacing, or a11y, and add zero motion (static
        CSS only, automatically safe under prefers-reduced-motion).
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 sm:h-24 lg:h-32"
        style={{
          background:
            "linear-gradient(180deg, rgb(28,31,36) 0%, transparent 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 30% 45%, rgba(255,222,1,0.04) 0%, transparent 65%)",
        }}
      />
      {/* Edge vignette — invisible perimeter depth so the section reads as a
          contained volume rather than a flat fill */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 130% 100% at 50% 40%, transparent 55%, rgba(20,24,29,0.22) 100%)",
        }}
      />
      {/* Warm lift at the bottom edge — carries warm lighting into the
          dark→light dissolve that Facilities' top blend completes below */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-14 sm:h-16 lg:h-24"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(255,222,1,0.03) 100%)",
        }}
      />
      <div className="relative mx-auto flex max-w-2xl flex-col gap-6">
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
