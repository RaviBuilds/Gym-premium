# Performance QA Checklist (Version 2)

*Verify against [01-design-system.md](../01-design-system.md), [02-motion-system.md](../02-motion-system.md), and `docs/Visual-Design-Specification.md` §14. Measure on a throttled mobile profile, not just desktop.*

---

## Lighthouse Targets (unchanged sitewide goals)

- [ ] Performance ≥ 90 (mobile, throttled).
- [ ] Accessibility ≥ 95.
- [ ] Best Practices ≥ 95.
- [ ] SEO ≥ 95.

## Core Web Vitals

- [ ] LCP < 2.5s — Hero's background image remains the prioritized LCP candidate; verify no Version 2 change (overlay consolidation, parallax restructuring) accidentally delays its paint.
- [ ] CLS < 0.1 — every image reserves final display dimensions before load; verify Version 2's new elements (Facilities' icon chips, Membership CTA's border+tint, FinalCta's radial glow) introduce zero layout shift since they're pure CSS with no dimension dependency.
- [ ] INP < 200ms — button/card press feedback (new `active:` states added to ProgramCard and TrainerCard for touch parity) must not feel delayed behind any heavier script execution.

## DOM & Paint Cost Reductions (Version 2-specific)

- [ ] Hero's four overlay divs are consolidated into one gradient-layered div — confirm via DevTools element inspector that only one overlay element exists, not four.
- [ ] Trust Strip's three background-atmosphere divs are consolidated to photo element + one gradient div.
- [ ] ProgramCard's two independently-stacked hover transforms (outer `motion.div` scale + inner `Card` translateY/shadow) are consolidated into one hover animation definition.

## Animation Performance

- [ ] All scroll-reveal and hover animations use only `transform`/`opacity` — no animation of `width`/`height`/`top`/`left` anywhere (spot-check every Version 2 addition: Facilities' banner gradient, FAQ's chevron color transition, FinalCta's radial glow — none should animate layout-affecting properties).
- [ ] Parallax (`ParallaxLayer` on Hero, Programs' `TrainingBanner`, Facilities' banner) is implemented without a per-frame JS scroll listener recalculating styles — confirm passive/throttled or CSS-native scroll-linked technique.
- [ ] Navbar's permanent translucent state (no scroll-triggered transition, per Version 2's explicit decision) — confirm no scroll listener was added for Navbar in this pass, consistent with the spec's rejection of that approach.

## Image Optimization

- [ ] Every photograph served in a modern compressed format (WebP/AVIF + fallback) at responsive size variants matching its fixed crop ratio.
- [ ] Programs' card images: confirmed `aspect-[4/5]` at every breakpoint post-fix (Version 2 removes the ratio flip) — verify `sizes` attribute values still match the corrected single-ratio layout's actual rendered widths (may need adjustment now that tablet no longer renders at 16:10).
- [ ] No `priority` added speculatively to Locations' images without a real LCP measurement (per [locations-implementation-spec.md](../sections/locations-implementation-spec.md) §13 — this should remain lazy-loaded unless staging data proves otherwise).

## Font Loading

- [ ] Both type families load with `font-display: swap` (or equivalent) — unchanged, verify no regression.
- [ ] Only the weights actually used (900 display, 400/600/700 body/UI) are loaded — verify Version 2 additions (e.g. any new badge text) don't introduce a request for an unused weight.

## New Dependency Check

- [ ] Confirm zero new npm packages were introduced to implement any Version 2 change — every correction in this spec set reuses existing primitives (`AnimationWrapper`, `ParallaxLayer`, `KineticHeadline`, `Badge`, `Card`, `ButtonLink`) per [00-design-principles.md](../00-design-principles.md) §16 patterns across every section spec.
