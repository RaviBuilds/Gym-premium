# 00 — Design Principles (Version 2)

*Applies to every document in `/specifications`. Read this first — every section-level spec inherits these rules and will reference them by name instead of repeating them.*

---

## 1. What Version 2 Is Fixing

Version 1 (the current build) is well-engineered and already spec-driven — `docs/Visual-Design-Specification.md` and `docs/Homepage-Architecture.md` established a real system (yellow-on-ink brand, Archivo Black + Inter, 8px spacing scale, fade-up motion vocabulary, `AnimationWrapper` primitives) and the code follows it faithfully. It is a solid, professional implementation.

It is not yet an Awwwards-tier implementation. The gap is not visual language — the palette, type pairing, and photography direction are already right. The gap is **depth, pacing, and confidence**:

- Motion is uniform. Nearly every section reveals with the same fade-up/24px/500ms pattern regardless of that section's emotional weight in the story. A premium site is *not* isotropic — the Hero and Testimonials should feel materially more choreographed than the FAQ or Footer.
- Scroll is passive. Elements appear once and sit still. Nothing in the current build responds continuously to scroll position (no parallax depth beyond the Hero, no scroll-linked reveals, no sense that the page has a spatial quality, not just a vertical list of cards).
- Whitespace is functional, not compositional. Section padding follows the spacing scale correctly, but within sections, layouts default to centered/symmetric grids rather than the asymmetric, editorial compositions that separate Apple/Nike/Linear from a well-built template.
- CTA hierarchy is declared but not enforced with enough visual force. Multiple sections present 2–3 buttons at near-equal visual weight (Section 5 rationale exists in the current spec but the built primary/secondary contrast is a color swap, not a scale/weight swap).

Version 2 keeps every token, every brand color, every piece of real content exactly as-is. It changes **choreography, composition, and hierarchy contrast** — the things that separate "correctly implemented" from "impossible to look away from."

## 2. Non-Negotiable Constraints

These carry forward from Version 1 and are **not** open for revision in any section spec:

1. **Color system is closed.** `#FFDE01` (Brand Yellow), `#14181D` (Ink), and the neutral/semantic tokens in [01-design-system.md](01-design-system.md) are the complete palette. No section spec may introduce a new hue.
2. **Type pairing is closed.** Archivo Black (display) + Inter (body). No new typeface, no new weight beyond what's already loaded (900, 700, 600, 400).
3. **Radius law is closed.** Buttons/badges/dividers = 0px (hard edges = action). Cards/content containers = 6px (soft edges = content). This distinction is a brand signature, not a style choice — never blur it, never make an exception.
4. **8px spacing scale is closed.** 8/16/24/32/48/64/96/128. Any new spacing value proposed in a section spec must be justified against this scale or rejected.
5. **Primary Yellow is a spotlight, not a wash.** If a proposed change pushes solid yellow past ~10% of any viewport, it is overused — flag it, don't ship it.
6. **Real content only.** No invented copy, no invented stats, no placeholder Latin. Every section spec pulls copy from the existing `src/content/*.ts` files or the current component source, never fabricated.
7. **`prefers-reduced-motion` is absolute.** Every motion instruction in every section spec must state its reduced-motion fallback in the same breath, not as an afterthought.

## 3. What "Premium" Means Here, Concretely

Not decoration — restraint with intention. Four testable qualities, all borrowed from the reference brands named in the brief:

| Quality | What it looks like in this codebase | Reference |
|---|---|---|
| **Confident whitespace** | Content blocks given more room to breathe than feels "efficient" — negative space is a design element, not leftover space after content is placed. | Apple, Linear |
| **Purposeful asymmetry** | Section compositions that use an editorial 7/5 or 8/4 column split rather than a centered 12-col grid by default, when the content has a clear primary/secondary relationship (headline + supporting proof, photo + copy). | Nike, Porsche |
| **Scroll as a spatial dimension** | Parallax depth and scroll-linked reveals used consistently (not just in the Hero) so scrolling feels like moving through a considered space, not flipping through stacked cards. | Apple product pages, On Running |
| **Escalating choreography** | Motion complexity/weight increases toward the sections carrying the most emotional or conversion weight (Hero → Testimonials → Final CTA), and *decreases* for utility sections (FAQ, Footer) — matching the existing "curiosity → conviction → action" arc already named in `Visual-Design-Specification.md` §1, but expressed more deliberately in the motion design itself, not just the content. | Stripe, Linear |

Every improvement proposed in a section spec must trace back to one of these four qualities, or to a stated conversion/usability fix (see [15. Design Rationale] fields in each section doc). No change is made "because it looks cooler."

## 4. Document Map

```
/specifications
├── 00-design-principles.md       ← this file
├── 01-design-system.md            Color, type, spacing, radius, elevation, iconography — exact values
├── 02-motion-system.md            The full motion vocabulary: easing curves, durations, triggers, choreography tiers
├── 03-responsive-system.md        Breakpoints, grid behavior, container widths, touch targets
├── 04-accessibility.md            Sitewide a11y rules inherited by every section
├── sections/
│   ├── navbar-footer-implementation-spec.md
│   ├── hero-implementation-spec.md
│   ├── truststrip-implementation-spec.md
│   ├── programs-implementation-spec.md
│   ├── whyinfiniti-implementation-spec.md
│   ├── facilities-implementation-spec.md
│   ├── trainershowcase-implementation-spec.md
│   ├── testimonials-implementation-spec.md
│   ├── membershipcta-implementation-spec.md
│   ├── locations-implementation-spec.md
│   ├── faq-implementation-spec.md
│   └── finalcta-implementation-spec.md
└── qa/
    ├── visual-checklist.md
    ├── motion-checklist.md
    ├── accessibility-checklist.md
    └── performance-checklist.md
```

Each section spec is self-contained per the 16-part structure below, but assumes the reader (Gemini, or any implementing engineer) has already read `00`–`04`. Section specs reference these system docs by number (e.g. "per §2.3 of 02-motion-system.md") rather than restating shared rules.

## 5. How To Read a Section Spec

Sections 1–4 (Purpose, Philosophy, Storytelling, Hierarchy) are **decisions**, not implementation detail — read them to understand *why* before touching *what*.

Sections 5–8 (Desktop/Tablet/Mobile Layout, Spacing System) are **exact values** — no ambiguity is intentional; if a value seems oddly specific, it's because a vaguer instruction would have left room for a wrong guess.

Sections 9–11 (Motion, Scroll, Micro-interactions) are **exact behavior** — treat these like an animation timing sheet, not inspiration.

Sections 12–14 (Accessibility, Performance, Acceptance Criteria) are **gates**, not suggestions — a section that fails any Acceptance Criteria item is not done, regardless of how it looks.

Sections 15–16 (Rationale, Implementation Notes) are **for Gemini specifically** — read these last, right before writing code.
