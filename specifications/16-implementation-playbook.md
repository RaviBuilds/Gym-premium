# 16 — Implementation Playbook

*The execution guide. Where [11-ai-implementation-manual.md](11-ai-implementation-manual.md) states the rules of behavior, this document states the exact sequence of steps to follow for any task, start to finish, plus checklists, common mistakes, and recovery strategies. Follow this workflow for every task regardless of size — skipping steps because a task "looks small" is the single most common cause of regressions in a codebase this thoroughly specified.*

---

## 1. The Workflow

```
Understand the task
        ↓
Read 00-design-principles.md
        ↓
Read 01-design-system.md
        ↓
Read 02-motion-system.md
        ↓
Read 03-responsive-system.md
        ↓
Read 04-accessibility.md
        ↓
Read the relevant section implementation spec (specifications/sections/*.md)
        ↓
Locate reusable components (12-component-map.md, 14-reuse-rules.md)
        ↓
Locate reusable motion (12-component-map.md's Motion Components section)
        ↓
Confirm file ownership boundaries (15-file-ownership.md)
        ↓
Confirm dependency direction (13-dependency-graph.md)
        ↓
Plan the implementation
        ↓
Implement
        ↓
Typecheck
        ↓
Lint
        ↓
Build
        ↓
Visual QA
        ↓
Responsive QA
        ↓
Accessibility QA
        ↓
Performance QA
        ↓
Completion
```

If you've read `00`–`04` and the relevant section spec in a prior task this session and nothing about them has changed, you don't need to re-read the full text — but you do need to re-confirm the specific values/rules your current task touches. Never skip the reuse/ownership/dependency checks (steps 8–11) even on a repeat task — those are per-task lookups, not one-time reading.

## 2. Step-by-Step Detail

### Step 1 — Understand the task
Restate the task in terms of: which section(s) it touches, whether it's a visual/layout change, a motion change, a content change, or a behavior/accessibility fix, and whether it's scoped to one breakpoint tier or sitewide. If the task description references a spec section number (e.g. "fix per §9"), open that exact section first.

### Step 2 — Read `00-design-principles.md`
Confirm which of the four "premium" qualities (§3) or which non-negotiable constraint (§2) the task relates to. This tells you what's closed (never touch) versus what's genuinely open for this task.

### Step 3 — Read `01-design-system.md`
Confirm every color/type/spacing/radius value your task will use already exists here. If your task seems to need a value that isn't in this document, stop per [11-ai-implementation-manual.md](11-ai-implementation-manual.md) §9 — do not proceed with an invented value.

### Step 4 — Read `02-motion-system.md`
If your task touches any animated element, confirm its choreography tier (§2) and check whether the task's requested effect is already a named pattern (§4's parallax rule-of-application, §6's decision table).

### Step 5 — Read `03-responsive-system.md`
Confirm the breakpoint-stepping rule (§3) and the exact device-width behavior table (§4) for any layout change. Check whether the section you're touching is one of the two explicitly-flagged corrections (Locations, MembershipCta) or a new addition.

### Step 6 — Read `04-accessibility.md`
Confirm your task doesn't silently remove a guarantee from §1–§8, and check §9's gap list — your task might already be one of the four gaps this document tracks.

### Step 7 — Read the relevant section implementation spec
Open `specifications/sections/<section>-implementation-spec.md`. Read the whole document, not just the subsection matching your task — §15 (Design Rationale) and §16 (Implementation Notes for Gemini) frequently contain binding constraints ("do not," "keep as-is," "explicitly deferred") that apply even to a task that looks unrelated at first glance.

### Step 8 — Locate reusable components
Run the [14-reuse-rules.md](14-reuse-rules.md) §10 checklist. Search [12-component-map.md](12-component-map.md) before writing anything.

### Step 9 — Locate reusable motion
Specifically re-check [12-component-map.md](12-component-map.md)'s Motion Components section — this is the category most often reinvented by mistake because a one-off `framer-motion` block feels faster to write inline than to trace through `AnimationWrapper`'s variant system. It almost never is faster once you account for the reduced-motion contract you'd otherwise have to reimplement by hand.

### Step 10 — Confirm file ownership boundaries
Check [15-file-ownership.md](15-file-ownership.md) for the specific file(s) you're about to touch. Confirm the change stays within that file's stated ownership.

### Step 11 — Confirm dependency direction
Check [13-dependency-graph.md](13-dependency-graph.md) §6's quick-reference table for the layer you're editing. If your planned import would violate a forbidden direction (§3), redesign the approach before writing code.

