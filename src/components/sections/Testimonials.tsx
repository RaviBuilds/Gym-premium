import { PageSection } from "@/components/layout";
import { Eyebrow, Heading, TestimonialPullQuote, TestimonialCard, ButtonLink } from "@/components/ui";
import { AnimationWrapper } from "@/components/motion";
import { getStaggerDelay } from "@/lib/design-tokens";
import { featuredTestimonials, secondaryTestimonials } from "@/content/testimonials";

/**
 * Testimonials ("Real Results") — Results As Hero Typography + Editorial
 * Proof Wall, Real Results redesign Phase 3, refined Phase 4. Tier 3 — Peak
 * per specifications/02-motion-system.md §2: the most deliberately
 * choreographed section on the page after Hero.
 *
 * The section's own name is "Real Results" — Real people. Real numbers —
 * so the two measurable results (Lalith's "10 KG in 3 months", Samba's
 * "2 years member") are the primary visual device, not a caption inside a
 * testimonial card. `TestimonialPullQuote` renders each as a Result block
 * (oversized `text-result-lg` figure + one yellow rule) composed against a
 * Quote block, arranged so the two stories share the same visual DNA
 * (`result-first` / `quote-first`) but read as two distinct editorial
 * spreads rather than a mirrored pair — Phase 4 gives Samba's column its
 * own `lg:mt-12` offset so the two stories no longer share a top shelf, and
 * gives each story's quote its own reading measure independent of its
 * column width.
 *
 * Below `lg:` both featured stories stay stacked in document order — never
 * side-by-side before 1024px, so the quote copy never gets squeezed into a
 * cramped tablet-width column split.
 *
 * The five remaining testimonials are edited down from a card grid into a
 * numbered editorial evidence field (`01`–`05`): no card shell, no shadow,
 * no equal-height boxes. Desktop rhythm is 2 / 2 / 1, built as one grid
 * with a larger row gap than column gap so the two pair-rows read as
 * distinct beats — `05` is placed at the pair-row's second column via
 * `lg:col-start-2`, not a leftover flush-left item.
 *
 * Motion is one continuous cascade — result → quote → result → quote →
 * evidence → CTA — built entirely from `AnimationWrapper` presets and the
 * existing `getStaggerDelay`, per the closed motion vocabulary. Unchanged
 * by Phase 4.
 */
