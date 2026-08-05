# Trust Strip — Implementation Spec (Version 2)

*Reads against [00-design-principles.md](../00-design-principles.md), [01-design-system.md](../01-design-system.md), [02-motion-system.md](../02-motion-system.md), [03-responsive-system.md](../03-responsive-system.md). Version 1 source: `src/components/sections/TrustStrip.tsx`.*

---

## 1. Section Purpose

Converts "is this a real, established business" doubt into confidence in under 5 seconds, using only real numbers (Since 2016 · 2 Locations · 9 Disciplines · 6 Trainers). No imagery, no CTA — a deliberate visual pause after the Hero's emotional hit, before Programs asks the visitor to engage again.

## 2. Design Philosophy

Quiet confidence. This section's entire job is to get out of the way fast while still registering as credible — it should read as a clean data band, not a boxed widget, and it should not compete with the Hero it just followed or the Programs section it precedes.

## 3. Storytelling Goal

Eye path: yellow divider rule (signals "new beat") → four stats, left to right, each landing in sequence. No single stat should visually dominate by default — but see §4 for the one hierarchy correction Version 2 makes.

## 4. Visual Hierarchy

1. "9 Training Disciplines" and "6 Dedicated Trainers" (the two most *marketing-significant* stats — depth of offering and staffing — get equal-but-primary visual treatment)
2. "2 Hyderabad Locations"
3. "Since 2016"
4. Divider rule (precedes all, but is a marker, not content)

