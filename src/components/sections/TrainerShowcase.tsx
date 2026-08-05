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
    <PageSection tone="dark" spacing="standard" className="relative overflow-hidden">
      {/* Visual continuity — Phase 3. Top blend dissolves the light→dark
          transition from Facilities (Surface Light → Ink), bottom blend
          dissolves the dark→light transition into Testimonials. A faint
          warm radial glow gives the dark section depth parity with
          Hero/TrustStrip/Programs. All layers are aria-hidden +
          pointer-events-none atmosphere — static CSS, zero motion cost. */}
      {/* Top blend — receives Facilities' bottom blend (ink dissolve) and
          continues it into the dark section. Pure ink, no surface-light tint:
          the previous light component painted a visible light strip on the
          dark canvas, which read as "a banner pasted on top" rather than the
          dark arriving naturally. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 sm:h-24 lg:h-32"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,24,29,0.4) 0%, rgba(20,24,29,0.15) 45%, transparent 100%)",
        }}
      />
      {/* Bottom blend — carries the dark section into Testimonials' light
          top. Strength matches Testimonials' top blend so the light return
          is anticipated here, not pasted on below. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 sm:h-24 lg:h-32"
        style={{
          background:
            "linear-gradient(0deg, rgba(20,24,29,0.35) 0%, transparent 100%)",
        }}
      />
      {/* Warm radial glow — same rim-light technique as TrustStrip, kept at
          mood intensity so the dark section reads as a contained volume */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(255,222,1,0.04) 0%, transparent 65%)",
        }}
      />
      {/* Edge vignette — invisible perimeter depth, inherited from the other
          dark sections so every dark band shares the same edge treatment */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 130% 100% at 50% 40%, transparent 55%, rgba(20,24,29,0.22) 100%)",
        }}
      />
      <div className="relative z-10 flex flex-col gap-10">
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
