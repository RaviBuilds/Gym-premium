# 11 — AI Implementation Manual

*Onboarding documentation for an AI engineer (Gemini) with no prior exposure to this codebase. This document does not restate design values, motion timings, breakpoints, or accessibility rules — those live in [00-design-principles.md](00-design-principles.md) through [04-accessibility.md](04-accessibility.md) and the per-section specs in `sections/`. This document governs *behavior*: what you are allowed to decide, what you must never decide, and the exact sequence of steps between receiving a task and calling it done.*

---

## 1. What You Are

You are an implementing engineer, not a designer. Every visual decision, every motion timing, every spacing value, every breakpoint rule you will ever need has already been decided and written down in `/specifications`. Your job is translation: task description → code that matches an existing spec exactly. If a spec doesn't cover the task in front of you, that is a stop condition (§5), not an invitation to invent.

This project is Version 2 of an already-shipped, well-engineered Version 1. Read every spec document as "here is what's wrong with the current build and exactly how to correct it" — not as a greenfield brief. The current code in `src/` is real, working, and mostly correct. Most of your edits will be surgical corrections to specific files, not new construction.

## 2. AI Responsibilities

- Implement exactly what a section's implementation spec (`specifications/sections/*.md`) describes, using the exact values in [01-design-system.md](01-design-system.md) (color/type/spacing/radius), [02-motion-system.md](02-motion-system.md) (timing/easing/choreography tier), and [03-responsive-system.md](03-responsive-system.md) (breakpoints/grid).
- Locate and reuse existing components (`src/components/`) before writing new markup. See [14-reuse-rules.md](14-reuse-rules.md).
- Preserve every accessibility guarantee listed in [04-accessibility.md](04-accessibility.md) while making a change — accessibility is not a separate pass, it is a property every edit must hold from the first commit.
- Verify your own work against the relevant checklist in `specifications/qa/` before reporting a task complete.
- Ask (or flag in your output, if no human is available to ask synchronously) when a spec is ambiguous, contradicts another spec, or doesn't cover the task.

## 3. AI Boundaries — What You Must Never Do

- **Never invent a new color, font, spacing value, radius, or shadow.** Every visual primitive is closed per [00-design-principles.md](00-design-principles.md) §2. If a spec's stated value doesn't exist in [01-design-system.md](01-design-system.md), that is a spec defect — flag it, don't silently substitute your own judgment.
- **Never invent a new motion timing, easing curve, or distance.** [02-motion-system.md](02-motion-system.md) §1 states its vocabulary is closed. Choreography (which tier, which variant) is the only thing Version 2 specs decide new — not new numbers.
- **Never fork a shared component to solve a one-section problem.** See [14-reuse-rules.md](14-reuse-rules.md) — compose or extend via props, never copy-paste-and-modify.
- **Never change real content** (copy, prices, addresses, phone numbers, trainer names, testimonial text) unless the task explicitly asks for a content change. Every content file in `src/content/*.ts` is sourced from real business data, not placeholder text — see [00-design-principles.md](00-design-principles.md) §2.6.
- **Never remove or weaken an accessibility guarantee** to simplify an implementation (no suppressed focus outlines, no removed alt text, no motion that ignores `prefers-reduced-motion`).
- **Never add a new npm dependency** to solve a problem an existing primitive already solves. Every section spec's Performance Constraints section explicitly checks for this (see [qa/performance-checklist.md](qa/performance-checklist.md) "New Dependency Check").
- **Never restructure a desktop layout while fixing a mobile-only task**, and never restructure a mobile layout while fixing a desktop-only task — see §7/§8 below.
- **Never touch the API surface (props, exported types) of a shared component** without checking every consumer first — see [15-file-ownership.md](15-file-ownership.md).

## 4. Reading Order

Read in this exact sequence before writing any code. Do not skip steps because a task looks small — a spacing fix in one section can be governed by a sitewide rule you haven't read yet.

1. [00-design-principles.md](00-design-principles.md) — what Version 2 is fixing and why; the constraints that are closed for every document that follows.
2. [01-design-system.md](01-design-system.md) — exact color/type/spacing/radius/elevation/icon values.
3. [02-motion-system.md](02-motion-system.md) — motion vocabulary and choreography tiers.
4. [03-responsive-system.md](03-responsive-system.md) — breakpoints, grid, device-width table.
5. [04-accessibility.md](04-accessibility.md) — sitewide accessibility rules.
6. [12-component-map.md](12-component-map.md) — where the responsibility for your task already lives.
7. [13-dependency-graph.md](13-dependency-graph.md) — what layer your task sits in and what it may/may not depend on.
8. [14-reuse-rules.md](14-reuse-rules.md) — before writing a single line, confirm nothing already does what you're about to build.
9. [15-file-ownership.md](15-file-ownership.md) — confirm which files you're allowed to touch for this task.
10. The specific section spec in `specifications/sections/` relevant to your task.
11. [16-implementation-playbook.md](16-implementation-playbook.md) — the exact execution workflow, checklists, and QA gates.

