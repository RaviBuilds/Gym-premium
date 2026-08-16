import { HEX_CLIP, HEX_CLIP_INSET } from "@/lib/shapes";
import { cn } from "@/lib/utils";

/**
 * RosterIndexChip — the two-digit index numeral inside a flat-top hexagon
 * (design.md §5.3, §5.4, Requirement 2.7).
 *
 * This is how two of the section's three shared motifs enter a card at once:
 * the **index numeral** carried forward from Programs, and the **flat-top
 * hexagon** already shipping in `SceneNavigator` and `StripNavigator`. Programs
 * paints its numeral bare in the card's top-right corner; here it sits in a
 * chip, which is what lets the hexagon join the section without inventing a
 * decorative element that exists only to be decorative.
 *
 * ## Construction — matched to `StripNavigator`'s hex steppers
 *
 * Two nested boxes, both clipped to the same polygon:
 *
 * 1. **Rim** — the full-size box, `bg-white/10`. Reads as a machined edge
 *    catching the same overhead-left key light as the plinth's frame hairline.
 * 2. **Core** — `inset-[2px]`, `bg-ink`. The 2px rim thickness comes from the
 *    inset box, never from a second, tighter polygon: scaling a hexagon path
 *    thins the rim unevenly along its diagonals, which is exactly the reasoning
 *    recorded on `HEX_CLIP_INSET` in `src/lib/shapes.ts`.
 *
 * `StripNavigator` uses `bg-white/25` for its rim because a stepper is an
 * interactive control that has to advertise itself. This chip is decoration on
 * a photograph, so design.md §5.1 puts it at `bg-white/10` — bright enough to
 * describe the hexagon's edge, dim enough that five of them across a grid row
 * do not read as five buttons.
 *
 * ## Why it is always `aria-hidden`
 *
 * A numeral is not identity (Requirement 2.7, design.md §5.3). The coach's name
 * in a real `<h3>` carries that, and a screen reader announcing "zero four,
 * Anuradh Aleti" would be reading the section's layout aloud. So the chip is
 * unconditionally hidden from assistive tech and unconditionally
 * `pointer-events-none` — there is deliberately no prop to opt out of either,
 * because there is no call site where exposing a decorative numeral would be
 * correct (Requirement 6.3).
 *
 * Exactly one chip renders per coach, and each chip holds exactly one numeral.
 * The Phase 4 oversized backdrop numeral behind each cutout is retired rather
 * than kept alongside this one, since two numerals per card is precisely the
 * duplication Requirement 2.7 rules out.
 *
 * ## No client JavaScript
 *
 * No `"use client"` directive: this renders in whichever tree imports it, which
 * today is the Server tree via `TrainerPlinth`. It holds no state and binds no
 * handlers, so the hover glow specified in design.md §8.4 is a CSS group variant
 * off the ancestor `<a class="group">` — see {@link CHIP_GLOW_CLASSES}.
 */

/**
 * The hover glow — one hex-clipped warm layer, `opacity 0 → 0.14`
 * (Requirement 4.1, design.md §8.4).
 *
 * It is the chip's whole contribution to the card's interaction: the numeral
 * warms as if the same light that lifts the plinth caught the chip's face. Only
 * `opacity` animates, so the compositor handles it and the hexagon's clip is
 * never recomputed (Requirement 7.5).
 *
 * ## Why it is a warm radial and not `bg-brand-yellow`
 *
 * design.md §8.4 describes this as "a hex-clipped brand-yellow layer", and a
 * literal reading would reach for `bg-brand-yellow`. That would break
 * Requirement 2.4, which allows a roster card **exactly one** brand-yellow
 * descendant on hover — the name underline — and exactly zero at rest. A second
 * `bg-brand-yellow` element inside the chip would make it two.
 *
 * So the glow is expressed the way the section already expresses *light* rather
 * than *accent*: an `rgba` radial, the same construction as the lead plinth's
 * `rgba(234,179,8,0.11)` backlight in `TrainerPlinth`. That precedent is
 * load-bearing — Requirement 2.5 counts the section's resting yellow accents as
 * three and does not count the lead's yellow backlight among them, because a
 * sub-15% warm gradient reads as a light source, not as a spotlight the brand is
 * spending. At 14% peak over an ink core this one is well inside the same
 * category.
 *
 * The result is the design's intent (a warm chip on hover) with the accent budget
 * intact. Do not "correct" it to the token colour.
 *
 * The radial rather than a flat fill is what keeps it reading as a glow: a flat
 * 14% yellow over the whole chip is a tinted hexagon, whereas a bloom from just
 * above centre falls off before the rim and leaves the machined edge legible.
 */
const CHIP_GLOW_GRADIENT =
  "radial-gradient(circle at 50% 42%, rgba(234,179,8,0.95) 0%, rgba(234,179,8,0.4) 52%, transparent 78%)";