**Correction from Version 1:** all four stats currently render at identical size/weight/color with no differentiation. Version 2 does not introduce a size hierarchy (that would break the "clean data band, not a boxed widget" goal stated in the section's own business goal) — instead, the differentiation is order-only: the two most persuasive stats are the second and third positions in the row (center-weighted reading pattern), keeping "Since 2016" first (chronological anchor) and closing on "6 Dedicated Trainers" (the most human, most memorable stat, ending the sequence on people rather than a number). See §15 for why size-based hierarchy was rejected.

## 5. Desktop Layout Specification

- `PageSection tone="dark" spacing="compact"` — unchanged (56/96px → compact tier is 40/64px per system, confirmed against `py-10 lg:py-16`).
- Grid: `grid-cols-4` at desktop, `lg:divide-x lg:divide-border-dark`, `lg:px-8` per stat cell — unchanged, correct.
- Divider rule: 96px wide (`lg:w-24`), 1px tall, centered, `mb-12` below it — unchanged.
- Background: keep the three-layer atmosphere (blurred texture image at 8% opacity/grayscale, yellow radial glow, vertical vignette) — this is genuinely good restrained depth and should not be removed. **Consolidate into one layered background** per the same DOM-reduction pattern used in [hero-implementation-spec.md](hero-implementation-spec.md) §9 — three divs become the blurred `<Image>` (kept as a real element, since it's an actual photo, not a gradient) plus one `<div>` carrying both gradient layers (radial glow + vignette) as comma-separated `background-image` values.

## 6. Tablet Layout Specification

**Correction from Version 1** (flagged in [03-responsive-system.md](../03-responsive-system.md) §3): the current grid jumps straight from `grid-cols-2` (mobile) to `lg:grid-cols-4` (1024px) with no tablet step, leaving a boxy 2×2 layout all the way through the 640–1023px tablet range. Version 2 requires an explicit tablet tier:
- `grid-cols-2` (mobile, <640px) → `sm:grid-cols-4` (640px+) → same 4-column layout continues through `lg:` with dividers/padding added.
- At `sm:` (before dividers activate at `lg:`), use `sm:gap-x-6 sm:gap-y-8` in place of mobile's `gap-y-12` — four columns at tablet width need horizontal breathing room, not vertical stacking gap.
- Dividers (`divide-x`) still only activate at `lg:` — a tablet-width 4-column row without dividers, then dividers added as extra polish at desktop width where there's more room for them to read clearly, is fine and requires no further correction.

## 7. Mobile Layout Specification

- `grid-cols-2` (2×2), `gap-y-12` (48px) — unchanged, correct for mobile.
- Divider rule: 64px wide (`w-16`), unchanged.

**At exact widths:**
- **320/375/390/430px:** identical 2×2 layout, no changes across this range.
- **768px:** now inside the corrected tablet tier (§6) — 4 stats in a single row, no dividers, generous horizontal gap. This is the primary behavioral fix in this section's spec.

## 8. Spacing System

| Relationship | Value |
|---|---|
| Section top padding → Divider | Standard compact-tier top padding (unchanged) |
| Divider → Stat grid | 40px mobile (`mb-10`) / 48px desktop (`lg:mb-12`) — unchanged |
| Stat grid row gap (mobile 2×2) | 48px (`gap-y-12`) — unchanged |
| Stat grid gap (tablet 4-col, NEW) | 24px horizontal / 32px vertical (`sm:gap-x-6 sm:gap-y-8`) |
| Stat cell internal padding (desktop, with dividers) | 32px (`lg:px-8`) — unchanged |

## 9. Motion Choreography

Tier 1 — Establishing (per [02-motion-system.md](../02-motion-system.md) §2), immediately following the Hero's own Tier 1 sequence.

- Divider: scaleX 0→1, center-anchored, 500ms, ease-out, triggers once at 20% viewport — unchanged.
- Stats: `AnimationWrapper` fade-up, delay = `getStaggerDelay(index) + 0.15` (0.15/0.23/0.31/0.39s) — unchanged, correct; the flat 0.15s offset lets the divider finish drawing before stats begin.
- Counter animation: 0→final value, 1200ms, ease-out, per [02-motion-system.md](../02-motion-system.md) §1 — unchanged.

**Correction — threshold desync (flagged in audit):** Version 1 has the section-level `AnimationWrapper` triggering at `amount: 0.2` while `CountUp`'s internal `useInView` triggers at a different `amount: 0.4`. Version 2 requires both to use the same threshold — **0.2** (the sitewide standard per [02-motion-system.md](../02-motion-system.md) §1) — so the fade-up entrance and the count-up start are synchronized rather than potentially visible as two separate, out-of-sync triggers depending on scroll speed.

**Correction — remove hover states on non-interactive content:** Version 1 applies `hover:-translate-y-1` plus opacity/color shifts to each stat block on desktop hover, despite stats not being clickable. Version 2 removes this hover treatment entirely — a static data display should not simulate interactivity it doesn't have. See §15.

**Reduced motion:** counters display final value immediately, divider appears at full width immediately, no fade-up travel — unchanged sitewide rule.

## 10. Scroll Behaviour

None — per [02-motion-system.md](../02-motion-system.md) §4, this section has no full-bleed banner image (its background texture is a low-opacity atmospheric layer, not a compositional banner), so it correctly receives no parallax. Entrance-only motion, no continuous scroll response. This is intentional restraint, not a gap.

## 11. Micro Interactions

None by design — removing the hover lift (§9) leaves this section with zero interactive micro-details, which is correct: it has zero interactive elements. A "quiet data band" should not manufacture interaction cues it doesn't need.

## 12. Accessibility

- Counters expose final value in DOM immediately via `sr-only` span, animated digits hidden from AT via `aria-hidden` — unchanged, already correctly implemented.
- Background texture image and gradient overlay: `aria-hidden` + `pointer-events-none` — unchanged.
- **Add `aria-hidden="true"` to the `AnimatedDivider`** — currently unmarked despite being purely decorative; a screen reader has no reason to encounter a thin rule element.

## 13. Performance Constraints

- Consolidate background layers per §5 (three divs → photo element + one gradient div).
- Background texture image: add explicit `sizes="100vw"` (currently unset, relying on next/image default) — makes the responsive request behavior explicit rather than implicit.
- No `width`/`height`/`top`/`left` animation — confirmed compliant, keep it that way.

## 14. Acceptance Criteria

- ✓ No horizontal overflow at 320–1920px.
- ✓ At 768px, all four stats display in a single row with no dividers and no cramped 2×2 stacking (the primary fix this spec introduces).
- ✓ Fade-up entrance and count-up animation start in visible sync (same 0.2 threshold).
- ✓ Reduced motion: final numbers visible immediately, no counting, no divider draw animation.
- ✓ No hover state fires on stat blocks (verify via manual desktop hover test — nothing should move or change opacity).
- ✓ Screen reader announces final stat values without needing to wait for or trigger animation.

## 15. Design Rationale

**Why order-based hierarchy instead of size-based:** the section's own stated business goal is "a deliberate visual pause... inserting a CTA or unequal visual weight here would dilute its speed and purpose" (per `docs/Homepage-Architecture.md` §2). A size hierarchy would turn a clean data band into a mini-infographic competing for attention it isn't supposed to have. Reordering costs nothing visually and lets the two most persuasive facts land in the strongest reading positions (center-of-row, and last-before-moving-on) without adding visual noise.

**Why remove the hover lift:** hover implies "this does something." These stats do nothing when hovered — no link, no expansion, no tooltip. Applying a lift/opacity animation to static content trains visitors to expect interactivity that isn't there, which is a small but real trust/usability cost in a section whose entire purpose is building trust.

**Why fix the tablet grid gap specifically:** a 2×2 stat block on a ~768px iPad is the single clearest "this wasn't designed for my screen size" moment on the whole page — four short stats have plenty of room to sit in one clean row at that width, and stacking them into a box instead reads as an oversight, not a decision.

## 16. Implementation Notes for Gemini

- Reorder the four stat objects in the content array: Since 2016 → 2 Hyderabad Locations → 9 Training Disciplines → 6 Dedicated Trainers (unchanged from current order — verify this is already the order in `src/content/...` before assuming a change is needed; if the current order differs, correct it to match this sequence).
- Add `sm:grid-cols-4` to the stats grid, and add `sm:gap-x-6 sm:gap-y-8` for the 640–1023px range, keeping `lg:divide-x lg:divide-border-dark lg:px-8 lg:gap-y-0` for 1024px+ exactly as it currently exists.
- Remove the `hover:-translate-y-1` and any associated opacity/color hover classes from the stat block wrapper.
- Change `CountUp`'s internal `useInView` `amount` prop from `0.4` to `0.2` to match the section-level `AnimationWrapper` threshold.
- Add `aria-hidden="true"` to `AnimatedDivider`'s root element.
- Add explicit `sizes="100vw"` to the background texture `<Image>`.
- Do not change the counter duration (1200ms), the divider draw duration (500ms), or any color/typography value — these are correct as-is.
- Do not add parallax to this section — it has no qualifying banner image per [02-motion-system.md](../02-motion-system.md) §4's rule.
