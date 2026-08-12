"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Card, CardMedia } from "./Card";
import { Badge } from "./Badge";
import { Heading, BodyText } from "./Heading";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";
import { getStaggerDelay } from "@/lib/design-tokens";
import type { Program } from "@/types/content";

/**
 * Per-slug focal point overrides — the shared card crop (4:5 mobile/desktop)
 * center-crops by default, which clips the actual subject on a few source
 * photos shot off-center. Cardio's source photo places the subject in the
 * upper-right two-thirds of the frame, so a plain `center` crop loses most
 * of it; kick-boxing and rock-climbing are shot portrait with the subject
 * high in frame, so they need to anchor toward the top rather than
 * vertical-center. Every other program's source photo is already centered on
 * its subject and is left on the CardMedia default.
 */
const focalPointOverrides: Partial<Record<Program["slug"], string>> = {
  cardio: "object-[78%_28%]",
  "kick-boxing": "object-[50%_15%]",
  "rock-climbing": "object-[50%_10%]",
};

/**
 * Premium choreography tokens — the ProgramCard `motion="premium"` mode's
 * additive motion vocabulary. Reveal travel (48px) sits on the 8px spacing
 * scale and inside the 40-60px "rising from below" brief; duration 0.7s is
 * the premium range; the easing reuses the exact curve Hero's CTA already
 * uses (`[0.22, 1, 0.36, 1]`) rather than inventing a new one. The inner
 * content stagger (70ms between image/title/description/CTA) matches the
 * premium 60–90ms brief. Reduced motion: when `prefers-reduced-motion` is
 * active, the whole premium path collapses to the plain static rendering —
 * the `motion="premium"` flag is effectively ignored and the final DOM
 * state is shown immediately, matching every other motion primitive's
 * contract.
 */
const PREMIUM_REVEAL = {
  hidden: { opacity: 0, y: 48, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      when: "beforeChildren" as const,
      staggerChildren: 0.07,
    },
  },
} as const;

const PREMIUM_ITEM = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
} as const;

/**
 * Material backdrop tuning — the card's resting dark veil that dims the
 * shared pattern plane behind the Programs card rows (see Programs.tsx's
 * `ProgramMaterialPlane`). Kept as named constants, never inline literals,
 * so the "physical elevation, not a lighting effect" balance is one
 * documented decision.
 *
 *  - Rest veil `bg-ink/80`: additional dimming ON TOP of the plane's own
 *    full-bleed ambient scrim (see Programs.tsx's `PLANE_SCRIM_ALPHA`), so
 *    the material immediately around each card is pushed down to roughly the
 *    section backdrop's value while the wider section stays at the ambient
 *    level. At rest this reads as the card's own soft shadow pooled on the
 *    surface; on hover it dissolves and the area brightens back up to
 *    ambient — never past it, so nothing ever looks lit from within.
 *  - `MATERIAL_VEIL_MASK` is what stops this reading as a "fixed square".
 *    An unmasked rectangle fading out announces its own hard edges — you see
 *    a crisp box of lighter material switch on. The radial mask gives the
 *    veil a soft elliptical falloff instead, so what dissolves has no
 *    perceivable boundary: dense across the card's own footprint, thinning
 *    through ~78%, fully transparent at the outer edge.
 *  - Because the falloff is soft, adjacent veils can now safely overlap —
 *    two gradients blending produces a gradual gradient, not the hard seam
 *    that overlapping flat rectangles produced. That's what allows a much
 *    larger `lg:-inset-10` (40px) reveal band than the old hard-edged
 *    `-inset-1` (4px), which was too small to perceive. Mobile stays at
 *    `-inset-2` (8px) deliberately: the veil is absolutely positioned inside
 *    `CardGrid`'s `overflow-x-auto` swipe strip, and a wide inset there would
 *    extend the strip's scrollable width.
 *  - On `lg:group-hover` (desktop pointer) and `group-active` (touch tap) the
 *    veil fades fully to `opacity-0`. Still no `blur` and no pointer
 *    tracking — the plane itself never moves, never brightens, and has no
 *    cursor-following component. The soft edge comes from a static mask, not
 *    from a light source.
 */
const MATERIAL_VEIL_MASK =
  "radial-gradient(ellipse at center, #000 0%, #000 55%, rgb(0 0 0 / 0.5) 78%, transparent 100%)";

