# Hero — Implementation Spec (Version 2)

*Reads against [00-design-principles.md](../00-design-principles.md), [01-design-system.md](../01-design-system.md), [02-motion-system.md](../02-motion-system.md). Version 1 source: `src/components/sections/Hero.tsx`.*

---

## 1. Section Purpose

The Hero has under 3 seconds to prove three things at once: this is a real, energetic gym (not a template); the promise is blunt and legible ("Stop being a dumbbell, burn fat, not muscle."); there's an obvious, low-risk next step. It solves the "is this worth my time" decision every first-time visitor makes almost instantly. The visitor should feel a jolt of "this place means it" — confident, athletic, slightly blunt — and should leave the Hero already knowing what to click.

## 2. Design Philosophy

Confident and calm, not chaotic. Energy comes from the photograph itself (a real training moment) and from one clean cinematic gesture (the existing slow zoom), not from busy motion layered on top. Blunt honesty in tone, matching the headline's actual words — no soft marketing gloss.

## 3. Storytelling Goal

Eye path: **photo → headline line 1 → headline line 2 (larger, the punchline) → subhead → primary CTA → trust cue.** The visitor should register the environment first (photo, half a second), then read the promise as two escalating beats (the setup line, then the larger payoff line), then get the practical next step. This is already Version 1's intended sequence — Version 2 keeps it and adds one thing Version 1 lacks: a subtle sense that the photo has depth (parallax) rather than being a static backdrop the text sits in front of.

## 4. Visual Hierarchy

1. Headline (two-line, escalating scale)
2. Photograph / background
3. Primary CTA ("Book Free Trial")
4. Subheadline
5. Secondary CTA ("See Membership Plans")
6. Trust cue row
7. Scroll indicator

Photo is priority 2, not 1, deliberately — it's the stage, the headline is the statement being made on that stage. This differs from a generic hero where the image is the whole point.

## 5. Desktop Layout Specification

- Section height: `min-h-[calc(100vh-80px)]` (viewport minus the 80px navbar). Content anchored to the bottom (`items-end`) — unchanged from Version 1, this is correct: it keeps the headline near the trust-building content below without forcing full vertical centering that would waste the photo's upper two-thirds.
- Container: use the standard `Container` component (side padding 48px at 1024–1439px, 80px at ≥1440px, max-width 1280px) — **correction from Version 1**, which hand-rolls the padding scale inline instead of importing `Container`. Functionally identical values, but Version 2 requires the shared component so the padding scale can never drift from the system.
- Headline max-width: 16ch at desktop (unchanged) — keeps the two-line break intentional, not accidental.
- CTA row: primary and secondary side by side, `gap-4`. Primary renders visually heavier: solid yellow fill vs. secondary's outline — this is the existing contrast and it's sufficient at this size; do not add extra scale difference between the two buttons (see §15 for why).
- Trust cue row: sits 16px below the CTA row, inline, small caption-scale text.
- Scroll cue: bottom-center, `bottom-6`, visible only in this desktop instance (`hidden lg:flex`).
- Vertical gap between headline block, subhead+CTA block, and trust row: use the standard scale — 32px (`gap-8`) between major blocks. **Correction from Version 1:** the current `gap-3 sm:gap-6 lg:gap-5 wide:gap-9` sequence shrinks from 24px (sm) to 20px (lg) before growing to 36px (wide) — a non-monotonic step that has no stated rationale. Version 2 uses a monotonically increasing gap: 12px (mobile) → 24px (sm) → 32px (lg) → 36px (wide).

## 6. Tablet Layout Specification

- Same bottom-anchored composition as desktop, at tablet type scale (still the "mobile" typography tier per [01-design-system.md](../01-design-system.md) until the `lg:` 1024px breakpoint — tablet does not get an intermediate type size).
- CTA row switches to horizontal (`sm:flex-row`) at 640px, same as Version 1 — correct, no change.
- Parallax on the background image is **disabled** below 1024px (unchanged rule, `disableOnMobile` default) — tablet gets the static hero-zoom only, no scroll-linked drift.

