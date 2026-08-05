# 02 — Motion System (Version 2)

*The single most important change from Version 1. Version 1 has one motion pattern (`AnimationWrapper` fade-up) applied almost everywhere. Version 2 keeps that pattern as the baseline and adds tiered choreography plus continuous scroll behavior so the page's emotional arc (stated in `docs/Visual-Design-Specification.md` §1: curiosity → credibility → recognition → conviction → belief → decision → action) is expressed in motion, not just copy.*

---

## 1. Core Vocabulary (unchanged — Version 1 baseline, kept)

| Token | Value |
|---|---|
| Fade-up distance | 24px vertical travel |
| Fade-up duration | 500ms |
| Fade-up easing | `[0.16, 1, 0.3, 1]` (ease-out, ships as `motion.easeOut` in `design-tokens.ts`) |
| Scroll trigger threshold | 20% into viewport (`amount: 0.2` in Framer Motion `whileInView`) |
| Stagger per card | 80ms |
| Stagger cap | 6 cards / 480ms max (cards beyond 6 animate simultaneously at the capped delay) |
| Counter duration | 1200ms, ease-out |
| Button press duration | 180ms |
| Parallax max drift (Hero, legacy) | 40px total across scrollable hero height |
| Magnetic button max travel | 8px cursor-following |

These durations/easings/distances are **closed** — do not invent new numbers. Version 2's job is *choreography* (which elements get which treatment, in what order, at what intensity) and *scroll depth* (continuous, not just entrance), not new timing primitives.

## 2. Choreography Tiers

Every section is assigned one of three motion tiers based on its position in the emotional arc. This replaces Version 1's uniform "everything fades up the same way" with deliberate escalation and de-escalation.

| Tier | Sections | Character |
|---|---|---|
| **Tier 1 — Establishing** | Hero, TrustStrip | Fastest, most front-loaded. Sequenced load animation (Hero only), fast staggered reveal (TrustStrip). Sets pace, doesn't linger. |
| **Tier 2 — Building** | Programs, WhyInfiniti, Facilities, TrainerShowcase, Locations | Standard scroll-triggered fade-up/slide, one added depth cue per section (parallax banner, directional slide, or card-stagger wave) — present but not the emotional peak. |
| **Tier 3 — Peak** | Testimonials | The single most deliberately choreographed section on the page after Hero. Pull-quotes get a distinct, weightier entrance (scale-in-settle) than any other content type sitewide. This is intentional and must not be diluted to match Tier 2's restraint. |
| **Tier 4 — Resolving** | MembershipCta, Faq, FinalCta, Footer | Motion *decreases* again — FAQ and Footer are utility, not story; FinalCta gets exactly one deliberate accent (button pulse) and nothing more. A busy Footer animation would undercut the calm, confident close the brand goal requires. |

**Rule:** a section's tier caps its motion complexity. Tier 4 sections must never out-animate Tier 3. Tier 1/2 sections must never feel static relative to their neighbors — if a Tier 2 section currently has zero depth cue beyond entrance fade, Version 2 adds exactly one (specified per-section), never more than one.

## 3. Entrance Timing (unchanged pattern, reference table)

| Element | Delay after trigger | Duration |
|---|---|---|
| Eyebrow | 0ms | 400ms |
| Heading | 100ms | 500ms |
| Supporting body text | 200ms | 500ms |
| First card in a grid | 300ms | 500ms |
| Each subsequent card | +80ms stagger (capped at 480ms total) | 500ms each |

## 4. Scroll Depth (NEW — Version 2's primary structural addition)

Version 1 has scroll-triggered *entrance* (elements appear once, then are static) and exactly one continuous scroll effect (Hero's `ParallaxLayer` background drift, ≤40px). Version 2 extends continuous scroll response to every section that carries a background image or banner, using the same `ParallaxLayer` primitive already in the codebase — no new dependency, no new component, just broader application of what exists.

**Rule of application:** a section gets scroll-linked parallax **only if it already has a full-bleed or banner-style image** (Hero, Programs' `TrainingBanner`, Facilities' photo banner). Sections that are pure card grids or text (TrustStrip, WhyInfiniti, Testimonials, Faq, MembershipCta) do **not** get parallax — introducing background motion where there is no background image would be motion for its own sake, which [00-design-principles.md](00-design-principles.md) §3 explicitly rules out.

| Section | Scroll behavior | Max drift | Layer |
|---|---|---|---|
| Hero | Background image drifts opposite scroll direction (existing `hero-zoom` keyframe stays as-is; parallax drift is the new addition layered on top) | 40px (unchanged) | Background photo only — text layer is scroll-locked, never drifts |
| Programs — `TrainingBanner` | Banner image drifts at 0.5x scroll speed relative to the page (foreground cards scroll at 1x, banner lags) | 32px | Banner background only |
| Facilities — photo banner | Same 0.5x lag treatment as Programs' banner | 32px | Banner background only |

**Depth composition rule:** where a banner sits behind foreground content (a headline, a card grid edge), the foreground content's shadow uses the "foreground elevation tier" defined in [01-design-system.md](01-design-system.md) §4 — the shadow difference plus the speed difference together sell the depth; neither alone is enough.

**Exit transitions:** no section has a bespoke scroll-out animation (elements simply scroll out of viewport normally) — Version 1's absence of exit transitions is correct and stays. Adding exit animation on every section would be exactly the "gratuitous motion" [00-design-principles.md](00-design-principles.md) warns against.

## 5. Reduced Motion (closed rule, restated for completeness)

Every instruction above collapses to an instant, final-state appearance under `prefers-reduced-motion: reduce`:
- No fade, no slide, no scale-in, no parallax drift, no counter roll-up (final number renders immediately), no button pulse, no hero-zoom.
- Final DOM state (text content, final numeric values, final image position) must be present and correct with zero JS/animation dependency — screen readers and reduced-motion users never wait on or infer content from an animation.
- Implementation pattern already exists sitewide (`AnimationWrapper`'s internal `useReducedMotion` check + the CSS defense-in-depth block in `globals.css`). Version 2 adds scroll-linked parallax (§4) to this same gate — parallax `ParallaxLayer` instances must respect the identical reduced-motion check already used by the Hero's existing parallax, applied consistently to the two new banner instances.

## 6. Motion Decision Table (quick reference for Gemini)

| Question | Answer |
|---|---|
| Does this section have a full-bleed/banner photo? | Yes → apply §4 parallax at the specified drift. No → entrance-only, no parallax. |
| What tier is this section? | Check §2's table — caps motion complexity. |
| Is this a card grid? | Apply §3's stagger table, capped per §1. |
| Is this the Testimonials featured pull-quote? | Use the Tier 3 scale-in-settle treatment — the one deliberately "loudest" entrance sitewide, per §2. |
| Does `prefers-reduced-motion` apply? | Always check — §5 is never optional. |