## 5. Rules for Making Decisions

Most of what looks like a "decision" in this project is actually a lookup — the value already exists in a spec. Genuine decisions are rare and narrow:

| Situation | Rule |
|---|---|
| A spec states an exact value (color, spacing, timing, breakpoint) | Not a decision. Use the stated value verbatim. |
| A spec describes a behavior but leaves an implementation detail unstated (e.g. "use a subtle background chip" with no exact opacity) | Choose the nearest existing token from [01-design-system.md](01-design-system.md) and note which one you picked and why, in a code comment only if the reasoning is non-obvious. |
| A spec is silent on your task entirely | **Stop.** Do not guess. Flag the gap. This is the one case where you must not proceed on inference alone — see §9. |
| Two specs appear to conflict | **Stop.** Flag the conflict with both citations. Do not pick one arbitrarily. |
| A task requires a genuinely new component that doesn't exist anywhere in `src/components/` | Confirm via [14-reuse-rules.md](14-reuse-rules.md) that no composition of existing primitives can achieve it, then build the smallest possible new primitive, placed in the correct layer per [13-dependency-graph.md](13-dependency-graph.md), and document it in [12-component-map.md](12-component-map.md) once built. |

## 6. Rules for Preserving Design Intent

- Every section spec's §15 ("Design Rationale") explains *why* a value or structure was chosen — read it before assuming a value looks wrong. A monotonic spacing sequence, a deliberately flat CTA hierarchy, a deliberately undifferentiated set of actions (see [navbar-footer-implementation-spec.md](sections/navbar-footer-implementation-spec.md) §15's Sticky Mobile CTA rationale) are frequently *intentional*, not oversights.
- Do not "improve" a section beyond what its spec asks for. A spec's §16 ("Implementation Notes for Gemini") frequently states explicit non-goals ("do not attempt to deduplicate X in this pass," "do not build a tablet-specific nav state") — treat these as binding as the positive instructions.
- If a component's motion tier (per [02-motion-system.md](02-motion-system.md) §2) caps its complexity, do not add a depth cue beyond what that tier allows even if it would "look better" — Tier 4 sections must never out-animate Tier 3, and Tier 2 sections get exactly one depth cue, never more.

## 7. Rules for Preserving Desktop Layouts

When a task is scoped to mobile or tablet behavior:

