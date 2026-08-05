# Testimonials (Real Results) — Implementation Spec (Version 2)

*Reads against [00-design-principles.md](../00-design-principles.md), [01-design-system.md](../01-design-system.md), [02-motion-system.md](../02-motion-system.md). Version 1 source: `src/components/sections/Testimonials.tsx`.*

---

## 1. Section Purpose

Converts accumulated trust (Hero → TrustStrip → Programs → WhyInfiniti → Facilities → Trainers) into desire — "this could be me." This is the emotional peak of the homepage's persuasion arc per `docs/Visual-Design-Specification.md` §1, and per [02-motion-system.md](../02-motion-system.md) §2 it is the page's one Tier 3 section: the most deliberately choreographed moment after the Hero.

## 2. Design Philosophy

Proof, not decoration. Two featured pull-quotes (Lalith's -10kg, Samba's 2-year tenure) carry real specificity that should feel like reading a magazine feature, not scanning a review widget.

## 3. Storytelling Goal

Header → two featured pull-quotes (the emotional peak) → five secondary testimonials (breadth of proof) → CTA ("Book Your Free Trial," capitalizing on peak persuasion). The featured quotes must visually dominate the secondary grid — this is the single most important hierarchy correction in this section (see §4/§15).

## 4. Visual Hierarchy

1. Featured pull-quotes (2)
2. CTA ("Book Your Free Trial")
3. Secondary testimonial grid (5)
4. Section heading

**Correction from Version 1:** the featured quotes currently have zero visual containment (no card, no shadow, no border, no background tint) while sitting directly above secondary cards that *do* have shadows — an inversion where the bigger, more important content reads as less contained/weighted than the smaller content beneath it. Version 2 does not add a card treatment to the featured quotes (that would contradict their intentional "magazine pull-quote, not a UI component" design, which is correct) — instead it adds a **subtle background tint** (a very low-opacity yellow wash, ≤4% opacity, `bg-brand-yellow/[0.04]`) behind the two featured quotes as a section-within-a-section, giving them a visible "stage" without turning them into cards. See §15.

## 5. Desktop Layout Specification

- Featured row: `lg:grid-cols-2 lg:gap-16` — unchanged column count, but wrapped in the new subtle background tint block (per §4) with its own internal padding (`p-12`) so the tint reads as a deliberate frame, not an accidental edge bleed.
- Secondary grid: `lg:grid-cols-3` — unchanged, but **add a `lg:col-span-2` or centering treatment to the 5th (last) card** so the 3+2 uneven final row doesn't look accidental — center the last row's two cards under the middle and right columns of the row above, or span the last card to `lg:col-span-2 lg:mx-auto lg:max-w-md` so the asymmetry reads as intentional rather than a leftover.
- CTA: add a divider or increased top margin (`mt-4` → `mt-8`, using the existing 8px scale) separating it from the secondary grid, so it reads as a deliberate closing beat rather than a plain trailing button.

## 6. Tablet Layout Specification

- Featured row: **correction** — add `sm:grid-cols-2` so the two featured pull-quotes sit side-by-side starting at tablet (640px), not desktop (1024px) only, per [03-responsive-system.md](../03-responsive-system.md) §3's stepping rule. Two large pull-quotes stacked full-height on a tablet is a real underuse of available width.
- Secondary grid: `sm:grid-cols-2` — unchanged.

## 7. Mobile Layout Specification

- Featured row: single column — unchanged (correctly, per [03-responsive-system.md](../03-responsive-system.md) §6's stated exception: only two items exist, and a cramped tablet-width 2-col split would work against the pull-quote's need to breathe, but this reasoning applies to genuinely narrow tablet widths, not the full 640–1023px range — see §6's correction, which pushes the 2-col step to 640px specifically because at that width there's enough room).
- Secondary grid: single column — unchanged.

