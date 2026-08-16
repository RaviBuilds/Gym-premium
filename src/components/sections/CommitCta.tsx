"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { PageSection } from "@/components/layout";
import { BodyText, ButtonLink } from "@/components/ui";
import { AnimationWrapper, MagneticButton, KineticHeadline } from "@/components/motion";
import { siteConfig } from "@/config/site";

/**
 * CommitCta — "Athlete Statement" between WhyInfiniti and InsideTheGym.
 *
 * Light section with a dramatic transparent-background athlete image
 * anchored to the right, cropped at thigh level at the section baseline.
 * Text and CTAs sit left-aligned, creating a magazine editorial layout.
 *
 * The athlete image gives this section visual WEIGHT and human presence
 * that makes it impossible to scroll past — it's no longer "just text
 * on white." The transparent PNG composites directly onto the light
 * surface with subtle shadow/glow effects.
 */

const SECTION_ENTRANCE = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/** Large infinity loop — brand identity mark behind content. */
function InfinityDecor({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 50" fill="none" className={className} aria-hidden="true">
      <path
        d="M70 25c0 0-12-16-28-16-10 0-22 8-22 16s12 16 22 16c16 0 28-16 28-16s12 16 28 16c10 0 22-8 22-16s-12-16-22-16c-16 0-28 16-28 16z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CommitCta() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <PageSection
      tone="light"
      spacing="compact"
      className="relative overflow-hidden py-20 sm:py-24 lg:py-32"
      bleed="content"
    >
      {/* ═══════════════════════════════════════════════════════════════════
          BACKGROUND TREATMENTS
          ═══════════════════════════════════════════════════════════════════ */}

      {/* Bold brand-yellow top accent stripe */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-brand-yellow sm:h-1.5"
      />

      {/* Warm diagonal gradient — adds depth to white */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,222,1,0.05) 0%, transparent 35%, transparent 65%, rgba(255,222,1,0.03) 100%)",
        }}
      />

      {/* Radial glow behind the text area (left-biased) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 30% 50%, rgba(255,222,1,0.06) 0%, transparent 55%)",
        }}
      />

      {/* Subtle geometric grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(20,24,29,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,24,29,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Top edge blend */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-12 sm:h-16 lg:h-20"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,24,29,0.06) 0%, transparent 100%)",
        }}
      />

      {/* Bottom edge blend */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-12 sm:h-16 lg:h-20"
        style={{
          background:
            "linear-gradient(0deg, rgba(20,24,29,0.06) 0%, transparent 100%)",
        }}
      />

      {/* Faint infinity mark behind content */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center lg:justify-start lg:pl-[15%]"
      >
        <InfinityDecor className="h-auto w-64 text-brand-yellow/[0.05] sm:w-80 lg:w-96" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          ATHLETE IMAGE — zoomed in, dominant, cropped at upper thigh
          Muscles and body dominate the right side of the section.
          ═══════════════════════════════════════════════════════════════════ */}

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-[-5%] z-[2] h-[120%] w-[70%] sm:right-[-2%] sm:h-[115%] sm:w-[60%] lg:right-0 lg:h-[110%] lg:w-[55%] xl:w-[50%]"
        initial={prefersReducedMotion ? undefined : { opacity: 0, x: 60, scale: 0.95 }}
        whileInView={{ opacity: 1, x: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] as const, delay: 0.2 }}
      >
        {/* Dramatic backlight glow — makes the athlete pop off the surface */}
        <div
          className="absolute inset-0"
          style={{
            background: [
              // Main warm spotlight behind the torso
              "radial-gradient(ellipse 50% 55% at 50% 45%, rgba(255,222,1,0.18) 0%, rgba(255,222,1,0.06) 40%, transparent 65%)",
              // Secondary cooler rim light (subtle blue edge)
              "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(180,200,240,0.08) 0%, transparent 55%)",
              // Outer soft shadow halo
              "radial-gradient(ellipse 70% 75% at 50% 50%, rgba(20,24,29,0.1) 0%, transparent 60%)",
            ].join(", "),
          }}
        />
        {/* Concentrated bright spot directly behind shoulders/chest */}
        <div
          className="absolute left-[20%] right-[20%] top-[15%] bottom-[35%]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,222,1,0.12) 0%, rgba(255,240,150,0.05) 40%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
        <Image
          src="/athelete.png"
          alt=""
          fill
          sizes="(min-width: 1024px) 50vw, 65vw"
          className="object-cover object-[center_20%] opacity-15 sm:opacity-25 lg:opacity-100"
        />
        {/* Bottom fade — melts into baseline cleanly */}
        <div
          className="absolute inset-x-0 bottom-0 h-20 sm:h-24 lg:h-28"
          style={{
            background:
              "linear-gradient(0deg, rgba(250,249,246,1) 0%, rgba(250,249,246,0.9) 30%, rgba(250,249,246,0.5) 60%, transparent 100%)",
          }}
        />
        {/* Left fade — athlete dissolves into the text area */}
        <div
          className="absolute inset-y-0 left-0 w-24 sm:w-32 lg:w-40"
          style={{
            background:
              "linear-gradient(90deg, rgba(250,249,246,1) 0%, rgba(250,249,246,0.6) 40%, transparent 100%)",
          }}
        />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
          CONTENT — left-aligned editorial layout (not centered)
          ═══════════════════════════════════════════════════════════════════ */}

      <motion.div
        className="relative z-10 mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 sm:gap-7 sm:px-6 lg:max-w-7xl lg:gap-8 lg:px-12 wide:px-20"
        initial={prefersReducedMotion ? undefined : SECTION_ENTRANCE.hidden}
        whileInView={SECTION_ENTRANCE.visible}
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* Decorative top accent */}
        <AnimationWrapper variant="fade" delay={0}>
          <div aria-hidden="true" className="flex items-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-brand-yellow/60" />
            <span className="h-2 w-2 rotate-45 bg-brand-yellow" />
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-brand-yellow/60" />
          </div>
        </AnimationWrapper>

        {/* Headline — left-aligned, max-width so it doesn't overlap athlete */}
        <div className="max-w-lg lg:max-w-xl">
          <KineticHeadline
            as="h2"
            text="Commit to health and fitness."
            trigger="inView"
            className="font-display text-section text-ink lg:text-section-lg"
          />
        </div>

        <AnimationWrapper variant="fade-up" delay={0.25}>
          <BodyText size="large" className="max-w-md text-text-secondary">
            Challenge yourself. Take it to the next level.
          </BodyText>
        </AnimationWrapper>

        {/* CTA row */}
        <AnimationWrapper variant="fade-up" delay={0.35}>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <MagneticButton>
              <ButtonLink href="/#free-trial" variant="primary">
                Book Free Trial
              </ButtonLink>
            </MagneticButton>
            <ButtonLink href="/#pricing" variant="secondary">
              View Membership Plans
            </ButtonLink>
            <ButtonLink href={siteConfig.links.whatsapp} variant="whatsapp">
              Message Us on WhatsApp
            </ButtonLink>
          </div>
        </AnimationWrapper>
      </motion.div>

      {/* Bold brand-yellow bottom accent stripe */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1 bg-brand-yellow sm:h-1.5"
      />
    </PageSection>
  );
}