### Step 12 — Plan the implementation
Write out (mentally or as a short note, not a new file — see the Writing Style rule in this document's parent instructions) exactly which files will change and what each change is. If the plan touches more than one section or one shared component with multiple consumers, this is the point to flag scope to a human reviewer if working interactively.

### Step 13 — Implement
Make the change. Follow the exact values from steps 2–6. Reuse per steps 8–9. Respect boundaries per steps 10–11.

### Step 14 — Typecheck
Run the project's TypeScript compiler (`tsc --noEmit` or the project's configured script). Zero errors required.

### Step 15 — Lint
Run the project's ESLint config. Zero errors required.

### Step 16 — Build
Run the project's build command (`next build` or equivalent). Zero errors required. A successful build is not optional evidence — it's the minimum bar before any visual/QA claim is credible.

### Step 17 — Visual QA
Work through the relevant rows in [qa/visual-checklist.md](qa/visual-checklist.md) for the section(s) touched, at all seven required widths (320/375/390/430/768/1366/1920px).

### Step 18 — Responsive QA
Re-verify the section spec's own §5–§7 (Desktop/Tablet/Mobile Layout Specification) against what's actually rendered.

### Step 19 — Accessibility QA
Work through [qa/accessibility-checklist.md](qa/accessibility-checklist.md)'s relevant rows: keyboard-only pass, focus visibility, alt text, ARIA state, touch targets, reduced-motion.

### Step 20 — Performance QA
Work through [qa/performance-checklist.md](qa/performance-checklist.md)'s relevant rows: no new dependencies, transform/opacity-only animation, image optimization, no layout shift.

### Step 21 — Completion
Confirm every item in [11-ai-implementation-manual.md](11-ai-implementation-manual.md) §15's Definition of Done. Report the change.

## 3. Checklists

### Pre-implementation checklist
- [ ] I have read the governing section spec in full, including §15/§16.
- [ ] Every value I'm about to use (color/spacing/timing/breakpoint) already exists in `00`–`04`.
- [ ] I have searched [12-component-map.md](12-component-map.md) and confirmed no existing component/primitive already does this.
- [ ] I know which file(s) I'm allowed to touch, per [15-file-ownership.md](15-file-ownership.md).
- [ ] My planned imports respect [13-dependency-graph.md](13-dependency-graph.md)'s dependency direction.
- [ ] If this task touches a shared component's public API, I have identified every current consumer.

### Pre-completion checklist
- [ ] Typecheck passes.
- [ ] Lint passes.
- [ ] Build succeeds.
- [ ] Visual QA rows relevant to this change pass at all seven widths.
- [ ] Responsive QA matches the section spec's stated breakpoint behavior.
- [ ] Motion QA: reduced-motion produces a correct, fully realized static state.
- [ ] Accessibility QA: keyboard reachability, focus visibility, alt text, ARIA state all verified.
- [ ] Performance QA: no new dependency, no layout-affecting property animated, no unexplained new image weight.
- [ ] No sibling section or other consumer of a touched shared component has regressed.
- [ ] No real content changed unless the task explicitly asked for it.
- [ ] Every gap or ambiguity encountered was surfaced, not silently resolved by guesswork.

## 4. Common Mistakes

