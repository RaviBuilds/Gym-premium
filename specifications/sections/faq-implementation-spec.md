# FAQ — Implementation Spec (Version 2)

*Reads against [00-design-principles.md](../00-design-principles.md), [01-design-system.md](../01-design-system.md), [02-motion-system.md](../02-motion-system.md). Version 1 source: `src/components/sections/Faq.tsx`.*

---

## 1. Section Purpose

Resolves remaining objections in the visitor's own words/questions, positioned late in the scroll after every other trust-building section has already done its work. A utility section — its job is clarity and findability, not persuasion.

## 2. Design Philosophy

Calm and functional. Per [02-motion-system.md](../02-motion-system.md) §2, this is a **Tier 4 — Resolving** section — motion should be quieter here than in Programs/Testimonials, not louder. Version 1's restraint (single fade-up for the whole block, no per-item stagger) is directionally correct for this tier; the fixes here are about scannability, not adding energy.

## 3. Storytelling Goal

Header → list of questions, scannable, easy to find "my" question and expand only it. No dramatic reveal needed — the goal is utility, not spectacle.

## 4. Visual Hierarchy

1. Accordion items (equal weight, scannable)
2. Section heading
3. Eyebrow

## 5. Desktop Layout Specification

- **Correction — widen the content column.** Version 1's `max-w-2xl` (672px) sits as a small floating column inside a section that could otherwise use `max-w-content` (1280px), with no visual framing (no card background, no border) explaining the width drop — it risks looking unfinished on wide desktop. Version 2 widens to `max-w-3xl` (768px) — still a deliberately narrow, readable column (FAQ answers genuinely benefit from a constrained line length), but wide enough to feel like a considered editorial choice rather than an accidentally-narrow leftover. Pair this with a **subtle framing device**: a `border-t border-border-subtle` above the accordion list and `border-b border-border-subtle` below it (the accordion's own internal `divide-y` already separates individual items — this adds a top/bottom cap so the whole block reads as one contained unit against the wider section).
- Accordion structure (button/panel/chevron) — unchanged, already correct.

## 6. Tablet Layout Specification

Unchanged from Version 1 — no breakpoint-specific behavior needed; the widened `max-w-3xl` column applies uniformly once it fits (it will render as the full available width below that cap on tablet, same as it does on mobile).

## 7. Mobile Layout Specification

Unchanged — single narrow column, full accordion behavior.

