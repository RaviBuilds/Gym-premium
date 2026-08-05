# 14 — Reuse Rules

*The most important document in this operating manual. Every regression risk named in [11-ai-implementation-manual.md](11-ai-implementation-manual.md) traces back to one root cause: writing new code where reusing or extending existing code would have worked. This document teaches the identification step — how to find out that something already exists — before you write anything.*

---

## 1. The Core Rule

**Before writing a single line of new component/markup/animation/style code, prove to yourself that nothing in `src/components/`, `src/lib/`, or `globals.css`'s token set already does the job.** [12-component-map.md](12-component-map.md) is your index for this search. If the map's entry for a candidate component doesn't settle the question, read the component's actual source file — the map summarizes, the source file is ground truth.

This rule exists because this codebase is already comprehensively primitived. Nearly every visual and motion pattern a new task will ask for is a *configuration* of something that exists, not a gap. Treat "I need to build a new component" as a claim requiring proof, not a default assumption.

## 2. Never Duplicate Components

- **Never create a second button, card, badge, icon-wrapper, or heading component.** `Button`/`ButtonLink`, `Card`/`CardMedia`, `Badge`, `Icon`, `Heading`/`Eyebrow`/`BodyText`/`SectionHeader` are the *only* sanctioned implementations of each, sitewide (see [12-component-map.md](12-component-map.md)).
- If a new content type (say, a future "Awards" section) needs a card, compose `Card`/`CardMedia` directly the way `LocationCard`/`TrainerCard` do — do not write a bespoke `<div className="rounded-... shadow-...">` that reimplements `Card`'s geometry from scratch.
- If an existing card component (e.g. `ProgramCard`) is 90% right for a new need, the correct move is almost always to add an optional prop to that component (with a default preserving current behavior) — not to copy the file and rename it. A near-duplicate file is a maintenance liability the moment the design system's card radius or shadow values change once and only one of the two copies gets updated.
- **Exception path:** if a genuinely new visual pattern is needed (no existing component's structure is a superset of what's required even with new props), see [11-ai-implementation-manual.md](11-ai-implementation-manual.md) §5's "genuinely new component" row — this is a stop-and-confirm situation, not a default action.

## 3. Never Duplicate Animations

