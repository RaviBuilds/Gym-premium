# Why Infiniti (Philosophy / Value Story) — Implementation Spec (Version 2)

*Reads against [00-design-principles.md](../00-design-principles.md), [01-design-system.md](../01-design-system.md), [02-motion-system.md](../02-motion-system.md). Version 1 source: `src/components/sections/WhyInfiniti.tsx`.*

---

## 1. Section Purpose

Converts the brand's honest, deliberate pricing logic into a confidence-building moment instead of a defensive FAQ answer, and surfaces real pricing ("Memberships from ₹199/day") before the visitor has to click through to find it. This pre-answers the price-conscious comparison shopper's unspoken "what's the catch?" — arguably the single highest-leverage content moment on the homepage per `docs/Homepage-Architecture.md` §4.

## 2. Design Philosophy

Confident, not defensive. Stated with pride, not as an excuse. This is the one section on the page that should feel like the brand looking the visitor in the eye and making a direct statement — which means it needs more visual weight than Version 1 gives it, not different content.

## 3. Storytelling Goal

Eyebrow → headline ("We cut the spa. Not the results.") → supporting line → pricing callout with its own CTA. The headline is the single most quotable line on the page and currently receives the least distinctive typographic treatment of any headline on the site (identical `text-section` scale to every other section's H2). Version 2 corrects this without changing the type system.

## 4. Visual Hierarchy

1. Headline
2. Pricing teaser callout (price + CTA)
3. Supporting body line
4. Eyebrow

## 5. Desktop Layout Specification

**Correction from Version 1 — asymmetric two-column composition, not a centered single column.** Version 1 renders everything in a single `max-w-2xl` centered column on a full-width dark section, leaving large empty flanks left and right on desktop — this is the clearest example in the whole audit of the "confident whitespace vs. wasted whitespace" distinction from [00-design-principles.md](../00-design-principles.md) §3.

- Desktop (≥1024px): two-column asymmetric split within the standard `Container` (max 1280px) — **7/5 column split** (per [00-design-principles.md](../00-design-principles.md) §3's "purposeful asymmetry" principle).
  - Left column (7/12, ~720px at max width): eyebrow, headline, supporting body line.
  - Right column (5/12, ~480px at max width): the `PricingTeaserCallout`, vertically centered against the left column's block, treated as a distinct bordered card-like element (not the current inline border-left-4 treatment — see §15).
- This replaces the centered `max-w-2xl` wrapper at desktop only — tablet and mobile keep the single-column stack (§6/§7).

## 6. Tablet Layout Specification

- Single column, `max-w-2xl` centered — unchanged from Version 1 (the two-column split is a desktop-only enhancement; at tablet widths there isn't enough room for a genuine 7/5 split to breathe).
- `PricingTeaserCallout` switches to horizontal row layout at `sm:` (640px) — unchanged existing behavior.

## 7. Mobile Layout Specification

- Single column, stacked, unchanged from Version 1.
- `PricingTeaserCallout` stacks vertically with the yellow left-border accent — unchanged.

**At exact widths:**
- **320/375/390/430px:** identical single-column stack.
- **768px:** still single-column (tablet tier, per §6) — the asymmetric split only activates at 1024px where there's genuine room for two columns without cramping either.

## 8. Spacing System

| Relationship | Value |
|---|---|
| Eyebrow → Headline | 24px (unchanged) |
| Headline → Body | 24px (unchanged) |
| Body → Pricing callout (mobile/tablet, stacked) | 24px (unchanged, `gap-6` wrapper) |
| Left column → Right column gap (desktop, NEW) | 64px (`gap-16`) — generous separation per [00-design-principles.md](../00-design-principles.md) §3's "confident whitespace," using the 64px scale step already in [01-design-system.md](../01-design-system.md) §3, not a new value |
| Section vertical padding | Standard tier, 96/64/56px — unchanged |

## 9. Motion Choreography

Tier 2 — Building (per [02-motion-system.md](../02-motion-system.md) §2), with one elevated moment per §15.

- Eyebrow: fade-up, delay 0 — unchanged.
- **Headline: change from plain `AnimationWrapper fade-up` to `KineticHeadline`** (the same word-mask reveal primitive already used in Hero and Programs) — this is the section's single most important line of copy and Version 1 gives it the least distinctive motion treatment on the page despite that. Delay 0.1s (unchanged position in sequence).
- Body: fade-up, delay 0.2s — unchanged.
- Pricing callout: fade-up, delay 0.3s — unchanged position, but on desktop (per §5's two-column layout) this element enters from the right column rather than stacking beneath, so its motion should be a fade-up matching the left column's rhythm, not a slide-in (keep it simple — this section doesn't need directional motion, just the standard cascade).

**Reduced motion:** `KineticHeadline` shows full text instantly (unchanged sitewide behavior for this primitive, already implemented for Hero/Programs) — no new reduced-motion work required, this component already handles it.

## 10. Scroll Behaviour

None — per [02-motion-system.md](../02-motion-system.md) §4, this section has no banner/background image and does not qualify for parallax. Entrance-only motion.

## 11. Micro Interactions

- Pricing callout CTA: standard primary button treatment (`ButtonLink variant="primary" size="compact"`) — unchanged.
- No hover/interaction changes needed elsewhere in this section — it's a statement section, not a card grid.

## 12. Accessibility

- Headline remains a real `h2` even when using `KineticHeadline`'s word-mask treatment — confirm the full text string is present in the DOM (not assembled from letter fragments with no combined accessible text), matching the same pattern already correct in Hero/Programs' use of the same component.
- Contrast: white/light-gray text on `bg-ink` — unchanged, already clears WCAG AAA per [01-design-system.md](../01-design-system.md) §1.
- No images in this section, no alt-text considerations.

## 13. Performance Constraints

- No images added — this section remains text/CTA-led and inherently lightweight, per its own stated performance consideration in `docs/Homepage-Architecture.md` §4.
- `KineticHeadline` reuses an existing component/animation budget already paid for elsewhere on the page — no new dependency.

## 14. Acceptance Criteria

- ✓ No horizontal overflow at any tested width.
- ✓ At ≥1024px, content renders as a 7/5 two-column split, not a centered single column with large empty flanks.
- ✓ At <1024px, content renders as the original single-column stack — no broken intermediate state.
- ✓ Headline uses the same word-mask reveal treatment as Hero/Programs headlines.
- ✓ Pricing callout CTA remains clearly visible and functional in both the stacked (mobile/tablet) and side-column (desktop) layouts.
- ✓ Reduced motion: headline text fully present and readable with no animation.

## 15. Design Rationale

**Why introduce an asymmetric two-column split here specifically:** this section was flagged in the audit as the starkest example of "functional but not compositional" whitespace on the entire page — a `max-w-2xl` block of text floating in the center of a full-width dark section, with nothing else to look at, on a section whose own doc comments call it "the single highest-leverage content change" on the homepage. That mismatch between stated importance and delivered visual weight is exactly what [00-design-principles.md](../00-design-principles.md) §1 identifies as Version 1's core gap. A 7/5 split gives the pricing callout genuine visual presence as a distinct object (not a thin bordered line at the bottom of a paragraph) while keeping the headline's reading column at a comfortable width — it doesn't add content, it gives existing content room to be seen.

**Why elevate the headline to `KineticHeadline` specifically:** "We cut the spa. Not the results." is the brand's core argument in one sentence — it deserves the same word-by-word reveal treatment the Hero's headline gets, not because every headline should get it (they shouldn't — that would flatten the effect through overuse) but because this is one of exactly three headlines on the page (Hero, this one, and arguably Testimonials' pull-quotes) that qualify as a genuine "peak" moment rather than a section label. This is a targeted exception, not a new blanket rule.

**Why the pricing callout becomes a bordered card-like element on desktop rather than staying a plain border-left-4 line:** in a two-column layout, an element needs enough visual weight to hold its own column — a thin left-border accent that works fine attached to the bottom of a text block looks under-designed floating alone in a 480px-wide column with nothing else around it. Treating it as a distinct block (padding, subtle background tint or border on all sides rather than just the left edge) gives it presence appropriate to carrying the single most important sentence for a comparison-shopping visitor.

## 16. Implementation Notes for Gemini

- At `lg:` (1024px) and above, restructure the section's content wrapper from `mx-auto flex max-w-2xl flex-col gap-6` to a two-column grid: `lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center`, with the eyebrow/headline/body block spanning `lg:col-span-7` and the pricing callout spanning `lg:col-span-5`.
- Below `lg:`, keep the exact existing single-column stack and gap values — do not change mobile/tablet behavior.
- Replace the headline's wrapping `AnimationWrapper` + plain text with `KineticHeadline`, matching the same prop pattern already used in `Hero.tsx`/`Programs.tsx` (text prop, `as="h2"`, existing `font-display text-section lg:text-section-lg` classes carried over unchanged).
- Restyle `PricingTeaserCallout` for the desktop column context: keep the `border-l-4 border-brand-yellow` accent, add `p-6` internal padding and a subtle `bg-white/5` background tint so it reads as a contained block rather than a caption line, when rendered inside the desktop right column. The mobile/tablet stacked version can keep its current lighter treatment if adding the same padding/tint there feels heavy — use judgment, but the desktop version must not look identical to a plain inline line.
- Do not change the copy, the ₹199/day figure, or the CTA link target (`/pricing`).
- Do not add an image to this section — its lightweight, text-only performance profile is a stated goal, not a gap.
