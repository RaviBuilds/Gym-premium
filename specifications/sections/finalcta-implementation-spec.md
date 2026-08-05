# Final CTA Band — Implementation Spec (Version 2)

*Reads against [00-design-principles.md](../00-design-principles.md), [01-design-system.md](../01-design-system.md), [02-motion-system.md](../02-motion-system.md). Version 1 source: `src/components/sections/FinalCta.tsx`.*

---

## 1. Section Purpose

Converts all accumulated trust into action with zero remaining friction — the last, unambiguous conversion moment on the page. Every major objection has already been pre-answered by the sections above it; this should feel like a natural, low-pressure "yes," not a hard sell.

## 2. Design Philosophy

Confident and calm, closing the page the way it opened (Hero) — but per [02-motion-system.md](../02-motion-system.md) §2 this is a **Tier 4 — Resolving** section, so "confident" here means *decisive*, not *loud*. Exactly one deliberate accent (the CTA pulse) and nothing more.

## 3. Storytelling Goal

Headline → subhead → three CTAs in clear priority order (Free Trial primary, Membership Plans secondary, WhatsApp tertiary). Version 1 presents all three at near-equal visual weight — the fix here is establishing an unmistakable priority order without adding new motion complexity (which would violate the Tier 4 classification).

## 4. Visual Hierarchy

1. Primary CTA ("Book Free Trial")
2. Headline
3. Secondary CTA ("View Membership Plans")
4. Subhead
5. Tertiary CTA ("Message Us on WhatsApp")

## 5. Desktop Layout Specification

- **Correction — differentiate the three CTAs by size, not just by color/variant.** Version 1 renders all three `ButtonLink`s at identical padding/scale. Version 2 sizes them explicitly: primary at the standard button size (16px/32px padding, unchanged), secondary at `size="compact"` (a step down), tertiary (WhatsApp) at `size="compact"` as well — so the visual weight order is solid-yellow-full-size → outlined-compact → green-compact, giving primary unambiguous dominance instead of three same-size buttons differentiated by color alone.
- **Correction — add a visual anchor.** Version 1 is a flat ink rectangle with centered text — identical in structure to FAQ, a Tier 4 utility section, despite FinalCta being the page's actual closing argument. Add a single restrained visual device: a soft radial yellow glow behind the headline (`background: radial-gradient(ellipse at center, rgba(255,222,1,0.06) 0%, transparent 60%)`, positioned behind the text, `aria-hidden`) — enough to distinguish this section from a plain utility band without adding imagery, motion, or new color. See §15.
- Row layout: `flex-row` for the three CTAs — unchanged, but reduce to two visual tiers via size (per above) rather than one flat row of equals.

## 6. Tablet Layout Specification

Unchanged from Version 1 structurally — CTA row is already horizontal from `sm:` (640px). Apply the same size differentiation (§5) at this tier too.

## 7. Mobile Layout Specification

