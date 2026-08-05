# 13 — Dependency Graph

*Architectural layering rules for `src/`. This document governs *direction of dependency*, not component behavior — for what each component does, see [12-component-map.md](12-component-map.md). For file-level ownership boundaries, see [15-file-ownership.md](15-file-ownership.md).*

---

## 1. The Layer Stack

```
Application            src/app/ (layout.tsx, page.tsx)
        ↓
Sections                src/components/sections/
        ↓
Shared Components        src/components/ui/
        ↓
Layout Components        src/components/layout/
        ↓
Motion Components         src/components/motion/
        ↓
UI Primitives (base)       Button, Card, Icon, Heading — the leaf-level ui/ exports
        ↓
Utilities                    src/lib/
        ↓
Content                        src/content/, src/types/
        ↓
Configuration                    src/config/
```

This is a simplification for readability — in the real dependency graph, `ui/` components depend on `motion/` (e.g. `Card` and `Button` use `framer-motion` directly; `CardGrid` composes `AnimationWrapper`), and `layout/` components depend on `ui/` (`Navbar` uses `ButtonLink`/`Icon`; `Footer` uses `Heading`/`BodyText`/`TrialBookingForm`). Read the stack above as an *ordering* of "what may depend on what," not as strictly separate non-overlapping tiers. The precise rule is stated in §2.

## 2. Dependency Rules

A module may depend on (import from) any layer **below** it in the stack, and must never depend on a layer **above** it.

