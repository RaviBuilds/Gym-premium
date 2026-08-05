import { PageSection } from "@/components/layout";
import { SectionHeader, LocationCard } from "@/components/ui";
import { AnimationWrapper } from "@/components/motion";
import { locations } from "@/content/locations";

/**
 * Locations — Homepage-Architecture.md §7 Two Locations, One Standard.
 *
 * Resolves branch-choice friction currently invisible until the live
 * site's footer — Rethibowli's ladies-only slot surfaced as a visible
 * Badge on its card, not a footnote. Cards slide in from opposite sides
 * (Gachibowli left, Rethibowli right) per §10 Motion Design's "two
 * locations, one brand" metaphor — implemented here via a plain
 * directional fade rather than AnimationWrapper's shared fade-up variant,
 * since this is the one section-specific motion beat the spec calls out by
 * name and doesn't fit the generic vocabulary.
 */
export function Locations() {
  return (
    <PageSection tone="light" spacing="standard" className="relative overflow-hidden">
      {/* Visual continuity — Phase 3. A faint edge vignette gives this
          light section depth parity with the premium sections — the location
          cards read as grounded rather than floating on a flat white field.
          No edge blends needed (both neighbors are light → light). All
          layers are aria-hidden + pointer-events-none atmosphere — static
          CSS, zero motion cost. */}
      {/* Top blend — receives MembershipCta's bottom blend (light ink kiss)
          and continues the light→light seam so the two light bands read as
          one continuous surface rather than two stacked panels. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 sm:h-24 lg:h-32"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,24,29,0.05) 0%, transparent 100%)",
        }}
      />
      {/* Bottom blend — carries the light section toward Faq. Both are light,
          so a pure ink kiss keeps the base grounded. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 sm:h-24 lg:h-32"
        style={{
          background:
            "linear-gradient(0deg, rgba(20,24,29,0.05) 0%, transparent 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 130% 100% at 50% 35%, transparent 55%, rgba(20,24,29,0.04) 100%)",
        }}
      />
      {/* Warm radial wash — inherited from Facilities/Testimonials/Membership
          so every light section shares the same warm ambient light source. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 35%, rgba(255,222,1,0.03) 0%, transparent 65%)",
        }}
      />
      <div className="relative z-10 flex flex-col gap-10">
        <SectionHeader eyebrow="Two Locations" heading="Two gyms. One standard." tone="light" />
        <div className="grid gap-8 lg:grid-cols-2">
          {locations.map((location, index) => (
            <AnimationWrapper
              key={location.branchKey}
              variant={index === 0 ? "slide-in-left" : "slide-in-right"}
            >
              <LocationCard location={location} />
            </AnimationWrapper>
          ))}
        </div>
      </div>
    </PageSection>
  );
}
