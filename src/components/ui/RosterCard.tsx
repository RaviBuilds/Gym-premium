import { formatIndex } from "@/components/sections/trainer-showcase/roster";
import { TrainerPlinth } from "@/components/ui/TrainerPlinth";
import { cn } from "@/lib/utils";
import type { Trainer } from "@/types/content";

/**
 * RosterCard — one roster coach's grid cell: a single link wrapping a single
 * presentational plinth (design.md §6.1, §6.2, §13.3).
 *
 * ## Why the whole card is one anchor
 *
 * There is exactly one interactive element per card and it is the outermost
 * thing inside the cell root (Requirement 6.4). Everything a visitor can see of a
 * coach — the frame, the photograph, the name, the role, the pips, the hex
 * numeral, the dossier overlay — is inside it, so the entire 4:5 cell is the
 * click target and there is nothing to aim at. The alternative shape, a card
 * with a small "Book" link tucked in its dossier layer, was rejected twice
 * over: it hides the action behind hover at `lg:`, and a nested control inside a
 * linked card gives the cell two tab stops and an ambiguous activation area.
 *
 * `TrainerDossier`'s booking cue is therefore `aria-hidden` text, not a second
 * link — it is the visual half of this anchor's promise, which is why that file
 * calls it "a cue, not a control".
 *
 * ## Keyboard parity is a side effect, not a second code path
 *
 * The anchor's one structural job beyond navigation is to establish the
 * **unnamed** `group` (see {@link LINK_CLASSES}). Every interaction state in the
 * subtree is a CSS variant off it — `lg:group-hover:` in `TrainerPlinth` and
 * `RosterIndexChip`, `group-focus-visible:` for the cutout scale, plinth lift,
 * plate and chip glow, `group-focus-within:` for the dossier reveal,
 * `group-active:` for the press scale and accent draw. Because those variants
 * are written off the focusable element itself, focusing the card resolves the
 * same declarations hovering it does: the six end states Requirement 4.1 names
 * for a pointer are the six Requirement 4.2 asks for a keyboard, expressed once
 * (design.md §6.2).
 *
 * That is what lets this component hold zero React state, zero effects and zero
 * event handlers (Requirement 4.4), and therefore carry no `"use client"`
 * directive and cost the homepage's hydration budget nothing across all five
 * cards (Requirement 7.8). A `useState`-driven hover would have pulled this file,
 * `TrainerPlinth`, `TrainerDossier` and `RosterIndexChip` into the client bundle
 * for an effect Tailwind already expresses, *and* needed a separate focus path.
 *
 * ## What this file deliberately does not do
 *
 * - **No press scale.** Requirement 4.3's 0.98 tap cue is owned by
 *   `TrainerPlinth`'s inner frame as `motion-safe:group-active:scale-[0.98]`,
 *   driven from this anchor. Adding an `active:scale-[0.98]` here would compound
 *   with it (0.98 × 0.98 ≈ 0.96) and give one gesture two durations.
 * - **No grid placement.** `RosterGrid` (task 9.2) owns the swipe strip, the
 *   two-column grid and the three-column grid, and this card is simply one of
 *   the children handed to it (Requirements 5.1–5.3). No `col-start-*`, no
 *   `row-*`, no breakpoint-specific placement — which is what keeps the grid
 *   valid for 4–7 roster entries with no code change (Requirement 1.8).
 * - **No `suppressName`.** The roster card's name lives in its own label block
 *   and is the only place it appears, so the plinth renders the `<h3>`
 *   (Requirements 6.1, 6.2). `suppressName` belongs exclusively to the lead,
 *   whose dossier column owns that identity (Requirement 6.10).
 */

/**
 * `next/image` `sizes` for the roster cell — one string covering all three
 * containers `RosterGrid` renders (Requirement 7.1).
 *
 * Derived from the actual boxes rather than guessed, walking the breakpoints
 * from the widest down, which is the order the browser evaluates them:
 *
 * | Viewport      | Container                            | Cell width            |
 * |---------------|--------------------------------------|-----------------------|
 * | ≥ 1440px      | 3 cols, `gap-10`, content capped 1280 | `(1280 − 80) / 3` = 400px |
 * | 1024–1439px   | 3 cols, `gap-10`, `px-12` padding     | `(100vw − 96 − 80) / 3` |
 * | 640–1023px    | 2 cols, `gap-8`, `px-6` padding       | `(100vw − 48 − 32) / 2` |
 * | < 640px       | swipe strip at 85% card width         | `85vw`                |
 *
 * The two constants in each `calc` are the `Container` side padding doubled and
 * the gutters between columns: `px-12` is 48px a side (96px total) with two
 * 40px `lg:gap-10` gutters, `px-6` is 24px a side (48px total) with one 32px
 * `gap-8` gutter. At 1440px and above `max-w-content` caps the column at 1280px
 * before `wide:px-20` ever bites, so the cell stops growing and a fixed 400px is
 * the honest answer — the same value `ProgramCard` lands on for its own
 * three-column row.
 *
 * This is why `TrainerPlinth` takes `imageSizes` as a required prop instead of
 * holding a constant: the lead spread renders at 48% of a capped container and this
 * cell at a third, a half or 85vw, and only the call site knows which. A shared
 * value would make one of the two over-fetch at every breakpoint.
 */
const ROSTER_IMAGE_SIZES =
  "(min-width: 1440px) 400px, (min-width: 1024px) calc((100vw - 176px) / 3), (min-width: 640px) calc((100vw - 80px) / 2), 85vw";

