# Locations (Two Locations, One Standard) — Implementation Spec (Version 2)

*Reads against [00-design-principles.md](../00-design-principles.md), [01-design-system.md](../01-design-system.md), [02-motion-system.md](../02-motion-system.md), [03-responsive-system.md](../03-responsive-system.md). Version 1 source: `src/components/sections/Locations.tsx`.*

---

## 1. Section Purpose

Resolves branch-choice friction that's currently invisible until the footer, and surfaces Rethibowli's ladies-only slot as a real, marketable feature. Lets a visitor decide "which branch is convenient for me" without digging through separate tabbed widgets elsewhere on the site.

## 2. Design Philosophy

Two equal, confident options — "two gyms, one standard" as a visual metaphor (the existing directional slide-in-left/right treatment), not two lonely boxes in a wide empty section.

## 3. Storytelling Goal

Header (with a supporting line, currently missing — see §4) → two branch cards converging from opposite edges → each ending in its own CTA. The slide-in-left/right metaphor only makes visual sense once the two cards are actually side-by-side — which is currently true only at desktop (1024px), leaving the metaphor meaningless below that width.

## 4. Visual Hierarchy

1. Location cards (2)
2. Section heading
3. **NEW — supporting body line** (currently absent, inconsistent with Testimonials/MembershipCta which both reinforce their headers with a sentence)
4. Eyebrow

## 5. Desktop Layout Specification

- Grid: `lg:grid-cols-2` — unchanged.
- **Add a supporting body sentence** beneath the heading (e.g. "Same equipment, same trainers, same standard — pick whichever's closer"), matching the pattern already used in Testimonials (`body` prop on `SectionHeader`) and MembershipCta. See §15.
- Cards keep their existing hover lift (`interactive` default true) — this is the section's only card type where Version 1 already got hover-vs-static right (see §11 for why this is preserved, not "fixed" to match Testimonials/MembershipCta's deliberately-static cards).

## 6. Tablet Layout Specification

**Correction (per [03-responsive-system.md](../03-responsive-system.md) §3/§6):** Version 1's grid jumps straight from `grid-cols-1` to `lg:grid-cols-2` — meaning a 768px tablet gets the same single-column stack as a 375px phone despite having ample room for two columns side by side, and the slide-in-left/right convergence metaphor has nothing to converge toward below 1024px. Version 2 requires `sm:grid-cols-2` (640px) so both cards sit side-by-side starting at tablet, matching the corrected pattern used identically in [testimonials-implementation-spec.md](testimonials-implementation-spec.md) §6.

## 7. Mobile Layout Specification

- Single column, stacked — unchanged (correctly, only two items, no room for a 2-col split below 640px).

**At exact widths:**
- **320/375/390/430px:** identical single-column stack.
- **768px:** now inside the corrected tablet tier — two cards side-by-side, slide-in-left/right animation now visually meaningful (see §9).

## 8. Spacing System

| Relationship | Value |
|---|---|
| Header → Card grid | 40px (`gap-10`) — unchanged |
| Card grid gap | 32px (`gap-8`) — unchanged |
| Heading → new supporting line (NEW) | 12px, matching the existing `SectionHeader` internal gap pattern used in Testimonials/MembershipCta |

## 9. Motion Choreography

Tier 2 — Building (per [02-motion-system.md](../02-motion-system.md) §2).

- `slide-in-left` (Gachibowli) / `slide-in-right` (Rethibowli), ±48px horizontal travel, simultaneous (no stagger delay between the two) — unchanged, this is correct and the section's one deliberate exception to the sitewide default fade-up, per Version 1's own design comment (a lightweight "two locations, one brand" visual metaphor).
- **This animation now has visual purpose at 768px+ per §6's grid correction** — previously it played below 1024px too, but with both cards stacked full-width (no actual left/right convergence to perceive), the directional motion was cosmetically present but narratively meaningless. With the tablet-tier 2-column fix, the metaphor now reads correctly starting at 640px instead of 1024px.
- `PageSection`'s `overflow-hidden` (required to clip the ±48px slide travel without triggering a horizontal scrollbar) — unchanged, keep.

**Reduced motion:** cards appear at final position instantly, no slide travel — unchanged sitewide rule.

## 10. Scroll Behaviour

None — no full-bleed banner in this section (each card has its own contained 16:9 image, not a section-spanning banner), correctly no parallax per [02-motion-system.md](../02-motion-system.md) §4.

## 11. Micro Interactions

