# 15 — File Ownership

*What each significant file owns, what it may modify, and what it must never touch without explicit instruction. This is the regression-prevention layer: most accidental breakage happens when a fix to File A reaches into File B's territory because it was the path of least resistance in the moment. Cross-reference [13-dependency-graph.md](13-dependency-graph.md) for direction-of-dependency rules and [12-component-map.md](12-component-map.md) for full component detail.*

---

## How Ownership Works Here

"Owns" means: this file is the correct and only place to change this behavior. "Must never modify" means: if a task seems to require changing this from inside a different file, that is a signal you're about to reach across an ownership boundary — stop and either (a) find the actual owning file and change it there, or (b) recognize the task is asking for a shared-primitive change that needs the full consumer audit described in [11-ai-implementation-manual.md](11-ai-implementation-manual.md) §12.

---

## Application Layer — `src/app/`

### `layout.tsx`
- **Owns:** Root HTML shell, font variable application, sitewide metadata/viewport config, Organization JSON-LD injection, the assembly order of `SkipLink` → `ScrollProgressBar` → `Navbar` → `<main>` → `Footer` → `StickyMobileCTA`, and the bottom-padding reservation for the mobile sticky bar.
- **May modify:** Its own assembly order, metadata wiring, the `pb-[...]` reservation value if `StickyMobileCTA`'s height genuinely changes.
- **Must never modify:** Any individual section's or persistent-chrome component's internal behavior — this file assembles, it does not implement.
- **Depends on:** `fonts.ts`, `metadata.ts`, `structured-data.ts`, `a11y/SkipLink`, `layout/{Navbar,Footer,StickyMobileCTA}`, `motion/ScrollProgressBar`.
- **Depended on by:** Nothing (root of the tree).
- **Governing documentation:** [13-dependency-graph.md](13-dependency-graph.md) §4.

