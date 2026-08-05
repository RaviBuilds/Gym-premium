# 04 — Accessibility (Version 2)

*Version 1's accessibility posture is genuinely strong — this document mostly formalizes what the current implementation already does correctly (real alt text, focus-visible outlines, semantic headings, reduced-motion handling) so every section spec can reference it instead of restating it, and calls out the specific gaps found during the Version 1 audit that Version 2 must close.*

---

## 1. Color & Contrast (closed, unchanged)

Every text/background pairing in [01-design-system.md](01-design-system.md) clears WCAG AA (4.5:1 body text, 3:1 large text ≥24px). Primary button text is Ink-on-Yellow (12:1+) — never white-on-yellow. This correction is permanent; never revert it for a "cleaner" visual.

## 2. Keyboard Navigation

- Every interactive element (nav links, buttons, cards-as-links, accordion headers, tab controls, form fields) reachable via Tab in logical visual order.
- Every interactive element operable via Enter/Space where a mouse would use click.
- Swipeable mobile card strips (Programs, TrainerShowcase) must remain keyboard-navigable via arrow keys or sequential Tab order — swipe-only with no keyboard equivalent is not acceptable. **Gap found in Version 1 audit:** verify this is actually implemented on `CardGrid`'s mobile scroll-snap mode, not just assumed — flag as an open verification item per section.

## 3. Focus Visibility (closed, unchanged)

2px Primary Yellow outline, 2px offset, on every focusable element sitewide, shown on `:focus-visible` (keyboard) not on mouse click. Never suppressed for aesthetic reasons — if an outline clashes with a background, adjust offset/color for that context, never remove it.

## 4. Alt Text Strategy (closed, unchanged — already well-executed in Version 1)

Every image has a real, descriptive alt attribute:
- Program cards: describe the activity ("Crossfit training session at Infiniti Fitness Gachibowli").
- Trainer cards: name + role ("Mohammed Wajeed, Fitness Guru and Mr Nizamabad titleholder") — confirmed present in current code.
- Location cards: facility description ("Infiniti Fitness Gachibowli training floor") — confirmed present.
- Decorative-only images: empty `alt=""` deliberately, never a missing attribute.

**No regression permitted:** Version 2's photography/composition changes (any new banner, any new image) must carry the same descriptive-alt standard — a new visual flourish is never an excuse for a missing or generic alt string.

## 5. ARIA & Semantic Structure

- Mobile menu toggle: `aria-expanded` + `aria-controls` pointing to the panel.
- Accordion headers (FAQ): `aria-expanded` state, control associated panel visibility.
- Carousel/auto-advancing content: pausable, pauses on keyboard focus, live-region consideration so screen reader users aren't interrupted by unrequested content changes.
- Heading hierarchy matches visual hierarchy exactly — one `h1` (page-level, outside these section specs' scope), one `h2` per section, `h3` for card-level sub-items. Never skip a level for visual effect.
- Badges communicating meaningful state (e.g. "Ladies Only") pair color with explicit text, never color alone — confirmed correctly implemented in Locations' current code; carry this pattern forward to any new badge use.

## 6. Reduced Motion (closed, restated from [02-motion-system.md](02-motion-system.md) §5)

Every animated element — including Version 2's new scroll-linked parallax on Programs' and Facilities' banners — has a fully realized instant/static fallback under `prefers-reduced-motion: reduce`. Final content (text, numbers, image position) is present in the DOM immediately, never solely assembled or revealed by animation. This is the single most load-bearing accessibility rule in the whole system — treat every new motion instruction in every section spec as incomplete until its reduced-motion behavior is stated in the same breath.

## 7. Screen Reader Considerations

- Counters (TrustStrip) expose final value in the DOM immediately, not solely through animation.
- Form fields use real, persistent labels — never placeholder-only text standing in for a label.
- Decorative icons (stars, quote marks, amenity glyphs) are `aria-hidden` when adjacent text already conveys the same meaning — confirmed correctly implemented across Testimonials/Facilities in current code.

## 8. Touch Targets (closed, restated from [03-responsive-system.md](03-responsive-system.md) §5)

Minimum 44×44px for every interactive element, regardless of visual size.

## 9. Gaps Identified in Version 1 Audit — Must Close in Version 2

1. **TrainerShowcase's name-underline hover effect has no touch equivalent.** The underline-on-hover micro-interaction on trainer names never fires on touch devices, and `CardGrid`'s mobile mode is specifically the swipeable carousel pattern optimized for touch — meaning this section's one micro-interaction detail is invisible to its primary mobile audience. Version 2 must specify a touch-appropriate equivalent (see [trainershowcase-implementation-spec.md](sections/trainershowcase-implementation-spec.md) §11).
2. **TrainerShowcase's SectionHeader has no scroll-reveal animation** while every sibling section's header does — an unintentional inconsistency, not an accessibility failure per se, but flagged here because it affects the "predictable, considered" quality accessibility and polish both depend on. Correct in the section spec.
3. **Testimonials' featured/secondary grids reset their stagger index independently**, meaning both grids' first items can animate at delay-0 simultaneously if both are visible at once — verify this doesn't produce a jarring double-pop for any user, motion-sensitive or not.
4. **No section states a verified "images serve responsive sizes" claim beyond the `sizes` attribute being present in code** — Version 2 section specs must state exact `sizes` values per breakpoint (not just "responsive") so Gemini isn't guessing, and so this remains auditable against [qa/performance-checklist.md](qa/performance-checklist.md).