export function Testimonials() {
  const lalith = featuredTestimonials[0];
  const samba = featuredTestimonials[1];

  // Continuous stagger: featured beats occupy 0 – 0.56s (4 beats @ 0.12s
  // apart — inside the 0.08s/6-item cap's spirit, widened slightly because
  // these are two-part beats, not a flat grid), evidence continues from
  // there rather than resetting to getStaggerDelay(0).
  const EVIDENCE_START = 0.68;

  return (
    <PageSection tone="light" spacing="standard" className="relative overflow-hidden">
      {/* Visual continuity — unchanged from Phase 1. Top blend dissolves the
          dark→light transition from TrainerShowcase (Ink → Surface Light).
          All layers are aria-hidden + pointer-events-none atmosphere —
          static CSS, zero motion cost. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 sm:h-24 lg:h-32"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,24,29,0.35) 0%, rgba(20,24,29,0.08) 40%, transparent 100%)",
        }}
      />
      {/* Bottom blend — Membership is now a dark, photo-backed section (a
          gym atmosphere image behind an ink scrim), so this hand-off uses
          the same "light section anticipating a dark section" strength as
          Facilities' bottom blend into TrainerShowcase, rather than the
          flat 0.05 ink-kiss used between two light sections. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 sm:h-24 lg:h-32"
        style={{
          background: "linear-gradient(0deg, rgba(20,24,29,0.18) 0%, transparent 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 130% 100% at 50% 35%, transparent 55%, rgba(20,24,29,0.06) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 35%, rgba(255,222,1,0.03) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 flex flex-col gap-20 lg:gap-28">
        <div className="flex flex-col gap-16 lg:gap-24">
          {/* Eyebrow and headline — two sequential beats. */}
          <div className="flex flex-col gap-3 text-left sm:text-center lg:items-start lg:text-left">
            <AnimationWrapper preset="small">
              <Eyebrow tone="light">Real Results</Eyebrow>
            </AnimationWrapper>
            <AnimationWrapper preset="small" delay={0.1}>
              <Heading level="section" as="h2" className="text-ink">
                Real people. Real numbers.
              </Heading>
            </AnimationWrapper>
          </div>

          {/* Featured stories — stacked in document order below lg (Revision
              1: Story 1 then Story 2, never side-by-side before 1024px, so
              the quote copy never gets squeezed into a cramped tablet
              column). At lg+, the two stories sit side-by-side as two
              columns. Phase 4: Samba's column carries an lg-only top offset
              (`lg:mt-12`) so the two stories no longer share one top shelf —
              they read as two editorial spreads rather than a mirrored pair.
              The center divider is a short, quiet rule rather than a
              full-height line: centered vertically within the featured
              region, ~60% of its height, at reduced opacity — present but
              discovered, not announced. */}
          <div className="relative flex flex-col gap-16 lg:grid lg:grid-cols-2 lg:items-start lg:gap-16">
            <div
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 hidden h-[60%] w-px -translate-x-1/2 -translate-y-1/2 bg-border-subtle/60 lg:block"
            />
            {lalith && (
              <TestimonialPullQuote
                testimonial={lalith}
                align="result-first"
                resultDelay={0.2}
                quoteDelay={0.32}
              />
            )}
            <div aria-hidden="true" className="h-px w-full bg-border-subtle lg:hidden" />
            {samba && (
              <div className="lg:mt-12">
                <TestimonialPullQuote
                  testimonial={samba}
                  align="quote-first"
                  resultDelay={0.44}
                  quoteDelay={0.56}
                />
              </div>
            )}
          </div>
        </div>

        {/* Evidence field — separated from the featured pair by a strong
            editorial break (larger gap than any internal section spacing)
            plus a full-width hairline. Phase 4: rhythm is built as one grid
            with a deliberately larger row gap (64px, `gap-y-16`) than
            column gap (32px, `gap-x-8`), so the two rows read as distinct
            editorial beats rather than one uniform grid. Item 05 is placed
            via `lg:col-start-2` — an explicit grid placement, not a magic
            margin — so it aligns with the second column used by 02 and 04
            rather than sitting flush-left as a leftover. Below lg, 05
            auto-places at column 1 (the offset is lg-only, per the
            breakpoint contract). Each fragment's own reading measure is
            capped independently of its grid cell, so the cell stays wider
            than the text and the field reads as set copy, not content
            boxes. */}
        <div className="flex flex-col gap-12 lg:gap-16">
          {/* Final micro-polish: the transition rule is now short and
              left-aligned, matching the same short-rule language already
              used under each featured result, rather than reading as a
              generic full-width section divider. Whitespace above/below is
              unchanged. */}
          <div aria-hidden="true" className="h-px w-16 bg-border-subtle/70 lg:w-24" />

          <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2">
            {secondaryTestimonials.slice(0, 4).map((testimonial, i) => (
              <AnimationWrapper key={testimonial.id} preset="small" delay={getStaggerDelay(i) + EVIDENCE_START}>
                <TestimonialCard testimonial={testimonial} index={i + 1} className="max-w-[38ch]" />
              </AnimationWrapper>
            ))}
            {secondaryTestimonials[4] && (
              <AnimationWrapper
                preset="small"
                delay={getStaggerDelay(4) + EVIDENCE_START}
                className="lg:col-start-2"
              >
                {/* Final micro-polish: item 05 gets a touch more internal
                    breathing room (gap-5, via className override — tailwind-
                    merge resolves the conflict with the component's own
                    gap-4) than the paired fragments, reinforcing that it's
                    the field's closing beat rather than a sixth grid cell
                    that happens to be alone. Position and max-w-xl width are
                    unchanged. */}
                <TestimonialCard
                  testimonial={secondaryTestimonials[4]}
                  index={5}
                  className="max-w-xl gap-5"
                />
              </AnimationWrapper>
            )}
          </div>
        </div>

        {/* CTA — the section's earned final beat. A single quiet rule marks
            the transition out of the evidence field before the button, so
            the whitespace above the CTA reads as intentional rather than
            incidental — no supporting copy added. */}
        <div className="flex flex-col items-center gap-8">
          <AnimationWrapper preset="small" delay={getStaggerDelay(5) + EVIDENCE_START}>
            <span aria-hidden="true" className="block h-0.5 w-6 bg-brand-yellow/60" />
          </AnimationWrapper>
          <AnimationWrapper preset="small" delay={getStaggerDelay(5) + EVIDENCE_START + 0.08}>
            <ButtonLink href="/#free-trial" variant="primary">
              Book Your Free Trial
            </ButtonLink>
          </AnimationWrapper>
        </div>
      </div>
    </PageSection>
  );
}