- **Every scroll-triggered reveal is `AnimationWrapper`.** Before writing a new `framer-motion` `initial`/`whileInView`/`animate` block anywhere in a section component, check whether `AnimationWrapper`'s five variants (`fade-up`, `fade`, `scale-in-settle`, `slide-in-left`, `slide-in-right`) already cover it. They cover every entrance pattern used sitewide today.
- **Every stagger uses `getStaggerDelay()`** (`src/lib/design-tokens.ts`). Never hardcode `index * 0.08` inline in a section — call the shared function so the 80ms-per-card/480ms-cap rule stays centralized.
- **Every parallax effect is `ParallaxLayer`.** Never write a new `useScroll`/`useTransform` pair for background drift — and never apply parallax to a section without a full-bleed/banner image (per [02-motion-system.md](02-motion-system.md) §4's rule of application — this is a rule about *where* to reuse it, not just *whether*).
- **`KineticHeadline`, `MagneticButton`, `CountUp`, `AnimatedDivider`, `ScrollProgressBar` each solve one distinct, narrow problem** that `AnimationWrapper` genuinely cannot (per-word text reveal, cursor-following drift, numeric roll-up, growing-rule, scroll-position indicator, respectively). If a new task's motion need matches one of these problems, reuse the existing primitive — do not write a parallel implementation because "it's just for this one section."
- If a task seems to need a *sixth* narrow motion primitive, that is the [11-ai-implementation-manual.md](11-ai-implementation-manual.md) §9 stop condition — confirm no combination of existing primitives achieves it first.

## 4. Never Duplicate Spacing Systems

- The 8px scale (8/16/24/32/48/64/96/128px) in [01-design-system.md](01-design-system.md) §3 is the only spacing vocabulary. Never write an arbitrary Tailwind spacing value (`p-[17px]`, `gap-[30px]`) — if the value you want isn't on the scale, the task requires picking the nearest scale value and flagging the discrepancy, not inventing a new number. `TestimonialCard`'s own doc comment is the model for this: the spec asked for 28px padding, which isn't on the scale, so the component snaps to the nearest token (24px) rather than introducing an off-scale one-off value.
- Section vertical rhythm always comes from `PageSection`'s `spacing` prop (`standard`/`compact`/`hero`) — never write inline `py-*` values on a section's outer element to achieve custom vertical rhythm.
- Container side padding always comes from `Container` — never reimplement the responsive padding scale inline (this was a real Version 1 defect in `Hero.tsx`, corrected in Version 2 per [hero-implementation-spec.md](sections/hero-implementation-spec.md) §5).

## 5. Never Duplicate Typography

- Every headline routes through `Heading`. Every label routes through `Eyebrow`. Every paragraph routes through `BodyText`. Never write `className="font-display text-4xl font-black"` inline on a raw tag — that bypasses the two-font enforcement `Heading` exists specifically to guarantee (see [01-design-system.md](01-design-system.md) §2's closed-rule framing and `Heading.tsx`'s own doc comment about the five-plus-competing-fonts problem this component was built to prevent).
- If a new headline context seems to need a size between existing `HeadingLevel`s, that's a signal to re-examine whether the new content genuinely needs distinct visual weight or whether an existing level (with different `as` semantic tag, if needed) already fits — adding a new `HeadingLevel` value is a [01-design-system.md](01-design-system.md) change, not a per-task styling choice.

## 6. Never Duplicate Layout Primitives

- `Container` is the only width/padding primitive. `PageSection` is the only section-wrapper primitive. `Grid` is the only fixed-column-grid primitive. `CardGrid` is the only swipeable-card-collection primitive.
- A new section should almost never need a bespoke top-level wrapper — it should be `<PageSection tone=... spacing=...>` containing a composition of `ui/`/`motion/` primitives, matching every existing section in `src/components/sections/`.

## 7. Always Extend Existing Primitives (Composition Over Forking)

The preferred order of operations when an existing component is *almost* right:

1. **Configuration** — does an existing prop, with a different value, already produce what's needed? (Most common case — e.g. `Card`'s `interactive={false}` for non-hover contexts, `AnimationWrapper`'s `variant` prop for a different entrance style.)
2. **New optional prop** — does the component need one new optional capability, with a default that preserves every existing consumer's behavior unchanged? (e.g. if a future section needed `Card` to support a fourth padding tier, add `padding?: "default" | "compact" | "loose"` rather than forking.)
3. **Composition at the call site** — can the new need be met by combining two existing components differently, without touching either's source? (e.g. `MagneticButton` wrapping a `ButtonLink` — neither component knows about the other.)
4. **New shared primitive** — only after 1–3 are exhausted, and only when the new need is genuinely reusable (not a one-off), build a new component in the correct layer per [13-dependency-graph.md](13-dependency-graph.md) §4, and add it to [12-component-map.md](12-component-map.md) once built.

Forking (copying a component's file, renaming it, modifying the copy) is not on this list. It is never the right first move.

## 8. Never Fork a Shared Component Unless Explicitly Instructed

"Fork" here means: copying `Card.tsx` to `Card2.tsx` (or inlining a modified copy of its JSX directly into a section) because a task's needs seem close-but-not-quite. This is prohibited by default because it immediately creates two sources of truth for one visual rule — the exact failure mode [00-design-principles.md](00-design-principles.md) and [01-design-system.md](01-design-system.md) exist to prevent (see `01-design-system.md`'s own framing: "Version 2 does not introduce new tokens, it defines new rules for combining the existing ones").

If a task's instructions explicitly say to fork (e.g. "duplicate `LocationCard` for a new one-off use that must never be affected by future `LocationCard` changes"), that is the one case where forking is correct — but this must be an explicit instruction from the task, never an inference you make on your own to avoid the extra step of adding a prop.

## 9. Reusable Patterns Already Present in This Project

Recognize these named patterns before treating a task as novel:

| Pattern | Where it lives | When it applies |
|---|---|---|
| Scroll-reveal entrance | `AnimationWrapper` | Any element that should animate in on scroll |
| Card-collection with mobile swipe | `CardGrid` | Any multi-card grid needing the tablet/desktop-grid + mobile-swipe-strip behavior |
| Full-bleed banner with scroll drift | `ParallaxLayer` + `Image` + gradient overlay `div` (see `Facilities.tsx`'s banner and `Programs.tsx`'s `TrainingBanner`) | Any section needing a dramatic mid-section photo banner — the composition is duplicated *intentionally* per section (no cross-section import, per [13-dependency-graph.md](13-dependency-graph.md) §3), but the *pattern* (which components combine, in what structure) should be copied faithfully, not reinvented |
| Eyebrow + Heading + Body header block | `SectionHeader` (or the hand-composed equivalent in `Hero.tsx`/`Programs.tsx` when each layer needs its own independent reveal timing) | The top of nearly every section |
| Disclosure (expand/collapse) with ARIA wiring | `Accordion` + `getDisclosureIds` | Any future expand/collapse UI (Tabs, additional accordions) |
| Real value always in the DOM, animation is decoration only | `CountUp`'s `sr-only` + `aria-hidden` split | Any future numeric or text value that animates in |
| Descriptive alt-text builder | `altText` helpers in `src/lib/a11y.ts` | Any new image needing programmatically-consistent alt text (program/trainer/location shapes) |
| Focal-point image crop override per content item | `ProgramCard`'s `focalPointOverrides` map | Any card component whose default center-crop clips some source photos — a per-slug override map, not a per-card special case |

## 10. How to Identify Reusable Code Before Writing New Code — Checklist

Run through this before writing any new component, style, or animation:

1. Search [12-component-map.md](12-component-map.md) for a component whose stated **Purpose** or **Responsibilities** overlaps the task.
2. If found, open its source file and read its actual props/behavior — confirm the map's summary still matches reality.
3. If it's close but not exact, apply §7's ordering (configuration → new prop → composition → only then new primitive).
4. If nothing overlaps, search `src/lib/design-tokens.ts` and `globals.css`'s `@theme` block for an existing value before introducing any new number.
5. Search sibling sections in `src/components/sections/` for a similar-looking composition (e.g. "does another section already combine `ParallaxLayer` + banner image the way I need?") — copy the *pattern*, never the *import* (§9, §13's no-cross-section-import rule).
6. Only after 1–5 turn up nothing: proceed to build new code, in the correct architectural layer per [13-dependency-graph.md](13-dependency-graph.md) §4.
