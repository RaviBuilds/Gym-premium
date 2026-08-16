import Image from "next/image";
import { PageSection } from "@/components/layout";
import { Eyebrow, Heading, BodyText, ButtonLink, PricingPanel, Icon } from "@/components/ui";
import { AnimationWrapper, CameraLayer, AnimatedDivider, MagneticButton } from "@/components/motion";
import { homepagePricingTiers } from "@/content/pricing";

/**
 * MembershipCta — distinct from WhyInfiniti's single-line price teaser.
 * Where WhyInfiniti makes the "we're cheaper on purpose" argument once,
 * this section shows the actual tiers (Daily/Monthly/Yearly) so a
 * comparison shopper can see real numbers without leaving the homepage,
 * per 08-conversion-strategy.md's "surface pricing before the click"
 * guidance. Links through to the full per-branch/couples Pricing page for
 * the complete breakdown.
 *
 * V2 — Dark cinematic editorial (this revision):
 *
 * Membership sat between two flat, plain-white sections (Testimonials and
 * Locations) with no atmospheric weight of its own — the section read as a
 * pause, not a beat. This revision gives it its own identity by flipping
 * the section dark and placing a genuine gym-interior photograph
 * (`pricing-section.webp`) behind an ink scrim, the same "photograph +
 * scrim + editorial type" language WhyInfiniti/InsideTheGym/TrainerShowcase
 * already use — so the section now reads as a deliberate dark chapter
 * bookended by two light ones, not a fourth identical white band in a row.
 *
 * Paint order (back to front):
 *   1. CameraLayer `background` — the photograph, subtle scroll parallax
 *      matching every other full-bleed section image on the page.
 *   2. Ink scrim — tuned so the room is genuinely felt (visible rack/floor
 *      shapes at the edges) rather than reduced to near-black texture, while
 *      staying darkest at center where the pricing column sits, so the
 *      photo never fights the type for contrast.
 *   3. Warm radial wash + edge vignette — the same depth-parity atmosphere
 *      every other dark section carries, layered on top of the photo scrim
 *      rather than replacing it.
 *   4. Content — eyebrow/heading/body (each its own reveal beat), a short
 *      connecting rule, three PricingPanels (dark-surface variant, each
 *      carrying a decorative numeral + plan glyph), and a magnetic CTA.
 *
 * The three pricing panels themselves compose PricingPanel.tsx — border-
 * only, dark-surface colors (white/ink-mix, per Hero/FinalCta precedent),
 * a decorative numeral + Lucide glyph per plan, and a soft ambient glow +
 * scale-in-settle entrance reserved for the Best Value panel.
 */
