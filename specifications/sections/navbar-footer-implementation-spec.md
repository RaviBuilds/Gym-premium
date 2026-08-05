# Navbar, Footer & Sticky Mobile CTA — Implementation Spec (Version 2)

*Reads against [00-design-principles.md](../00-design-principles.md), [01-design-system.md](../01-design-system.md), [02-motion-system.md](../02-motion-system.md), [03-responsive-system.md](../03-responsive-system.md), [04-accessibility.md](../04-accessibility.md). Version 1 sources: `src/components/layout/Navbar.tsx`, `Footer.tsx`, `StickyMobileCTA.tsx`.*

---

## 1. Section Purpose

These are the page's persistent/global chrome, not scroll sections (per `docs/Homepage-Architecture.md`'s own framing). Navbar provides constant orientation and a constant path to conversion regardless of scroll position. Footer closes the page with trust and utility — contact details, branch info, a free-trial form, for visitors doing due diligence or ready to act. Sticky Mobile CTA keeps the three lowest-friction actions (Call, WhatsApp, Free Trial) within thumb-reach on mobile at all times.

## 2. Design Philosophy

Stable and utilitarian, not decorative — chrome should feel like infrastructure the visitor can rely on, present at every scroll position without drawing attention to itself.

## 3. Storytelling Goal

Not applicable in the scroll-narrative sense — these elements exist outside the page's emotional arc by design. Their "story" is availability: the CTA is always reachable, the contact info is always findable.

## 4. Visual Hierarchy

**Navbar:** Logo → primary nav links → CTA button → mobile hamburger.
**Footer:** Free-trial form (most conversion-relevant) → branch cards → Explore/Contact link columns → brand signature → copyright.
**Sticky Mobile CTA:** Free Trial (visually distinct, yellow fill) → Call / WhatsApp (equal secondary weight).

## 5. Desktop Layout Specification

### Navbar
- `sticky top-0 z-50`, `h-20` (80px) fixed height — unchanged.
- **Correction — the "transparent over hero, solid on scroll" behavior described in the codebase's own architecture comments does not actually exist in Version 1**; the header is permanently `bg-ink/95 backdrop-blur-sm`. Version 2 requires this be resolved one of two ways — see §15 for the recommendation: **keep the permanently-translucent bar** (do not implement a scroll-triggered transparent state), but correct the architecture comment to match reality, and additionally reduce the opacity specifically over the Hero's own viewport region is *not* pursued (see §15 for why a scroll-linked implementation is explicitly rejected, not just deferred).
- **NEW — active/current-page nav link state.** No nav link currently indicates the visitor's current route. Add a persistent underline (reusing the existing hover-underline mechanic) on whichever nav link matches the current route, always visible (not just on hover) for that one link.

### Footer
- **Correction — breakpoint inconsistency.** The top-level Free-Trial/Locations split currently waits until `lg:` (1024px) to go 2-column, while the nested branch grid and the bottom Explore/Contact/Brand grid both go multi-column already at `sm:` (640px) — an inconsistent "how eagerly do we go multi-column" rule within the same component. Version 2 requires all three footer grid regions to adopt the same tablet-tier rule: the top-level Free-Trial/Locations split gets `sm:grid-cols-2` (640px) matching the other two regions, rather than waiting for `lg:`.
- **Correction — heading-level mismatch.** "Sign Up for a Free Trial" currently uses `level="section"` (H2, 28–48px/900 weight) — identical visual weight to an actual homepage section headline (e.g. "Frequently asked questions"), despite being a sub-block within the footer. Change to `level="subsection"` (H3, matching "Explore"/"Contact"/branch name headings elsewhere in the same footer) — this removes an unintended hierarchy spike at the exact point a skimming visitor might otherwise wonder whether the page has "ended" yet.

### Sticky Mobile CTA (mobile-only, not rendered at desktop — no desktop spec needed)

## 6. Tablet Layout Specification

### Navbar
- **Gap identified, not fixed in this pass:** Version 1 jumps directly from mobile-hamburger to full desktop nav at exactly 1024px, meaning 640–1023px viewports get the hamburger experience despite having meaningfully more horizontal room than a phone. Flag this as a genuine gap per §15, but do not introduce a bespoke tablet-condensed nav in this spec — the primary nav list is only 6 items and the risk of a half-built "tablet nav" (neither hamburger nor full desktop) introduces more inconsistency than it resolves without a dedicated design pass. Leave the 1024px threshold as-is; this is a deliberate deferral, not an oversight (see §15).

### Footer
- All three grid regions now step to multi-column at `sm:` (640px) per §5's correction — at tablet width, Free-Trial-form/Locations sits 2-up, branch cards 2-up, Explore/Contact/Brand 3-up.

## 7. Mobile Layout Specification

### Navbar
- Logo + hamburger only, no CTA in the collapsed header row (Sticky Mobile CTA owns that responsibility) — unchanged, correct, already explicitly reasoned in the current code's own comments.
- Mobile panel: full-height slide-down, all 6 links + one full-width CTA button — unchanged.

