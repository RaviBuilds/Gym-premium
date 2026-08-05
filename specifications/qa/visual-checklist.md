# Visual QA Checklist (Version 2)

*Run against every section spec in `/specifications/sections/`. Check at each of the seven required widths: 320 / 375 / 390 / 430 / 768 / 1366 / 1920px.*

---

## Sitewide

- [ ] No horizontal overflow / no horizontal scrollbar at any of the 7 widths, on any page.
- [ ] `PageSection` elements using `overflow-hidden` (Locations, any future slide-in section) clip only their intended animation travel — never used to mask a genuine layout bug.
- [ ] Container side padding matches [03-responsive-system.md](../03-responsive-system.md) §2 exactly: 16px mobile / 24px tablet / 48px desktop / 80px wide.
- [ ] Max content width never exceeds 1280px in any section (verify at 1920px specifically — content should be centered with equal flanking whitespace, not stretched).
- [ ] Radius law holds everywhere: buttons/badges/dividers = 0px, cards/content containers = 6px. No exceptions found.
- [ ] Brand Yellow never exceeds ~10% of any single viewport screenshot (spot-check Hero, Programs' featured card, FinalCta).
- [ ] Type scale matches [01-design-system.md](../01-design-system.md) §2 exactly at both mobile and desktop tiers for every heading level encountered.
- [ ] Heading hierarchy is never skipped (no H3 visually larger than an H2 anywhere).
- [ ] Every card grid aligns to the underlying column grid — no card floats at an arbitrary offset.

## Per-Section Corrections (spot-check each is actually implemented)

- [ ] **Hero:** overlay consolidated to one gradient layer (not 4 divs); trust-row separators are not bare "/" characters; spacing gaps increase monotonically across breakpoints.
- [ ] **Trust Strip:** 4-column single row at 768px (not 2×2); no hover lift on stat blocks.
- [ ] **Programs:** card aspect ratio is 4:5 at every breakpoint (no mid-breakpoint flip); header is left-aligned at every breakpoint; featured (Crossfit) card's glow is not animating continuously at rest.
- [ ] **Why Infiniti:** two-column 7/5 split at ≥1024px, not a centered single column; headline uses word-mask reveal styling consistent with Hero/Programs headlines.
- [ ] **Facilities:** header left-aligned at every breakpoint; banner has a visible directional gradient, not a flat tint; icons sit inside a background chip; a CTA link is present beneath the icon grid.
- [ ] **Trainer Showcase:** every one of the 6 cards has a badge (not just Wajeed's).
- [ ] **Testimonials:** featured pull-quotes sit inside a visible subtle background tint; side-by-side at 768px; secondary grid's 5th card is centered/spanned, not an orphan.
- [ ] **Membership CTA:** card row is visibly wider than 672px at desktop; Best-Seller tier has a persistent border+tint, not just the floating badge; 2-column tablet tier exists (not a 1→3 jump).
- [ ] **Locations:** side-by-side at 768px (not stacked); a supporting body sentence appears beneath the heading.
- [ ] **FAQ:** column renders up to 768px wide with visible top/bottom border framing; chevron changes color on open, not just rotation.
- [ ] **Final CTA:** primary CTA is visibly larger than secondary/tertiary; a subtle radial glow is present behind the headline.
- [ ] **Navbar/Footer:** current-route nav link shows a persistent underline; Footer's three grid regions all step to multi-column at the same breakpoint (640px); "Sign Up for a Free Trial" heading is Subsection-scale, not Section-scale.

## Cross-Section Consistency

- [ ] Card hover behavior is intentional per card type (Location/Program/Trainer cards lift on hover because they're links or genuinely interactive; static display content like secondary Testimonial cards does not) — verify no card type was missed or inconsistently left static/interactive relative to its own section spec.
- [ ] The two mid-page banners (Programs' `TrainingBanner`, Facilities' banner) use the same parallax drift value (32px) and the same directional-gradient-overlay approach.
- [ ] Every section's alignment rule (left-aligned desktop / center mobile, per [01-design-system.md](../01-design-system.md)) is monotonic across breakpoints — no left→center→left or similar flips remain anywhere on the page.
