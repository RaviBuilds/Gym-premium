"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Heading, BodyText, ButtonLink } from "@/components/ui";
import { Container } from "@/components/layout";
import { CameraGroup, CountUp, KineticHeadline, MagneticButton } from "@/components/motion";
import { HeroScrollCue } from "./HeroScrollCue";
import { CinematicHeroSequence, HERO_DWELL_MS, HERO_FRAMES } from "./CinematicHeroSequence";
import { HeroAtmosphere } from "./HeroAtmosphere";
import { SceneNavigator } from "./SceneNavigator";

/**
 * Hero — Homepage-Architecture.md §1.
 *
 * Exactly three depth planes, matching the architecture brief's own example:
 *
 *   Background Plane   CinematicHeroSequence (depth="background") — the film
 *   Content Plane       eyebrow + headline + description, one CameraGroup
 *   CTA Plane            the button row, one CameraGroup, shallowest = closest
 *
 * (HeroAtmosphere is a fixed overlay above every scene, mounted once — it's
 * not a scroll-linked plane, it never moves, so it isn't part of the camera.)
 *
 * ── What changed from the per-element version ────────────────────────────
 * Previously the eyebrow, headline, description, CTA, and stat strip each ran
 * their own `useCameraLayer` — five scroll subscriptions for what the brief
 * defines as two planes. They also carried `AnimationWrapper` fade-up entrance
 * animations *nested inside* the camera transform, so for the ~0.5s reveal
 * window two systems wrote `y` on the same subtree at once.
 *
 * Now: the eyebrow, headline, and description share ONE CameraGroup (one
 * subscription, one measured height, so they can never drift apart from each
 * other — the previous per-element version measured three different element
 * heights and produced three subtly different amplitudes for "the same
 * plane"). The CTA is its own CameraGroup, one step shallower, since it's
 * meant to sit physically closer to the viewer than the copy above it.
 *
 * Entrance is opacity-only, applied directly with `initial`/`animate` (no
 * `AnimationWrapper` — that component's `y`-bearing variants are exactly what
 * this file needs to avoid). Scroll owns `y`. Hover owns MagneticButton's
 * `x`/`y` and the button's own hover lift. Entrance owns opacity. One property,
 * one owner, per the architecture rule.
 *
 * Reduced motion / mobile: `CameraGroup` resolves to a static wrapper via the
 * shared intensity multiplier, and CinematicHeroSequence holds a single frame
 * below desktop — no per-component guards needed here. The one opacity
 * entrance is skipped outright under reduced motion (content renders at full
 * opacity immediately) rather than firing an invisible-but-still-computed fade.
 */
export function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-[calc(100svh-80px)] items-end overflow-hidden bg-ink lg:min-h-[calc(100vh-80px)]">
      <CinematicHeroSequence activeIndex={activeIndex} onFrameChange={setActiveIndex} />
      {/* Mounted as a sibling, above every scene and below all content: this is
          what must never remount, so it never appears in a keyed position. */}
      <HeroAtmosphere />
      <SceneNavigator
        frames={HERO_FRAMES}
        activeIndex={activeIndex}
        onSelect={setActiveIndex}
        progressMs={HERO_DWELL_MS}
      />

      {/* Hero Content */}
      <Container
        as="div"
        className="relative z-40 w-full pt-5 pb-[calc(76px+env(safe-area-inset-bottom)+8px)] sm:pt-8 sm:pb-[calc(76px+env(safe-area-inset-bottom)+20px)] lg:pt-8 lg:pb-6 wide:pt-12 wide:pb-14"
      >
        <motion.div
          className="flex flex-col items-start gap-3 sm:gap-6 lg:gap-8 wide:gap-9"
          initial={prefersReducedMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Content Plane — eyebrow, headline, description all ride ONE
              camera subscription as a single rigid group. */}
          <CameraGroup depth="content" className="flex w-full flex-col items-start gap-3 sm:gap-6 lg:gap-8 wide:gap-9">
            <p className="border-l-2 border-brand-yellow pl-3 font-body text-caption font-semibold uppercase tracking-[0.18em] text-white">
              Hyderabad&apos;s no-excuses gym
            </p>

            <Heading
              level="hero"
              as="h1"
              className="max-w-[20ch] text-white sm:max-w-[17ch] lg:max-w-[16ch]"
            >
              <span className="block text-hero leading-[1.08] lg:text-hero-lg lg:leading-[1.05]">
                <KineticHeadline text="Stop being a dumbbell," />
              </span>
              <span className="mt-1 block text-hero-display lg:mt-2 lg:text-hero-display-lg lg:leading-[0.92]">
                <KineticHeadline text="burn fat, not muscle." />
              </span>
            </Heading>

            <div className="flex w-full max-w-120 flex-col gap-4 border-l border-white/20 pl-4 sm:gap-5 sm:pl-5">
              <BodyText size="large" className="text-white/85">
                Advanced training. Real trainers. Prices that don&apos;t punish you for showing
                up.
              </BodyText>
            </div>
          </CameraGroup>

          {/* CTA Plane — one step shallower than the content plane above it,
              so it reads as physically closer to the viewer. */}
          <CameraGroup depth="cta" className="w-full max-w-120 pl-4 sm:pl-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <MagneticButton className="w-full sm:w-auto">
                <motion.div
                  whileHover={{ y: -2, scale: 1.02 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ButtonLink href="/#free-trial" variant="primary" className="w-full sm:w-auto shadow-lg hover:shadow-brand-yellow/30 transition-shadow">
                    Book Free Trial
                  </ButtonLink>
                </motion.div>
              </MagneticButton>
              <motion.div
                whileHover="hover"
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="w-full sm:w-auto"
              >
                <ButtonLink href="/pricing" variant="secondary" className="group w-full text-white sm:w-auto hover:bg-white/10 hover:border-white/20 hover:text-white transition-colors duration-500 ease-premium">
                  See Membership Plans
                  <motion.span variants={{ hover: { x: 2 } }} className="ml-2 transition-transform duration-500 ease-premium">
                    &rarr;
                  </motion.span>
                </ButtonLink>
              </motion.div>
            </div>
          </CameraGroup>

          {/* Stat strip rides the same Content Plane conceptually, but sits
              below the CTA in the DOM — kept as plain flow (no transform) since
              a third camera plane here would just be more subscriptions for a
              line of text nobody perceives moving independently. */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-white/20 pt-3 font-body text-caption font-medium uppercase tracking-[0.12em] text-white/75 sm:pt-4 lg:justify-start">
            <CountUp end={2} suffix=" Hyderabad locations" />
            <span aria-hidden="true" className="text-brand-yellow"> • </span>
            <span>Since 2016</span>
            <span aria-hidden="true" className="text-brand-yellow"> • </span>
            <span>Real coaching</span>
          </div>

          <div className="lg:hidden">
            <HeroScrollCue />
          </div>
        </motion.div>
      </Container>

      <div className="absolute inset-x-0 z-50 hidden justify-center bottom-6 lg:flex">
        <HeroScrollCue />
      </div>
    </section>
  );
}
