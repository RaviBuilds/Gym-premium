import { PageSection } from "@/components/layout";
import { SectionHeader, Accordion } from "@/components/ui";
import { AnimationWrapper } from "@/components/motion";
import { faqs } from "@/content/faqs";

/**
 * Faq — Homepage-Architecture.md nav (FAQ listed among primary sections).
 * Six real, homepage-relevant questions pulled from the live site's larger
 * 21-item FAQ, avoiding repetition with content already covered elsewhere
 * (pricing philosophy in WhyInfiniti, hours in Locations).
 */
export function Faq() {
  return (
    <PageSection tone="light" spacing="standard" className="relative overflow-hidden">
      {/* Visual continuity — Phase 3. Bottom blend dissolves the light→dark
          transition into FinalCta (Surface Light → Ink), turning the hard
          white→black cut into a soft twilight. A faint neutral vignette
          gives this light section depth parity with the premium sections.
          All layers are aria-hidden + pointer-events-none atmosphere —
          static CSS, zero motion cost. */}
      {/* Top blend — receives Locations' bottom blend (light ink kiss) and
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
      {/* Edge vignette — invisible perimeter depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 130% 100% at 50% 35%, transparent 55%, rgba(20,24,29,0.04) 100%)",
        }}
      />
      {/* Warm radial wash — inherited from the other light sections so every
          light band shares the same warm ambient light source. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 35%, rgba(255,222,1,0.03) 0%, transparent 65%)",
        }}
      />
      {/* Bottom blend — carries the light section into FinalCta's dark top.
          Strength matches FinalCta's top blend so the dark return is
          anticipated here, not pasted on below. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 sm:h-24 lg:h-32"
        style={{
          background:
            "linear-gradient(0deg, rgba(20,24,29,0.3) 0%, transparent 100%)",
        }}
      />
      <div className="relative z-10 mx-auto flex max-w-2xl flex-col gap-10">
        <SectionHeader eyebrow="Questions" heading="Frequently asked questions" tone="light" align="center" />
        <AnimationWrapper>
          <Accordion items={faqs} />
        </AnimationWrapper>
      </div>
    </PageSection>
  );
}