/**
 * The link's own classes — three jobs, and nothing decorative.
 *
 * 1. **`group`, unnamed.** Load-bearing, and the reason it must stay unnamed:
 *    `TrainerPlinth`, `TrainerDossier` and `RosterIndexChip` all write bare
 *    `lg:group-hover:`, `group-focus-visible:`, `group-focus-within:` and
 *    `group-active:` variants, which resolve against the nearest *unnamed*
 *    group ancestor. Renaming this to `group/card` would silently kill every one
 *    of those states — the card would still navigate, and nothing would ever
 *    respond to hover or focus again. (`RosterCtaTile` uses a named
 *    `group/cta` precisely because it owns its own variants and shares no
 *    subtree with these.)
 * 2. **`block`.** Makes the anchor fill the cell's width so the whole 4:5 frame
 *    is the click target rather than a text-sized inline box. Its height comes
 *    from the plinth's `aspect-[4/5]`, deliberately not from `h-full`: every
 *    cell in the grid carries the same ratio, so the anchor already covers the
 *    row, and stretching it to a taller row would add an invisible strip of
 *    padding that still triggers the card's hover reveal.
 * 3. **The focus ring** — a 2px `brand-yellow` outline at 2px offset
 *    (Requirements 6.4, 4.2), matching the exact utility trio `StripNavigator`
 *    and `SceneNavigator` already use, so the section introduces no second focus
 *    treatment. Yellow on the section's near-black ground measures far past the
 *    3:1 non-text contrast floor, and the 2px offset lifts the ring clear of the
 *    frame's own `border-white/10` edge light so it never reads as a thicker
 *    hairline. It is drawn square because the frames are square — no radius to
 *    match.
 *
 * The ring is the card's *only* focus affordance in this file; the substantive
 * focus states (scale, lift, plate, underline, chip glow, dossier) belong to the
 * subtree and fire from this same element, so keyboard focus gets full parity
 * with hover rather than a bare outline (design.md §12).
 */
const LINK_CLASSES = cn(
  "group block",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
);

export interface RosterCardProps {
  /** The coach in this cell. Plain JSON-serialisable content (design.md §6.2). */
  trainer: Trainer;
  /**
   * Zero-based position **within the roster**, not within `trainers`.
   *
   * Only used to derive the displayed numeral, `formatIndex(position + 2)`: the
   * lead coach owns `01`, so the first roster coach is `02` and the set stays
   * contiguous through `formatIndex(trainerCount)` (Requirement 1.2). The `+ 2`
   * lives here rather than in the caller so a `roster.map((t, i) => …)` call
   * site cannot get the offset wrong.
   *
   * It is not used for reveal timing — `RosterGrid` applies `getStaggerDelay(i)`
   * from the outside, across cards *and* the CTA tile, so the stagger stays one
   * continuous sequence (Requirements 3.2, 3.12).
   */
  position: number;
  /**
   * The section-level booking target, used when this coach has no `ctaHref` of
   * their own (Requirement 4.5).
   *
   * Required rather than defaulted, so the section owns its one conversion
   * target in one place — the same value `RosterCtaTile` receives. A default
   * here would give that target two owners and let a card link somewhere the
   * section never chose.
   */
  fallbackCtaHref: string;
}

export function RosterCard({ trainer, position, fallbackCtaHref }: RosterCardProps) {
  return (
    // CELL ROOT — a plain <div>, matching `RosterCtaTile`, and container-neutral
    // on purpose: this card is rendered inside a `<ul>` in the grid tree and
    // inside `CardGrid`'s `div`s in the swipe strip, and a `<div>` is the one
    // root that is valid in both. The grid tree's list item is supplied by
    // `RosterGrid`'s reveal wrapper (`AnimationWrapper as="li"`), which is the
    // direct child of the `<ul>` — so the list holds list items only and a
    // screen reader announces "list, 6 items" (Requirement 6.6). Rooting an
    // <li> here as well would nest one inside the other.
    //
    // It carries no styling of its own: the plinth's `aspect-[4/5]` sets the
    // cell's geometry, and layout belongs to RosterGrid.
    <div>
      {/* THE CARD'S ONE INTERACTIVE ELEMENT — a real `<a>`, which is what a
          keyboard user tabs to and a screen reader lists (Requirement 6.4).

          A plain anchor rather than `next/link`, which is the one place this
          file departs from house convention (`Footer`, `ProgramCard` and
          `ButtonLink` all use `Link`). Two reasons, both specific to this card:
          `next/link` is a client component, so five of them would hydrate five
          card trees the section is required to ship with zero client JavaScript
          (Requirement 7.8, and design.md §13.7's own snippet writes `<a>`); and
          it prefetches on viewport entry, so five cards pointing at one booking
          target would fire prefetches for a section that sits well below the
          fold. The target is the same-page `#free-trial` anchor today, where
          client-side routing buys nothing anyway.

          `aria-label` names the coach and their role, so the link is
          self-describing out of context and never announces a bare "Book"
          (Requirement 6.7). It is `trainer.title` rather than a discipline pip
          because the title is the role the Content_Registry states.

          Press feedback is NOT here — `TrainerPlinth`'s inner frame owns the
          0.98 scale via `motion-safe:group-active:scale-[0.98]`, driven from
          this element. See this file's doc comment. */}
      <a
        href={trainer.ctaHref ?? fallbackCtaHref}
        aria-label={`Book a session with ${trainer.name}, ${trainer.title}`}
        className={LINK_CLASSES}
      >
        <TrainerPlinth
          trainer={trainer}
          variant="roster"
          index={formatIndex(position + 2)}
          imageSizes={ROSTER_IMAGE_SIZES}
        />
      </a>
    </div>
  );
}
