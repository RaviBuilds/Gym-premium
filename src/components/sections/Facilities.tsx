import Image from "next/image";
import { PageSection } from "@/components/layout";
import { Eyebrow, Heading, BodyText, Icon } from "@/components/ui";
import { AnimationWrapper, AnimatedDivider } from "@/components/motion";
import { getStaggerDelay } from "@/lib/design-tokens";
import { facilities, type Facility } from "@/content/facilities";

/**
 * Facilities — Homepage-Architecture.md nav calls for a distinct
 * "Facilities" section separate from the Programs (training disciplines)
 * grid. Covers physical amenities — equipment, steam room, café, lockers,
 * biometric entry, parking — real facts already documented in the FAQ
 * audit (01-business-analysis.md), not training content.
 *
 * PHASE 1 (editorial redesign, per specifications/sections audit): the
 * section is now an editorial left/right split rather than
 * heading → banner photo → 3x2 icon grid. Left column carries the eyebrow
 * and heading as a fixed editorial text column; right column carries the
 * six amenities as a numbered-list rhythm (01/02 full-width rows, 03/04 and
 * 05/06 as pairs) instead of a uniform card grid. The banner photograph is
 * intentionally removed — this section is meant to read as a
 * typography/layout-driven information experience, not another photography
 * beat (the site already has strong photography elsewhere).
 *
 * PHASE 2 (visual geometry): adds the 01–06 numeral index and the hairline
 * row rules that turn the Phase 1 two-column structure into the "Utility
 * Blueprint" list — still no hover treatment or new motion, those remain
 * later phases. Content, icons, order, and copy are unchanged from
 * `src/content/facilities.ts`.
 *
 * PHASE 3 (rhythm/hierarchy): caps each item's description to a fixed
 * reading measure so full-width 01/02 rows don't stretch text past a
 * comfortable line length; regroups the numeral and icon into one aligned
 * header row so they read as a unit rather than two incidental siblings;
 * anchors the left column to the top of the amenity list (`items-start`)
 * instead of centering against its variable height; and extends the 03/04
 * and 05/06 pairing down to `sm:` so tablet widths don't sit exposed to the
 * same over-wide-line problem. Still no hover treatment, yellow accent
 * rule, or new motion — those remain later phases.
 */

/**
 * Local, unexported render helper — avoids repeating the numeral/icon/
 * title/body JSX shape six times inline. Not a new shared component; lives
 * only inside this file and is not exported.
 *
 * The numeral uses the existing `--text-stat` token (the same scale Trust
 * Strip uses for its count-up figures) rather than a new size, set in
 * `font-display` at very low opacity (`text-ink/15`) so it reads as a quiet
 * structural index — visible, but never competing with the title next to
 * it. `aria-hidden` because the number is a design device, not additional
 * content; the title text already carries the meaning.
 *
 * PHASE 4 (motion + micro-interaction): a restrained hover/focus/touch
 * cue, decorative only — no `tabIndex`, this stays an informational block,
 * not an interactive control. `group` lives on this root div so numeral,
 * icon, and title underline can all respond to one pointer/keyboard-focus/
 * touch state without a JS handler. Numeral shifts +4px (`translate-x-1`)
 * and the icon lifts -2px (`-translate-y-0.5`) — both existing Tailwind
 * steps, not new arbitrary values. The title underline uses the sitewide
 * `bg-[length]` grow-on-hover pattern — a 2px brand-yellow background
 * gradient growing from 0% to 100% width — rather than introducing a second
 * underline technique.
 * `group-focus-visible` covers keyboard, `group-active` covers touch so the
 * cue doesn't depend solely on synthetic hover. Every transform/underline
 * transition is `motion-safe:`-gated so `prefers-reduced-motion` renders the
 * final state with no animated travel or growth. Transform/background-size/
 * color only — no shadow, blur, filter, or scale.
 */