## 7. Mobile Layout Specification

- Section height: `min-h-[calc(100svh-80px)]` (small-viewport-height unit, correctly avoids mobile browser chrome jump).
- Headline max-width 20ch, both lines stack, mobile type scale (36px line 1 / 44px line 2 display size).
- CTA row stacks full-width (`flex-col`), primary CTA first/top — unchanged, correct.
- Trust cue row wraps to caption scale, stays inline (not stacked) unless width forces a wrap.
- Scroll cue: separate, in-flow instance directly beneath the trust row (`lg:hidden`) — **keep the current dual-instance approach** (see §16 for why this isn't consolidated).
- Bottom padding reserves space for the mobile Sticky CTA bar (`pb-[calc(76px+env(safe-area-inset-bottom)+8px)]`) — unchanged, this is correct and necessary.

**At exact widths (per [03-responsive-system.md](../03-responsive-system.md) §4):**
- **320px / 375px / 390px / 430px:** identical structural layout — single column, stacked CTAs, headline at mobile scale, image crop `object-[82%_20%]`. No behavior changes across these four widths; only available line-length increases slightly.
- **768px:** enters tablet tier. CTA row is already horizontal (crossed at 640px). Image crop shifts to `object-[74%_18%]`. Parallax still disabled (only enables at 1024px).

## 8. Spacing System

| Relationship | Value |
|---|---|
| Eyebrow → Headline | 12px (`gap-3`, mobile) / 24–36px at larger breakpoints per §5's monotonic scale |
| Headline → Subhead block | Same block gap as above |
| Subhead → CTA row | 16px (unchanged, `gap-4` within the bordered sub-block) |
| CTA row → Trust cue | 16px (unchanged) |
| Section bottom padding (content-to-viewport-edge) | Per existing responsive calc — unchanged |
| Container side padding | Standard scale: 16/24/48/80px per [03-responsive-system.md](../03-responsive-system.md) §2 |

## 9. Motion Choreography

Tier 1 — Establishing (per [02-motion-system.md](../02-motion-system.md) §2). Fastest, most front-loaded sequence on the page, completing in under 900ms.

**Load sequence (unchanged from Version 1, all values confirmed correct):**
1. Eyebrow line: fade, delay 0.05s
2. Headline: `KineticHeadline` per-word mask reveal, `y: 110%→0%`, duration 0.5s, delay `0.1 + index*0.06` per word — line 1 then line 2
3. Subhead: fade-up, delay 0.24s
4. CTA row: fade-up, delay 0.34s
5. Trust row: fade-up, delay 0.44s
6. Scroll cue: fade, delay 0.5s

**Background treatment — this is where Version 2 changes behavior:**
- Keep the existing `hero-zoom` CSS keyframe (scale 1→1.08 over 18s, `forwards`, plays once, gated `motion-safe:`).
- **Do not** run `ParallaxLayer`'s scroll-linked transform simultaneously with the zoom on the same image layer — Version 1 stacks both, uncoordinated, on one `<Image>`. Version 2 requires: the zoom keyframe runs on the `<Image>` element itself; `ParallaxLayer`'s scroll-linked translate applies to its own wrapping layer, which contains the image — i.e., two nested layers, one static-zooming, one scroll-translating, so they compose predictably (translate never fights the transform-origin of the zoom) instead of two independent transforms both targeting the same element's `transform` property, which is the actual bug risk in Version 1 (later transform wins/overwrites, depending on implementation order).
- Parallax drift: 40px max (unchanged), desktop-only (`disableOnMobile`, unchanged).

**Overlay treatment — consolidate, don't add:**
- Version 1 stacks four separate absolutely-positioned overlay divs (directional scrim, yellow rim-light radial, vignette radial, bottom fade). Version 2 requires these be authored as **one** layered CSS `background-image` with multiple gradient layers (`background-image: linear-gradient(...), radial-gradient(...), radial-gradient(...), linear-gradient(...)`) on a single div, rather than four stacked DOM elements. Same visual output, fewer paint layers — a performance and maintainability correction (see §13), not a visual change. Exact gradient values are unchanged from Version 1's four layers.

**Reduced motion:** hero-zoom, parallax, and all `AnimationWrapper`/`KineticHeadline` reveals collapse to instant final-state — headline fully visible immediately, no word-mask, no zoom, no drift. This is unchanged sitewide behavior per [02-motion-system.md](../02-motion-system.md) §5.

## 10. Scroll Behaviour

- Background photo: continuous scroll-linked parallax, 40px max drift, desktop only (≥1024px), per §9's two-layer correction.
- Text content: scroll-locked, never drifts — the headline/CTA block must stay exactly where entrance animation placed it as the user scrolls past the Hero; only the background layer moves.
- No exit transition — the Hero simply scrolls out of view as TrustStrip scrolls in. No fade-out, no scale-down on exit (consistent with [02-motion-system.md](../02-motion-system.md) §4's "no bespoke exit transitions" rule).

## 11. Micro Interactions

- Primary CTA: wrapped in `MagneticButton` (≤8px cursor-follow, desktop pointer only) — unchanged, keep.
- Secondary CTA: **not** magnetic (unchanged) — reinforces the primary/secondary weight difference through interaction, not just color.
- Both buttons: standard press-state `scale(0.97)` per [01-design-system.md](../01-design-system.md) button system.
- Scroll cue: looping `y: [0,6,0]` over 2s, infinite, gated by `useReducedMotion` — unchanged, this is the one sitewide exception to "no infinite loops" and it's justified because it's a wayfinding affordance, not decoration.

## 12. Accessibility

- Hero image `alt=""` (deliberately decorative/atmospheric) — unchanged, acceptable since the headline text conveys the section's meaning independently of the photo's specific content.
- All four (now one, per §9) overlay layers: `aria-hidden="true"`.
- Trust row separators (currently plain "/" characters): replace with a `•` (middot) character or a small `Icon` (e.g. a 4px dot) — **correction**, see §15. Keep `aria-hidden="true"` on whichever is used.
- `H1` semantic tag preserved via `as="h1"` on the Heading component, spanning both visual lines — unchanged, correct.
- Scroll cue: `aria-label="Scroll to What We Offer"` — unchanged, correct.
- Touch targets: both CTAs meet 44px minimum at every breakpoint (`w-full` on mobile already exceeds this).

## 13. Performance Constraints

- Hero image: `priority`, `sizes="100vw"` — unchanged, correct (this is the LCP element).
- **Correction:** consolidate the four overlay divs into one gradient-layered div (per §9) — reduces DOM nodes and composite layers from 5 (image + 4 overlays) to 2 (image + 1 gradient overlay), a measurable paint-cost reduction with zero visual difference.
- Two independent transform systems on the same image (zoom keyframe + parallax translate) must be resolved into the two-layer structure in §9 — prevents potential layout-thrash or visual conflict at scroll-start, and keeps both animations GPU-composited (`transform`/`opacity` only, unchanged).
- No `width`/`height`/`top`/`left` animation anywhere in this section — confirmed compliant in Version 1, keep it that way.

## 14. Acceptance Criteria

- ✓ No horizontal overflow at 320/375/390/430/768/1366/1920.
- ✓ Headline, subhead, both CTAs, and trust cue all visible without scrolling at every tested width.
- ✓ Load sequence completes in under 900ms (unchanged timing budget).
- ✓ Parallax and hero-zoom never visually conflict (single coherent depth effect, not two competing transforms) — verify by scrubbing scroll position immediately after page load, before the 18s zoom completes.
- ✓ `prefers-reduced-motion` produces an instant, fully-readable final state with zero animation.
- ✓ CLS = 0 for the Hero's own content (image has explicit `fill` + container dimensions, text blocks don't shift after fonts load).
- ✓ Trust row separators are not bare "/" characters (see §12/§15).
- ✓ Works identically in structure (not pixel-identical, but structurally equivalent) at 1366px and 1920px — confirm the `wide:` breakpoint's increased side padding (80px) doesn't push content awkwardly given the `max-w-content` cap.

## 15. Design Rationale

**Why fix the overlapping transforms (zoom + parallax) rather than removing one:** both effects independently justify their existence per `Visual-Design-Specification.md` §5/§10 — the zoom gives the image a "documentary opening" feel, the parallax gives scroll a spatial quality. The problem isn't that both exist, it's that they're unstructured (two systems targeting one element's transform). Nesting them into two layers preserves both effects' intent while removing the conflict risk — this is a correctness fix, not a design change.