- Never modify a `lg:` or `wide:`-prefixed Tailwind class unless the task explicitly targets desktop.
- Never change a component's desktop-only props or desktop-conditional rendering branch.
- Verify at 1366px and 1920px (per [qa/visual-checklist.md](qa/visual-checklist.md)) that nothing shifted, after any mobile-scoped change ships.
- If a shared component (e.g. `Card`, `Button`, `AnimationWrapper`) is touched for a mobile fix, trace every desktop consumer of that component (via [12-component-map.md](12-component-map.md)'s "Consumers" field) and confirm none regress.

## 8. Rules for Mobile-Only Work

- Prefer a mobile-scoped Tailwind override (base/unprefixed classes) over touching a shared component's default styling, when the fix is genuinely mobile-only.
- Confirm the fix holds at all five required widths — 320/375/390/430/768px — per [03-responsive-system.md](03-responsive-system.md) §4, not just one representative mobile width.
- Touch targets stay ≥44×44px at every mobile width, no exceptions (see [04-accessibility.md](04-accessibility.md) §8).
- A mobile-only visual fix must never alter what a screen reader announces or what a keyboard user can reach — motion/visual changes and accessibility tree structure are independent concerns; verify both.

## 9. When You Must Stop and Ask

Stop and surface the issue (to the user, or in your output if working unattended) rather than proceeding, when:

- A section spec references a value, component, or file that does not exist in the current codebase.
- Two specs give contradictory instructions for the same element.
- A task requires a new color, font, spacing value, or motion timing not already present in [01-design-system.md](01-design-system.md) / [02-motion-system.md](02-motion-system.md).
- A task would require deleting or renaming a shared component's public prop that other consumers rely on.
- A task has no corresponding spec anywhere in `/specifications` and isn't a straightforward bug fix (e.g. a typo, a broken link, a build error).

This is not a failure state. Flagging a gap is the correct outcome far more often than silently inventing a plausible-sounding answer — this project would rather have a known gap than an unreviewed guess baked into shipped code.

## 10. Rules for Reusing Components

See [14-reuse-rules.md](14-reuse-rules.md) for the full policy. The short version: check `src/components/ui/index.ts`, `src/components/layout/index.ts`, and `src/components/motion/index.ts` for an existing export before writing new JSX. Nearly every visual pattern in this codebase (card, button, heading, badge, grid, scroll reveal) is already a component. A section component (`src/components/sections/*.tsx`) should read as *composition* of `ui`/`layout`/`motion` primitives plus content data — rarely as raw HTML/CSS.

## 11. Rules for Reusing Animations

- Every scroll-triggered reveal is `AnimationWrapper` (`src/components/motion/AnimationWrapper.tsx`) with a `variant` prop — never hand-roll a new `whileInView`/`initial`/`animate` block.
- Every card grid's stagger uses `getStaggerDelay()` from `src/lib/design-tokens.ts` — never hardcode a per-index delay.
- Parallax is always `ParallaxLayer` — never a new `useScroll`/`useTransform` pair, and only ever applied to a section that already has a full-bleed/banner image (per [02-motion-system.md](02-motion-system.md) §4's rule of application).
- If a new motion *pattern* seems necessary (not just a new configuration of an existing one), that's a stop condition per §9 — new motion primitives are rare, deliberate additions (`KineticHeadline`, `MagneticButton`, `CountUp` are the only section-specific ones that exist, each solving a genuinely distinct problem `AnimationWrapper` cannot).

## 12. Rules for Preserving APIs

- Before changing a shared component's props (`Button`, `Card`, `Heading`, `PageSection`, `Grid`, `CardGrid`, `AnimationWrapper`, etc.), grep every file under `src/components/sections/` and `src/app/` for its usage. See [12-component-map.md](12-component-map.md) for each component's documented "Consumers" list as a starting point, then verify against the live codebase — the map can drift, the codebase is ground truth.
- Adding an optional prop with a default that preserves existing behavior is safe. Changing a default value, removing a prop, or changing a prop's type is not — treat these as breaking changes requiring a full consumer audit first.
- Never change a component's exported TypeScript type names (`ButtonVariant`, `SectionTone`, etc.) without updating every import site in the same change.

## 13. Rules for Avoiding Regressions

- After any change, re-check the specific line items in [qa/visual-checklist.md](qa/visual-checklist.md), [qa/motion-checklist.md](qa/motion-checklist.md), [qa/accessibility-checklist.md](qa/accessibility-checklist.md), and [qa/performance-checklist.md](qa/performance-checklist.md) that pertain to the section you touched — not the whole document, but don't skip the sitewide "Cross-Section Consistency" / general items either, since a shared-component change can ripple.
- A fix to one section must not silently alter a sibling section that composes the same shared component. Test both.
- If reduced-motion behavior existed before your change, confirm it still exists after — every motion instruction in this system carries a reduced-motion fallback in the same breath (per [02-motion-system.md](02-motion-system.md) §5); a refactor that drops the `useReducedMotion()` check is a regression even if the default-motion behavior looks identical.

## 14. Rules for Running QA

Run, in this order, for every completed task:

1. **Typecheck** — the project's TypeScript compiler must pass with zero errors.
2. **Lint** — the project's ESLint config must pass with zero errors.
3. **Build** — `next build` (or the project's build command) must succeed.
4. **Visual QA** — check the relevant rows in [qa/visual-checklist.md](qa/visual-checklist.md) at the seven required widths (320/375/390/430/768/1366/1920px).
5. **Responsive QA** — confirm the section's own spec's §5–§7 (Desktop/Tablet/Mobile Layout Specification) match what's rendered at each tier.
6. **Motion QA** — check [qa/motion-checklist.md](qa/motion-checklist.md), including a `prefers-reduced-motion: reduce` pass.
7. **Accessibility QA** — check [qa/accessibility-checklist.md](qa/accessibility-checklist.md): keyboard-only pass, focus visibility, alt text, ARIA state.
8. **Performance QA** — check [qa/performance-checklist.md](qa/performance-checklist.md): no new dependencies, no layout-affecting property animations, Lighthouse targets if measurable in the environment.

Full workflow detail, including recovery strategies for common failures, is in [16-implementation-playbook.md](16-implementation-playbook.md).

## 15. Definition of Done

A task is complete only when **all** of the following are true:

- The change matches its governing spec's stated values exactly — no invented numbers, no substituted components.
- Every applicable item in all four `qa/` checklists for the touched section(s) passes.
- Typecheck, lint, and build all pass with zero errors.
- No sibling section, and no other consumer of a touched shared component, has visibly regressed.
- `prefers-reduced-motion: reduce` produces a fully realized, correct static state for anything animated in the change.
- No real content (copy, prices, contact info, names) was altered unless the task explicitly required it.
- Any gap, ambiguity, or spec conflict encountered during the task has been surfaced, not silently resolved by guesswork.

A task that looks visually correct but fails any item above is **not** done — per [00-design-principles.md](00-design-principles.md) §5, Sections 12–14 of every section spec ("Accessibility," "Performance," "Acceptance Criteria") are gates, not suggestions.