function AmenityItem({ facility, index }: { facility: Facility; index: number }) {
  const numeral = String(index + 1).padStart(2, "0");

  return (
    <div className="group flex flex-col gap-3">
      {/* Numeral + icon share one aligned header row — the index and the
          mark it labels read as a single unit, with title/description
          flowing beneath as a subordinate block. */}
      <div className="flex items-center gap-3 sm:gap-4">
        <span
          aria-hidden="true"
          className="shrink-0 select-none font-display text-stat tabular-nums text-ink/15 transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1 motion-safe:group-active:translate-x-1 lg:text-stat-lg"
        >
          {numeral}
        </span>
        <Icon
          icon={facility.icon}
          size="lg"
          className="text-brand-yellow transition-transform duration-300 ease-out motion-safe:group-hover:-translate-y-0.5 motion-safe:group-focus-visible:-translate-y-0.5 motion-safe:group-active:-translate-y-0.5"
        />
      </div>
      <Heading level="subsection" as="h3" className="text-ink">
        {/* Underline growth only — the sitewide name-accent technique
            (background-size 0%→100%, 2px, brand yellow). */}
        <span className="bg-linear-to-r from-brand-yellow to-brand-yellow bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-400 ease-out motion-safe:group-hover:bg-[length:100%_2px] motion-safe:group-hover:duration-300 motion-safe:group-focus-visible:bg-[length:100%_2px] motion-safe:group-active:bg-[length:100%_2px]">
          {facility.title}
        </span>
      </Heading>
      {/* Capped to a normal reading measure regardless of the row's full
          available width — prevents full-width 01/02 rows from stretching
          the description past a comfortable line length. */}
      <BodyText size="standard" className="max-w-md text-text-secondary">
        {facility.description}
      </BodyText>
    </div>
  );
}

/** Editorial hairline — the "connects the amenity system" rule between
 *  rows. Uses the existing subtle-border token as a 1px fill rather than a
 *  Tailwind `border` utility, purely so it reads as one continuous rule
 *  across the row's full width instead of a per-item card edge. Static,
 *  decorative — no motion in this phase. */
function RowRule() {
  return <div aria-hidden="true" className="h-px w-full bg-border-subtle" />;
}