### Footer
- Single column throughout, stacked: Free-Trial form → Locations → Explore/Contact/Brand → copyright — unchanged.

### Sticky Mobile CTA
- Fixed bottom bar, 3 equal-width actions, safe-area-aware — unchanged structurally, but see §5's size-hierarchy note carried over from [finalcta-implementation-spec.md](finalcta-implementation-spec.md)'s pattern: **do not** apply a size-hierarchy correction here — see §15 for why Sticky CTA's flat three-equal-actions treatment is correct as-is and should not be changed to match FinalCta's differentiated-CTA pattern.

**At exact widths:**
- **320/375/390/430px:** identical hamburger nav, single-column footer, 3-action sticky bar.
- **768px:** Navbar still shows hamburger (deferred per §6). Footer's three grid regions now consistently multi-column per §5's correction.

## 8. Spacing System

No new spacing values introduced in this document beyond the existing system — the corrections here are structural (breakpoint stepping, heading level, active-state styling), not spacing-scale changes.

## 9. Motion Choreography

Tier 4 — Resolving applies to Footer (per [02-motion-system.md](../02-motion-system.md) §2) — Footer currently has **zero** motion (no `AnimationWrapper` anywhere, confirmed in the Version 1 audit), which is directionally correct for its tier (footers should feel stable, not choreographed) but represents a hard, uncushioned cut from every section above it, all of which animate on scroll entry.

- **NEW — minimal Footer entrance.** Add exactly one `AnimationWrapper` fade (opacity-only, no y-travel, 400ms) wrapping the Footer's top-level content block as a whole (not per-element, not per-column) — the absolute minimum motion needed to avoid a jarring "static webpage mode" jump-cut, without contradicting Tier 4's restraint. This is the *only* motion added to Footer in this spec.
- Navbar: no scroll-triggered motion (per §5's decision to keep the bar permanently translucent) — mobile menu panel's existing height/opacity `AnimatePresence` transition (250ms) is unchanged.
- Sticky Mobile CTA: existing mount-triggered slide-up (`y:"100%"→0`, 400ms, 0.25s delay) — unchanged, already reasoned correctly in the current code's comments as an acceptable simplification of a scroll-triggered entrance.

**Reduced motion:** Footer's new fade skips to instant full-opacity; mobile menu panel skips to instant open/closed state; Sticky CTA skips to instant final position — unchanged sitewide rule, extended to the one new addition.

## 10. Scroll Behaviour

None for any of the three components — Navbar is `sticky`, not scroll-transformed; Footer and Sticky Mobile CTA have no scroll-linked effects.

## 11. Micro Interactions

- Navbar desktop nav links: existing grow-from-0 underline on hover — unchanged. **NEW:** persistent (not hover-dependent) underline on the current-route link, per §5.
- Navbar hamburger: **add a visible resting-state affordance** — currently two floating icon glyphs with no background/border, easy to miss as interactive on first glance. Add a subtle `hover:bg-white/5` (desktop pointer) and ensure the existing `size-11` tap target remains, giving the button a slight visual "container" presence even at rest (e.g. a very faint `border border-white/10` or simply the hover background — a border at rest would be the more discoverable fix, see §16).
- Footer: Explore/Contact links already meet 44px touch target with `min-h-11` — unchanged, correct.
- Sticky Mobile CTA: `active:scale-[0.97]` press-state on all three actions — unchanged, correct.

## 12. Accessibility

- Navbar: fix the **duplicate `aria-label="Primary"`** on two simultaneously-present `<nav>` elements (desktop instance `hidden lg:block`, mobile-panel instance conditionally rendered) — even though only one is visually active at a time, both exist in the DOM simultaneously and share an identical accessible name, which can confuse landmark navigation in assistive tech. Differentiate: desktop nav keeps `aria-label="Primary"`, mobile panel nav uses `aria-label="Primary, mobile"` (or hide the inactive one from the accessibility tree via `aria-hidden` when not the active rendering — whichever approach the underlying component pattern makes simpler).
- Footer: heading-level correction (§5) also has an accessibility dimension — an H2-weight heading inside the footer competing with real page-section H2s makes heading-based screen-reader navigation less useful for distinguishing "am I in a page section or in the footer" — the `level="subsection"` fix addresses this directly, not just the visual mismatch.
- Sticky Mobile CTA: no `aria-label` needed on the three actions since each has a persistent visible text label — unchanged, already correctly reasoned in the current code.

## 13. Performance Constraints

- Footer's new single fade-in wrapper: negligible cost (one `AnimationWrapper` instance, opacity-only, GPU-composited) — does not meaningfully change Footer's current lightweight profile.
- Navbar: `backdrop-blur-sm` — unchanged, already the sitewide sole-sanctioned use of blur per [01-design-system.md](../01-design-system.md) §7's photography direction rules (reserved for Navbar's frosted state) — no change needed, already compliant.
- No new images, no new dependencies added by this spec.