| Layer | May depend on | Must never depend on |
|---|---|---|
| `src/app/` | Everything below | Nothing (it's the top) |
| `src/components/sections/` | `ui/`, `layout/`, `motion/`, `a11y/`, `lib/`, `content/`, `config/`, `types/` | Other files in `sections/` (sections are siblings — one section must never import another section's component; see §5) |
| `src/components/ui/` | `motion/`, `lib/`, `types/`, `config/` (rare) | `sections/`, `layout/` |
| `src/components/layout/` | `ui/`, `motion/`, `lib/`, `config/` | `sections/` |
| `src/components/motion/` | `lib/` (specifically `design-tokens.ts`) | `ui/`, `layout/`, `sections/`, `content/` |
| `src/components/a11y/` | Nothing below it except React itself | `ui/`, `layout/`, `sections/`, `motion/`, `content/` |
| `src/lib/` | Nothing project-internal except `src/config/` where explicitly needed (e.g. `structured-data.ts`/`metadata.ts` depend on `config/site.ts`) | `ui/`, `layout/`, `motion/`, `sections/` |
| `src/content/` | `src/types/` (for type annotations only) | Everything else |
| `src/config/` | Nothing project-internal | Everything else |
| `src/types/` | Nothing | Everything else |

## 3. Forbidden Dependency Directions

These are the specific violations to watch for, because they are the most tempting shortcuts under time pressure:

- **A `ui/` component importing from `sections/`.** This would invert the whole hierarchy — `ui/` primitives must stay section-agnostic so any section can reuse them. If a card component needs section-specific behavior, that behavior belongs in the section, passed down as props/content, not pulled up into the primitive.
- **A `motion/` component importing from `ui/` or `content/`.** Motion primitives (`AnimationWrapper`, `ParallaxLayer`, etc.) are pure behavior wrappers — they know nothing about cards, buttons, or program data. `CardGrid` is the boundary that combines a `ui/` layout pattern with a `motion/` behavior; the motion primitives themselves stay content-blind.
- **One section importing another section's component.** `Programs.tsx` must never import anything from `Facilities.tsx`, even though both use the identical `ParallaxLayer` banner pattern. Shared behavior between sections belongs in `motion/`/`ui/`/`layout/`, not borrowed sibling-to-sibling. (Programs' `TrainingBanner` and Facilities' banner independently compose the same `ParallaxLayer` + `Image` + overlay pattern — this duplication-of-composition is correct; a shared *import* between the two section files would not be.)
- **`lib/` depending on `components/` of any kind.** `design-tokens.ts` and `a11y.ts` must stay framework-view-agnostic — they're plain functions/constants consumable by both Server and Client Components, and by both `.tsx` and non-React code. A dependency on any component would make that impossible and would risk a "use client" directive propagating somewhere it shouldn't (see `design-tokens.ts`'s own doc comment on exactly this risk with `getStaggerDelay`).
- **`content/` files importing `config/` or vice versa.** These are two independent sources of truth — business-identity data (`config/site.ts`, `config/nav.ts`) and per-section content arrays (`content/*.ts`) — and must not cross-reference each other. If a content file needs a site-wide value (e.g. a branch name), that's a signal the value belongs in a shared type or should be passed at the section level, not imported directly between these two directories.

## 4. Ownership Boundaries

- **`src/app/`** owns route composition and root-level chrome assembly (which sections render, in what order, plus the persistent Navbar/Footer/StickyMobileCTA/SkipLink/ScrollProgressBar). It does not own any component's internal behavior.
- **`src/components/sections/`** owns per-section composition, choreography sequencing (which `AnimationWrapper` variant, what delay, in what order), and content-to-component wiring. It does not own shared visual primitives — a section must never redefine what a `Card` or `Button` looks like inline.
- **`src/components/ui/`** owns the closed visual vocabulary (color/type/spacing/radius rendering) for every reusable content shape. It does not own scroll-triggered behavior beyond composing `motion/` primitives (e.g. `CardGrid` wraps children in `AnimationWrapper`, but does not define `AnimationWrapper`'s own timing).
- **`src/components/layout/`** owns page-level structural chrome (`Container`, `PageSection`, `Grid`) and the three persistent global elements (`Navbar`, `Footer`, `StickyMobileCTA`). It does not own per-section content composition.
- **`src/components/motion/`** owns every animation *mechanism* (how a fade-up, parallax, or count-up actually works) but never *which* section uses which mechanism or when — that choreography decision lives in `sections/`.
- **`src/components/a11y/`** owns cross-cutting accessibility utilities that don't belong to any single component. It has no dependencies on anything else in `components/`, by design — this keeps it trivially safe to import from anywhere without circular-dependency risk.
- **`src/lib/`** owns pure, environment-agnostic logic and the canonical mirror of design values that must stay in sync with `globals.css`.
- **`src/content/`** owns real business copy/data per section. **`src/config/`** owns real business identity/contact data shared across multiple sections and metadata.
- **`src/types/`** owns the shape contracts that let content and components agree on data structure without a runtime dependency between them.

## 5. Architectural Constraints

- **No section-to-section imports, ever.** Sections are independent leaves of the tree from each other's perspective, even when they share a visual pattern (see §3's Programs/Facilities banner example). If two sections need genuinely identical *new* behavior, extract it into `ui/`, `layout/`, or `motion/` as a new shared primitive — don't reach sideways.
- **Client/Server boundary respected by directory, not by convention alone.** Every file with a `"use client"` directive is either in `motion/` (nearly all of it, since animation requires browser APIs/hooks) or is a narrowly-scoped interactive leaf inside `ui/`/`layout/` (`Button`, `Navbar`, `Accordion`, `TrialBookingForm`, `FormField`, `HeroScrollCue`). Section components (`sections/*.tsx`) are Server Components by default and must stay that way — if a section needs client-only behavior, isolate it into its own small client sub-component (the `HeroScrollCue` pattern) rather than marking the whole section file `"use client"`. This is a hard performance constraint, not a style preference — see [00-design-principles.md](00-design-principles.md) and each section spec's Performance Constraints section.
- **`design-tokens.ts` has no `"use client"` directive and must never acquire one.** It is imported by both Server Components (sections mapping content into staggered JSX) and Client Components (`AnimationWrapper` itself). Adding any hook or browser API to this file would make every Server Component importing it fail to compile, per the file's own doc comment on `getStaggerDelay`.
- **A new component's directory placement is a real architectural decision, not a filing convenience.** Before adding a new file, check [14-reuse-rules.md](14-reuse-rules.md) first (is a new component even needed), then place it according to §4's ownership boundaries above — a component that renders visual content goes in `ui/`; a component that only adds motion behavior to existing content goes in `motion/`; a component that structures page-level chrome goes in `layout/`.
- **Configuration and content never contain JSX or component imports.** `src/config/*.ts` and `src/content/*.ts` are plain data modules. If a value needs to render differently depending on context, that logic belongs in the consuming component, not in the data file.

## 6. Quick Reference — "Can I Import This?"

| I am editing... | I may import from... | I may NOT import from... |
|---|---|---|
| A section (`sections/*.tsx`) | `ui/`, `layout/`, `motion/`, `a11y/`, `lib/`, `content/`, `config/`, `types/` | Any other file in `sections/` |
| A `ui/` component | `motion/`, `lib/`, `types/`, other `ui/` components (e.g. `ProgramCard` imports `Card`, `Badge`, `Heading`, `Icon`) | `sections/`, `layout/` |
| A `layout/` component | `ui/`, `motion/`, `lib/`, `config/` | `sections/` |
| A `motion/` component | `lib/design-tokens.ts` only | `ui/`, `layout/`, `sections/`, `content/`, `config/` |
| An `a11y/` component | Nothing project-internal | Everything in `components/`, `sections/`, `content/` |
| A `lib/` file | `config/` (rare, metadata/structured-data only) | Anything in `components/` or `sections/` |
| A `content/` file | `types/` (type-only) | Everything else |
| A `config/` file | Nothing | Everything else |
