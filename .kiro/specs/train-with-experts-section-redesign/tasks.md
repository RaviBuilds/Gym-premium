# Implementation Plan: Train With Experts — Section Redesign (Concept B, "The Lit Plinth")

## Overview

This plan rebuilds `src/components/sections/TrainerShowcase.tsx` as a lit coaching floor: one lead coach on a cinematic plinth with a full dossier column, five coaches in a containment grid, and a sixth booking tile. Language is **TypeScript** throughout (Next.js 15 App Router + framer-motion 12), as specified in design.md §13.

The build order is deliberately bottom-up: the shared hexagon token and test tooling first, then the content model, then the pure `Section_Assembler` logic (which every render decision reads from), then the motion primitives, then the plinth, then the cards, then the section wiring. Property tests for the pure layer land immediately beside the functions they check, so a broken roster order or a dishonest year sum fails before any DOM exists.

`vitest` + `fast-check` + `@testing-library/react` + `jsdom` are **not currently installed** (design.md §15.1) — task 1.2 adds them.

## Tasks

- [x] 1. Prerequisite refactor and test tooling
  - [x] 1.1 Extract the hexagon clip to a shared shape token
    - Create `src/lib/shapes.ts` exporting `HEX_CLIP` and `HEX_CLIP_INSET` (no directive — importable from Server and Client trees)
    - `HEX_CLIP` must be byte-identical to the string currently inlined in `src/components/ui/StripNavigator.tsx` and `src/components/sections/SceneNavigator.tsx`, so the refactor is provably visual-neutral
    - Update both call sites to import from `@/lib/shapes` and delete the local constants
    - _Requirements: 2.3_

  - [x] 1.2 Add the test runner and property-testing tooling
    - Install pinned `vitest`, `fast-check`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
    - Add `vitest.config.ts` with the `@/` path alias, `environment: "jsdom"`, and a setup file registering `jest-dom`
    - Add `"test": "vitest --run"` and `"test:watch": "vitest"` scripts to `package.json`
    - _Requirements: none (tooling dependency for all property tasks)_

  - [ ]* 1.3 Write the shared `fast-check` generators
    - `src/components/sections/trainer-showcase/__tests__/arbitraries.ts`: `arbTrainer` (unique `slug`, non-empty `name`/`title`, 1–3 `discipline` entries, each optional field independently `fc.option`), `arbTrainerRoster` (`fc.uniqueArray` by slug, length 1–12, `lead` set on 0/1/many entries), `arbPresentationOrder`, `arbProgress` (`fc.double({ min: -2, max: 3, noNaN: true })` — deliberately out of range), `arbAmplitude` (`fc.double({ min: 0, max: 2000, noNaN: true })`)
    - `arbTrainer` is what turns the §7.3 degradation matrix into a generated case set
    - _Requirements: 8.4_

- [x] 2. Content model and registry
  - [x] 2.1 Extend the `Trainer` type and add `TrainerCredential`
    - In `src/types/content.ts`: add required `discipline: string[]`, optional `yearsExperience`, `certifications`, `signatureAchievement`, `philosophy`, `backdropSrc`, `ctaHref`, `lead`; keep `achievementBadge` for back-compat
    - Add `TrainerCredential { label: string; value: string }`
    - Every field must be JSON-serialisable — no functions, `Date` values or class instances
    - _Requirements: 8.4, 8.10_

  - [x] 2.2 Populate the Content_Registry honestly
    - In `src/content/trainers.ts`: add `discipline` to all six coaches, derived by rewording each coach's existing `title` (nothing invented)
    - Set `lead: true` on `mohammed-wajeed`; map `signatureAchievement: "Mr Nizamabad"` from the existing badge
    - Add `backdropSrc: "/back/{slug}.jpg"` for all six
    - Leave `yearsExperience`, `certifications`, `philosophy` absent — they are owner inputs (Open Questions 1–4) and must not be estimated
    - _Requirements: 8.3, 8.4, 1.3_

  - [ ]* 2.3 Write property test for boundary serialisability
    - **Property 27: Trainer data crossing the boundary is JSON-serialisable**
    - **Validates: Requirements 8.10**
    - File: `src/content/__tests__/trainers.serialisable.property.test.ts` — also assert over the shipped `trainers` array