### `page.tsx`
- **Owns:** Homepage section assembly order (the scroll sequence: Hero → TrustStrip → Programs → WhyInfiniti → Facilities → TrainerShowcase → Testimonials → MembershipCta → Locations → Faq → FinalCta).
- **May modify:** The assembly order, if a task explicitly asks to reorder sections (rare — this order is a deliberate emotional-arc decision per [00-design-principles.md](00-design-principles.md) §3's "Escalating choreography" quality and the [02-motion-system.md](02-motion-system.md) §2 tier table, which assumes this order).
- **Must never modify:** Any individual section component's internals — this file only imports and lists them.
- **Depends on:** `sections/index.ts`.
- **Governing documentation:** [02-motion-system.md](02-motion-system.md) §2 (the tier assignments assume this scroll order).

---

## Section Files — `src/components/sections/*.tsx`

Each section file owns exactly its own layout, composition, and choreography — nothing shared. Using `Hero.tsx` as the fullest example, then stating the pattern once for the rest:

### `Hero.tsx` (+ `HeroScrollCue.tsx`)
- **Owns:** Hero's own layout structure, its background image + overlay composition, its specific headline copy split (two `KineticHeadline` lines), its own entrance-sequence delays, its own scroll-cue placement (two responsive instances).
- **May modify:** Anything listed above, when a task targets Hero specifically.
- **Must never modify without explicit instruction:** `Button`/`ButtonLink` variants, `KineticHeadline`/`MagneticButton`/`ParallaxLayer`/`CountUp` internals, `Heading`/`BodyText` styling, `Container`/`PageSection` behavior — Hero *consumes* all of these; it does not own their implementation. Also must never touch the two-line headline copy or exact color values without instruction (locked content decisions, per [hero-implementation-spec.md](sections/hero-implementation-spec.md) §16).
- **Depends on:** `ui/{Heading,BodyText,ButtonLink}`, `motion/{AnimationWrapper,CountUp,KineticHeadline,MagneticButton,ParallaxLayer}`, its own private `HeroScrollCue`.
- **Governing documentation:** [hero-implementation-spec.md](sections/hero-implementation-spec.md).

### The remaining ten section files (`TrustStrip.tsx`, `Programs.tsx`, `WhyInfiniti.tsx`, `Facilities.tsx`, `TrainerShowcase.tsx`, `Testimonials.tsx`, `MembershipCta.tsx`, `Locations.tsx`, `Faq.tsx`, `FinalCta.tsx`)
- **Owns (each, for itself only):** Its own layout composition, its own content-to-component wiring (mapping its `src/content/*.ts` array into cards/list items), its own choreography (which `AnimationWrapper` variant, what delay sequence), its own section-specific copy already present in the file or pulled from `content/`.
- **May modify:** Anything listed above, for its own section, when a task targets that section. `Programs.tsx` additionally owns its private `TrainingBanner` sub-component (not exported, not reusable elsewhere — see [13-dependency-graph.md](13-dependency-graph.md) §3 on why this duplicates Facilities' banner pattern deliberately rather than importing it).
- **Must never modify without explicit instruction:** Any `ui/`, `layout/`, or `motion/` component's internals; any other section's file; the real content in its own `src/content/*.ts` source (content edits are a distinct kind of task from layout/behavior edits — see the Content Files section below); its own governing spec's stated §16 "do not" list (each section spec's final section states explicit non-goals — treat these as binding).
- **Governing documentation:** The matching file in `specifications/sections/*-implementation-spec.md`.

---

## Layout Components — `src/components/layout/`

### `Container.tsx`, `PageSection.tsx`, `Grid.tsx`
- **Owns:** The literal implementation of [03-responsive-system.md](03-responsive-system.md)'s width/padding/column values.
- **May modify:** Internal implementation, as long as rendered output for every existing consumer is unchanged, unless a task explicitly changes a responsive-system value (which must originate as a [03-responsive-system.md](03-responsive-system.md) edit first).
- **Must never modify:** The padding scale, max-width, or column-count values independently of a spec change — see [12-component-map.md](12-component-map.md) entries for each.
- **Depended on by:** Nearly every section (directly or via `PageSection`), `Navbar`, `Footer`.

### `Navbar.tsx`, `Footer.tsx`, `StickyMobileCTA.tsx`
- **Owns:** Its own persistent-chrome markup and behavior, exactly as detailed in [12-component-map.md](12-component-map.md).
- **May modify:** Internal behavior when a task targets one of these three specifically (see [navbar-footer-implementation-spec.md](sections/navbar-footer-implementation-spec.md) for the current, binding corrections list for each).
- **Must never modify:** Real contact/branch/nav data (owned by `src/config/site.ts` and `src/config/nav.ts` — these three files render that data, they don't own it); each other's files (Navbar must never reach into Footer's markup or vice versa, even though both are "global chrome").
- **Governing documentation:** [navbar-footer-implementation-spec.md](sections/navbar-footer-implementation-spec.md).

---

## Motion Components — `src/components/motion/*.tsx`

- **Owns (each):** Its one specific animation mechanism, exactly as detailed per-component in [12-component-map.md](12-component-map.md).
- **May modify:** Internal implementation of its own mechanism, as long as the closed timing/distance/easing values from [02-motion-system.md](02-motion-system.md) §1 are preserved exactly and the `prefers-reduced-motion` contract (final state instantly, zero animation) is preserved.
- **Must never modify:** The closed motion vocabulary (durations/easings/distances) independent of a [02-motion-system.md](02-motion-system.md) update; any section's choice of *which* motion component to use where (that's the section's choreography decision, owned by the section file, not by the motion primitive).
- **Depended on by:** Nearly every section, `Navbar` (mobile panel `AnimatePresence`), `StickyMobileCTA`, `Accordion`.
- **Governing documentation:** [02-motion-system.md](02-motion-system.md).

---

## UI Components — `src/components/ui/*.tsx`

- **Owns (each):** Its own closed visual vocabulary and public API, exactly as detailed per-component in [12-component-map.md](12-component-map.md).
- **May modify:** Internal implementation, additive optional props with backward-compatible defaults (per [14-reuse-rules.md](14-reuse-rules.md) §7).
- **Must never modify without a full consumer audit first (per [11-ai-implementation-manual.md](11-ai-implementation-manual.md) §12):** Any existing prop's type, default value, or removal; the closed radius/shadow/color rules stated in [01-design-system.md](01-design-system.md) §4.
- **Must never modify at all, regardless of audit:** `Button`'s 0px radius rule; `Card`'s 6px radius rule; `TestimonialPullQuote`'s deliberate non-use of `Card`; `TrainerCard`'s deliberate absence of hover image-zoom; `Eyebrow`'s tone-based contrast-correction logic.
- **Depended on by:** Nearly every section, `Navbar`, `Footer`.
- **Governing documentation:** [01-design-system.md](01-design-system.md), [04-accessibility.md](04-accessibility.md).

---

## Accessibility Components — `src/components/a11y/*.tsx`

- **Owns:** Its one cross-cutting accessibility utility (skip-link, visually-hidden wrapper, live-region announcer).
- **May modify:** Internal implementation, as long as the accessibility contract (visually hidden but present to assistive tech; correct ARIA roles) is preserved.
- **Must never modify:** `SkipLink`'s target id without simultaneously updating `layout.tsx`'s `<main id="main-content">` in the same change.
- **Governing documentation:** [04-accessibility.md](04-accessibility.md).

---

## Utility Files — `src/lib/*.ts`

### `utils.ts` (`cn`)
- **Owns:** Tailwind class-merging behavior sitewide.
- **Must never modify:** The merge-precedence behavior (tailwind-merge's "last wins" resolution) — every component's className-override pattern depends on this exact behavior.

### `design-tokens.ts`
- **Owns:** The TypeScript-side mirror of `globals.css`'s design tokens, plus the pure `getStaggerDelay()` function.
- **Must never modify:** Any value here independently of `globals.css`/[01-design-system.md](01-design-system.md) — this file's own doc comment states the rule explicitly: "if a value doesn't exist there yet, add it there first, then mirror it here — never the other way around." Must never acquire a `"use client"` directive or import anything that would force one (see [13-dependency-graph.md](13-dependency-graph.md) §5).

### `a11y.ts`
- **Owns:** `getDisclosureIds`, `slugify`, the `altText` builder functions.
- **Must never modify:** The `altText` builder output shapes without an accessibility review — every card component's alt-text consistency depends on these staying stable.

### `fonts.ts`, `metadata.ts`, `structured-data.ts`
- **Owns:** Font loading config, SEO metadata builder, JSON-LD schema builder, respectively.
- **Must never modify:** `fonts.ts`'s loaded weight set without checking [qa/performance-checklist.md](qa/performance-checklist.md)'s Font Loading section; `structured-data.ts`'s schema fields beyond what `siteConfig` actually provides (never fabricate a business fact for SEO).

---

## Configuration Files — `src/config/*.ts`

### `site.ts`
- **Owns:** The single source of truth for site name, tagline, description, contact info, and both branches' real address/hours/ladies-only-slot data.
- **May modify:** Only when a task explicitly provides updated real business information (a new phone number, a corrected address, updated hours). This is business-fact data, not design data.
- **Must never modify:** Speculatively "fixing" a value that looks like a typo without confirming with the task source — this file's own comment states the values are already reconciled from business records against a known-inconsistent live site; don't re-introduce an inconsistency by guessing which version is correct.
- **Depended on by:** `Footer.tsx`, `StickyMobileCTA.tsx`, `Navbar.tsx` (nav CTA `href` only), `TrustStrip.tsx` (indirectly, via stat values), `structured-data.ts`, `metadata.ts`.

### `nav.ts`
- **Owns:** `primaryNav`, the six-item primary navigation list.
- **May modify:** Only when a task explicitly changes site navigation structure — this affects both `Navbar` and `Footer` simultaneously (both consume the same list), so a nav change is never a single-file edit.
- **Depended on by:** `Navbar.tsx`, `Footer.tsx`.

---

## Content Files — `src/content/*.ts`

- **Owns (each):** The real copy/data for exactly one section's content array (programs, trainers, testimonials, locations, facilities, faqs, pricing).
- **May modify:** Only when a task explicitly asks for a content change (new copy, corrected figure, added/removed item) — never as a side effect of a layout or motion task. If a layout task's diff also happens to touch a content file, that is very likely scope creep — stop and reconsider (per [11-ai-implementation-manual.md](11-ai-implementation-manual.md) §3, real content is locked unless the task says otherwise).
- **Must never modify:** The shape of the exported data (that's a `src/types/content.ts` concern, requiring a coordinated update across every consuming component) without also updating the corresponding type and every consumer.
- **Depended on by:** Exactly one section component each (see [12-component-map.md](12-component-map.md) for the pairing).

---

## Type Files — `src/types/*.ts`

- **Owns:** The shape contracts (`Program`, `Trainer`, `Testimonial`, `LocationSummary`) that content files and consuming components both agree to.
- **May modify:** Only as part of a coordinated change that updates the type, every content file matching that type, and every component consuming that type, in the same change — never in isolation.
- **Must never modify:** In a way that silently breaks an existing content file's shape without a compiler error surfacing it (this is naturally enforced by TypeScript if content files are properly typed — verify the build catches it, per [11-ai-implementation-manual.md](11-ai-implementation-manual.md) §14 step 1).

---

## Specification Files — `specifications/`

- **Owns:** The design/behavior source of truth this entire manual defers to.
- **May modify:** Never, as part of an implementation task. If executing a task reveals a spec is wrong, incomplete, or self-contradictory, that is a [11-ai-implementation-manual.md](11-ai-implementation-manual.md) §9 stop condition — flag it for a human to resolve in the spec itself. An implementing AI session should not edit `/specifications` to make its own code change "match" — the spec is upstream of the code, not the reverse.
