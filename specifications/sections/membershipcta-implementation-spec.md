# Membership CTA (Philosophy Pricing Teaser) — Implementation Spec (Version 2)

*Reads against [00-design-principles.md](../00-design-principles.md), [01-design-system.md](../01-design-system.md), [02-motion-system.md](../02-motion-system.md), [03-responsive-system.md](../03-responsive-system.md). Version 1 source: `src/components/sections/MembershipCta.tsx`.*

---

## 1. Section Purpose

Surfaces real pricing tiers (Daily/Monthly/Yearly) directly on the homepage so a comparison-shopping visitor doesn't have to click through blind, and nudges toward the Yearly plan (flagged "Best Seller") as the intended anchor option. Links out to the full `/pricing` page for complete detail.

## 2. Design Philosophy

Clear, decisive, no ambiguity about which plan the business wants most visitors to consider — pricing sections should reduce decision friction, not add to it.

## 3. Storytelling Goal

Header ("Pick your pace. Not your poison.") → three pricing tiers, with the recommended tier visually unmistakable → CTA to the full plans page. Currently all three tiers are near-identical in visual weight, which undermines the header's own confident, decisive tone.

## 4. Visual Hierarchy

1. Yearly tier (Best Seller — the intended anchor)
2. Monthly / Daily tiers (equal weight to each other, secondary to Yearly)
3. Section heading
4. CTA to full plans page

## 5. Desktop Layout Specification

- **Correction — widen the card row.** Version 1 caps the grid at `max-w-2xl` (672px) regardless of viewport, sitting as a small centered block inside a `max-w-content` (1280px) section — a real mismatch of visual authority for a conversion-critical moment. Version 2 widens the cap to `max-w-4xl` (896px) at desktop and removes the cap entirely at `wide:` (≥1440px), letting the row use proportionally more of the available width like every other card grid on the page.
- **Correction — differentiate the Yearly (Best Seller) tier.** The recommended tier gets: a 1.05x scale-up relative to its siblings (`lg:scale-105`), OR (simpler, lower-risk) a persistent `border-2 border-brand-yellow` outline plus a subtle `bg-brand-yellow/[0.03]` background tint distinguishing it at rest, not just via the small floating badge. Use the border+tint approach — a scale transform on a card in a 3-up grid risks colliding with neighboring cards' padding at narrow desktop widths; border+tint achieves the same "this one is different" signal with zero layout risk.
- Cards remain interactive (`interactive={true}`, i.e. remove the current `interactive={false}` override) — see §11/§15 for why hover feedback should return.

## 6. Tablet Layout Specification

**Correction (per [03-responsive-system.md](../03-responsive-system.md) §3/§6):** Version 1 jumps straight from `grid-cols-1` to `sm:grid-cols-3` at 640px — too narrow for three comfortable card columns. Version 2 requires an explicit intermediate tier: `grid-cols-1` (mobile) → `sm:grid-cols-2` (640px, Daily+Monthly side by side, Yearly/Best-Seller spans full width beneath or wraps to its own row) → `lg:grid-cols-3` (1024px, all three side by side). At `sm:` specifically, place the Yearly/Best-Seller card first (or spanning `sm:col-span-2`) so the anchor tier still gets top billing even in the 2-column tablet arrangement.

## 7. Mobile Layout Specification

- Single column, stacked, full-width cards — unchanged.
- **Order correction:** lead with the Yearly (Best Seller) tier first on mobile (reorder the stacked list, or use `order-first` if the underlying data order should stay Daily/Monthly/Yearly for other reasons) — on a single-column mobile stack, the first card gets disproportionate attention from a visitor who may not scroll through all three; leading with the intended anchor tier matters more here than it does in a side-by-side desktop row.