**At exact widths:**
- **320/375/390/430px:** identical single-column stacking throughout.
- **768px:** featured pull-quotes now sit side-by-side (per §6's correction), secondary grid at 2 columns.

## 8. Spacing System

| Relationship | Value |
|---|---|
| Section header → Featured row | 48px (`gap-12` outer wrapper) — unchanged |
| Featured row → Secondary grid | 48px — unchanged |
| Featured tint block internal padding (NEW) | 48px desktop (`p-12`) / 32px mobile (`p-8`) |
| Secondary grid → CTA | **corrected** 32px (`mt-8`), was effectively unspaced beyond the wrapper's `gap-12` |

## 9. Motion Choreography

Tier 3 — Peak (per [02-motion-system.md](../02-motion-system.md) §2) — the single most deliberately weighted entrance sitewide after the Hero.

- Featured quotes: `scale-in-settle` variant (`scale:1.06→1`, opacity 0→1), 500ms — unchanged base treatment, but **correction: unify the stagger sequence.** Version 1 resets the stagger index independently between the featured grid and the secondary grid (both start at index 0), meaning both grids' first items can animate at delay-0 simultaneously. Version 2 requires the secondary grid's stagger to continue from where the featured grid's left off: featured quotes use `getStaggerDelay(0)` and `getStaggerDelay(1)`, secondary cards continue at `getStaggerDelay(2)` through `getStaggerDelay(6)` — one continuous cascade down the whole section, matching the fix already specified for Programs' two-row grid in [programs-implementation-spec.md](programs-implementation-spec.md) §9.
- Secondary cards: `fade-up` variant — unchanged.
- CTA: keep its own `AnimationWrapper`, but change its trigger so it fires *after* the secondary grid's last stagger delay completes (continue the unified sequence, e.g. `getStaggerDelay(7)` capped per the stagger cap rule) rather than firing independently on its own separate viewport intersection.

**Reduced motion:** all quotes/cards appear instantly at final scale/position, no stagger — unchanged sitewide rule.

## 10. Scroll Behaviour

None — no banner/background image in this section, correctly no parallax per [02-motion-system.md](../02-motion-system.md) §4.

## 11. Micro Interactions

- No card hover on secondary `TestimonialCard`s (unchanged, correct — they sit in a dense grid, not meant to feel individually interactive/clickable since they're not links).
- Featured quotes: no hover interaction needed (not clickable).

## 12. Accessibility

- `blockquote`/`figure`/`figcaption` semantic markup on featured quotes — unchanged, already correct.
- Stars and quote-mark icons: `aria-hidden` — unchanged, correct.
- **NEW consideration:** if an attributeTag stat (e.g. "-10kg") gets a `CountUp` treatment (see §15), the final value must be present in the DOM immediately regardless of animation state, per the sitewide counter accessibility rule in [04-accessibility.md](../04-accessibility.md) §7.

## 13. Performance Constraints

- No images in this section (text/icon only) — remains inherently lightweight, unchanged.
- New background tint (§4) is a CSS background-color, zero performance cost.

## 14. Acceptance Criteria

- ✓ No horizontal overflow at any tested width.
- ✓ Featured pull-quotes visually read as the section's primary content (via the new tint frame), not secondary to the card grid beneath them.
- ✓ At 768px, featured quotes sit side-by-side, not stacked.
- ✓ The 5-card secondary grid's uneven last row (3+2) reads as an intentional centered/spanning layout, not an accidental leftover.
- ✓ Motion cascades continuously from featured quotes through secondary cards to the CTA — no simultaneous double-pop at delay-0 from two independently-reset grids.
- ✓ Reduced motion: all content visible at final state immediately.

## 15. Design Rationale

**Why a subtle background tint instead of a card treatment for the featured quotes:** the audit is right that zero containment next to shadowed secondary cards creates a hierarchy inversion, but the component's own design comment ("no shadow, no card border... should feel like a magazine pull-quote, not a UI component") is correct and should be preserved — a full card treatment would be the wrong fix. A near-invisible tint (4% yellow opacity) gives the featured quotes a "stage" — visually separating their zone from the secondary grid's zone — without adding a border, shadow, or radius that would turn them into "just another card." This resolves the inversion while keeping the magazine-pull-quote intent intact.

**Why continue the stagger sequence across both grids instead of treating them as independent motion units:** per [00-design-principles.md](../00-design-principles.md) §3, Tier 3 sections should feel like the most deliberately choreographed moment on the page — two grids that both reset to delay-0 independently can produce a visible double-pop that undercuts exactly the "weighted, deliberate" quality this section is supposed to have above all others. A single continuous cascade (featured → secondary → CTA) reads as one intentional reveal, which is the whole point of a Tier 3 treatment.

**Why address the uneven 5-card last row rather than just accepting it:** an unbalanced 3+2 grid with no design accommodation is a small but real "assembled, not designed" tell — the fix (center or span the last row) costs nothing structurally and removes a visible asymmetry that has no narrative justification (unlike the deliberate 7/5 asymmetry introduced elsewhere in this redesign, which *does* have a stated purpose).

**Why not add reviewer photos (an audit finding):** real photography beats stock photography, but per [00-design-principles.md](../00-design-principles.md) §2, "real content only" — no reviewer photos exist as assets today (confirmed absent from `src/content/testimonials.ts` and the current component). Inventing avatar placeholders would violate the "no invented content" rule more than it would add credibility; this gap is a photography/asset-collection task for the business, not a spec-level design fix, and is explicitly out of scope here.

## 16. Implementation Notes for Gemini

- Wrap the featured pull-quote row (`div.grid...lg:grid-cols-2`) in an additional outer container with `bg-brand-yellow/[0.04]` background, `rounded-card` (6px, matching the sitewide content-container radius even though the quotes inside remain unbordered/unshadowed themselves), and padding `p-8 lg:p-12`.
- Add `sm:grid-cols-2` to the featured row's grid classes (currently `grid gap-10 lg:grid-cols-2 lg:gap-16` — add the `sm:` step before `lg:`).
- For the secondary grid's 5th card, add `lg:col-span-2 lg:mx-auto lg:max-w-[calc((100%-2*theme(spacing.6))/3)]` (or simpler: wrap the grid in a structure where the last item is centered under the row above at desktop width) — the exact CSS approach is an implementation choice, but the visible result must be a centered final item, not a left-aligned orphan.
- Unify the stagger index: pass explicit `startIndex` values so the featured grid uses indices 0–1 and the secondary grid continues at index 2–6, and the CTA's `AnimationWrapper` uses index 7 (or the equivalent capped delay) rather than firing on its own independent viewport trigger.
- Add `mt-8` (or equivalent) between the secondary grid and the CTA button.
- Do not change any testimonial copy, names, or the 2-featured/5-secondary content split — these are existing real content and must be preserved exactly.
- Do not add reviewer avatar images or placeholder photos.