- CTA column: `flex-col` stack — unchanged. **Correction:** even stacked, the size differentiation should read via padding (primary gets the full standard vertical padding, secondary/tertiary get `size="compact"`'s reduced padding) so the stacked column still visually communicates priority order top-to-bottom, not three identical blocks.

**At exact widths:**
- **320/375/390/430px:** identical stacked CTA column, primary visibly larger/taller than the two beneath it.
- **768px:** horizontal row (crossed at 640px), same size hierarchy.

## 8. Spacing System

Unchanged from Version 1 — `max-w-2xl` centered column, `gap-6` between headline/subhead/CTA-row. The narrow column width itself is *not* corrected here the way it is in FAQ (§5 of [faq-implementation-spec.md](faq-implementation-spec.md)) — see §15 for why FinalCta's narrow column is acceptable while FAQ's identical width was flagged as a problem.

## 9. Motion Choreography

Tier 4 — Resolving (per [02-motion-system.md](../02-motion-system.md) §2) — quiet entrance, exactly one deliberate accent.

- Headline/subhead/CTA row: three sequential `AnimationWrapper` fade-ups, delays 0/0.1/0.2s — unchanged.
- CTA pulse: keep the existing single one-time pulse (`scale 1.0→1.03→1.0`, 1200ms, ease-in-out) on first viewport entry — **but apply it only to the primary CTA**, not all three buttons uniformly (if Version 1 currently applies it to the row as a whole or to all three, correct so only the primary button pulses) — reinforcing the priority order established in §5 through motion as well as size.

**Reduced motion:** no pulse, no fade-up travel, all content appears instantly — unchanged sitewide rule.

## 10. Scroll Behaviour

None — no banner image, correctly no parallax. The new radial glow (§5) is a static background effect, not scroll-linked.

## 11. Micro Interactions

- Primary CTA: standard press-state `scale(0.97)` — unchanged.
- Secondary CTA: `border-white` override for dark-background legibility — unchanged, this is a legitimate necessary override, not a code smell (see §15).
- Tertiary/WhatsApp CTA: standard WhatsApp-green button treatment — unchanged.

## 12. Accessibility

- Three CTAs already have distinct, descriptive accessible labels ("Book Free Trial," "View Membership Plans," "Message Us on WhatsApp") — unchanged, already correct, meets the sitewide "no generic click-here" rule.
- New radial glow: `aria-hidden="true"`, `pointer-events-none`.
- Size differentiation (§5) must not drop any button below the 44×44px touch target minimum — `size="compact"` already meets this elsewhere in the system (confirmed via its use in Hero's secondary treatment and MembershipCta), so no new verification needed beyond consistency.

## 13. Performance Constraints

- New radial glow is a CSS `background` gradient — zero additional network/paint cost beyond what a flat background already costs.
- No new images, no new dependencies.

## 14. Acceptance Criteria

- ✓ No horizontal overflow at any tested width.
- ✓ Primary CTA is visibly larger (more padding) than secondary/tertiary at every breakpoint, stacked or row.
- ✓ Only the primary CTA pulses on scroll entry — secondary/tertiary do not.
- ✓ A subtle radial glow is present behind the headline, `aria-hidden`, not interfering with text contrast (verify WCAG AA still holds with the glow present).
- ✓ Reduced motion: no pulse, all content visible instantly.
- ✓ All three CTAs remain individually reachable via keyboard with correct accessible names.

## 15. Design Rationale

**Why size-differentiate rather than adding more color/motion:** [00-design-principles.md](../00-design-principles.md) §3's escalating-choreography principle caps this section's motion complexity at Tier 4 — the fix for "three CTAs feel equal" cannot be "add more animation," since that would violate the section's correct place in the page's motion arc. Size is the one lever available that doesn't add motion complexity, and it's also simply the most direct way to express "do this one first" — matching [15. Final Design Rules] in `docs/Visual-Design-Specification.md`: "every CTA is deliberate and singular in priority per section."

**Why add a radial glow instead of a photo or bolder background:** the audit is right that a flat ink rectangle here is indistinguishable from FAQ's equally flat treatment, despite carrying much more conversion weight — but [00-design-principles.md](../00-design-principles.md) §2 keeps the color system closed (no new hues) and this section's own stated design intent (`docs/Homepage-Architecture.md` §9) explicitly says "no motion needed beyond [the pulse]... this can be short and confident rather than persuasive." A restrained radial glow using the existing brand yellow at very low opacity adds just enough visual distinction to separate this section from a plain utility band, without contradicting the "short and confident, not persuasive" brief or introducing new visual language this late in the page.

**Why FinalCta's narrow `max-w-2xl` column is fine as-is while FAQ's identical width was corrected:** FAQ's narrowness was flagged because it had *no visual framing* explaining the width choice, floating unexplained in a wider section. FinalCta's narrow column is centered, symmetrical, and already visually justified by its content type (a short, punchy closing statement genuinely benefits from a tight, confident column — unlike FAQ's answer text, which doesn't need to look "punchy," it needs to be scannable). Different content, different correct answer to a similar-looking layout choice — this isn't inconsistency, it's applying the same underlying judgment ("does the width serve this specific content") and getting a different answer because the content differs.

**Why the `secondary` variant's `text-white` override is not a bug to fix:** the audit flagged this as evidence the Button system's tone-awareness is "incomplete," but a component that defaults to `border-current`/`text-current` and allows a per-usage override for a specific dark-background context is a reasonable, minimal API — building full automatic tone-detection into the base Button component would be speculative engineering for a pattern that occurs in exactly the contexts already identified in this document. Leave as-is.

## 16. Implementation Notes for Gemini

- Change the secondary and tertiary `ButtonLink` instances from their current size to `size="compact"`, leaving the primary at its current default/standard size.
- Add a radial gradient behind the headline: a `div` positioned absolutely behind the text content (z-index below the text, above the section background), `aria-hidden="true"`, `pointer-events-none`, using `background: radial-gradient(ellipse at 50% 40%, rgba(255,222,1,0.06) 0%, transparent 60%)` or equivalent Tailwind arbitrary-value classes.
- Scope the existing pulse animation to the primary `ButtonLink` only — if it currently wraps all three buttons in one `AnimationWrapper` with the pulse variant, split so only the primary button's wrapper carries the pulse; secondary/tertiary keep their fade-up entrance but no pulse.
- Do not change the headline/subhead copy, the CTA link targets, or the `max-w-2xl` column width.
- Do not add new colors, images, or additional motion beyond the single primary-only pulse.