- [x] 3. Section_Assembler — the pure logic layer
  - [x] 3.1 Implement `formatIndex` and `resolveLead`
    - Create `src/components/sections/trainer-showcase/roster.ts` (no directive)
    - `formatIndex(n)` = `String(n).padStart(2, "0")`; `resolveLead` returns the first `lead === true` trainer, else `trainers[0]` with a development-only `console.warn`; warn also when more than one trainer sets the flag
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

  - [ ]* 3.2 Write property test for index formatting
    - **Property 3: Index formatting is total and stable**
    - **Validates: Requirements 1.2**
    - File: `.../__tests__/formatIndex.property.test.ts`, driven by `fc.nat()`

  - [ ]* 3.3 Write property test for lead resolution
    - **Property 4: Lead resolution is deterministic and total**
    - **Validates: Requirements 1.3, 1.4, 1.5**
    - File: `.../__tests__/resolveLead.property.test.ts`, driven by `arbTrainerRoster`

  - [x] 3.4 Implement `resolveRoster`
    - Order strictly by the passed slug list, independent of declaration order in the registry; exclude the lead; `throw new Error` naming the unmatched slug so the failure lands at build time
    - _Requirements: 1.6, 1.7, 1.3_

  - [ ]* 3.5 Write property test for presentation order and slug totality
    - **Property 19: Presentation order is positional and slug-total**
    - **Validates: Requirements 1.6, 1.7**
    - File: `.../__tests__/resolveRoster.property.test.ts`

  - [x] 3.6 Implement `resolveCombinedYears`
    - Return the exact sum only when every trainer supplies `yearsExperience`; return `null` when any omits it — never a partial sum
    - _Requirements: 8.1_

  - [ ]* 3.7 Write property test for combined years honesty
    - **Property 6: Combined years is honest**
    - **Validates: Requirements 8.1**
    - File: `.../__tests__/resolveCombinedYears.property.test.ts` — assert the `null` ⟺ "any field missing" biconditional

  - [x] 3.8 Implement `resolveDossierRows` with the row and pip caps
    - Export `MAX_DOSSIER_ROWS = { lead: 5, roster: 2 }` and `MAX_ROSTER_PIPS = 2`
    - Follow design.md §13.6 exactly: Experience → Certified (loop, break at cap) → Focus, with the loop invariant `rows.length <= maxRows` at every boundary; a coach with zero optional fields still yields one `Focus` row
    - _Requirements: 8.2_

  - [ ]* 3.9 Write property test for dossier row bounds
    - **Property 7: Dossier rows are bounded and non-empty**
    - **Validates: Requirements 8.2**
    - File: `.../__tests__/resolveDossierRows.property.test.ts`, both variants

  - [x] 3.10 Implement `assembleSection`
    - Compose `resolveLead` → `resolveRoster` → index map → `resolveCombinedYears`, returning `{ lead, roster, indices, combinedYears }`
    - Assign `"01"` to the lead and `formatIndex(i + 2)` to roster position `i`, keeping indices unique and contiguous
    - _Requirements: 1.1, 1.2, 8.1_

  - [ ]* 3.11 Write property test for roster completeness
    - **Property 1: Every coach renders exactly once**
    - **Validates: Requirements 1.1**
    - File: `.../__tests__/assembleSection.permutation.property.test.ts`

  - [ ]* 3.12 Write property test for index contiguity
    - **Property 2: Indices are contiguous and match roster order**
    - **Validates: Requirements 1.2**
    - File: `.../__tests__/assembleSection.indices.property.test.ts`

  - [ ]* 3.13 Write property test for lead exclusion
    - **Property 5: Roster excludes the lead**
    - **Validates: Requirements 1.3**
    - File: `.../__tests__/assembleSection.leadExclusion.property.test.ts`

  - [ ]* 3.14 Write unit tests against the shipped content set
    - Lead is Mohammed Wajeed at `"01"`; roster is the five presentation-order slugs at `"02"`–`"06"`; an unknown slug throws with the slug in the message; `resolveCombinedYears(trainers)` returns `null` today
    - _Requirements: 1.2, 1.7, 8.1_