const MATERIAL_BACKDROP_CLASS =
  "pointer-events-none absolute -inset-2 lg:-inset-10 z-0 bg-ink/80 " +
  "motion-safe:transition-opacity motion-safe:duration-500 ease-out " +
  "lg:group-hover:opacity-0 group-active:opacity-0";

/**
 * Elevation shadow — a dark-backdrop-visible cast shadow for the card,
 * additive to Card's own base box-shadow rather than a replacement for it.
 * Card.tsx's rest/hover shadow (`rgba(20,24,29,0.12)` → `rgba(20,24,29,0.08)`)
 * is correct on the light `surface-light` background every other card type
 * (TrainerCard/LocationCard/TestimonialCard) sits on, but on the Programs
 * section's charcoal-to-near-black gradient the shadow color is nearly
 * identical to the backdrop it's cast on, so it reads as invisible — not a
 * wrong *direction*, just the wrong *density* for this one dark section.
 * Rather than overriding Card.tsx's shared shadow (which would regress the
 * other card types), this is a separate sibling layer scoped to ProgramCard
 * only, sized to the exact same `rounded-card` footprint as the Card panel
 * so the shadow reads as cast BY the card, not as a lighting effect.
 *
 * Direction mirrors Card's own hover contract exactly — larger blur radius
 * (softer) + lower alpha (lighter) on hover/touch-active — the same
 * "further from the surface, less dense" relationship Card.tsx already
 * encodes, just at a density that's actually perceptible against this
 * section's near-black gradient. A single uniform box-shadow matching the
 * card's own silhouette: no filter, no backdrop-filter, no radial shape, no
 * pointer-tracking — the material plane behind it (Programs.tsx's
 * `ProgramMaterialPlane`) never moves or brightens; only this shadow's own
 * blur/alpha eases on interaction.
 *
 * The hover alpha (0.2) is deliberately lower than a naive "half the rest
 * value" would be, because this shadow blurs outward across the exact same
 * pixels the veil clears on hover — at 0.45+ it crushed the material it was
 * supposed to be revealing. Keeping a residual 0.2 is still correct
 * physically: a lifted card's shadow SHOULD darken the surface immediately
 * beneath it, with the material reading brighter further out.
 */
const ELEVATION_SHADOW_CLASS =
  "pointer-events-none absolute inset-0 z-0 rounded-card " +
  "shadow-[0_10px_28px_rgb(0_0_0_/_0.45)] " +
  "motion-safe:transition-shadow motion-safe:duration-500 ease-out " +
  "lg:group-hover:shadow-[0_18px_40px_rgb(0_0_0_/_0.2)] " +
  "group-active:shadow-[0_18px_40px_rgb(0_0_0_/_0.2)]";

/** Breathing loop — near-invisible ambient scale on the image layer only.
 *  Not `as const` on the whole object — Framer Motion requires mutable
 *  (non-readonly) keyframe arrays for `scale` and `times`. `as const` is
 *  applied only to the `ease` string so it narrows to the literal `"easeInOut"`
 *  Easing type rather than widening to `string`. */
const PREMIUM_BREATHE = {
  animate: { scale: [1, 1.03, 1] },
  transition: {
    duration: 14,
    ease: "easeInOut" as const,
    times: [0, 0.5, 1],
    repeat: Infinity,
  },
};

/**
 * ProgramCard — Homepage-Architecture.md §3 Programs, Design-System.md §7.
 *
 * A full-card link keeps every discipline equally discoverable while the
 * optional feature treatment creates a single visual anchor in the nine-card
 * collection. The "View Program" CTA lives below the image as a permanently
 * visible row (not a hover-only overlay) so touch users get the same
 * affordance as desktop pointer users; desktop hover just adds an animated
 * arrow + underline on top of what's already legible everywhere.
 *
 * The outer motion.div layers a subtle whileHover scale on top of Card's own
 * translateY/shadow lift rather than modifying Card itself, so TrainerCard/
 * LocationCard (which also compose Card) are unaffected.
 *
 * Optional `motion="premium"` mode (default `"standard"` preserves the exact
 * historical behavior): adds the premium cinematic interactions described in
 * the Phase 2 brief — scroll-reveal with reduced travel + settle (14px,
 * 0.7s, premium ease), 1.04 hover zoom, an ultra-slow ambient image breathe,
 * and a fine inner content stagger (image → title → description → CTA). All
 * animation is transform/opacity only (no layout reflow, no per-frame
 * box-shadow). Under `prefers-reduced-motion` the premium flag is ignored
 * and the card renders identically to the standard path.
 */