export function Facilities() {
  return (
    <PageSection tone="light" spacing="standard" className="relative overflow-hidden">
      {/* Background photograph — decorative texture only, and deliberately
          constrained on two axes:

          1. OPACITY (8%). Contrast math, not taste: `text-secondary`
             (#5B6069) needs the plate behind it to stay at roughly sRGB 220+
             to clear the 4.5:1 WCAG AA floor for normal-size text. The
             darkest regions of this photo sit near sRGB 30, so blending it
             over Surface Light (#FAF9F6) at 15% pulls those areas to ~219 —
             about 4.3:1, i.e. just under AA — and the edge vignette + bottom
             blend stack further darkening on top of that. 8% keeps the
             darkest patch near ~232 (~5.2:1) so every description stays
             above AA with headroom at any viewport height.
          2. MASK. The photo dissolves left→right so it never sits behind the
             dense amenity copy in the right column, where the ribbed-mat
             texture was competing with body text at small sizes. It stays
             visible in the left editorial column's open space, which carries
             only the large `text-ink` heading (>12:1 — unaffected).

          Together these keep the section reading as the typography-driven
          composition it's specified as (Phase 1 note above) with the photo as
          a ground texture, rather than as a photography beat. Sits beneath
          every gradient/vignette layer below so those still blend over it
          normally. No parallax/CameraLayer — this section stays free of
          scroll-linked media per specifications/02-motion-system.md. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          maskImage:
            "linear-gradient(105deg, #000 0%, #000 26%, rgba(0,0,0,0.4) 52%, transparent 72%)",
          WebkitMaskImage:
            "linear-gradient(105deg, #000 0%, #000 26%, rgba(0,0,0,0.4) 52%, transparent 72%)",
        }}
      >
        <Image
          src="/images/sections/everything-you-need/image1.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      {/* Visual continuity — Phase 3. Top blend dissolves the dark→light
          transition from WhyInfiniti (Ink → Surface Light), bottom blend
          dissolves the light→dark transition into TrainerShowcase. A faint
          neutral vignette gives this flat light section depth parity with
          the premium sections above/below. All layers are aria-hidden +
          pointer-events-none atmosphere — static CSS, zero motion cost. */}
      {/* Top blend — receives WhyInfiniti's dark tone and dissolves into the
          light section, turning the hard black→white cut into a soft twilight.
          Peak opacity lowered so the dark hand-off reads as a gradual lift
          out of shadow rather than a visible dark band parked on white. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 sm:h-24 lg:h-32"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,24,29,0.45) 0%, rgba(20,24,29,0.1) 40%, transparent 100%)",
        }}
      />
      {/* Bottom blend — carries the light section into TrainerShowcase's dark
          top. Strength matches TrainerShowcase's top blend so the dark return
          is anticipated here, not pasted on below. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 sm:h-24 lg:h-32"
        style={{
          background:
            "linear-gradient(0deg, rgba(20,24,29,0.18) 0%, transparent 100%)",
        }}
      />
      {/* Edge vignette — invisible perimeter depth so the section reads as a
          contained volume rather than a flat white field */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 130% 100% at 50% 35%, transparent 55%, rgba(20,24,29,0.06) 100%)",
        }}
      />
      {/* Warm radial wash — inherited from the Testimonials light section so
          every light section shares the same warm ambient light source, not a
          different temperature per band. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 35%, rgba(255,222,1,0.03) 0%, transparent 65%)",
        }}
      />
      <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
        {/* Left — editorial text column. Fixed width at lg+ (~5/12), stacks
            above the amenity list below lg. Anchored to the top of the
            amenity list (beside numeral 01) rather than centered against
            its full height — a deliberate masthead-beside-a-list
            relationship instead of a content-dependent floating position. */}
        <div className="flex flex-col gap-3 lg:w-5/12 lg:shrink-0">
          <AnimationWrapper>
            <Eyebrow tone="light">Everything You Need</Eyebrow>
          </AnimationWrapper>
          <AnimationWrapper preset="small" delay={0.08}>
            <Heading level="section" as="h2" className="text-ink">
              Everything you need, nothing you&apos;re paying extra for
            </Heading>
          </AnimationWrapper>
          <AnimatedDivider
            delay={0.16}
            orientation="horizontal"
            className="h-px w-12 bg-brand-yellow lg:w-16"
          />
        </div>

        {/* Right — amenity system. 01/02 each take a full-width row; 03/04
            and 05/06 pair up two-per-row starting at sm: (tablet), staying
            single-column only on genuinely narrow mobile widths where a pair
            would cramp line lengths. Hairline rules between every row turn
            the stack into one connected editorial list rather than six
            independent blocks. */}
        <div className="flex flex-col gap-6 lg:w-7/12">
          {facilities.slice(0, 2).map((facility, index) => (
            <div key={facility.title} className="flex flex-col gap-6">
              <AnimationWrapper delay={getStaggerDelay(index)}>
                <AmenityItem facility={facility} index={index} />
              </AnimationWrapper>
              <RowRule />
            </div>
          ))}

          <div className="flex flex-col gap-6">
            <div className="grid gap-8 sm:grid-cols-2">
              {facilities.slice(2, 4).map((facility, index) => (
                <AnimationWrapper key={facility.title} delay={getStaggerDelay(index + 2)}>
                  <AmenityItem facility={facility} index={index + 2} />
                </AnimationWrapper>
              ))}
            </div>
            <RowRule />
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {facilities.slice(4, 6).map((facility, index) => (
              <AnimationWrapper key={facility.title} delay={getStaggerDelay(index + 4)}>
                <AmenityItem facility={facility} index={index + 4} />
              </AnimationWrapper>
            ))}
          </div>
        </div>
      </div>
    </PageSection>
  );
}