- [x] 4. Checkpoint — pure layer green
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Motion primitives and camera math
  - [x] 5.1 Implement `MaskedLine`
    - `src/components/motion/MaskedLine.tsx`, `"use client"`: `overflow-hidden` wrapper + `motion.span` with `initial={{ y: "110%" }}`, `whileInView={{ y: "0%" }}`, `viewport={{ once: true, amount: SCROLL_TRIGGER_THRESHOLD }}`, `transition={{ duration: 0.5, delay, ease: MOTION_EASING }}`
    - Under `useReducedMotion`, return children in a plain element — no mask, no transform, no delay; text content is in the DOM at final content at all times
    - Animate `transform` only. Export from `src/components/motion/index.ts`
    - _Requirements: 3.8, 3.9, 6.5_

  - [x] 5.2 Extend `KineticHeadline` with `trigger` and `delay`
    - Additive only: `trigger?: "mount" | "inView"` defaulting to `"mount"` so the Hero's on-load behaviour is byte-for-byte preserved; `"inView"` switches `animate` → `whileInView` at `SCROLL_TRIGGER_THRESHOLD`. `delay?: number` offsets the whole word sequence
    - _Requirements: 3.1, 3.9_

  - [ ]* 5.3 Write property test for stagger timing
    - **Property 8: Stagger is monotonic and capped**
    - **Validates: Requirements 3.2**
    - File: `src/lib/__tests__/getStaggerDelay.property.test.ts` — `i <= j ⟹ getStaggerDelay(i) <= getStaggerDelay(j) <= 0.48`

  - [x] 5.4 Extract the camera offset mapping as a pure function
    - Add `cameraY(progress, amplitude)` to `src/lib/motion/camera-tokens.ts`: `y = (clamp(progress, 0, 1) - 0.5) * amplitude`
    - Consume it from `useCameraLayer` so the shipped transform and the tested function are the same code path — no behaviour change intended
    - _Requirements: 3.3_

  - [ ]* 5.5 Write property test for camera offset clamping
    - **Property 9: Camera output is clamped to the derived amplitude**
    - **Validates: Requirements 3.3**
    - File: `src/lib/motion/__tests__/cameraY.property.test.ts`, driven by `arbProgress × arbAmplitude`; assert `y ∈ [−a/2, +a/2]`, `cameraY(0.5, a) === 0`, `cameraY(p, 0) === 0`

  - [ ]* 5.6 Write property test for amplitude resolution
    - **Property 10: Amplitude is non-negative and parks under reduced motion**
    - **Validates: Requirements 3.4, 6.5**
    - File: `src/lib/motion/__tests__/resolveAmplitude.property.test.ts` — result `>= 0`, and `intensity === 0 ⟹ result === 0`

