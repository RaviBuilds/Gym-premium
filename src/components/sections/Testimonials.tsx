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
    <PageSection tone="light" spacing="standard">
      <div className="flex flex-col gap-12">
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