**Why replace the "/" trust-row separators:** a bare ASCII slash reads as a placeholder character left over from a copy draft, not a designed micro-detail — at this level of polish (Hero is the single highest-scrutiny section on the page), even a 2px dot separator communicates "someone made a decision here" rather than "someone didn't get to this yet."

**Why keep the CTA hierarchy as color-contrast-only (not size-contrast) despite the audit flagging it as "fairly flat":** two full-width-on-mobile buttons of different sizes side-by-side on desktop would look unbalanced and amateur — the existing solid-fill-vs-outline distinction is the correct, restrained way to show primary/secondary at this specific moment (a hero, where both CTAs are genuinely low-friction and either is a reasonable next step for different visitor intents). Making the secondary a bare text link (as the audit suggested) would work on a content-dense page but here would leave the composition feeling unbalanced/empty next to the single remaining solid button — kept as-is deliberately, not an oversight.

**Why consolidate the four overlay divs into one gradient stack:** four separate absolutely-positioned elements achieving one lighting effect is unnecessary DOM/paint overhead with zero visual benefit — a single multi-layer `background-image` produces an identical rendered result at lower cost. This is the one change in this spec justified purely by performance, not storytelling.

**Why the monotonic spacing correction matters even though it's a small value change:** a gap sequence that shrinks then grows (24px→20px→36px) has no perceivable design intent and will look like an inconsistency under close inspection (exactly the kind of "assembled, not designed" tell [00-design-principles.md](../00-design-principles.md) calls out) — monotonic scaling is what a deliberate system looks like.

