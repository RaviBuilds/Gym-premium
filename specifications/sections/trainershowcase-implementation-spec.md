# Trainer Showcase — Implementation Spec (Version 2)

*Reads against [00-design-principles.md](../00-design-principles.md), [01-design-system.md](../01-design-system.md), [02-motion-system.md](../02-motion-system.md). Version 1 source: `src/components/sections/TrainerShowcase.tsx`.*

---

## 1. Section Purpose

Pre-answers "will I actually get real coaching, or just left alone with a machine, given how cheap this is" — turning the six-person trainer roster into visible proof of service quality. Real names and specific specialties matter more here than polish alone; this is where the "Committed Regular" persona decides whether this gym can deliver a real coaching relationship.

## 2. Design Philosophy

Editorial team introduction, not an employee directory grid. Six real people, presented with enough individual distinction that the section feels like meeting a team, not scanning a staff-photo wall.

## 3. Storytelling Goal

Header → six trainer cards in sequence, left to right, top to bottom — echoing a "lineup" feeling. Mohammed Wajeed's "Mr Nizamabad" competitive title is the roster's single most sellable credibility detail and should read as such, not as one inconsistent badge among five bare cards.

## 4. Visual Hierarchy

1. Trainer cards (all six, roughly equal weight — see §15 for why full differentiation isn't the fix)
2. Section heading
3. Eyebrow

## 5. Desktop Layout Specification

- Grid: `lg:grid-cols-3 lg:gap-8` — unchanged, 3×2.
- Card: `aspect-[3/4]` portrait photo, white card on dark section — unchanged, correct.
- **Correction:** wrap the `SectionHeader` in an `AnimationWrapper` (fade-up, no delay) — Version 1 leaves it unanimated while every sibling section's header animates, an unintentional inconsistency (see §15).
- **NEW — consistent credential treatment:** every trainer card gets a small `Badge(variant="informational")` chip showing their specialty/certification (e.g. "CrossFit & Personal Trainer" is already the title text — the badge instead shows something *additional*, like years of experience if available in content, or the specific discipline focus). Wajeed's existing achievement badge stays as the one visually distinct exception (dark chip, yellow text) — the other five get the standard informational badge style (per [01-design-system.md](../01-design-system.md) §1), so all six cards carry a badge, but Wajeed's remains visually the "loudest" one. See §15 for why this is corrective, not additive scope creep.

## 6. Tablet Layout Specification

- Grid: `sm:grid-cols-2 sm:gap-6` — unchanged.
- Same badge-on-every-card treatment as desktop.

## 7. Mobile Layout Specification

- Swipeable snap-scroll carousel, `85%` card width, `gap-4` — unchanged, correct pattern for six items.
- Name/title always visible (not hover-gated) — unchanged, already correct per Version 1's own stated intent.
- Badge treatment: same as desktop/tablet — badges are always-visible text, unaffected by the hover-vs-touch gap (see §11).

**At exact widths:**
- **320/375/390/430px:** identical swipe-carousel behavior.
- **768px:** 2-column static grid (tablet tier).

## 8. Spacing System

Unchanged from Version 1 — `flex flex-col gap-10` section wrapper, card grid gaps per §5–§7. No spacing corrections needed in this section; the issues here are motion/consistency, not layout spacing.

## 9. Motion Choreography

Tier 2 — Building (per [02-motion-system.md](../02-motion-system.md) §2).

- **Correction:** `SectionHeader` gets a fade-up `AnimationWrapper` (no delay) — matching every sibling section (WhyInfiniti, Facilities both animate their headers; this section currently doesn't, which is the specific inconsistency flagged in [04-accessibility.md](../04-accessibility.md) §9 item 2).
- Card grid: `getStaggerDelay(index)` per card via `CardGrid`, 0/0.08/0.16/0.24/0.32/0.4s across all 6 — unchanged, correct (six cards land exactly at the stagger cap, no compression needed).
- Card hover (desktop): `whileHover={{y:-6}}` lift — unchanged.
- Name underline-on-hover: unchanged for desktop, see §11 for the touch correction.

**Reduced motion:** header and cards appear instantly, no stagger, no hover lift needed (hover doesn't fire under reduced motion by definition) — unchanged sitewide rule.

## 10. Scroll Behaviour

None — per [02-motion-system.md](../02-motion-system.md) §4, this section has no full-bleed banner (it's a pure card grid on a flat dark background), so it correctly receives no parallax.

## 11. Micro Interactions

- Desktop hover: name underline grows 0→100% width, 300ms — unchanged.
- **NEW — touch equivalent (correction, per [04-accessibility.md](../04-accessibility.md) §9 item 1):** since the underline-on-hover never fires on touch devices (`CardGrid`'s mobile mode is a swipe carousel, no hover), add an `active:` press-state on the card that briefly (150ms) shows the same underline treatment at full width, giving touch users an equivalent confirmation-of-registration cue when they tap a card. This mirrors the same fix already specified for ProgramCard in [programs-implementation-spec.md](programs-implementation-spec.md) §11.
- Card press: standard `active:scale-[0.98]` on touch.

## 12. Accessibility

- Trainer photo alt text: name + role, already correctly implemented ("Mohammed Wajeed, Fitness Guru and Mr Nizamabad titleholder") — unchanged, keep this pattern for all six.
- Name/title always visible without hover — unchanged, correctly implemented, meets the stated requirement in `docs/Homepage-Architecture.md` §5 that identity info must never be hover-only.
- **NEW badges:** informational badges pair with visible text (specialty/credential), never color-only — per the sitewide badge rule in [01-design-system.md](../01-design-system.md) and [04-accessibility.md](../04-accessibility.md) §5.
- Card is a plain `div` (not a link) — correct, per Version 1's own stated design decision that trainers reinforce trust rather than directly converting; no accessible-name concern since there's no click target beyond the swipe gesture itself.

## 13. Performance Constraints

- Trainer images: `sizes="(min-width:1024px) 16vw, (min-width:640px) 45vw, 85vw"` — already correctly tuned, unchanged.
- No `priority` (correct, below fold).
- New badges are text+CSS, no new image assets.

## 14. Acceptance Criteria

- ✓ No horizontal overflow at any tested width.
- ✓ `SectionHeader` animates on scroll entry, consistent with WhyInfiniti/Facilities' headers.
- ✓ All six cards carry a badge (Wajeed's achievement-style, the other five informational-style) — no card looks "incomplete" relative to its neighbors.
- ✓ Tapping a trainer card on a touch device produces a visible feedback cue (underline flash or equivalent), not just the swipe gesture with zero per-card feedback.
- ✓ Names/titles remain always-visible (never hover-gated) at every breakpoint.
- ✓ Reduced motion: header and cards appear instantly with no stagger delay.

## 15. Design Rationale

**Why fix the missing header animation rather than leave it as a deliberate quiet moment:** there's no comment or rationale anywhere in the Version 1 code explaining why this one section's header skips the animation every sibling section has — it reads as an oversight, not a decision. Per [00-design-principles.md](../00-design-principles.md) §3, unexplained inconsistency is exactly the "assembled, not designed" tell this whole redesign exists to close.

**Why give all six trainers a badge instead of removing Wajeed's or leaving the asymmetry:** the audit correctly notes that one badged card among five bare ones makes the five look incomplete rather than making Wajeed's look special — asymmetry without a system reads as an error. The fix isn't to flatten everyone to identical treatment (that would erase a genuinely differentiating fact about Wajeed) — it's to give every card a badge slot so badges become an expected, consistent element of the card type, with Wajeed's specific achievement badge remaining the one that's visually louder (dark chip + yellow text vs. the other five's standard informational style). This keeps his distinction meaningful instead of making it look like a placeholder that never got filled in for the other five.

**Why fix touch feedback on the name underline instead of removing the hover effect entirely:** removing it would be the easy fix but throws away a nice detail for the roughly one-third of visitors on desktop pointer devices who do see it. Adding a touch-equivalent (per the identical pattern already justified in [programs-implementation-spec.md](programs-implementation-spec.md)) preserves the desktop detail while closing the actual gap — no interaction feedback at all for touch, which is this section's primary audience given `CardGrid`'s own mobile-first swipe design.

**Why this section does NOT get a featured/larger treatment for Wajeed (unlike Programs' featured Crossfit card):** the audit floated this as a possible improvement, but six roughly-equal cards in a roster context (a team lineup) is the correct metaphor — visually promoting one trainer above the other five risks implying a hierarchy of coaching quality among staff, which is a real, unintended message for a fitness business to send about its own team. The badge-consistency fix above achieves the same "make his distinction visible" goal without that risk.

## 16. Implementation Notes for Gemini

- Wrap the `SectionHeader` in `AnimationWrapper` with default `fade-up` variant, no delay override — matching the exact pattern already used in `WhyInfiniti.tsx` and `Facilities.tsx`.
- Add a `Badge(variant="informational")` to every `TrainerCard` that doesn't already have one, positioned identically to Wajeed's existing achievement badge (top-left overlay on the photo). Source the badge text from each trainer's existing specialty/title data already in `src/content/trainers.ts` — do not invent new content; if no distinct short credential string exists per trainer beyond their full title, use a shortened version of their existing title (e.g. "Nutritionist" from "Nutritionist & Fitness Trainer") rather than fabricating a new fact.
- Add an `active:` CSS state to the name-underline element mirroring its existing `group-hover:bg-[length:100%_2px]` treatment, scoped so it fires on tap (touch) without permanently altering the desktop hover behavior.
- Do not change the six trainers' photos, names, titles, or the card's white-on-dark-section color treatment (explicitly correct and intentional in Version 1's own comments).
- Do not add a per-card link/CTA — this section is deliberately non-converting per its own stated business goal; do not add scope beyond the badge and header-animation fixes specified here.