**At exact widths:**
- **320/375/390/430px:** identical single-column stack, Yearly tier first (per §7's correction).
- **768px:** now inside the corrected tablet tier — Daily+Monthly side by side, Yearly spanning or leading, per §6.

## 8. Spacing System

| Relationship | Value |
|---|---|
| Header → Card row | 40px (`gap-10`) — unchanged |
| Card row gap | 24px (`gap-6`) — unchanged |
| Card row → CTA | 40px — unchanged |
| Card row max-width (corrected) | 896px desktop (`max-w-4xl`) / unconstrained at `wide:` (still bounded by the section's own 1280px `max-w-content`) |

## 9. Motion Choreography

Tier 4 — Resolving is *not* correct here — MembershipCta sits mid-arc (per `docs/Visual-Design-Specification.md`'s stated section order, it precedes Locations/Faq/FinalCta) and carries real conversion weight. Classify as **Tier 2 — Building** (per [02-motion-system.md](../02-motion-system.md) §2).

- Cards: `fade-up`, `getStaggerDelay(index)` — unchanged, correct, but reorder per §7's mobile-first-tier correction so the stagger sequence still visually lands Yearly first if it's now first in DOM order.
- CTA: own `AnimationWrapper`, unchanged.

**Reduced motion:** unchanged sitewide rule — instant final-state appearance.

## 10. Scroll Behaviour

None — no banner image, correctly no parallax per [02-motion-system.md](../02-motion-system.md) §4.

## 11. Micro Interactions

**Correction — restore hover feedback.** Version 1 explicitly sets `interactive={false}` on all three `PricingTierCard`s, removing the standard card hover lift. Per §5, Version 2 restores standard hover lift (`translateY(-4px)` + shadow, per [01-design-system.md](../01-design-system.md) §4) on all three cards — see §15 for why static/inert pricing tiles are the wrong choice at a decision-making moment.

## 12. Accessibility

- No images — no alt-text considerations.
- Badge ("Best Seller") already pairs with visible text, not color-only — unchanged, correct.
- **Add explicit price-unit suffixes** ("₹199/day", "₹1,999/mo", "₹9,499/yr") directly adjacent to the price number rather than relying solely on a separate duration label above it — reduces the need to visually cross-reference two separate text blocks to parse what a number means, which benefits screen reader users (who'd otherwise hear "₹199" and "Daily" as separate, unlinked announcements depending on markup) as much as sighted users.

## 13. Performance Constraints

No images, no new dependencies — remains lightweight. No performance-relevant changes in this spec.

## 14. Acceptance Criteria

- ✓ No horizontal overflow at any tested width.
- ✓ Card row occupies a visually proportionate width at desktop (896px, not 672px) and is unconstrained (up to the section max) at `wide:`.
- ✓ The Yearly/Best-Seller tier is unmistakably differentiated at rest (border + tint), not solely via the small floating badge.
- ✓ At 768px, cards render 2-up with the Best-Seller tier given top billing (first or spanning).
- ✓ On mobile, the Best-Seller tier is the first card encountered when scrolling into the section.
- ✓ Cards respond to hover/focus with the standard lift+shadow feedback (interactivity restored).
- ✓ Price text includes an explicit per-unit suffix inline, not solely in a separate label.

## 15. Design Rationale

**Why widen the card row instead of leaving it at `max-w-2xl`:** a pricing comparison is one of the more conversion-critical moments on the homepage, and giving it *less* width authority than sections carrying lower-stakes content (Testimonials' secondary grid, for instance) sends the wrong visual signal about its importance. Widening it doesn't add content or clutter — it lets three cards breathe at a scale proportionate to their actual importance in the funnel.

**Why border+tint instead of scale-up for the Best Seller distinction:** real pricing-table UX (and the audit's own comparison point) typically makes the recommended tier visually dominant through scale, but in a fixed 3-column grid, scaling one card up risks that card's content overlapping or crowding its neighbors' padding at exactly the desktop widths (1024–1280px) where all three need to coexist without a wider container to absorb the extra size. A persistent border+tint achieves equivalent "this one is different" signaling with zero layout collision risk — a case where a more conservative visual treatment is the correct engineering trade-off, not a compromise.

**Why restore hover interactivity:** the audit correctly flags `interactive={false}` on cards representing actual purchase options as removing exactly the affordance/feedback a decision-making moment should have — a pricing card a visitor might mentally "select" should feel responsive to attention (hover), the same way it would on Stripe's or Linear's own pricing pages, both of which this project explicitly cites as reference points in [00-design-principles.md](../00-design-principles.md) §3.

**Why reorder to lead with Yearly on mobile specifically:** a single-column stack gives the first item disproportionate attention from any visitor who doesn't scroll through the full list — this is different from a side-by-side desktop row where all three are visible simultaneously and order matters less. The correction is mobile-specific because the underlying problem (first-item bias) is mobile-specific.

## 16. Implementation Notes for Gemini

- Change the card row's `max-w-2xl` to `max-w-4xl lg:max-w-4xl wide:max-w-none` (or equivalent — the requirement is: capped at 896px through desktop, unconstrained at `wide:` up to the section's own 1280px ceiling).
- Add `sm:grid-cols-2 lg:grid-cols-3` stepping (removing the current direct `grid-cols-1` → `sm:grid-cols-3` jump). At `sm:`, give the Best-Seller card `sm:col-span-2` (or reorder so it's the row's first full-width item) so it doesn't get visually equal-but-arbitrary placement in the 2-column tablet tier.
- On the Best-Seller `PricingTierCard` specifically, add `border-2 border-brand-yellow bg-brand-yellow/[0.03]` (or equivalent) as a permanent (non-hover) style, in addition to the existing floating "Best Seller" badge — keep the badge, add the border/tint.
- Remove `interactive={false}` from all three `PricingTierCard` instances (or explicitly set `interactive={true}` if that's not the component's default) — restoring the standard hover lift.
- Reorder the pricing tier data (or apply a CSS `order-first` utility on the Yearly card specifically for the mobile/single-column breakpoint range only) so Yearly appears first when stacked single-column, while preserving whatever left-to-right order makes sense once the grid reaches 2-up/3-up (Daily, Monthly, Yearly is a reasonable ascending-duration reading order for the multi-column layouts — only the single-column mobile order needs correcting).
- Add an inline unit suffix to each price string (e.g. "/day", "/mo", "/yr") directly next to the number, not solely in the separate duration label above it — pull this from existing data in `src/content/pricing.ts` if a suffix field already exists, or derive it from the existing `duration` field if not.
- Do not change the three prices, the struck-through list-price treatment, or the CTA link target (`/pricing`).