## 16. Implementation Notes for Gemini

- Do not change any copy, any color value, or the two-line headline split — these are locked content decisions, not layout decisions.
- Replace the hand-rolled Hero padding classes with the shared `Container` component. Verify the rendered padding values are pixel-identical to what Version 1 currently produces (48px/80px at desktop/wide) — this is a refactor, not a redesign, so there should be zero visual diff from this change alone.
- Restructure the background layer per §9: outer div handles scroll-linked parallax translate (via `ParallaxLayer`, unchanged component, unchanged 40px max), inner `<Image>` handles the `hero-zoom` keyframe. Confirm in dev tools that both transforms are visible simultaneously without one overwriting the other.
- Consolidate the four overlay `<div>`s into one `<div aria-hidden>` with a `background-image` containing all four gradients as comma-separated layers, in the same order/values as Version 1's current four divs (so the composited visual result is unchanged).
- Fix the spacing scale per §5/§8 to be monotonic across breakpoints.
- Replace the "/" separator characters in the trust row with a `•` character (or a 4px `<span>` dot with `bg-current`), still `aria-hidden`.
- Do not touch `KineticHeadline`, `MagneticButton`, `HeroScrollCue`, or the CTA button variants — these are correct as-is.
- Do not attempt to deduplicate the two `HeroScrollCue` instances (mobile in-flow vs. desktop absolute) into one responsive instance in this pass — the audit flagged it as a code-smell, but it's a low-risk simplification that risks introducing a positioning bug for no visual gain; leave it unless explicitly asked to refactor.
- Preserve all existing accessible names, alt text, and ARIA attributes exactly as they are in Version 1 except the trust-row separator fix noted above.