export function ProgramCard({
  program,
  index,
  featured = false,
  motion: motionMode = "standard",
}: {
  program: Program;
  index: number;
  featured?: boolean;
  /** `"standard"` (default) = the original static reveal-less card. `"premium"`
   *  enables the Phase 2 cinematic choreography (scroll reveal, hover zoom
   *  1.04, image breathe, inner content stagger). `"premium"` collapses to
   *  `"standard"` under `prefers-reduced-motion`. */
  motion?: "standard" | "premium";
}) {
  const prefersReducedMotion = useReducedMotion();
  const premium = motionMode === "premium" && !prefersReducedMotion;

  const number = String(index + 1).padStart(2, "0");
  const accessibleLabel = `${program.name} training at Infiniti Fitness — view program details`;
  const delay = getStaggerDelay(index);

  return (
    <Link
      href={`/programs/${program.slug}`}
      aria-label={accessibleLabel}
      className="group block h-full rounded-card transition-opacity duration-200 ease-out active:opacity-90"
    >
      <motion.div
        className="relative isolate h-full"
        {...(premium
          ? {
              // Premium: the outer wrapper owns the scroll-reveal only. The
              // luxury hover lift/shadow is Card's own `whileHover` and the
              // image zoom is the card's internal 1.04 `lg:group-hover:scale`
              // — no outer whileHover here, so the reveal `transition` never
              // collides with a hover transition on the same element.
              initial: PREMIUM_REVEAL.hidden,
              whileInView: PREMIUM_REVEAL.visible,
              viewport: { once: true, amount: 0.2 },
              transition: { delay },
            }
          : {
              // Standard (legacy) behavior unchanged: outer micro-scale on
              // hover layered over Card's own translateY/shadow lift.
              whileHover: { scale: 1.012 },
              transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
            })}
      >
        {/* Material backdrop — the card's resting "shadow": a soft-edged
            dark pool that dims the premium pattern plane immediately around
            this card, on top of the plane's own full-bleed ambient scrim.
            On desktop hover (and touch active) it dissolves, so the material
            around the elevated card brightens back up to the ambient level
            with no perceivable edge. Purely a veil over the shared plane;
            the plane itself never moves, brightens, or gains a
            pointer-tracked effect. Under reduced motion the fade is instant
            (motion-safe: gate), the final state is still reachable, so no
            content depends on animation. */}
        <div
          aria-hidden="true"
          className={MATERIAL_BACKDROP_CLASS}
          style={{ WebkitMaskImage: MATERIAL_VEIL_MASK, maskImage: MATERIAL_VEIL_MASK }}
        />

        {/* Elevation shadow — see ELEVATION_SHADOW_CLASS doc comment. Sits
            between the material veil and the card panel, sized to match the
            card's own footprint exactly, so it reads as the card's cast
            shadow deepening/softening as it lifts — not as a background
            effect. Card.tsx's own box-shadow is unchanged (still correct
            for TrainerCard/LocationCard on light sections); this is an
            additive, ProgramCard-only layer for this section's dark
            backdrop. */}
        <div aria-hidden="true" className={ELEVATION_SHADOW_CLASS} />

        <Card
          className={cn(
            "relative z-10 flex h-full flex-col",
            featured
              ? // Flagship distinction: a static 2px yellow border only — no
                // blur, no animation. The previous treatment (infinite
                // breathing box-shadow glow) read as a spotlight/halo effect,
                // which conflicts with this section's "physical elevation,
                // not lighting" material language. `border` (not a
                // box-shadow utility) deliberately avoids competing with
                // Card's own inline `boxShadow` style, which would otherwise
                // silently win over a same-property Tailwind class.
                "border-2 border-brand-yellow/60"
              : "border border-border-subtle/60"
          )}
        >
          <CardMedia ratio="landscape" className="aspect-[4/5] sm:aspect-[16/10] lg:aspect-[4/5]">
            {premium ? (
              <motion.div
                aria-hidden="true"
                className="absolute inset-0 will-change-transform"
                animate={PREMIUM_BREATHE.animate}
                transition={PREMIUM_BREATHE.transition}
              >
                <Image
                  src={program.imageSrc}
                  alt={program.imageAlt}
                  fill
                  sizes="(min-width: 1440px) 400px, (min-width: 1024px) calc((100vw - 112px) / 3), (min-width: 640px) 45vw, 85vw"
                  className={cn(
                    "object-cover transition-transform duration-500 ease-out lg:group-hover:scale-[1.04]",
                    focalPointOverrides[program.slug] ?? "object-center"
                  )}
                />
              </motion.div>
            ) : (
              <Image
                src={program.imageSrc}
                alt={program.imageAlt}
                fill
                sizes="(min-width: 1440px) 400px, (min-width: 1024px) calc((100vw - 112px) / 3), (min-width: 640px) 45vw, 85vw"
                className={cn(
                  "object-cover transition-transform duration-500 ease-out lg:group-hover:scale-[1.08]",
                  focalPointOverrides[program.slug] ?? "object-center"
                )}
              />
            )}

            {/* Always-on depth: bottom gradient + soft vignette, independent of hover. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/55 via-ink/5 to-transparent transition-opacity duration-300 ease-out lg:group-hover:from-ink/70"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgb(20_24_29/0.25)_100%)]"
            />

            {featured && (
              <Badge
                className={cn(
                  "pointer-events-none absolute left-3 top-3 z-10",
                  premium && "transition-[filter] duration-500 ease-out lg:group-hover:brightness-110"
                )}
              >
                Flagship Format
              </Badge>
            )}

            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-3 font-display text-4xl text-white/35 lg:text-5xl"
              style={{ WebkitTextStroke: "1px rgba(255,255,255,0.5)" }}
            >
              {number}
            </span>
          </CardMedia>

          {premium ? (
            // Premium content choreography — pure variant propagation, no own
            // initial/animate: the outer wrapper's `when: "beforeChildren"` +
            // `staggerChildren: 0.07` drives this sequence (image/card reveal
            // first, then title → description → CTA at ~70ms steps), and the
            // per-card `delay` (getStaggerDelay(index)) offsets the whole group
            // so the continuous 0–8 stagger across both rows is preserved. The
            // container is a motion.div (with no own initial/animate) so the
            // outer wrapper's variant state propagates through it to the leaf
            // motion.divs below — a plain div would break that propagation.
            <motion.div className="flex flex-1 flex-col">
              <motion.div variants={PREMIUM_ITEM}>
                <Heading level="subsection" as="h3" className="text-ink">
                  {program.name}
                </Heading>
              </motion.div>
              <motion.div variants={PREMIUM_ITEM}>
                <BodyText size="standard" className="mt-2 text-text-secondary">
                  {program.hook}
                </BodyText>
              </motion.div>
              <motion.div variants={PREMIUM_ITEM} className="mt-4 flex items-center gap-2 font-body text-caption font-semibold uppercase tracking-wide text-ink">
                <span className="relative">
                  View Program
                  <span className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-100 bg-ink transition-transform duration-300 ease-out lg:scale-x-0 lg:group-hover:scale-x-100" />
                </span>
                <Icon
                  icon={ArrowRight}
                  size="sm"
                  className="transition-transform duration-300 ease-out lg:group-hover:translate-x-1"
                />
              </motion.div>
            </motion.div>
          ) : (
            <div className="flex flex-1 flex-col">
              <Heading level="subsection" as="h3" className="text-ink">
                {program.name}
              </Heading>
              <BodyText size="standard" className="mt-2 text-text-secondary">
                {program.hook}
              </BodyText>

              <div className="mt-4 flex items-center gap-2 font-body text-caption font-semibold uppercase tracking-wide text-ink">
                <span className="relative">
                  View Program
                  <span className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-100 bg-ink transition-transform duration-300 ease-out lg:scale-x-0 lg:group-hover:scale-x-100" />
                </span>
                <Icon
                  icon={ArrowRight}
                  size="sm"
                  className="transition-transform duration-300 ease-out lg:group-hover:translate-x-1"
                />
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </Link>
  );
}