- [x] 6. `TrainerPlinth` — the containment frame
  - [x] 6.1 Build the plinth frame, surface and grounding
    - `src/components/ui/TrainerPlinth.tsx`, **no** `"use client"`: outer `relative` wrapper that never clips (holding the backlight at `-inset-4 lg:-inset-6`) plus an inner `overflow-hidden aspect-[4/5]` frame
    - Inside the frame, in paint order: plinth surface gradient, 1px `border-t border-l border-white/10` edge light, texture plane (`luxury-grid-pattern.webp` as a CSS `background-image`, edge-masked), contact-shadow and floor-light radials, then the cutout via `next/image` `fill object-cover object-bottom origin-bottom` with `loading="lazy"`, no `priority`, and a call-site `sizes`
    - Every decorative layer carries `aria-hidden="true"` + `pointer-events-none`; cutout `alt` comes from `trainer.imageAlt`
    - _Requirements: 2.1, 2.6, 2.9, 5.8, 6.3, 6.9, 7.1, 7.4_

  - [x] 6.2 Build the label pool, label block and hex index chip
    - Label pool gradient over the bottom 38% of the inner frame; label block pinned to the frame's own bottom padding (`p-4 lg:p-5`, `gap-1` name→role, `gap-2` role→pips) so the name baseline offset is identical across all roster cards
    - `RosterIndexChip`: one flat-top hexagon using `HEX_CLIP` (rim + `bg-ink` core), numeral in `font-display`, always `aria-hidden`, exactly one numeral per coach; 32/36/40px by breakpoint
    - Name as `<h3>` via `MaskedLine`, suppressed when `suppressName` is true; role micro-caps; hex discipline pips capped at `MAX_ROSTER_PIPS`; achievement badge replaces the second pip row and truncates pips to one when `signatureAchievement` is present
    - The achievement badge uses `Badge variant="achievement"` (yellow) in the lead variant and `Badge variant="informational"` (`bg-ink text-white`, already exists) in the roster variant, so a roster coach with an achievement adds no resting yellow and the section's three-accent budget holds for any number of achievement-carrying coaches
    - Label pool height must be a function of variant and breakpoint only — never of which optional fields exist
    - _Requirements: 2.2, 2.4, 2.7, 2.10, 6.2, 6.8, 6.10, 8.5, 8.6_

  - [x] 6.3 Add the conditional backdrop plate
    - Rendered only when `trainer.backdropSrc` is present; `next/image` with `loading="lazy"`, `quality={55}`, matched `sizes`, `alt=""`, static `grayscale brightness-75`, opacity `0 → 0.16` on hover/focus
    - Wrap the plate in a `hidden lg:block` layer, not an opacity or visibility change: `display: none` is the only mechanism that also suppresses the lazy fetch below `lg:`, which is what Requirement 5.6 now asks for and the same mechanism task 9.2 relies on for the two grid trees
    - _Requirements: 5.6, 6.9, 7.2, 8.8_

  - [x] 6.4 Add the dossier layer and CSS-only interaction states
    - `TrainerDossier` overlay (philosophy line + "Book a session" affordance) at `z-40`: `translate-y-3 opacity-0` → `lg:group-hover:` / `group-focus-within:` at `opacity-100 translate-y-0`, with `max-lg:translate-y-0 max-lg:opacity-100` so it is unconditionally visible below `lg:`
    - Cutout `lg:group-hover:scale-[1.04] group-focus-visible:scale-[1.04]` about `bottom center`; plinth lift `-6px`; name underline draw `0% → 100%`; hex chip glow `0 → 0.14`; `active:scale-[0.98]` at 180ms; all gated by `motion-safe:` and limited to `transform`/`opacity`
    - Zero React state, zero effects, zero event handlers
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 4.7, 5.5, 7.5_

  - [ ]* 6.5 Write property test for frame containment invariants
    - **Property 20: Frame containment invariants hold for every coach**
    - **Validates: Requirements 2.6, 2.7, 2.9**
    - File: `src/components/ui/__tests__/TrainerPlinth.containment.property.test.ts`, driven by `arbTrainer` × both variants

  - [ ]* 6.6 Write property test for backdrop plate presence
    - **Property 24: The backdrop plate renders exactly when its source exists**
    - **Validates: Requirements 5.6, 8.8**
    - File: `.../__tests__/TrainerPlinth.backdrop.property.test.ts` — also assert the plate's wrapper carries `hidden` and `lg:block` and no opacity-only hiding, since that class pair is what makes the below-`lg:` omission real

  - [ ]* 6.7 Write property test for the achievement/pip trade
    - **Property 26: The achievement badge supersedes the second pip row without spending yellow**
    - **Validates: Requirements 8.6, 2.4**
    - File: `.../__tests__/TrainerPlinth.achievement.property.test.ts` — assert the pip truncation, and that the roster variant's badge resolves the `informational` (non-yellow) style while the lead variant's resolves `achievement`

  - [ ]* 6.8 Write property test for decorative-layer hiding
    - **Property 13: Decorative layers are hidden from assistive tech**
    - **Validates: Requirements 6.3**
    - File: `.../__tests__/TrainerPlinth.decorative.property.test.ts` — every atmosphere/lighting/numeral/backdrop layer carries `aria-hidden="true"` and `pointer-events-none`

  - [ ]* 6.9 Write property test for image loading strategy
    - **Property 29: Every cutout is lazily loaded with an explicit `sizes`**
    - **Validates: Requirements 7.1**
    - File: `.../__tests__/TrainerPlinth.loading.property.test.ts`

