# Accessibility QA Checklist (Version 2)

*Verify against [04-accessibility.md](../04-accessibility.md). Use axe DevTools or equivalent automated scan, plus manual keyboard-only and screen-reader passes.*

---

## Color & Contrast

- [ ] Every text/background pairing clears WCAG AA (4.5:1 body, 3:1 large ≥24px) — run an automated contrast scan on every section, including new additions (Facilities' new CTA link, FAQ's yellow chevron accent, FinalCta's radial glow area behind text).
- [ ] Primary button text remains Ink-on-Yellow everywhere (never reverted to white-on-yellow).
- [ ] Membership CTA's new Best-Seller border+tint does not reduce the card's internal text contrast below AA.

## Keyboard Navigation

- [ ] Every interactive element sitewide reachable via Tab in logical visual order.
- [ ] Every interactive element operable via Enter/Space.
- [ ] Programs' mobile swipe-snap strip: verify all 9 cards are reachable via sequential Tab order, not swipe-only.
- [ ] Trainer Showcase's mobile swipe-snap carousel: verify all 6 cards are reachable via sequential Tab order.
- [ ] FAQ accordion: every header togglable via keyboard, `aria-expanded` state accurate at every step.
- [ ] Navbar: mobile menu toggle keyboard-operable, focus moves logically into the opened panel and back on close.

## Focus Visibility

- [ ] 2px Primary Yellow `:focus-visible` outline, 2px offset, present on every focusable element sitewide — spot-check new elements added in this spec (Facilities' new CTA link, Membership CTA's now-interactive cards, Navbar's current-page nav link).
- [ ] No focus outline suppressed anywhere for aesthetic reasons.

## Alt Text & Semantic Structure

- [ ] Every image has real descriptive alt text (Program/Trainer/Location cards) or deliberate empty `alt=""` (decorative-only, e.g. Hero background, banner images).
- [ ] Programs' `TrainingBanner` heading renders as a real `h3`, not a `<p>` — verify via accessibility tree / heading outline inspection.
- [ ] Facilities' amenity titles render as real `h3` elements.
- [ ] Heading hierarchy sitewide: one `h1`, one `h2` per section, `h3` for sub-items, no skipped levels — run a full-page heading outline check.
- [ ] Navbar's two `<nav aria-label="Primary">` instances have distinguishable accessible names, or the inactive one is `aria-hidden` when not rendered.

## ARIA & Component Patterns

- [ ] Navbar mobile toggle: `aria-expanded` + `aria-controls` present and accurate.
- [ ] FAQ accordion: `aria-expanded`, `aria-controls`, `role="region"`, `aria-labelledby` all present and accurate per item.
- [ ] Trainer Showcase's new informational badges pair color with visible text — never color alone.
- [ ] Locations' Ladies Only badge continues pairing color with explicit text (regression check — this was already correct, confirm the Version 2 changes didn't disturb it).

## Reduced Motion

- [ ] `prefers-reduced-motion: reduce` produces a fully realized static/instant fallback for every animated element added or modified in this spec (see [motion-checklist.md](motion-checklist.md) for the full itemized list) — cross-reference, don't skip.
- [ ] Screen reader users receive final counter values, final image positions, and full text content immediately, with zero dependency on animation completing.

## Touch Targets

- [ ] Every interactive element (including all Version 2 additions: Facilities' CTA link, FAQ's accordion headers, Membership CTA's now-interactive cards, Navbar's current-page indicator) maintains minimum 44×44px touch target.

## Screen Reader Pass (manual, at least one full run with VoiceOver or NVDA)

- [ ] Full homepage scroll-through with a screen reader produces a coherent, non-redundant reading order.
- [ ] Trust Strip counters announce final values without requiring the animation to complete.
- [ ] Testimonials' featured pull-quotes read correctly via `blockquote`/`figure`/`figcaption` semantics.
- [ ] Footer's heading-level correction (Subsection, not Section) doesn't disrupt the footer's own internal heading navigation (Explore/Contact/branch names should still read as a coherent, equal-weight set alongside "Sign Up for a Free Trial").
