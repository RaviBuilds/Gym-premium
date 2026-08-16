"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, Clock, ArrowRight, Users, Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { primaryNav } from "@/config/nav";
import { buildDirectionsLabel, buildMapsSearchUrl } from "@/lib/maps";
import { Icon } from "@/components/ui/Icon";
import { Heading, BodyText, Eyebrow } from "@/components/ui/Heading";
import { TrialBookingForm } from "@/components/ui/TrialBookingForm";
import { Container } from "./Container";

/**
 * Footer — Premium "Free Trial" conversion zone + navigation + brand.
 *
 * 9.5 target — all upgrades:
 *   - Perimeter glow border on form card with breathing animation
 *   - Premium form inputs (styled in FormField.tsx)
 *   - Full-width CTA button with sparkle icon
 *   - Branch cards as clickable links with hover lift/glow/pin pulse
 *   - Scroll-triggered staggered reveals with scale entrance on form
 *   - Decorative illustrations (dumbbell, infinity, pulse line)
 *   - Benefit pills as micro-motivators
 *   - Trust signal with animated counter concept
 *   - Availability dots on branch cards
 *   - Ambient floating dumbbell animation
 */

/**
 * The footer's photographic backdrop — one image behind both zones.
 *
 * ## Why the scrim carries the opacity, and the image does not
 *
 * The obvious way to seat a photo behind text is `opacity-20` on the image, and it
 * is the wrong lever here. The footer already paints ten decorative layers over
 * this spot — a warm spotlight, a secondary glow, three gold geometric bars, noise,
 * three line marks and a vignette — plus a near-opaque surface gradient over the
 * nav zone. Fading the image *and* stacking a scrim on top means two controls
 * fighting for one outcome, and the result is a photo you can no longer see at all.
 *
 * So the image renders at full opacity and {@link BACKDROP_SCRIM} alone decides how
 * much of it survives. One gradient, one place to tune, and the alpha at any height
 * reads directly as "how much photo is visible here".
 *
 * ## The alphas are a legibility budget, not a taste
 *
 * The footer's text runs from `text-white` headings down to
 * `text-text-secondary-dark` body copy, and there is a **white** form card sitting
 * on top of the busiest part of the frame. The stops below keep the composite dark
 * enough that none of that loses contrast:
 *
 * | Height | Alpha | What sits there |
 * |---|---|---|
 * | 0% | 0.84 | Top edge, under the gold border and the trial headline |
 * | 32% | 0.78 | The photo's most visible band — beside the form card, not behind it |
 * | 68% | 0.90 | Trial zone closing out, branch cards |
 * | 100% | 0.97 | Nav columns and the copyright bar, effectively solid ink |
 *
 * 0.78 is the loosest point and it is still 78% ink, which is what keeps this in
 * "atmosphere" territory rather than competing with the content. The section
 * darkens monotonically downward on purpose: the trial zone is the conversion
 * surface and earns the visual interest, while the nav columns are dense text where
 * a photograph is just noise. That descent also means the existing nav-zone
 * gradient does not have to change — it lands on an already-dark base and the two
 * compose into a smooth fade rather than a hard cut.
 *
 * `grayscale` because the frame is near-monochrome already and the footer's only
 * chromatic notes are brand-yellow. Any residual warmth in the photo would read as
 * a second, muddier gold. It is a static filter applied once at paint, never
 * animated — the same treatment `TrustStrip` already uses on its backdrop.
 */
const BACKDROP_SCRIM =
  "linear-gradient(180deg, rgba(20,24,29,0.84) 0%, rgba(20,24,29,0.78) 32%, rgba(20,24,29,0.90) 68%, rgba(20,24,29,0.97) 100%)";

/** Staggered reveal. */
const REVEAL = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.12,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

/** Form card entrance — includes scale for "materializing" effect. */
const FORM_REVEAL = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      delay: 0.15,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

/** Decorative dumbbell — with float animation class. */
function DumbbellMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" fill="none" className={className} aria-hidden="true">
      <rect x="10" y="14" width="8" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="102" y="14" width="8" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="18" y="17" width="84" height="6" rx="3" stroke="currentColor" strokeWidth="2" />
      <rect x="5" y="15" width="5" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="110" y="15" width="5" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/** Infinity loop mark — brand identity. */
function InfinityMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 44" fill="none" className={className} aria-hidden="true">
      <path
        d="M60 22c0 0-10-14-24-14-9 0-18 7-18 14s9 14 18 14c14 0 24-14 24-14s10 14 24 14c9 0 18-7 18-14s-9-14-18-14c-14 0-24 14-24 14z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Pulse/heartbeat line. */
function PulseMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 36" fill="none" className={className} aria-hidden="true">
      <path
        d="M0 18h35l8-14 10 28 10-28 8 14h35l6-10 8 20 8-20 6 10h46"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Custom brand map pin (consistent with LocationCard). */
function BrandMapPin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/** Availability dot — pulsing green indicator. */
function AvailabilityDot() {
  return (
    <span className="relative mr-1.5 inline-flex">
      <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-success/60 motion-reduce:animate-none" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
    </span>
  );
}

/** Social icon — Instagram. */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

/** Social icon — YouTube. */
function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

/** Social icon — WhatsApp. */
function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const prefersReducedMotion = useReducedMotion();

  return (
    <footer className="relative bg-ink text-white">
      {/* ═══════════════════════════════════════════════════════════════════
          PHOTOGRAPHIC BACKDROP — spans both zones
          First in DOM order and the only layer here that is not `relative`, so
          every zone below paints over it. All three siblings are positioned with
          `z-index: auto`, which means they stack in source order and the photo
          stays at the back without needing a z-index on anything.
          See BACKDROP_SCRIM for why the scrim owns the opacity.
          ═══════════════════════════════════════════════════════════════════ */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <Image
          src="/footer.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center grayscale"
        />
        <div className="absolute inset-0" style={{ background: BACKDROP_SCRIM }} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          FREE TRIAL HERO ZONE
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden border-t-2 border-brand-yellow/30">
        {/* Warm spotlight — left biased behind headline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 45% 55% at 30% 35%, rgba(255,222,1,0.08) 0%, transparent 55%)",
          }}
        />

        {/* Secondary glow behind branch area */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 40% 50% at 72% 50%, rgba(255,222,1,0.04) 0%, transparent 55%)",
          }}
        />

        {/* Bold geometric accent — two angled gold bars creating a dynamic frame.
            Replaces the previous invisible diagonal slash with a clear, intentional
            design element that reads as premium, not accidental. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 top-[10%] h-[80%] w-[3px] rotate-12 bg-brand-yellow/25 lg:w-1"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-1 top-[5%] h-[90%] w-px rotate-12 bg-brand-yellow/12"
        />
        {/* Horizontal accent bar at top-right — geometric framing */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[5%] top-[6%] h-[2px] w-24 bg-gradient-to-r from-brand-yellow/30 to-transparent sm:w-32 lg:w-40"
        />

        {/* Noise texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
          }}
        />

        {/* Decorative illustrations — VISIBLE range, not ghost-faint */}
        {/* Hero decoration: dumbbell floating — the one clearly visible mark */}
        <DumbbellMark className="pointer-events-none absolute right-[8%] top-[6%] h-auto w-32 -rotate-6 text-brand-yellow/[0.18] motion-safe:animate-[float_6s_ease-in-out_infinite] sm:w-36 lg:right-[10%] lg:w-44" />
        {/* Supporting: infinity mark — brand identity, visible */}
        <InfinityMark className="pointer-events-none absolute left-[3%] top-[25%] h-auto w-28 rotate-3 text-brand-yellow/[0.1] lg:left-[2%] lg:w-36" />
        {/* Supporting: pulse line — health/energy, visible */}
        <PulseMark className="pointer-events-none absolute bottom-[12%] left-[6%] h-auto w-36 text-brand-yellow/[0.1] lg:w-44" />

        {/* Vignette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 110% 100% at 50% 50%, transparent 45%, rgba(10,12,15,0.4) 100%)",
          }}
        />

        <Container>
          <div className="relative grid gap-12 py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:py-20">
            {/* ─── LEFT: headline + form ─── */}
            <div className="flex flex-col gap-6">
              {/* Headline block */}
              <motion.div
                className="flex flex-col gap-3"
                custom={0}
                initial={prefersReducedMotion ? undefined : "hidden"}
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={prefersReducedMotion ? undefined : REVEAL}
              >
                <Eyebrow>Wanna Try Before You Buy?</Eyebrow>
                <div className="relative">
                  <Heading level="section" as="h2" className="text-white">
                    Sign Up for a Free Trial
                  </Heading>
                  {/* Animated gold underline accent — grows from left on reveal */}
                  <motion.div
                    aria-hidden="true"
                    className="mt-2 h-[3px] rounded-full bg-brand-yellow"
                    initial={prefersReducedMotion ? { width: "30%" } : { width: 0 }}
                    whileInView={{ width: "30%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
                  />
                </div>
                <BodyText size="standard" className="max-w-sm text-text-secondary-dark">
                  No commitment. No card required. Just show up and train.
                </BodyText>

                {/* Benefit pills — micro-motivators with subtle shimmer on hover */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {["No payment", "Real coaching", "Same-day booking"].map((benefit) => (
                    <span
                      key={benefit}
                      className="group/pill relative inline-flex items-center gap-1.5 overflow-hidden rounded-sm border border-brand-yellow/15 bg-brand-yellow/[0.06] px-3 py-1.5 font-body text-[11px] font-medium text-white/80 transition-[border-color,background-color] duration-300 hover:border-brand-yellow/30 hover:bg-brand-yellow/[0.1]"
                    >
                      {/* Shimmer sweep on hover */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover/pill:translate-x-full"
                      />
                      <Icon icon={Check} size="sm" className="size-3 text-brand-yellow" />
                      {benefit}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Premium form card — perimeter glow + breathing + scale entrance */}
              <motion.div
                id="free-trial"
                className="group/form relative overflow-hidden rounded-card"
                initial={prefersReducedMotion ? undefined : FORM_REVEAL.hidden}
                whileInView={FORM_REVEAL.visible}
                viewport={{ once: true, amount: 0.2 }}
              >
                {/* Perimeter glow border — breathing animation */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-card motion-safe:animate-[form-breathe_4s_ease-in-out_infinite]"
                  style={{
                    background:
                      "conic-gradient(from 0deg, rgba(255,222,1,0.2), rgba(255,222,1,0.05) 25%, rgba(255,222,1,0.15) 50%, rgba(255,222,1,0.05) 75%, rgba(255,222,1,0.2))",
                    padding: "1.5px",
                    borderRadius: "inherit",
                  }}
                >
                  <div className="h-full w-full rounded-[calc(var(--radius-card)-1.5px)] bg-white" />
                </div>

                {/* Form card inner content */}
                <div
                  className="relative rounded-card bg-white p-6 lg:p-8"
                  style={{
                    boxShadow: [
                      "0 24px 60px rgba(0,0,0,0.4)",
                      "0 8px 24px rgba(0,0,0,0.2)",
                      "inset 0 0 40px rgba(255,222,1,0.02)",
                    ].join(", "),
                  }}
                >
                  {/* Inner warmth — golden tint gradient covering more area */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-card"
                    style={{
                      background:
                        "linear-gradient(145deg, rgba(255,222,1,0.04) 0%, rgba(255,222,1,0.01) 30%, transparent 60%)",
                    }}
                  />
                  <div className="relative">
                    <TrialBookingForm />
                  </div>
                </div>
              </motion.div>

              {/* Trust signal */}
              <motion.div
                className="flex items-center gap-2"
                custom={2}
                initial={prefersReducedMotion ? undefined : "hidden"}
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={prefersReducedMotion ? undefined : REVEAL}
              >
                <Icon icon={Users} size="sm" className="text-brand-yellow/70" />
                <BodyText size="caption" className="text-text-secondary-dark">
                  Join <span className="font-semibold text-white/80">500+</span> members who started with a free trial
                </BodyText>
              </motion.div>
            </div>

            {/* ─── RIGHT: branch cards (as links) ─── */}
            <div className="flex flex-col gap-6 lg:pt-14">
              {Object.values(siteConfig.branches).map((branch, index) => (
                <motion.div
                  key={branch.name}
                  custom={index + 1}
                  initial={prefersReducedMotion ? undefined : "hidden"}
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={prefersReducedMotion ? undefined : REVEAL}
                >
                  {/* Opens Google Maps on the branch, not `/locations/<name>` —
                      that route does not exist and these two cards used to 404.
                      Plain `<a>` with `target`/`rel` because the destination is
                      external now. See src/lib/maps.ts. */}
                  <a
                    href={buildMapsSearchUrl(branch.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={buildDirectionsLabel(branch.name)}
                    className="group relative flex flex-col gap-3 overflow-hidden rounded-card border border-white/[0.1] bg-white/[0.04] p-5 backdrop-blur-sm transition-all duration-400 ease-out hover:border-brand-yellow/25 hover:bg-white/[0.06] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,222,1,0.08)] lg:p-6"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 16px rgba(0,0,0,0.2)",
                    }}
                  >
                    {/* Hover left accent */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 w-[2px] bg-brand-yellow/0 transition-colors duration-400 group-hover:bg-brand-yellow/60"
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heading level="subsection" as="h3" className="text-white">
                          {branch.name}
                        </Heading>
                        <AvailabilityDot />
                      </div>
                      <Icon
                        icon={ArrowRight}
                        size="sm"
                        className="text-white/30 transition-[color,transform] duration-300 group-hover:translate-x-1 group-hover:text-brand-yellow"
                      />
                    </div>

                    <div className="flex items-start gap-2.5">
                      <BrandMapPin className="mt-0.5 size-[18px] shrink-0 text-brand-yellow/70 transition-transform duration-300 group-hover:scale-110" />
                      <BodyText size="standard" className="text-white/70">
                        {branch.address}
                      </BodyText>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Icon icon={Clock} size="sm" className="mt-0.5 text-white/40" />
                      <BodyText size="caption" className="text-white/60">
                        {branch.hours.days} · {branch.hours.unisex}
                        {branch.hours.ladiesOnly && (
                          <>
                            <br />
                            <span className="font-medium text-brand-yellow/80">
                              Ladies Only · {branch.hours.ladiesOnly}
                            </span>
                          </>
                        )}
                      </BodyText>
                    </div>
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER NAVIGATION + BRAND — Premium treatment
          `id="contact"` is the navbar's "Contact" target: this zone holds the
          phone, the email and the social links, which is what that nav item
          promises. There is no `/contact` route — see src/config/nav.ts.
          ═══════════════════════════════════════════════════════════════════ */}
      <div id="contact" className="relative">
        {/* Warmer surface gradient — slightly lighter than trial section */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(30,34,38,0.5) 0%, rgba(20,24,29,1) 100%)",
          }}
        />

        {/* Subtle noise texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
          }}
        />

        {/* Warm ambient glow behind Contact area */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 30% 50% at 50% 40%, rgba(255,222,1,0.03) 0%, transparent 60%)",
          }}
        />

        <Container>
          {/* Main footer grid with shimmer dividers */}
          <div className="relative grid gap-10 border-t border-border-dark py-14 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:gap-0 lg:py-16">

            {/* ─── Column 1: Explore ─── */}
            <motion.div
              className="flex flex-col gap-4 sm:pr-8 lg:pr-12"
              custom={0}
              initial={prefersReducedMotion ? undefined : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={prefersReducedMotion ? undefined : REVEAL}
            >
              <Heading level="subsection" as="h3" className="text-white">
                Explore
              </Heading>
              <nav aria-label="Footer">
                <ul className="flex flex-col">
                  {primaryNav.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="group flex min-h-11 items-center gap-1 font-body text-body text-text-secondary-dark transition-[color,transform,background-size] duration-300 ease-out hover:translate-x-1 hover:text-white hover:duration-150 bg-linear-to-r from-brand-yellow to-brand-yellow bg-[length:0%_1px] bg-left-bottom bg-no-repeat hover:bg-[length:100%_1px] focus-visible:bg-[length:100%_1px] focus-visible:text-white"
                      >
                        {item.label}
                        <ArrowRight className="size-3 opacity-0 transition-opacity duration-200 group-hover:opacity-60" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>

            {/* Shimmer divider 1 */}
            <motion.div
              aria-hidden="true"
              className="hidden w-px self-stretch sm:block"
              style={{
                background:
                  "linear-gradient(180deg, transparent 5%, rgba(255,222,1,0.15) 30%, rgba(255,255,255,0.08) 50%, rgba(255,222,1,0.15) 70%, transparent 95%)",
              }}
              initial={prefersReducedMotion ? undefined : { scaleY: 0, opacity: 0 }}
              whileInView={{ scaleY: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
            />

            {/* ─── Column 2: Contact + Social ─── */}
            <motion.div
              className="flex flex-col gap-4 sm:px-8 lg:px-12"
              custom={1}
              initial={prefersReducedMotion ? undefined : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={prefersReducedMotion ? undefined : REVEAL}
            >
              <Heading level="subsection" as="h3" className="text-white">
                Contact
              </Heading>
              <div className="flex flex-col gap-1">
                <a
                  href={`tel:${siteConfig.contact.phones[0]?.replace(/\s+/g, "")}`}
                  className="group flex min-h-11 items-center gap-2.5 rounded-card px-3 -ml-3 font-body text-body text-text-secondary-dark transition-[color,background-color] duration-300 ease-out hover:bg-white/[0.05] hover:text-white"
                >
                  <Icon icon={Phone} size="sm" className="transition-colors duration-300 group-hover:text-brand-yellow" />
                  {siteConfig.contact.phones[0]}
                </a>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="group flex min-h-11 items-center gap-2.5 rounded-card px-3 -ml-3 font-body text-body text-text-secondary-dark transition-[color,background-color] duration-300 ease-out hover:bg-white/[0.05] hover:text-white"
                >
                  <Icon icon={Mail} size="sm" className="transition-colors duration-300 group-hover:text-brand-yellow" />
                  {siteConfig.contact.email}
                </a>
              </div>

              {/* Social media links */}
              <div className="mt-2 flex items-center gap-3">
                {[
                  { href: "https://instagram.com/infinitifitness", label: "Instagram", icon: InstagramIcon, hoverColor: "hover:border-pink-400/40 hover:text-pink-400 hover:shadow-[0_0_12px_rgba(236,72,153,0.2)]" },
                  { href: "https://youtube.com/@infinitifitness", label: "YouTube", icon: YoutubeIcon, hoverColor: "hover:border-red-400/40 hover:text-red-400 hover:shadow-[0_0_12px_rgba(248,113,113,0.2)]" },
                  { href: siteConfig.links.whatsapp, label: "WhatsApp", icon: WhatsappIcon, hoverColor: "hover:border-whatsapp/40 hover:text-whatsapp hover:shadow-[0_0_12px_rgba(37,211,102,0.2)]" },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`flex size-9 items-center justify-center rounded-card border border-white/[0.1] text-white/50 transition-all duration-300 ${social.hoverColor}`}
                  >
                    <social.icon className="size-4" />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Shimmer divider 2 */}
            <motion.div
              aria-hidden="true"
              className="hidden w-px self-stretch sm:block"
              style={{
                background:
                  "linear-gradient(180deg, transparent 5%, rgba(255,222,1,0.15) 30%, rgba(255,255,255,0.08) 50%, rgba(255,222,1,0.15) 70%, transparent 95%)",
              }}
              initial={prefersReducedMotion ? undefined : { scaleY: 0, opacity: 0 }}
              whileInView={{ scaleY: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
            />

            {/* ─── Column 3: Brand ─── */}
            <motion.div
              className="flex flex-col gap-4 sm:pl-8 lg:pl-12"
              custom={2}
              initial={prefersReducedMotion ? undefined : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={prefersReducedMotion ? undefined : REVEAL}
            >
              {/* Logo with glow halo */}
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-4 motion-safe:animate-[logo-breathe_5s_ease-in-out_infinite]"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, rgba(255,222,1,0.05) 0%, transparent 70%)",
                  }}
                />
                <Image
                  src="/images/brand/logo.png"
                  alt="Infiniti Fitness"
                  width={741}
                  height={222}
                  className="relative h-10 w-auto"
                />
              </div>
              <BodyText size="standard" className="text-white/50">
                {siteConfig.tagline}
              </BodyText>
              {/* Gold rule under tagline */}
              <div
                aria-hidden="true"
                className="h-px w-16"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(255,222,1,0.4) 0%, transparent 100%)",
                }}
              />
              {/* Small infinity mark */}
              <InfinityMark className="h-auto w-16 text-brand-yellow/[0.12]" />
            </motion.div>
          </div>

          {/* ─── COPYRIGHT BAR ─── */}
          <motion.div
            className="flex items-center justify-between border-t py-6"
            style={{
              borderImage:
                "linear-gradient(90deg, transparent 5%, rgba(255,222,1,0.2) 50%, transparent 95%) 1",
            }}
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <BodyText size="caption" className="text-text-secondary-dark">
              © {year} {siteConfig.name}
              <span className="mx-2 text-brand-yellow/40">·</span>
              Built with sweat in Hyderabad
            </BodyText>

            {/* Back to top button */}
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
              className="group flex size-9 items-center justify-center rounded-full border border-white/[0.12] text-white/40 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-yellow/40 hover:text-brand-yellow hover:shadow-[0_0_12px_rgba(255,222,1,0.15)]"
            >
              <svg viewBox="0 0 24 24" fill="none" className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden="true">
                <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </motion.div>
        </Container>
      </div>
    </footer>
  );
}
