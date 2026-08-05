import { PageSection } from "@/components/layout";
import { SectionHeader, TestimonialPullQuote, TestimonialCard, ButtonLink } from "@/components/ui";
import { AnimationWrapper } from "@/components/motion";
import { getStaggerDelay } from "@/lib/design-tokens";
import { featuredTestimonials, secondaryTestimonials } from "@/content/testimonials";

/**
 * Testimonials — Homepage-Architecture.md §6 Real Results.
 *
 * Two featured pull-quotes (Lalith's -10kg/3-months, Samba's 2-year tenure)
 * get the large, weighted treatment; the remaining five sit in a lighter
 * secondary grid beneath. CTA placed directly adjacent, capitalizing on
 * peak persuasion per that section's spec, rather than only bookending the
 * whole page.
 */
export function Testimonials() {
  return (
    <PageSection tone="light" spacing="standard" className="relative overflow-hidden">
      {/* Visual continuity — Phase 3. Top blend dissolves the dark→light
          transition from TrainerShowcase (Ink → Surface Light), turning the
          hard black→white cut into a soft twilight. A faint warm radial
          wash gives this light section depth parity with the premium
          sections above. All layers are aria-hidden + pointer-events-none
          atmosphere — static CSS, zero motion cost. */}
      {/* Top blend — receives TrainerShowcase's bottom blend (ink dissolve)
          and continues it into the light section. Peak opacity lowered so the
          dark hand-off reads as a gradual lift out of shadow rather than a
          visible dark band parked on white. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 sm:h-24 lg:h-32"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,24,29,0.35) 0%, rgba(20,24,29,0.08) 40%, transparent 100%)",
        }}
      />
      {/* Bottom blend — carries the light section toward MembershipCta. Both
          are light, so a pure ink kiss keeps the base grounded and matching
          the Membership/Locations/Faq vignette family. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 sm:h-24 lg:h-32"
        style={{
          background:
            "linear-gradient(0deg, rgba(20,24,29,0.05) 0%, transparent 100%)",
        }}
      />
      {/* Edge vignette — invisible perimeter depth, inherited from the other
          light sections so every light band shares the same edge treatment */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 130% 100% at 50% 35%, transparent 55%, rgba(20,24,29,0.06) 100%)",
        }}
      />
      {/* Faint warm radial wash — same rim-light technique as TrustStrip,
          kept at mood intensity so the section reads as a contained volume */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 35%, rgba(255,222,1,0.03) 0%, transparent 65%)",
        }}
      />
      <div className="relative z-10 flex flex-col gap-12">
        <SectionHeader eyebrow="Real Results" heading="Real people. Real numbers." tone="light" />

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {featuredTestimonials.map((testimonial, index) => (
            <AnimationWrapper key={testimonial.id} variant="scale-in-settle" delay={getStaggerDelay(index)}>
              <TestimonialPullQuote testimonial={testimonial} />
            </AnimationWrapper>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {secondaryTestimonials.map((testimonial, index) => (
            <AnimationWrapper key={testimonial.id} delay={getStaggerDelay(index)}>
              <TestimonialCard testimonial={testimonial} />
            </AnimationWrapper>
          ))}
        </div>

        <AnimationWrapper className="self-center">
          <ButtonLink href="/#free-trial" variant="primary">
            Book Your Free Trial
          </ButtonLink>
        </AnimationWrapper>
      </div>
    </PageSection>
  );
}