- [ ] 7. Cards, CTA tile and the lead stage
  - [x] 7.1 Implement `RosterCard`
    - `src/components/ui/RosterCard.tsx`, no directive: root `<li>` containing exactly one `<a class="group …">` with `href={trainer.ctaHref ?? fallbackCtaHref}`, `aria-label={\`Book a session with ${name}, ${title}\`}`, and a 2px `brand-yellow` `focus-visible` outline at 2px offset
    - Displayed index is `formatIndex(position + 2)`; wraps `TrainerPlinth variant="roster"` with the roster `sizes` string
    - _Requirements: 4.4, 4.5, 6.4, 6.7, 7.8_

  - [ ]* 7.2 Write property test for CTA fallback
    - **Property 22: CTA target falls back deterministically**
    - **Validates: Requirements 4.5**
    - File: `src/components/ui/__tests__/RosterCard.href.property.test.ts`

  - [ ]* 7.3 Write property test for zero hydration
    - **Property 28: Roster cards contribute zero hydration**
    - **Validates: Requirements 4.4, 7.8**
    - File: `.../__tests__/RosterCard.hydration.property.test.ts` — assert no event-handler props on the rendered tree and no `"use client"` directive in `RosterCard.tsx` / `TrainerPlinth.tsx` source

  - [ ]* 7.4 Write property test for non-hover-gated identity
    - **Property 12: Identity is never hover-gated**
    - **Validates: Requirements 6.2**
    - File: `.../__tests__/RosterCard.identity.property.test.ts` — name, role and at least one discipline value present with no interaction

  - [ ]* 7.5 Write property test for accent discipline
    - **Property 15: One accent per card**
    - **Validates: Requirements 2.4**
    - File: `.../__tests__/RosterCard.accent.property.test.ts` — zero `brand-yellow` descendants at rest, exactly one under the hover/focus variant classes; `arbTrainer` must generate coaches both with and without `signatureAchievement` so the resting-zero claim is proven for the achievement case, not just today's content

  - [ ]* 7.6 Write property test for accessible names and alt text
    - **Property 25: Accessible names and alt text are built from real content**
    - **Validates: Requirements 6.7, 6.9**
    - File: `.../__tests__/RosterCard.names.property.test.ts`

  - [x] 7.7 Implement `RosterCtaTile`
    - Sixth cell: hex-clipped icon plate using `HEX_CLIP`, the section's one primary action, rendered as the final grid/strip cell; the tile's yellow is one of the three resting section accents
    - _Requirements: 1.8, 2.5, 5.1, 5.2, 5.3_

  - [x] 7.8 Implement the lead `TrainerDossier` column
    - Name (`Heading level="section" as="h3"`) via `MaskedLine`, role, yellow rule via `AnimatedDivider`, discipline pips, credential rows from `resolveDossierRows(trainer, "lead")` with `tabular-nums`, `Badge variant="achievement"`, philosophy line at `max-w-[26ch]`, per-coach CTA — each step on the §8.3 delay ladder (0.25 / 0.33 / 0.41 + stagger / 0.49 / 0.57)
    - Only existing type tokens and the two existing font families
    - _Requirements: 2.5, 2.10, 3.1, 3.9, 6.7, 8.2_

  - [x] 7.9 Implement `LeadCoachStage`
    - Server Component wrapping one client `CameraLayer depth="sectionMedia"` around the lead plinth (dolly 1.03 → 1.0); 57%/43% two-column spread at `lg:`, plinth full width with dossier stacked below otherwise
    - Pass `suppressName` to the plinth so the dossier owns identity and the name appears once per coach
    - _Requirements: 3.5, 5.1, 5.2, 6.10_

  - [ ]* 7.10 Write property test for one accessible name per coach
    - **Property 11: One accessible name per coach**
    - **Validates: Requirements 6.1**
    - File: `src/components/sections/__tests__/TrainerShowcase.headings.property.test.ts` — exactly one heading-level-3 per coach whose accessible name contains that coach's name

