import Image from "next/image";
import { PageSection } from "@/components/layout";
import { StatCounter } from "@/components/ui";
import { AnimationWrapper, AnimatedDivider } from "@/components/motion";
import { getStaggerDelay } from "@/lib/design-tokens";

/**
 * TrustStrip — Homepage-Architecture.md §2 Trust Strip.
 *
 * Real numbers only (siteConfig.foundedYear, program/branch/trainer counts
 * — all traceable to actual content elsewhere on this page), no CTA — a
 * deliberate visual pause after the Hero's intensity, per that section's
 * spec. "Since 2016" uses variant="static" per StatCounter's own doc
 * comment: a year shouldn't roll through every intermediate value.
 *
 * The section's signature move is the top accent rule: a single yellow
 * line draws itself left-to-right the instant this section enters view —
 * a "curtain opening on the credentials" beat that reads as this section's
 * own moment rather than another instance of the fade-up every section
 * uses. Every stat then lands in the same left-to-right sequence beneath
 * it (§10: "staggered slightly left-to-right"). No per-stat icon (elevation
 * pass removed it — a small line icon read as a generic dashboard-widget
 * tell rather than premium); the number alone is the anchor now. Vertical
 * dividers between stats (desktop only) grow into place on scroll rather
 * than appearing as a static border.
 *
 * Atmosphere comes from two low-opacity layers rather than any icon or
 * card treatment: a near-invisible training-energy texture (8% opacity,
 * grayscale, heavily blurred) plus a soft off-center radial glow — the
 * same rim-light technique Hero uses for its own atmosphere, at a much
 * lower intensity so it stays a mood, not a light source competing with
 * the numbers.
 *
 * Spacing stays on "compact" (not "standard") deliberately: the Hero
 * already ends on its own dark fade, so this section needs a tight,
 * confident band directly under it, not a second stretch of empty ink.
 */
const stats = [
  { value: 2016, label: "Since", variant: "static" as const },
  { value: 2, label: "Hyderabad Locations" },
  { value: 9, label: "Training Disciplines" },
  { value: 6, label: "Dedicated Trainers" },
];

export function TrustStrip() {
  return (
    <PageSection tone="dark" spacing="compact" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 scale-110 opacity-[0.08] grayscale blur-2xl"
      >
        <Image src="/training-energy-banner.webp" alt="" fill className="object-cover" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(255,222,1,0.05) 0%, transparent 65%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink via-transparent to-ink"
      />

      <AnimatedDivider
        orientation="horizontal"
        className="relative mx-auto mb-10 h-px w-16 bg-brand-yellow lg:mb-12 lg:w-24"
      />

      <div className="relative grid grid-cols-2 gap-y-12 lg:grid-cols-4 lg:divide-x lg:divide-border-dark lg:gap-y-0">
        {stats.map((stat, index) => (
          <AnimationWrapper key={stat.label} delay={getStaggerDelay(index) + 0.15} className="lg:px-8">
            <StatCounter value={stat.value} label={stat.label} variant={stat.variant} />
          </AnimationWrapper>
        ))}
      </div>
    </PageSection>
  );
}
