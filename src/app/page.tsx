import {
  Hero,
  TrustStrip,
  Programs,
  WhyInfiniti,
  InsideTheGym,
  Facilities,
  TrainerShowcase,
  Testimonials,
  MembershipCta,
  Locations,
  Faq,
  FinalCta,
} from "@/components/sections";

/**
 * Homepage — assembles every section in the scroll order defined by
 * Homepage-Architecture.md: Hero → Trust Strip → Programs → Why Infiniti
 * (Philosophy) → Inside The Gym → Facilities → Trainer Showcase →
 * Testimonials → Membership CTA → Locations → FAQ → Final CTA. Inside The
 * Gym is a single cinematic editorial beat (not a card/grid section) that
 * bridges the philosophy statement into the concrete amenities list.
 * Navbar/Footer/StickyMobileCTA render in the root layout, not here, since
 * they're persistent chrome rather than scroll sections.
 *
 * This is a Server Component (no "use client") — every section here is
 * either itself a Server Component or a thin Server Component wrapper
 * around client-only interactive pieces (Accordion, forms, motion), so the
 * page ships minimal hydration JS rather than marking the entire tree
 * client-side (§14 Performance: "minimize hydration").
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Programs />
      <WhyInfiniti />
      <InsideTheGym />
      <Facilities />
      <TrainerShowcase />
      <Testimonials />
      <MembershipCta />
      <Locations />
      <Faq />
      <FinalCta />
    </>
  );
}