- [x] 8. Checkpoint — plinth and cards green
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Atmosphere, grid, footer and section wiring
  - [x] 9.1 Implement `RosterAtmosphere`
    - `"use client"`: one `CameraLayer depth="deepBackground" fill decorative` carrying the texture plane (opacity 0.045 / 0.055 / 0.06 by breakpoint), hex wash and vignette
    - Mask the plane so it paints nothing inside the top or bottom 128px Blend_Zone; `will-change` comes from the camera system only
    - _Requirements: 2.3, 2.8, 3.5, 5.8, 7.4, 7.6_

  - [x] 9.2 Implement `RosterGrid`
    - Server Component: `sm:hidden` swipe strip via `CardGrid swipeNav` + `StripNavigator` at 85% card width with `overscroll-x-contain`, and a `hidden sm:block` `CameraGroup depth="interactive"` holding a `<ul>` at `grid-cols-2 lg:grid-cols-3`
    - Exactly one tree mounts at a given viewport width, so no coach is mounted twice and hidden lazy images never fetch
    - One continuous stagger across all cells via `getStaggerDelay(i)` for `i = 0..5`; cards stay rigid relative to one another on the tray; grid stays valid at 4–7 roster entries with the CTA tile always last
    - _Requirements: 1.8, 3.2, 3.7, 3.12, 5.1, 5.2, 5.3, 5.7, 5.9, 6.6_

  - [x] 9.3 Implement `RosterFooter`
    - Coach count plus the combined-years `CountUp` (1.2s, `useInView` 0.4), and the "See all" link; render the figure and its sentence only when `combinedYears !== null`
    - _Requirements: 3.11, 8.1_

  - [x] 9.4 Rewrite `TrainerShowcase` and wire the section together
    - Keep it a Server Component: call `assembleSection(trainers, ROSTER_PRESENTATION_ORDER, BOOKING_HREF)` at module scope, then compose `SectionBlends` → `RosterAtmosphere` → header (`Eyebrow` + `KineticHeadline trigger="inView" delay={0.1}` as `<h2>` + supporting line + `AnimatedDivider`) → `LeadCoachStage` → `RosterGrid` → `RosterFooter`
    - Preserve the existing top blend, bottom blend, warm wash and vignette unchanged; exactly three resting yellow accents (eyebrow, lead achievement group, CTA tile); exactly three camera subscriptions and at most three added client components
    - Retire the Phase 4 oversized backdrop numeral and the old `AnchorBlock` / `SecondaryBlock` / `TrainerImageFrame` helpers
    - _Requirements: 2.5, 2.8, 3.1, 3.5, 3.6, 3.10, 6.6, 7.8, 7.9, 7.10_

  - [ ]* 9.5 Write property test for keyboard parity
    - **Property 16: Keyboard parity with hover**
    - **Validates: Requirements 6.4, 4.2**
    - File: `src/components/sections/__tests__/TrainerShowcase.keyboard.property.test.ts` — focusing a card's link makes the dossier content visible, matching the hover end state

  - [ ]* 9.6 Write property test for unconditional dossier content below `lg`
    - **Property 23: Dossier content is unconditionally available below `lg`**
    - **Validates: Requirements 5.5**
    - File: `.../TrainerShowcase.dossierMobile.property.test.ts` — assert the `max-lg:` opacity/offset contract with no interaction

  - [ ]* 9.7 Write test for horizontal overflow
    - **Property 17: No horizontal overflow at any tested width**
    - **Validates: Requirements 5.4**
    - File: `.../TrainerShowcase.overflow.test.ts` — jsdom can only assert the structural contract (no negative horizontal margins, oversized graphics inside `overflow-hidden`, `overscroll-x-contain` on the strip); the pixel measurement at 320/375/390/430/768/1024/1440px stays on the §15.4 manual pass

  - [ ]* 9.8 Write test for uniform label geometry
    - **Property 18: Label geometry is uniform across the roster**
    - **Validates: Requirements 2.2, 8.5**
    - File: `.../TrainerShowcase.labelGeometry.test.ts` — assert every roster label block resolves the identical padding/rhythm class set regardless of which optional fields are populated; the ±1px baseline measurement stays on the manual pass, since jsdom does not lay out

  - [ ]* 9.9 Write property test for reduced-motion parity
    - **Property 14: Reduced motion yields zero transform animations**
    - **Validates: Requirements 6.5**
    - File: `.../TrainerShowcase.reducedMotion.property.test.ts` — with `prefers-reduced-motion: reduce` matched, no element reports a non-identity transform at rest and all Property 12 content is still present

  - [ ]* 9.10 Write property test for composited properties only
    - **Property 21: Only composited properties are animated**
    - **Validates: Requirements 3.8, 7.5**
    - File: `.../TrainerShowcase.composited.property.test.ts` — no transition or animation touches `clip-path`, `filter`, `box-shadow`, `backdrop-filter`, `width` or `height`

