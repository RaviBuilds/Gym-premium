import { PageSection } from "@/components/layout";
import { SectionHeader, CardGrid, TrainerCard } from "@/components/ui";
import { trainers } from "@/content/trainers";

/**
 * TrainerShowcase — Homepage-Architecture.md §5 Meet the Trainers.
 *
 * Six real, named trainers with real titles — pre-answers "will I actually
 * get real coaching at this price" before a visitor has to ask, per
 * 06-storytelling-blueprint.md. Wajeed's "Mr Nizamabad" competitive title
 * is surfaced as a visible Badge on his card, not buried plain text.
 *
 * Tone flipped to dark for the elevation pass — breaks up what was
 * otherwise five consecutive light sections in a row (Programs through
 * Faq), and dark contrast around confident portrait photography reads more
 * "elite coach" than the neutral light background did. TrainerCard's own
 * card is always a white surface regardless of section tone (Card.tsx's
 * `bg-surface-card` is fixed), so no card-internal color changes are needed
 * — only the section wrapper and SectionHeader's tone prop change here.
 */
export function TrainerShowcase() {
  return (
    <PageSection tone="dark" spacing="standard">
      <div className="flex flex-col gap-10">
        <SectionHeader eyebrow="Train With Experts" heading="Six trainers. Zero guesswork." tone="dark" />
        <CardGrid columns={3}>
          {trainers.map((trainer) => (
            <TrainerCard key={trainer.slug} trainer={trainer} />
          ))}
        </CardGrid>
      </div>
    </PageSection>
  );
}