## 14. Acceptance Criteria

- ✓ No horizontal overflow at any tested width.
- ✓ Current-route nav link shows a persistent underline in the desktop nav.
- ✓ Footer's Free-Trial/Locations split, branch grid, and Explore/Contact/Brand grid all step to multi-column at the same breakpoint (640px).
- ✓ "Sign Up for a Free Trial" heading renders at Subsection scale, not Section scale.
- ✓ Footer fades in as one unit on scroll entry (not per-element, not absent entirely).
- ✓ Both `<nav aria-label="Primary">` instances have distinguishable accessible names or one is correctly hidden from the accessibility tree when inactive.
- ✓ Hamburger button shows a visible resting-state affordance (border or subtle background), not two bare floating icons.
- ✓ Reduced motion: Footer fade, mobile menu transition, and Sticky CTA slide-up all collapse to instant final states.

## 15. Design Rationale

**Why keep the Navbar permanently translucent rather than implementing the "transparent over hero" behavior the code comments describe:** implementing a genuine scroll-triggered transparent→solid transition would require either a scroll listener (explicitly discouraged by `docs/Visual-Design-Specification.md` §10's performance guidance: "the Navbar's scroll-triggered background transition... must be implemented without a per-frame JavaScript scroll listener") or a CSS-only scroll-driven-animation approach with real browser-support caveats. The current permanently-translucent bar is cheap, jank-free, and already legible over both the dark Hero and light sections beneath it — the *only* problem is that the code comment overclaims what's implemented. The correct fix is documentation, not new scroll-tracking logic that would reintroduce exactly the performance risk the system's own guidance warns against.

**Why defer a tablet-specific nav instead of "fixing" the 1024px hamburger threshold:** a bespoke tablet nav state (neither full desktop links nor a hamburger) is a real design task — deciding which of the 6 nav items fit, how the CTA behaves, whether it condenses to icons — and inventing that structure inside this spec would be scope creep beyond what the Version 1 audit actually flagged as broken (the audit noted it as a gap, not as something actively wrong). Per [00-design-principles.md](../00-design-principles.md), every change here must trace to a stated purpose; "tablet users get the mobile nav" is a reasonable, common pattern (many premium sites use hamburger nav well below 1024px deliberately) and isn't obviously wrong enough to justify inventing new UI without dedicated design attention.

**Why Sticky Mobile CTA's three-equal-weight actions are correct and should NOT get FinalCta's size-hierarchy treatment:** FinalCta's three CTAs represent three flavors of the *same* ask (book now, in three ways) competing for one decision, which benefits from a clear priority order. Sticky Mobile CTA's three actions are genuinely different *use cases* — Call and WhatsApp are for someone who wants to talk to a human before committing, Free Trial is for someone ready to act — not a ranked priority list. The existing yellow-fill-on-FreeTrial-only differentiation already correctly signals "this one is the primary conversion path" while Call/WhatsApp remain equal to each other because they're equal alternatives, not two tiers of the same action. Applying more size differentiation here would misrepresent Call/WhatsApp as lesser options rather than legitimate parallel paths.

**Why fix the Footer heading level:** a "Sign Up for a Free Trial" heading styled identically to "Frequently asked questions" or "Real people. Real numbers." creates a false signal that the page has entered a new primary section, when it's actually inside a persistent global element. This is a correctness fix, matching visual weight to actual document structure, not a subjective preference.

## 16. Implementation Notes for Gemini

- **Navbar:** add logic to compare the current route (via Next.js `usePathname` or equivalent) against each nav link's `href`, applying a persistent underline class (reuse the existing hover-underline span, just remove its `group-hover`-only gating for the matching link and make it permanently visible). Update the mobile-panel `<nav>`'s `aria-label` to `"Primary, mobile"` (or apply `aria-hidden="true"` to whichever nav instance isn't currently rendered/visible, whichever pattern fits the existing component structure more cleanly). Add `hover:bg-white/5` and a subtle `border border-white/10` to the hamburger button.
- **Footer:** change the top-level grid from `grid gap-12 py-16 lg:grid-cols-2 lg:gap-16` to `grid gap-12 py-16 sm:grid-cols-2 sm:gap-16` (removing the `lg:`-only step, replacing with `sm:`). Change "Sign Up for a Free Trial"'s `Heading level="section"` to `Heading level="subsection"`. Wrap the Footer's top-level content in a single `AnimationWrapper` using the `"fade"` variant (opacity-only, no y-travel), 400ms duration.
- **Sticky Mobile CTA:** no changes required per this spec — confirmed correct as-is.
- Do not change any copy, contact information, branch data, or link destinations in any of the three components.
- Do not introduce a scroll listener or `IntersectionObserver`-driven Navbar background transition — this is explicitly rejected per §15, not an open option.
- Do not build a tablet-specific condensed nav state in this pass — explicitly deferred per §15.