export function MembershipCta() {
  return (
    <PageSection id="pricing" tone="dark" spacing="standard" className="relative overflow-hidden border-b border-brand-yellow/20">
      {/* Background photograph — full-bleed, scroll-linked parallax on the
          same `background` depth plane every other cinematic section uses
          (WhyInfiniti, InsideTheGym, TrainerShowcase, TrustStrip), so this
          section's "movement" reads as one more instance of an established
          technique rather than a new one. `fill` + `decorative` gives it
          the system-owned overscan bleed and the aria-hidden/pointer-events
          treatment automatically. */}
      <CameraLayer depth="background" fill decorative>
        <div className="relative h-full w-full">
          <Image
            src="/images/sections/membership/pricing-section.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </CameraLayer>

      {/* ─── WARM SPOTLIGHT STAGE ─── Unique identity: amber grain, tight
          spotlight cone, hard vignette. Distinct from Locations (cool blue)
          and FAQ (clean anthracite, no photo). */}

      {/* Warm amber color grade — shifts photo temperature warmer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-orange-950/[0.12]"
      />

      {/* Ink scrim — focused: darkest at center (type contrast), lighter at
          edges (gym atmosphere shows). Tighter falloff than other sections. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 75% at 50% 42%, rgba(20,24,29,0.74) 0%, rgba(20,24,29,0.68) 35%, rgba(20,24,29,0.5) 60%, rgba(20,24,29,0.4) 100%)",
        }}
      />

      {/* Directional scrim — heavier at top for headline contrast */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,24,29,0.5) 0%, rgba(20,24,29,0.2) 35%, transparent 60%)",
        }}
      />

      {/* Top blend — receives Testimonials' light surface */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 sm:h-24 lg:h-32"
        style={{
          background:
            "linear-gradient(180deg, rgba(250,249,246,0.14) 0%, transparent 100%)",
        }}
      />

      {/* Bottom: hard fade to pure ink (scene-change before Locations) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 sm:h-28 lg:h-36"
        style={{
          background:
            "linear-gradient(0deg, rgba(20,24,29,1) 0%, rgba(20,24,29,0.6) 50%, transparent 100%)",
        }}
      />

      {/* SPOTLIGHT CONE — focused warm overhead light (unique to Membership).
          Tighter than the diffuse glow other sections share. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 45% 50% at 50% 30%, rgba(255,200,60,0.07) 0%, rgba(255,222,1,0.03) 40%, transparent 70%)",
        }}
      />

      {/* Noise grain texture — dark fabric/stage materiality (unique to Membership) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      {/* Hard edge vignette — spotlight dies off fast at perimeter (theatrical staging) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 90% at 50% 40%, transparent 35%, rgba(10,12,15,0.55) 80%, rgba(10,12,15,0.75) 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 text-center lg:gap-10">
        {/* Header — three sequential reveal beats (eyebrow → heading →
            body) instead of one composite SectionHeader fade, so the
            section's opening reads as an assembling sequence rather than a
            single block appearing at once. */}
        <div className="flex flex-col items-center gap-3">
          <AnimationWrapper preset="small">
            <Eyebrow tone="dark">Membership</Eyebrow>
          </AnimationWrapper>
          <AnimationWrapper preset="small" delay={0.08}>
            <Heading level="section" as="h2" className="text-white">
              Pick your pace. Not your poison.
            </Heading>
          </AnimationWrapper>
          <AnimationWrapper preset="small" delay={0.16}>
            <BodyText size="large" className="max-w-xl text-text-secondary-dark">
              No hidden fees, no surprise add-ons — just a straightforward plan that fits how
              often you train.
            </BodyText>
          </AnimationWrapper>
        </div>

        {/* Connecting rule — grows into place between the header and the
            pricing row (AnimatedDivider's existing scaleX draw-in), the
            same "assembling deliberately" cue Trust Strip uses. Marks
            "philosophy stated, choices follow" as its own short beat. */}
        <AnimatedDivider orientation="horizontal" delay={0.22} className="h-[3px] w-14 bg-brand-yellow lg:w-20" />

        {/* Premium editorial pricing system — three border-only panels as one
            coherent decision experience, not three generic cards.
            Mobile: stacked vertically.
            Desktop (768px+): three-column grid. */}
        <div className="grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 lg:gap-8">
          {homepagePricingTiers[0] && (
            /* Panel 01 — Daily */
            <PricingPanel
              numeral="01"
              duration="Daily"
              price={homepagePricingTiers[0].listPrice}
              icon={<Icon icon={homepagePricingTiers[0].icon} size="xl" />}
              delay={0.3}
            />
          )}

          {homepagePricingTiers[1] && (
            /* Panel 02 — Monthly */
            <PricingPanel
              numeral="02"
              duration="Monthly"
              price={homepagePricingTiers[1].offerPrice ?? homepagePricingTiers[1].listPrice}
              originalPrice={homepagePricingTiers[1].offerPrice ? homepagePricingTiers[1].listPrice : undefined}
              icon={<Icon icon={homepagePricingTiers[1].icon} size="xl" />}
              delay={0.38}
            />
          )}

          {homepagePricingTiers[2] && (
            /* Panel 03 — Yearly (Best Value) */
            <PricingPanel
              numeral="03"
              duration="Yearly"
              price={homepagePricingTiers[2].offerPrice ?? homepagePricingTiers[2].listPrice}
              originalPrice={homepagePricingTiers[2].offerPrice ? homepagePricingTiers[2].listPrice : undefined}
              icon={<Icon icon={homepagePricingTiers[2].icon} size="xl" />}
              isBestValue={true}
              delay={0.46}
            />
          )}
        </div>

        {/* CTA — magnetic drift on desktop pointer (same primitive Hero's
            primary CTA uses), so this closing action feels alive under the
            cursor rather than static, without any new motion primitive. */}
        <AnimationWrapper delay={0.62}>
          <MagneticButton>
            {/* Relabelled and repointed together. "See Full Membership Plans" sat
                directly beneath the three panels that *are* the plans, and linked
                to `/pricing`, which does not exist — so it promised a page that
                was never built while standing on the content it promised. The
                honest next step after reading prices is starting the trial. */}
            <ButtonLink href="/#free-trial" variant="primary">
              Start With a Free Trial
            </ButtonLink>
          </MagneticButton>
        </AnimationWrapper>
      </div>
    </PageSection>
  );
}