**At exact widths:**
- **320/375/390/430px:** identical accordion behavior, column fills available width up to the `max-w-3xl` cap (which won't bind at these widths anyway).
- **768px:** same behavior, column may approach but likely not reach the 768px cap depending on container padding — no structural change from mobile.

## 8. Spacing System

| Relationship | Value |
|---|---|
| Header → Accordion | 40px (`gap-10`) — unchanged |
| Per-item question → answer (open state) | Existing panel padding (`pb-5`) — unchanged |
| Accordion max-width (corrected) | 768px (`max-w-3xl`), was 672px |

## 9. Motion Choreography

Tier 4 — Resolving (per [02-motion-system.md](../02-motion-system.md) §2) — correctly the quietest treatment on the page along with Footer.

- Section-level reveal: single `AnimationWrapper` fade-up wrapping the entire Accordion as one block — **keep as-is.** The audit floated per-item stagger as a possible improvement, but per this section's Tier 4 classification, adding stagger here would work against [00-design-principles.md](../00-design-principles.md) §3's "escalating choreography" principle — motion should *decrease*, not increase, in utility sections. Single-block fade-up is the correct, deliberately restrained choice.
- Per-item expand/collapse: `height: 0→"auto"` + opacity, 250ms, `AnimatePresence` — unchanged, already correct.
- Chevron rotation: 180° CSS transition, 250ms — unchanged.

**Reduced motion:** panel expand/collapse skips straight to final height/opacity (no animated transition, but the open/closed *state change itself* still functions — this isn't decorative motion, it's a state transition, so per [04-accessibility.md](../04-accessibility.md) §6 the state change must still happen, just without animated easing) — unchanged, already correctly implemented in Version 1.

## 10. Scroll Behaviour

None — no banner, no qualifying image, correctly no parallax.

## 11. Micro Interactions

- **NEW — open-state visual reinforcement.** Currently, an open accordion item is signaled *only* by chevron rotation — question text color and background are identical open vs. closed. On a list where a visitor may open several items while scanning, this makes it harder to tell at a glance which panel belongs to which header. Add a subtle treatment to the open state: question text shifts to include a small `text-brand-yellow` accent on the chevron itself when open (chevron already changes rotation; add color change: `text-text-secondary` closed → `text-brand-yellow` open), giving a second, independent visual cue beyond rotation alone.

## 12. Accessibility

- Disclosure pattern (`button` inside `h3`, `aria-expanded`, `aria-controls`, `role="region"`, `aria-labelledby`) — unchanged, already correctly implemented, exemplary.
- Multi-open behavior (Set-based, not exclusive) — unchanged, correct pattern for FAQ.
- **NEW:** verify the chevron's color-change addition (per §11) doesn't rely on color alone to communicate open/closed state — it doesn't, since rotation remains the primary signal and color is a secondary reinforcement layered on top, consistent with the sitewide "never color alone" badge rule extended here as a matter of consistent principle even though this isn't a badge.

## 13. Performance Constraints

No images, minimal JS (height/opacity animation only) — remains lightweight, unchanged.

## 14. Acceptance Criteria

- ✓ No horizontal overflow at any tested width.
- ✓ Accordion column renders at up to 768px wide on large desktop, framed by top/bottom borders, not floating unexplained at 672px.
- ✓ Chevron rotates AND changes color when a panel opens (two independent cues, not one).
- ✓ Expand/collapse remains smooth (height-based, not a jarring opacity-only pop) at 250ms.
- ✓ Reduced motion: panel state still changes (open/closed toggles correctly), just without animated transition easing.
- ✓ Keyboard: every accordion header reachable via Tab, togglable via Enter/Space, `aria-expanded` state accurate at all times.

## 15. Design Rationale

**Why widen to `max-w-3xl` rather than leaving `max-w-2xl` or matching the full `max-w-content`:** FAQ answers are exactly the kind of content where an overly wide line length actively hurts readability — going all the way to 1280px would be a readability regression, not an improvement. 768px is a deliberate middle point: noticeably more substantial than 672px (closing the "why is this section oddly narrow" perception) while staying within a comfortable reading measure.

**Why add top/bottom border framing:** a narrower-than-section-width content block with no visual explanation for the width change is the specific issue the audit raised — not the width itself (which is a legitimate typographic choice) but the *lack of any visual signal* that the narrowing was intentional. A simple top/bottom border cap costs nothing and turns "this looks unfinished" into "this is clearly a contained, deliberate module."

**Why NOT add per-item stagger despite the audit noting it would "read more premium":** [00-design-principles.md](../00-design-principles.md) §3 explicitly requires motion complexity to track a section's position in the emotional arc, and FAQ is deliberately Tier 4 — the least emotionally weighted tier on the page, by design, matching `docs/Visual-Design-Specification.md` §1's stated arc where the page should "settle into a calm, confident close" after Testimonials' peak. Adding stagger here would be optimizing this section in isolation while working against the whole-page choreography principle this entire redesign is built on. The correct response to "this could look more premium" is not always "add more motion" — sometimes it's "this section is supposed to be the quiet one."

## 16. Implementation Notes for Gemini

- Change the accordion wrapper's `max-w-2xl` to `max-w-3xl`.
- Add `border-t border-border-subtle` immediately above the Accordion component and `border-b border-border-subtle` immediately below it (or apply directly to the Accordion's own root wrapper if that's cleaner) — use the existing `divide-border-subtle` color token for consistency with the accordion's own internal dividers.
- In the Accordion component, add a conditional class on the chevron icon: `text-ink` (or current default) when closed, `text-brand-yellow` when open — driven by the existing `isOpen` state already used for the rotation class.
- Do not add per-item stagger to the section-level reveal — this is a deliberate Tier 4 choice, not an oversight; leave the single-block `AnimationWrapper` as-is.
- Do not change the FAQ copy, question count, or the multi-open (non-exclusive) accordion behavior.
- Do not change the 250ms expand/collapse timing.
