"use client";

import { MessageCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { PageSection } from "@/components/layout";
import { Eyebrow, BodyText, ButtonLink, Icon, Accordion } from "@/components/ui";
import { AnimationWrapper, KineticHeadline } from "@/components/motion";
import { faqs } from "@/content/faqs";

/**
 * FAQ — LIGHT section with warm surface, visible brand texture, and the
 * question mark watermark. Visually DISTINCT from Locations (cool dark
 * blue) above it by being the page's closing light section.
 *
 * The light background makes the glass accordion panels read differently
 * (dark items on light surface vs. light items on dark surface in other
 * sections). Creates a calm, readable, trustworthy "resolution" moment
 * before the footer.
 */

const SECTION_ENTRANCE = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/** Decorative question mark watermark. */
function QuestionMarkWatermark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 280"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M60 60c0-30 25-50 55-50s50 20 50 45c0 30-20 40-35 50-10 8-15 15-15 28v12"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <rect x="105" y="175" width="12" height="12" fill="currentColor" />
    </svg>
  );
}

export function Faq() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <PageSection
      tone="light"
      spacing="standard"
      className="relative overflow-hidden"
      bleed="content"
    >
      {/* ═══════════════════════════════════════════════════════════════════
          LIGHT WARM SURFACE — distinct from Locations (cool dark) above
          ═══════════════════════════════════════════════════════════════════ */}

      {/* Top edge blend — dissolves from Locations' dark bottom */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 sm:h-24 lg:h-32"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,24,29,0.1) 0%, transparent 100%)",
        }}
      />

      {/* Warm radial glow — cozy reading-light warmth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 50% 40%, rgba(255,222,1,0.05) 0%, transparent 60%)",
        }}
      />

      {/* Subtle diagonal warmth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,222,1,0.03) 0%, transparent 40%, transparent 60%, rgba(255,222,1,0.02) 100%)",
        }}
      />

      {/* Fine grid texture — editorial feel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(20,24,29,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,24,29,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Soft vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 100% at 50% 50%, transparent 50%, rgba(20,24,29,0.04) 100%)",
        }}
      />

      {/* Question mark watermark — brand identity mark */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-start justify-end overflow-hidden">
        <QuestionMarkWatermark className="mr-[4%] mt-[5%] h-[40%] text-ink/[0.04] lg:mr-[8%] lg:h-[50%]" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          CONTENT
          ═══════════════════════════════════════════════════════════════════ */}

      <motion.div
        className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-8 px-4 sm:gap-10 sm:px-6 lg:gap-12 lg:max-w-3xl"
        initial={prefersReducedMotion ? undefined : SECTION_ENTRANCE.hidden}
        whileInView={SECTION_ENTRANCE.visible}
        viewport={{ once: true, amount: 0.1 }}
      >
        {/* ─── HEADER ─── */}
        <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
          <AnimationWrapper variant="fade-up">
            <Eyebrow tone="light">Questions</Eyebrow>
          </AnimationWrapper>

          <KineticHeadline
            as="h2"
            text="Got questions? We got answers."
            trigger="inView"
            className="font-display text-section text-ink lg:text-section-lg"
          />

          <AnimationWrapper variant="fade-up" delay={0.3}>
            <BodyText size="caption" className="mt-1 text-text-secondary">
              Membership, facilities &amp; getting started
            </BodyText>
          </AnimationWrapper>
        </div>

        {/* ─── ACCORDION ─── */}
        <div className="w-full">
          <Accordion items={faqs} className="gap-2" />
        </div>

        {/* ─── CLOSING CTA ─── */}
        <AnimationWrapper variant="fade-up" delay={0.3}>
          <div className="flex flex-col items-center gap-4 pt-4 text-center">
            <BodyText size="standard" className="text-text-secondary">
              Still have questions?
            </BodyText>
            <ButtonLink
              href="https://wa.me/919876543210"
              variant="whatsapp"
              size="compact"
              icon={<Icon icon={MessageCircle} size="sm" />}
            >
              Chat with us on WhatsApp
            </ButtonLink>
          </div>
        </AnimationWrapper>
      </motion.div>
    </PageSection>
  );
}
