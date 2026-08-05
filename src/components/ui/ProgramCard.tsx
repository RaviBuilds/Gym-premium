"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Card, CardMedia } from "./Card";
import { Badge } from "./Badge";
import { Heading, BodyText } from "./Heading";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";
import type { Program } from "@/types/content";

/**
 * Per-slug focal point overrides — the shared card crop (4:5 mobile/desktop,
 * 16:10 tablet) center-crops by default, which clips the actual subject on
 * a few source photos shot off-center. Cardio's source photo places the
 * subject in the upper-right two-thirds of the frame, so a plain `center`
 * crop loses most of it; kick-boxing and rock-climbing are shot portrait
 * with the subject high in frame, so they need to anchor toward the top
 * rather than vertical-center. Every other program's source photo is
 * already centered on its subject and is left on the CardMedia default.
 */
const focalPointOverrides: Partial<Record<Program["slug"], string>> = {
  cardio: "object-[78%_28%]",
  "kick-boxing": "object-[50%_15%]",
  "rock-climbing": "object-[50%_10%]",
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
 */
export function ProgramCard({
  program,
  index,
  featured = false,
}: {
  program: Program;
  index: number;
  featured?: boolean;
}) {
  const number = String(index + 1).padStart(2, "0");
  const accessibleLabel = `${program.name} training at Infiniti Fitness — view program details`;

  return (
    <Link
      href={`/programs/${program.slug}`}
      aria-label={accessibleLabel}
      className="group block h-full rounded-card transition-opacity duration-200 ease-out active:opacity-90"
    >
      <motion.div
        className="h-full"
        whileHover={{ scale: 1.012 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card
          className={cn(
            "flex h-full flex-col",
            featured
              ? "motion-safe:animate-[card-glow_3s_ease-in-out_infinite] shadow-[0_0_0_1px_rgb(255_222_1_/_0.45),0_0_24px_rgb(255_222_1_/_0.18)]"
              : "border border-border-subtle/60"
          )}
        >
          <CardMedia ratio="landscape" className="aspect-[4/5] sm:aspect-[16/10] lg:aspect-[4/5]">
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
              <Badge className="pointer-events-none absolute left-3 top-3 z-10">Flagship Format</Badge>
            )}

            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-3 font-display text-4xl text-white/35 lg:text-5xl"
              style={{ WebkitTextStroke: "1px rgba(255,255,255,0.5)" }}
            >
              {number}
            </span>
          </CardMedia>

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
        </Card>
      </motion.div>
    </Link>
  );
}
