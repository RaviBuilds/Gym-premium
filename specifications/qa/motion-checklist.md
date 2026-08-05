# Motion QA Checklist (Version 2)

*Verify against [02-motion-system.md](../02-motion-system.md). Test with DevTools "Rendering → prefers-reduced-motion" toggle for the reduced-motion pass.*

---

## Choreography Tiers

- [ ] Hero and Trust Strip (Tier 1) complete their load/entrance sequences the fastest and most front-loaded on the page.
- [ ] Programs, Why Infiniti, Facilities, Trainer Showcase, Locations (Tier 2) use standard scroll-triggered fade-up/slide with exactly one added depth cue each (parallax banner, directional slide, or stagger wave) — none of them exceed Tier 2 complexity.
- [ ] Testimonials (Tier 3) is visibly the most choreographed section on the page after the Hero — featured pull-quotes use `scale-in-settle`, not plain fade-up.
- [ ] Membership CTA, FAQ, Final CTA, Footer (Tier 4) are visibly quieter than Testimonials — no section in this tier out-animates Tier 3.
- [ ] Motion complexity never increases from one section to the next within Tier 4 (Membership CTA → FAQ → Final CTA → Footer should feel flat or decreasing, not building back up).

## Scroll Depth / Parallax

- [ ] Parallax is present ONLY on: Hero background, Programs' `TrainingBanner`, Facilities' banner. No other section has scroll-linked background movement.
- [ ] Parallax is disabled below 1024px on all three qualifying sections (verify via `disableOnMobile` behavior, not just visual guess — check computed transform at 768px, should be static).
- [ ] Hero's `hero-zoom` keyframe and its `ParallaxLayer` scroll-drift do not visually conflict when scrolling immediately after page load (scrub scroll position within the first 2 seconds of load).
- [ ] Max drift values match spec exactly: Hero 40px, Programs banner 32px, Facilities banner 32px.

## Stagger & Sequencing

- [ ] Programs' two-row card grid (3+6) animates as one continuous 0–8 stagger sequence, not two independent 0-reset sequences.
- [ ] Testimonials' featured (2) + secondary (5) grids animate as one continuous stagger sequence, with the CTA continuing the same sequence rather than firing independently.
- [ ] Trust Strip's `AnimationWrapper` entrance and `CountUp`'s internal trigger use the same viewport threshold (0.2) — no visible desync between fade-in and count-start.
- [ ] No section anywhere has two independent stagger sequences producing a simultaneous "double pop" at delay-0.

## One-Time vs. Infinite Animations

- [ ] Programs' featured (Crossfit) card glow pulses exactly once on scroll-entry, then holds its static resting glow — verify it does NOT continue pulsing indefinitely while scrolled into view.
- [ ] Final CTA's button pulse fires once, on the primary CTA only — not on secondary/tertiary, not repeating.
- [ ] Hero's scroll cue is the ONE confirmed sitewide exception to "no infinite loops" (2s loop, wayfinding affordance) — confirm no other section has an uncontrolled infinite animation.

## Reduced Motion (`prefers-reduced-motion: reduce`)

- [ ] Every fade-up/slide/scale-in entrance collapses to instant final-state appearance, sitewide.
- [ ] Hero: no word-mask reveal (full headline text visible immediately), no hero-zoom, no parallax.
- [ ] Trust Strip: counters show final value immediately, no count-up animation.
- [ ] Programs/Facilities: parallax disabled, featured-card glow shows static state only (never even a single pulse).
- [ ] Testimonials: pull-quotes appear at final scale (no 1.06→1 scale-in).
- [ ] FAQ: accordion open/closed STATE still functions correctly (this is a state change, not decoration) — only the animated transition easing is removed.
- [ ] Navbar mobile menu: panel still opens/closes functionally, just without animated height/opacity transition.
- [ ] Sticky Mobile CTA: appears at final position on mount, no slide-up travel.
- [ ] Final CTA: no pulse on any button.
- [ ] Footer: new fade-in wrapper shows full opacity immediately.

## Touch Equivalents (motion/feedback that must not be hover-only)

- [ ] Programs' ProgramCard: tap produces a visible underline/opacity feedback cue equivalent to desktop hover (not silent).
- [ ] Trainer Showcase's TrainerCard: tap produces a visible underline feedback cue equivalent to desktop hover (not silent).
