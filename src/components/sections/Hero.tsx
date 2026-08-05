"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heading, BodyText, ButtonLink } from "@/components/ui";
import { Container } from "@/components/layout";
import { AnimationWrapper, CountUp, KineticHeadline, MagneticButton } from "@/components/motion";
import { HeroScrollCue } from "./HeroScrollCue";
import { CinematicHeroSequence, HERO_DWELL_MS, HERO_FRAMES } from "./CinematicHeroSequence";
import { HeroAtmosphere } from "./HeroAtmosphere";
import { SceneNavigator } from "./SceneNavigator";

export function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);

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
        <div className="flex flex-col items-start gap-3 sm:gap-6 lg:gap-8 wide:gap-9">
          <AnimationWrapper variant="fade" delay={0.05}>
            <p className="border-l-2 border-brand-yellow pl-3 font-body text-caption font-semibold uppercase tracking-[0.18em] text-white">
              Hyderabad&apos;s no-excuses gym
            </p>
          </AnimationWrapper>

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
            <AnimationWrapper variant="fade-up" delay={0.24}>
              <BodyText size="large" className="text-white/85">
                Advanced training. Real trainers. Prices that don&apos;t punish you for showing
                up.
              </BodyText>
            </AnimationWrapper>

            <AnimationWrapper variant="fade-up" delay={0.34}>
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
            </AnimationWrapper>
          </div>

          <AnimationWrapper variant="fade-up" delay={0.44}>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-white/20 pt-3 font-body text-caption font-medium uppercase tracking-[0.12em] text-white/75 sm:pt-4 lg:justify-start">
              <CountUp end={2} suffix=" Hyderabad locations" />
              <span aria-hidden="true" className="text-brand-yellow"> • </span>
              <span>Since 2016</span>
              <span aria-hidden="true" className="text-brand-yellow"> • </span>
              <span>Real coaching</span>
            </div>
          </AnimationWrapper>

          <AnimationWrapper variant="fade" delay={0.5} className="lg:hidden">
            <HeroScrollCue />
          </AnimationWrapper>
        </div>
      </Container>

      <AnimationWrapper
        variant="fade"
        delay={0.5}
        className="absolute inset-x-0 z-50 hidden justify-center bottom-6 lg:flex"
      >
        <HeroScrollCue />
      </AnimationWrapper>
    </section>
  );
}