- **Reaching for a new `framer-motion` block instead of `AnimationWrapper`.** Almost always avoidable — check the five existing variants first (see [14-reuse-rules.md](14-reuse-rules.md) §3).
- **Hardcoding a stagger delay (`index * 0.08`) instead of calling `getStaggerDelay()`.** Breaks the 480ms cap silently for grids beyond 6 items.
- **Applying `ParallaxLayer` to a section without a full-bleed/banner image "because it would look nice."** Violates [02-motion-system.md](02-motion-system.md) §4's explicit rule of application — motion for its own sake is the exact failure mode [00-design-principles.md](00-design-principles.md) §3 rules out.
- **Forking a card/button component instead of adding a prop.** See [14-reuse-rules.md](14-reuse-rules.md) §8 — this is prohibited by default, not a shortcut.
- **Changing a shared component's default value "just for this one section" via an inline override that happens to work everywhere else too.** If the change is correct sitewide, change the default and audit consumers. If it's only correct for one section, it needs to be a prop, not a default change with an unaudited blast radius.
- **Fixing a mobile layout bug by editing a `lg:`-prefixed class "to be safe."** Never touch desktop-scoped classes for a mobile-scoped task — see [11-ai-implementation-manual.md](11-ai-implementation-manual.md) §7.
- **Treating a section spec's §15 "Design Rationale" as optional background reading.** These sections frequently contain the single fact that prevents you from "fixing" something that was deliberately left as-is (e.g. Sticky Mobile CTA's flat three-action treatment, Hero's color-only CTA hierarchy).
- **Silently resolving an apparent spec contradiction by picking the one that seems more sensible.** This is a stop condition, not a judgment call — see [11-ai-implementation-manual.md](11-ai-implementation-manual.md) §5/§9.
- **Editing a `src/content/*.ts` file as a side effect of a layout task.** Content and layout are different task types; a layout diff that also touches content is very likely scope creep.
- **Skipping the reduced-motion verification because the default-motion behavior looks right.** A refactor can drop the `useReducedMotion()` gate while leaving the animated-state code path visually correct — always check both states explicitly.
- **Importing directly from a sibling section file** because two sections need "the same thing" (e.g. Programs' `TrainingBanner` reaching into Facilities.tsx, or vice versa). This duplication is intentional per [13-dependency-graph.md](13-dependency-graph.md) §3 — copy the *pattern*, never the *import*.

## 5. Recovery Strategies

- **Typecheck fails after a prop change:** you've broken a consumer. Find every import site (grep, don't rely on memory or the component map alone) and either update each consumer or revert the prop change and choose a backward-compatible approach (new optional prop with a safe default) instead.
- **Build fails with a Server/Client Component boundary error:** you've likely imported a `"use client"` module (most of `src/components/motion/`) into a context expecting a function prop to cross the boundary, or added a hook to a file `design-tokens.ts`-style utilities are expected to stay hook-free. Isolate the client-only piece into its own small component (the `HeroScrollCue` pattern) rather than marking a whole section `"use client"`.
- **A visual regression appears in a sibling section after a shared-component change:** revert the shared-component change, re-scope it as a new optional prop instead of a default-behavior change, and reapply.
- **Reduced-motion QA reveals a flash of animated content before the reduced state applies:** check that `useReducedMotion()` is read before the component's first render decision, not inside a `useEffect` that runs after an initial animated paint — every existing motion primitive in this codebase gates at render time, not post-mount.
- **A spec's stated value doesn't match what's actually in `globals.css`/`design-tokens.ts`:** this is the [11-ai-implementation-manual.md](11-ai-implementation-manual.md) §9 stop condition (spec vs. code mismatch) — flag it rather than picking one source over the other.
- **Two section specs give conflicting guidance for a genuinely shared element (e.g. both Programs and Facilities describe "the banner pattern" slightly differently):** treat [02-motion-system.md](02-motion-system.md)'s cross-referenced table (§4) as the tie-breaker for values (drift, layer) since it's the sitewide authority both sections should already match; if the sections' *prose* differs beyond that table's scope, flag the discrepancy.

## 6. Implementation Priorities

When a task involves multiple possible orderings of work (e.g. a multi-section correction pass), prioritize in this order:

1. **Accessibility and correctness fixes** (broken ARIA, missing alt text, keyboard traps, contrast failures) — these are gates per [00-design-principles.md](00-design-principles.md) §5, not enhancements.
2. **Explicitly flagged spec corrections** (e.g. [03-responsive-system.md](03-responsive-system.md) §3's Locations/MembershipCta breakpoint fixes, [navbar-footer-implementation-spec.md](sections/navbar-footer-implementation-spec.md)'s Footer breakpoint/heading-level corrections) — these are known, named defects with a stated fix, not open design questions.
3. **Choreography/motion additions** that are explicitly scoped ("add exactly one depth cue," "add exactly one Footer fade") — implement exactly the stated scope, not more.
4. **Performance consolidations** (e.g. Hero's four-overlay-divs-into-one correction) — verify zero visual difference before/after per the spec's own acceptance criteria.
5. **Deferred items** (e.g. Navbar's tablet-nav gap, explicitly marked "flag, do not fix in this pass") — do not implement these unless a task explicitly lifts the deferral; implementing a deferred item unprompted is scope creep, not helpfulness.

## 7. Quality Gates

A change does not pass any gate below on a partial basis — each is binary:

| Gate | Pass condition |
|---|---|
| Typecheck | Zero compiler errors |
| Lint | Zero lint errors |
| Build | Succeeds with zero errors |
| Visual | Every checked row in [qa/visual-checklist.md](qa/visual-checklist.md) relevant to the change is true at all seven widths |
| Motion | Every checked row in [qa/motion-checklist.md](qa/motion-checklist.md) relevant to the change is true, including the full reduced-motion pass |
| Accessibility | Every checked row in [qa/accessibility-checklist.md](qa/accessibility-checklist.md) relevant to the change is true |
| Performance | Every checked row in [qa/performance-checklist.md](qa/performance-checklist.md) relevant to the change is true |
| Regression | No sibling section or other shared-component consumer has visibly changed unintentionally |
| Scope | No file outside the task's stated ownership boundary was modified, per [15-file-ownership.md](15-file-ownership.md) |

A task that fails any gate is not done, regardless of how close it looks — per [00-design-principles.md](00-design-principles.md) §5's own framing of Sections 12–14 in every section spec as gates, not suggestions.
