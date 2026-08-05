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
    <PageSection tone="light" spacing="standard" className="overflow-hidden">
      <div className="flex flex-col gap-10">
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
