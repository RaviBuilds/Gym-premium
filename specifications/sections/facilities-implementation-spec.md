# Facilities — Implementation Spec (Version 2)

*Reads against [00-design-principles.md](../00-design-principles.md), [01-design-system.md](../01-design-system.md), [02-motion-system.md](../02-motion-system.md). Version 1 source: `src/components/sections/Facilities.tsx`.*

---

## 1. Section Purpose

Shows visitors the tangible, concrete value of what they're paying for ("Everything you need, nothing you're paying extra for") — six amenities/facilities with a supporting banner photo of the real training floor. Reinforces the no-frills-but-serious positioning established in WhyInfiniti with visible proof rather than another claim.

## 2. Design Philosophy

Grounded and concrete — this section's job is to make the abstract "honest pricing" argument tangible by showing real equipment/space. Restrained motion (fade-only banner reveal, per existing Version 1 choice) is correct; the fixes here are about visual weight and consistency, not adding energy.

## 3. Storytelling Goal

Header → banner photo (a real look inside the gym) → six amenity items in a grid. The banner should read as a genuine visual anchor for the section, not a filler image between two blocks of similar-weight content.

## 4. Visual Hierarchy

1. Banner photograph (the section's strongest asset)
2. Six amenity items (equal weight among themselves)
3. Section heading
4. Eyebrow

## 5. Desktop Layout Specification

- Header: left-aligned at every breakpoint — **correction**, see §15 for why the current `sm:text-center` step is removed.
- Banner: `lg:h-96` (384px), full-bleed via negative margins — unchanged height, but **add a bottom gradient-to-transparent overlay** (in addition to the existing flat `bg-ink/15` wash) so the banner has directional depth rather than a uniform tint — see §15.
- Icon grid: `lg:grid-cols-3` (2 rows of 3) — unchanged column count, but **add a background chip behind each icon** (see §15) and reduce the uniform `gap-8` to a breakpoint-aware scale: `lg:gap-8` stays, but see §7 for mobile/tablet correction.
- No CTA currently exists in this section — **add a low-key text-link CTA** ("See membership plans →") beneath the icon grid, `Ghost Button` style per [01-design-system.md](../01-design-system.md) button system, linking to `/pricing` — see §15.

## 6. Tablet Layout Specification

- Icon grid: `sm:grid-cols-2` — unchanged.
- Banner: `sm:h-72` (288px) — unchanged.
- Header: left-aligned (removing the current tablet-only center step, matching Programs' identical fix).

## 7. Mobile Layout Specification

- Icon grid: single column — unchanged column behavior, but **reduce vertical gap from the current uniform `gap-8` (32px) to `gap-6` (24px) on mobile only** — six stacked icon blocks at 32px gap each produces excessive vertical scroll length for genuinely sparse content (icon + short title + one line of body text); 24px is enough separation without bloating scroll length. Tablet/desktop keep `gap-8`.
- Banner: `h-56` (224px) — unchanged.

**At exact widths:**
- **320/375/390/430px:** single-column icon list, banner at 224px height.
- **768px:** 2-column icon grid, banner at 288px height, header left-aligned (per §6's correction).

## 8. Spacing System

| Relationship | Value |
|---|---|
| Header → Banner | 40px (`gap-10` outer wrapper) — unchanged |
| Banner → Icon grid | 40px — unchanged |
| Icon grid gap (mobile, corrected) | 24px |
| Icon grid gap (tablet/desktop) | 32px — unchanged |
| Icon grid → new CTA link (NEW) | 32px (`mt-8`) |

## 9. Motion Choreography

Tier 2 — Building (per [02-motion-system.md](../02-motion-system.md) §2).

- Banner: `AnimationWrapper variant="fade"` wrapping `ParallaxLayer` — unchanged, correct.
- Icon grid items: `AnimationWrapper` fade-up per item, `getStaggerDelay(index)` — unchanged, correct (this section already does real per-item stagger, unlike WhyInfiniti's manual delays).
- **NEW:** the CTA link (added per §5) gets its own `AnimationWrapper` fade-up, delay = the stagger value for a 7th item (continuing the existing sequence naturally, i.e. `getStaggerDelay(6)`).

**Reduced motion:** parallax disabled, banner fade skipped (instant), icon stagger collapses to instant appearance — unchanged sitewide rule.

## 10. Scroll Behaviour

- Banner: scroll-linked parallax, 32px max drift (matching Programs' `TrainingBanner` value for consistency across the site's two mid-page banners), desktop only (≥1024px) — per [02-motion-system.md](../02-motion-system.md) §4, this section qualifies since it has a genuine full-bleed banner.

## 11. Micro Interactions

- **NEW CTA link:** Ghost Button pattern — underline appears on hover only, not at rest, per [01-design-system.md](../01-design-system.md) button system.
- Icon items: no hover interaction (they're not clickable, correctly so) — unchanged.

## 12. Accessibility

- Banner image: descriptive alt text — already correctly implemented in Version 1, unchanged.
- Icons: `aria-hidden` — unchanged, correct.
- New CTA link: real link text ("See membership plans"), not an icon-only affordance — meets the sitewide "no generic click-here" rule.
- **Correction:** verify heading hierarchy — SectionHeader renders `h2`, each amenity title renders `h3` (confirm this is actually the case in the component; if amenity titles are currently a `<p>` or `<span>` rather than a real heading level, promote them to `h3` since they function as sub-headings within the section).

## 13. Performance Constraints

- Banner image: no `priority` (correct, below fold).
- No new image assets added — the icon chips (per §15) are a CSS treatment (background circle), not new image requests.

## 14. Acceptance Criteria

- ✓ No horizontal overflow at any tested width.
- ✓ Header is left-aligned at every breakpoint (no tablet-only centering).
- ✓ Banner has a visible directional gradient (not a flat uniform tint) reinforcing depth.
- ✓ Icons sit inside a visible background chip, not floating bare in whitespace.
- ✓ A CTA link is present and functional beneath the icon grid, linking to `/pricing`.
- ✓ Mobile icon grid gap is visibly tighter than tablet/desktop (24px vs 32px).
- ✓ Reduced motion: banner appears instantly, no parallax, icon items appear without stagger delay.

## 15. Design Rationale

**Why remove the tablet-only center alignment:** identical rationale to the same fix in [programs-implementation-spec.md](programs-implementation-spec.md) §15 — a left→center→left alignment flip across breakpoints has no stated design intent anywhere in the codebase and reads as an artifact of a shared component's default behavior rather than a considered choice for this specific section.

**Why add a directional gradient to the banner instead of the flat `bg-ink/15` wash:** the audit correctly identified this banner as "the strongest asset in this section" being treated as "essentially a filler image." A flat uniform tint doesn't build any depth or focal point — a bottom-to-transparent gradient (echoing the same directional-scrim logic already used in the Hero, per [01-design-system.md](../01-design-system.md) §1's "Depth overlays" rule) gives the image a sense of grounding without requiring new text-on-image content that this banner doesn't need.

**Why give icons a background chip:** six bare glyphs floating in whitespace above bold text reads thin compared to every card-based section elsewhere on the site. A small circular chip (using Surface Card white on the light background, or a subtle yellow-tinted circle) gives the icon a defined home and brings this section's visual language a step closer to the card language used elsewhere, without turning the amenity items into full `Card` components (which would be overkill for icon+title+one-line-description content).

**Why add a CTA where Version 1 has none:** this section makes the offering feel tangible and concrete — "everything you need, nothing you're paying extra for" is a value argument, and value arguments should end in a next step. WhyInfiniti (the section right before this one in scroll order) already has a pricing CTA; Facilities currently has none, creating an inconsistent pattern where some proof-sections close with an action and others just... end. A low-key text link (not a full button, which would overstate this section's conversion priority relative to WhyInfiniti's more central pricing moment) is proportionate.

**Why the mobile gap correction specifically:** six items at `gap-8` (32px) stacked single-column produces roughly 224px of pure gap space across the list on mobile, for content that's genuinely light (one icon, a 3-4 word title, one short sentence per item) — tightening to 24px keeps the section from feeling artificially long to scroll through on the device where scroll length matters most.

## 16. Implementation Notes for Gemini

- Remove the `sm:text-center` class from the section's `SectionHeader` wrapper, keep `text-left` (and `lg:items-start lg:text-left`, already present) at every breakpoint.
- Add a bottom-anchored linear gradient overlay on the banner (`bg-gradient-to-t from-ink/40 to-transparent`, layered alongside or replacing the existing flat `bg-ink/15` div — combining both is fine if the flat wash still reads as needed for overall photo legibility, use judgment but the gradient must be visibly present).
- Wrap each amenity icon in a `flex size-12 items-center justify-center rounded-full bg-surface-card` (or an equivalent circular chip using existing tokens) — icon renders centered inside at its existing size.
- Add a `ButtonLink` (Ghost variant, per [01-design-system.md](../01-design-system.md) §5's Button System) below the icon grid: text "See membership plans", href `/pricing`, wrapped in its own `AnimationWrapper`.
- Reduce the icon grid's base (mobile) gap from `gap-8` to `gap-6`, add `sm:gap-8 lg:gap-8` to restore 32px at tablet and above.
- Confirm each amenity title renders as `h3` — promote from `<p>`/`<span>` if it currently isn't a real heading element.
- Add scroll-linked `ParallaxLayer` drift of 32px to the banner if not already wired identically to Programs' `TrainingBanner` pattern (reuse the same component, same drift value, for consistency between the site's two banners).
- Do not change the six amenities' copy, icons, or the banner's photo/alt text.