/**
 * Glow triggers and timing.
 *
 * `lg:group-hover:` for pointer and `group-focus-visible:` for keyboard — the
 * same pair, off the same ancestor `<a class="group">`, that `TrainerPlinth`'s
 * backdrop plate uses, so hover and focus reach an identical end state with no
 * second code path (Requirements 4.1, 4.2). `focus-visible` rather than
 * `focus-within` because the anchor is itself the focusable element; the wider
 * `focus-within` is reserved for the dossier layer, where Requirement 6.4 names
 * it.
 *
 * `duration-500` is the Closed_Motion_Vocabulary's 0.5s (Requirement 3.9), and
 * because it is a transition the glow fades back out over the same 500ms when
 * the pointer or focus leaves (Requirement 4.7). `motion-safe:` gating means a
 * reduced-motion visitor gets the same end state instantly rather than a
 * cross-fade.
 */
const CHIP_GLOW_CLASSES =
  "opacity-0 lg:group-hover:opacity-[0.14] group-focus-visible:opacity-[0.14]";
const CHIP_GLOW_TRANSITION_CLASSES =
  "ease-out motion-safe:transition-opacity motion-safe:duration-500";

/**
 * Chip footprint — 32px, 36px at `sm:`, 40px at `lg:`.
 *
 * The ramp is a legibility floor, not a flourish. The chip is sized against the
 * frame it sits in, and that frame ranges from roughly 85vw in the mobile swipe
 * strip to a third of the grid on desktop. A flat 40px chip would crowd the
 * small frame's corner; a flat 32px chip would leave the numeral too small to
 * read on the lead spread.
 *
 * `size-*` sets width and height together, which keeps the hexagon's flats and
 * points on their intended angles — a non-square box shears the polygon.
 */
const CHIP_SIZE_CLASSES = "size-8 sm:size-9 lg:size-10";

/**
 * Numeral treatment: `font-display` (Archivo Black), `text-white/70`, drawn from
 * design.md §5.1's paint-order row for this layer.
 *
 * `tabular-nums` is doing real work rather than being applied by habit. There is
 * **no monospace face** in the two-family system (`Archivo Black` + `Inter`),
 * and importing one to align numerals would break the two-font rule that
 * Requirement 2.10 holds this section to. Tabular figures give the same result
 * for free: every numeral advances the same width, so `01` through `06` sit
 * optically centred in identical chips instead of `1` pulling its pair left.
 *
 * `text-caption` / `text-caption-lg` are existing `globals.css` tokens, so no
 * new type token is introduced (Requirement 2.10). `leading-none` is what keeps
 * the numeral centred inside the hexagon: the token's 1.5 line-height would add
 * half-leading above and below the digits, and since a hexagon's usable area is
 * its middle band, that leading would push the numeral visibly off-centre.
 */
const NUMERAL_CLASSES =
  "font-display text-caption leading-none tabular-nums text-white/70 lg:text-caption-lg";

export interface RosterIndexChipProps {
  /**
   * Two-digit display index, e.g. `"01"` — as produced by `formatIndex`.
   *
   * Rendered verbatim. The chip is sized for two digits, and a wider numeral
   * (a roster of 100+ coaches) overflows the hexagon visibly on purpose rather
   * than being clipped into a lie — the same reasoning `formatIndex` records
   * for not truncating.
   */
  index: string;
  /**
   * Positioning and any per-call-site overrides. Deliberately how the chip is
   * placed: this component owns the shape, the size ramp and the numeral, while
   * the frame that contains it owns where in that frame it sits — so the chip
   * stays reusable for the CTA tile and any future hex-chip call site without
   * carrying a `position` prop it would have to guess at.
   */
  className?: string;
}

export function RosterIndexChip({ index, className }: RosterIndexChipProps) {
  return (
    // Decoration, unconditionally: hidden from assistive tech and untargetable
    // by the pointer, so it can never intercept a click meant for the card's
    // link (Requirement 6.3).
    <span
      aria-hidden="true"
      className={cn("pointer-events-none relative block", CHIP_SIZE_CLASSES, className)}
      style={{ clipPath: HEX_CLIP }}
    >
      {/* Machined rim — the full-size hexagon. */}
      <span className="absolute inset-0 bg-white/10" style={{ clipPath: HEX_CLIP }} />

      {/* Ink core, inset 2px from the rim. The inset box is what creates the rim
          thickness; see HEX_CLIP_INSET's note in src/lib/shapes.ts. */}
      <span
        className="absolute inset-[2px] flex items-center justify-center bg-ink"
        style={{ clipPath: HEX_CLIP_INSET }}
      >
        <span className={NUMERAL_CLASSES}>{index}</span>
      </span>

      {/* Hover/focus glow, above the core so it warms the numeral as well as the
          rim. At `opacity-0` it paints nothing, so the chip still contributes no
          resting accent to the card (Requirement 2.4). See CHIP_GLOW_GRADIENT
          for why this is an rgba radial rather than the brand-yellow token. */}
      <span
        className={cn("absolute inset-0", CHIP_GLOW_CLASSES, CHIP_GLOW_TRANSITION_CLASSES)}
        style={{ background: CHIP_GLOW_GRADIENT, clipPath: HEX_CLIP }}
      />
    </span>
  );
}