- [x] 10. Assets and legacy cleanup
  - [x] 10.1 Recompress the oversized backdrop plate
    - `public/back/mohammed-wajeed.jpg` is 717KB against 60–324KB for its five siblings. Recompress to **under 200KB** (quality ~60, capped at the rendered width) and verify all six plates are at or below 200KB
    - _Requirements: 7.3_

  - [x] 10.2 Remove the orphaned legacy card component
    - `src/components/ui/TrainerCard.tsx` is used by no section but still exported from `src/components/ui/index.ts`. Delete it and its export, then confirm `npm run typecheck` and `npm run lint` are clean
    - _Requirements: 7.8_

- [x] 11. Final checkpoint — full verification
  - Run `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP. Skipping 1.2 and 1.3 removes the whole property-test layer, in which case Properties 11–18, 20, 21, 23–26, 28 and 29 move to the manual QA checklist in design.md §15.4.
- Properties 1–10, 19, 22, 26 and 27 need no DOM. They are the cheapest and the most valuable, because they cover the failures that break silently when content changes: roster order, index contiguity and honest year sums.
- Three properties (14, 17, 18) depend on real layout. jsdom can only assert their class-level contract; the pixel-level checks stay on the manual pass, and the tasks say so rather than pretending otherwise.
- The section stays a Server Component. Only `RosterAtmosphere`, `MaskedLine` and the extended `KineticHeadline` hydrate — roster cards and plinths ship zero client JavaScript.
- Content gaps (`yearsExperience`, `certifications`, `philosophy`, achievements beyond "Mr Nizamabad") are owner inputs, not code tasks. The section renders correctly without them via the §7.3 degradation matrix.
- `specifications/sections/trainershowcase-implementation-spec.md` should be reissued as Version 3 from this design once the code lands — tracked outside this task list, since it is documentation rather than code.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "10.1", "10.2"] },
    { "id": 1, "tasks": ["2.1", "5.1", "5.2"] },
    { "id": 2, "tasks": ["2.2", "1.3", "5.4"] },
    { "id": 3, "tasks": ["3.1", "2.3", "5.3", "5.5", "5.6"] },
    { "id": 4, "tasks": ["3.4", "3.2", "3.3"] },
    { "id": 5, "tasks": ["3.6", "3.5"] },
    { "id": 6, "tasks": ["3.8", "3.7"] },
    { "id": 7, "tasks": ["3.10", "3.9"] },
    { "id": 8, "tasks": ["6.1", "3.11", "3.12", "3.13", "3.14"] },
    { "id": 9, "tasks": ["6.2", "7.7", "7.8"] },
    { "id": 10, "tasks": ["6.3", "7.1"] },
    { "id": 11, "tasks": ["6.4", "7.9", "9.1"] },
    { "id": 12, "tasks": ["9.2", "9.3", "6.5", "6.6", "6.7", "6.8", "6.9"] },
    { "id": 13, "tasks": ["9.4", "7.2", "7.3", "7.4", "7.5", "7.6"] },
    { "id": 14, "tasks": ["7.10", "9.5", "9.6", "9.7", "9.8", "9.9", "9.10"] }
  ]
}
```