- Card hover lift (`translateY(-4px)` + shadow) — **keep as-is, do not remove.** The audit flagged this as "inconsistent" with Testimonials/MembershipCta's static cards, but the inconsistency runs the other way: Location cards are genuinely clickable (each links to a full branch detail page), while Testimonial and Pricing cards in their *current* Version 2 spec state are either non-interactive display content (Testimonials) or now *also* interactive per the MembershipCta correction (§11 of that spec). Location cards having hover feedback is correct precisely because they are links — see §15.

## 12. Accessibility

- Real descriptive alt text on both branch images — unchanged, already correct.
- Ladies-only badge pairs color with explicit text ("Ladies Only · 12-4PM") — unchanged, already correct, exemplary pattern.
- Address/hours as real selectable text, not baked into an image — unchanged, correct.
- **Add `tel:` tap-to-call treatment** if branch phone numbers are shown on these cards (verify against current content — if phone numbers aren't currently displayed on the homepage Location cards at all, this is out of scope for this section and is already correctly handled in the Footer's branch cards instead; do not duplicate).

## 13. Performance Constraints

- Location card images: add `priority` consideration — **flag as an open verification item, not a directive.** Locations is a mid-page section; whether it appears within the initial viewport varies significantly by screen height. Do not mark these `priority` by default (that would risk competing with the Hero's actual LCP image) — leave as lazy-loaded (current behavior) unless a real LCP audit on staging shows otherwise.

## 14. Acceptance Criteria

- ✓ No horizontal overflow at any tested width (verify specifically that `overflow-hidden` on the section successfully clips the ±48px slide travel without visible clipping of card content itself).
- ✓ At 768px, both cards render side-by-side, not stacked.
- ✓ A supporting body sentence appears beneath the section heading.
- ✓ Card hover lift remains functional (not removed).
- ✓ Ladies-only badge remains paired with explicit text.
- ✓ Reduced motion: both cards appear at final position instantly, no slide-in travel.

## 15. Design Rationale

**Why add a supporting body line:** every other proof/decision section on the homepage (Testimonials, MembershipCta, Facilities per its own spec) reinforces its heading with one supporting sentence before diving into content — Locations is the one exception, and the audit correctly reads this as "underdeveloped by comparison" rather than a deliberate minimalist choice (no comment in the code explains an intentional omission). Adding one sentence closes this gap using the exact same `SectionHeader` `body` prop pattern already proven elsewhere — zero new component work required.

**Why the tablet grid fix matters more here than almost anywhere else in the audit:** this is the one section whose entire animation concept (two cards converging from opposite edges toward the center) is *only* legible when the cards are actually side-by-side. Below the old 1024px threshold, the "convergence" is invisible — two single-column cards each independently slide in from their respective edges but land in the same single column, so the visual metaphor the section was designed around simply doesn't exist for any tablet visitor. This is not a nice-to-have tablet polish item, it's the difference between this section's signature motion idea working at all versus not existing for roughly a third of real-world device widths.

**Why Location cards keep their hover lift while Testimonials/Pricing cards are treated differently in their own specs:** hover feedback should track *actual interactivity*. A Location card is a full-card link to a branch detail page — hover lift correctly signals "this is clickable." A secondary Testimonial card is inert display content with no destination — hover lift there would be a false affordance (exactly the reasoning applied to remove Trust Strip's stat hover in [truststrip-implementation-spec.md](truststrip-implementation-spec.md) §15). Pricing cards are corrected *toward* interactive in [membershipcta-implementation-spec.md](membershipcta-implementation-spec.md) because they represent a real decision moment even without being a direct link. The rule is consistent — "does hover correctly signal something real about this element" — it just produces different answers per card type, not the same answer applied uniformly.

## 16. Implementation Notes for Gemini

- Add a `body` prop to the `SectionHeader` call in `Locations.tsx`, using copy consistent with the section's existing tone (e.g. "Same equipment, same trainers, same standard — pick whichever's closer") — confirm final copy with existing brand voice patterns already used in `docs/Homepage-Architecture.md` §7 rather than inventing an unrelated tone.
- Add `sm:grid-cols-2` to the card grid's existing `grid gap-8 lg:grid-cols-2` classes (becomes `grid gap-8 sm:grid-cols-2 lg:grid-cols-2` — functionally the same 2-column result from 640px onward, `lg:` step becomes a no-op but is harmless to leave for clarity, or simplify to just `sm:grid-cols-2` alone if `lg:grid-cols-2` is redundant once `sm:` already sets 2 columns).
- Do not remove or alter the `interactive` hover behavior on `LocationCard` — this is correct as shipped.
- Do not change the branch data, addresses, hours, or the ladies-only badge treatment.
- Do not add a `priority` prop to the location images without a real LCP measurement justifying it — treat this as out of scope for this pass.
