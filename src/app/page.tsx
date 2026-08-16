import {
  Hero,
  TrustStrip,
  Programs,
  WhyInfiniti,
  CommitCta,
  InsideTheGym,
  Facilities,
  TrainerShowcase,
  Testimonials,
  MembershipCta,
  Locations,
  Faq,
} from "@/components/sections";

/**
 * Homepage — assembles every section in the scroll order defined by
 * Homepage-Architecture.md: Hero → Trust Strip → Programs → Why Infiniti
 * (Philosophy) → Commit CTA → Inside The Gym → Facilities → Trainer
 * Showcase → Testimonials → Membership CTA → Locations → FAQ → Final CTA.
 *
 * Commit CTA sits between Philosophy and Inside The Gym as a bright
 * energy break separating two consecutive dark photo-backed sections.
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
      <CommitCta />
      <InsideTheGym />
      <Facilities />
      <TrainerShowcase />
      <Testimonials />
      <MembershipCta />
      <Locations />
      <Faq />
    </>
  );
}
