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
    <PageSection tone="light" spacing="standard">
      <div className="mx-auto flex max-w-2xl flex-col gap-10">
        <SectionHeader eyebrow="Questions" heading="Frequently asked questions" tone="light" align="center" />
        <AnimationWrapper>
          <Accordion items={faqs} />
        </AnimationWrapper>
      </div>
    </PageSection>
  );
}
