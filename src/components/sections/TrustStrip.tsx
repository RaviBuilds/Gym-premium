import Image from "next/image";
import { PageSection } from "@/components/layout";
import { StatCounter } from "@/components/ui";
import { CameraGroup, AnimatedDivider } from "@/components/motion";

/**
 * TrustStrip — Homepage-Architecture.md §2 Trust Strip.
 *
 * Real numbers only (siteConfig.foundedYear, program/branch/trainer counts
 * — all traceable to actual content elsewhere on this page), no CTA — a
 * deliberate visual pause after the Hero's intensity, per that section's
 * spec. "Since 2016" uses variant="static" per StatCounter's own doc
 * comment: a year shouldn't roll through every intermediate value.
 *
 * ── Motion: two planes, not six ──────────────────────────────────────────
 * A previous version gave each of the four stats its own `useCameraLayer`
 * (via `index` → `indexLag`), plus separate subscriptions for the background
 * texture and glow — six scroll listeners for a section the architecture
 * defines as a single "Whole Statistics Plane." That per-stat depth was also
 * imperceptible: a few pixels of amplitude spread across nine subscriptions'
 * worth of measurement overhead.
 *
 *   Background Plane        texture + glow, merged into ONE CameraGroup.
 *                            Still the section's own depth cue relative to
 *                            the content in front of it — just one
 *                            subscription instead of two.
 *   Whole Statistics Plane   the divider + all four stats, as ONE rigid
 *                            group. The row now moves as a single object;
 *                            there is no depth differentiation between
 *                            individual numbers, because nobody perceives
 *                            four numbers as sitting at four different
 *                            distances — they perceive one row.
 *
 * The `lg:divide-x` rules stay on the grid, which lives entirely *inside*
 * the CameraGroup now, so dividers move with the numbers as one composition
 * rather than staying pinned to a separate untransformed frame.
 *
 * This stays a Server Component: CameraGroup is itself the client boundary,
 * so the section ships no additional hydration beyond the two motion layers.
 *
 * Spacing stays on "compact" (not "standard") deliberately: the Hero
 * already ends on its own dark fade, so this section needs a tight,
 * confident band directly under it, not a second stretch of empty ink.
 */
const stats = [
  { value: 2016, label: "Since", variant: "static" as const },
  { value: 2, label: "Hyderabad Locations" },
  { value: 9, label: "Training Disciplines" },
  { value: 6, label: "Dedicated Trainers" },
];

export function TrustStrip() {
  return (
    <PageSection tone="dark" spacing="compact" className="relative overflow-hidden">
      {/* Background Plane — texture + glow as one object, one subscription. */}
      <CameraGroup depth="deepBackground" fill decorative>
        <div className="relative h-full w-full scale-110 opacity-[0.08] grayscale blur-2xl">
          <Image src="/training-energy-banner.webp" alt="" fill className="object-cover" />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(255,222,1,0.05) 0%, transparent 65%)",
          }}
        />
      </CameraGroup>

      {/* Deliberately NOT on a camera plane: this gradient's job is to blend
          this section's edges into the Hero above and Programs below. It has to
          stay welded to the section frame or the seam it hides would move. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink via-transparent to-ink"
      />

      {/* Whole Statistics Plane — divider + all four stats, one rigid group. */}
      <CameraGroup depth="interactive" className="relative">
        <AnimatedDivider
          orientation="horizontal"
          className="mx-auto mb-10 h-px w-16 bg-brand-yellow lg:mb-12 lg:w-24"
        />

        <div className="grid grid-cols-2 gap-y-12 lg:grid-cols-4 lg:divide-x lg:divide-border-dark lg:gap-y-0">
          {stats.map((stat) => (
            <div key={stat.label} className="lg:px-8">
              <StatCounter value={stat.value} label={stat.label} variant={stat.variant} />
            </div>
          ))}
        </div>
      </CameraGroup>
    </PageSection>
  );
}
