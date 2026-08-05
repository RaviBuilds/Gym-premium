# CLINE — Quick Reference

*A scannable lookup index for Cline. This file routes you to the right spec and surfaces the closed token sets so you don't re-read 20 files for every task. It is **not** a substitute for reading the governing section spec in full before implementing — always read the relevant section spec + its §15 (Design Rationale) and §16 (Implementation Notes for Gemini) before writing code. When this file and a source spec disagree, the source spec wins; fix this file.*

---

## 1. How to Use This File

1. Look up the value/rule you need in the tables below.
2. If a value exists here, use it verbatim — never invent.
3. Before coding, read the full governing section spec (`sections/*.md`) including §15/§16.
4. If a task isn't covered here or in a spec, that's a **stop condition** (§10 below), not an invitation to guess.

---

## 2. Reading Order (before writing any code)

Per `11-ai-implementation-manual.md §4` — read in this exact sequence:

1. `00-design-principles.md` — what V2 fixes; closed constraints
2. `01-design-system.md` — exact color/type/spacing/radius/elevation
3. `02-motion-system.md` — motion vocabulary + choreography tiers
4. `03-responsive-system.md` — breakpoints, grid, device-width table
5. `04-accessibility.md` — sitewide a11y rules
6. `12-component-map.md` — where responsibility already lives
7. `13-dependency-graph.md` — layer + dependency direction
8. `14-reuse-rules.md` — confirm nothing already does what you're about to build
9. `15-file-ownership.md` — which files you're allowed to touch
10. The specific `sections/*-implementation-spec.md` for your task
11. `16-implementation-playbook.md` — execution workflow + QA gates

---

## 3. Closed Token Sets (never invent outside these)

### 3.1 Color (`01 §1`)

| Token | Hex | CSS var | Use |
|---|---|---|---|
| Brand Yellow | `#FFDE01` | `--color-brand-yellow` | CTAs, key numbers, active states. Spotlight only — never >10% of viewport |
| Ink | `#14181D` | `--color-ink` | Dark section bg, primary text on light |
| Surface Light | `#FAF9F6` | `--color-surface-light` | Default page bg |
| Surface Card | `#FFFFFF` | `--color-surface-card` | Card bg on Surface Light |
| Border Subtle | `#E5E3DC` | `--color-border-subtle` | Card borders/dividers on light |
| Border Dark | `#2A2F36` | `--color-border-dark` | Dividers on dark sections |
| Text Primary | `#14181D` | `--color-text-primary` | Body copy on light |
| Text Secondary | `#5B6069` | `--color-text-secondary` | Supporting text on light |
| Text Primary Dark | `#FFFFFF` | `--color-text-primary-dark` | Body copy on dark |
| Text Secondary Dark | `#A8ACB3` | `--color-text-secondary-dark` | Supporting text on dark |
| Success | `#1E8E5A` | `--color-success` | Form success only |
| Warning | `#B7791F` | `--color-warning` | Non-blocking form warnings only |
| Error | `#C13B3B` | `--color-error` | Form validation errors only |
| WhatsApp Green | `#25D366` | `--color-whatsapp` | WhatsApp CTA only — the single deliberate palette exception |

**Contrast floor:** WCAG AA (4.5:1 body, 3:1 large ≥24px). Primary button text = Ink-on-Yellow (12:1+), never white-on-yellow.
**Depth overlays (NEW):** dark sections use Ink at reduced opacity as a directional gradient, never flat tint. Canonical Hero scrim: `linear-gradient(135deg, rgba(20,24,29,0.85) 0%, rgba(20,24,29,0.35) 55%, rgba(20,24,29,0.1) 100%)`.

### 3.2 Typography (`01 §2`)

Two families only: **Archivo Black** (`--font-display`, headlines only) + **Inter** (`--font-body`, everything else). Weights loaded: 900, 700, 600, 400.

| Role | Mobile | Desktop (`-lg`) | Weight | Line-height | Letter-spacing |
|---|---|---|---|---|---|
| Hero Display (homepage Hero only) | 44px (2.75rem) | 104px (6.5rem) | 900 | 1.1 / 1 | -0.02em / -0.03em |
| Hero Headline (other hero-scale) | 36px (2.25rem) | 64px (4rem) | 900 | 1.05 | -0.02em |
| Section Heading (H2) | 28px (1.75rem) | 48px (3rem) | 900 | 1.1 | -0.01em |
| Subsection Heading (H3) | 20px (1.25rem) | 28px (1.75rem) | 700 | 1.2 | normal |
| Eyebrow label | 13px (0.8125rem) | 14px (0.875rem) | 600 | 1.4 | 0.12em, uppercase |
| Body — large | 18px (1.125rem) | 20px (1.25rem) | 400 | 1.5 | normal |
| Body — standard | 16px (1rem) | 16px (1rem) | 400 | 1.6 | normal |
| Body — caption | 13px (0.8125rem) | 14px (0.875rem) | 400 | 1.5 | normal |
| Button label | 16px (1rem) | 16px (1rem) | 600 | 1 | 0.02em |
| Stat number | 28px (1.75rem) | 40px (2.5rem) | 900 | 1 | -0.01em |

**Rules:** One Hero Display per page (homepage only). One H2 per `PageSection`. Never skip a level. Eyebrows = only uppercase text. Buttons = sentence case / capitalize-first. Bold in body = sparing inline emphasis only.

### 3.3 Spacing (`01 §3`)

Base unit 8px. Full scale: **8 / 16 / 24 / 32 / 48 / 64 / 96 / 128px** (Tailwind `p-2/4/6/8/12/16/24/32`).

| Context | Desktop (≥1024) | Tablet (640–1023) | Mobile (<640) |
|---|---|---|---|
| Standard section vertical padding | 96px | 64px | 56px |
| Compressed section | 64px | 48px | 40px |
| Container side padding | 80px (≥1440) / 48px (1024–1439) | 24px | 16px |
| Max content width | 1280px | — | — |

**Compositional whitespace tier (NEW):** Hero, WhyInfiniti, Testimonials featured quotes may use 128px for internal element separation on desktop where V1 used 64/96px.

### 3.4 Radius & Elevation (`01 §4`)

| Element | Radius | Rule |
|---|---|---|
| Buttons, badges, dividers | 0px | Hard edge = action. Never rounded, no exceptions |
| Cards, content containers, images-in-cards | 6px (`--radius-card`) | Soft edge = content |

| Shadow | Value |
|---|---|
| Card resting | `0 2px 8px rgb(20 24 29 / 0.08)` |
| Card hover | `0 20px 40px rgb(20 24 29 / 0.2)` |
| Button resting | `0 4px 16px rgb(255 222 1 / 0.25)` |
| Button hover | `0 6px 20px rgb(255 222 1 / 0.35)` |

**Elevation tiers (NEW):** foreground layer in a parallax/banner composition may use Card Hover shadow at rest to read as physically closer than a background layer using Card Resting.

### 3.5 Motion Vocabulary (`02 §1`) — closed

| Token | Value |
|---|---|
| Fade-up distance | 24px vertical travel |
| Fade-up duration | 500ms |
| Fade-up easing | `[0.16, 1, 0.3, 1]` (ships as `motion.easeOut`) |
| Scroll trigger threshold | 20% into viewport (`amount: 0.2`) |
| Stagger per card | 80ms |
| Stagger cap | 6 cards / 480ms max |
| Counter duration | 1200ms, ease-out |
| Button press duration | 180ms |
| Parallax max drift (Hero) | 40px |
| Parallax max drift (Programs/Facilities banners) | 32px |
| Magnetic button max travel | 8px |

**Reduced motion (absolute):** every animated element collapses to instant final state under `prefers-reduced-motion: reduce`. Final DOM state must be present and correct with zero JS/animation dependency.

### 3.6 Iconography (`01 §5`)

Line icons, 2px stroke at 24×24 native. Sizes: 16/20/24/32px. 8px between icon and paired text. Color inherits context (Ink on light, White on dark); WhatsApp icon = WhatsApp Green. One library sitewide: `lucide-react` via the `Icon` component wrapper.

---

## 4. Choreography Tiers (`02 §2`)

| Tier | Sections | Character |
|---|---|---|
| **Tier 1 — Establishing** | Hero, TrustStrip | Fastest, most front-loaded. Sequenced load (Hero), fast stagger (TrustStrip) |
| **Tier 2 — Building** | Programs, WhyInfiniti, Facilities, TrainerShowcase, Locations | Standard fade-up/slide + exactly one depth cue each (parallax banner, directional slide, or stagger wave) |
| **Tier 3 — Peak** | Testimonials | Most choreographed after Hero. Pull-quotes use `scale-in-settle`, not plain fade-up |
| **Tier 4 — Resolving** | MembershipCta, Faq, FinalCta, Footer | Motion decreases. FinalCta = exactly one accent (primary-only pulse). FAQ/Footer = utility, not story |

**Rule:** a section's tier caps its motion complexity. Tier 4 must never out-animate Tier 3. Tier 2 gets exactly one depth cue, never more.

---

## 5. Responsive System (`03`)

### 5.1 Breakpoints (closed)

| Name | Range | Tailwind prefix |
|---|---|---|
| Mobile | 0–639px | (none / base) |
| Tablet | 640–1023px | `sm:` |
| Desktop | 1024–1439px | `lg:` |
| Large Desktop / Wide | 1440px+ | `wide:` |

### 5.2 Container & Grid

Max content width 1280px (`max-w-content`). Side padding: 80px wide / 48px desktop / 24px tablet / 16px mobile. Grid: 12 cols (24px gutter) desktop / 8 cols (20px) tablet / 4 cols (16px) mobile.

### 5.3 Breakpoint-Stepping Rule (NEW — V2 correction)

Any grid with ≥2 items must define an explicit tablet-tier column count at `sm:` (640px). May only skip `sm:` if content genuinely can't support an intermediate layout (rare — flag it explicitly).

**Flagged corrections:**
- **Locations:** add `sm:grid-cols-2` (was 1-col until `lg:`)
- **MembershipCta:** add `sm:grid-cols-2` intermediate (was 1→3 jump)

### 5.4 Device-Width Behavior

| Width | Class | Behavior |
|---|---|---|
| 320px | Smallest supported | Single col, 16px padding, mobile type scale, no overflow, buttons stack full-width |
| 375px | iPhone SE | Same as 320px |
| 390px | iPhone 12/13/14 | Mobile baseline for visual QA screenshots |
| 430px | iPhone Pro Max | Still mobile layout, only line-length increases |
| 768px | iPad portrait | Crosses into Tablet. 24px padding. `sm:` column counts apply |

**No-overflow rule:** `overflow-x: hidden` must never mask a layout mistake. Locations' `overflow-hidden` clips intentional slide-in travel only.

### 5.5 Touch Targets (closed)

Every interactive element ≥44×44px minimum, regardless of visual size. Extend hit area with padding if visual is smaller.

### 5.6 Card Grid Stepping (corrected)

| Section | Mobile | Tablet | Desktop |
|---|---|---|---|
| Programs | Swipeable strip ~1.2 cards | 2-col | 3×3 |
| Facilities icon grid | 1 col | 2 col | 3 col |
| TrainerShowcase | Swipeable 85% card | 2 col | 3 col |
| Testimonials featured | 1 col | 1 col | 2 col (exception — only 2 items) |
| Testimonials secondary | 1 col | 2 col | 3 col |
| MembershipCta | 1 col stacked | **2 col (corrected)** | 3 col |
| Locations | 1 col stacked | **2 col (corrected)** | 2 col |

---

## 6. Component Inventory (`12`)

Grouped by layer. "Must not modify" = the one-line hard rule.

### 6.1 Layout — `src/components/layout/`

| Component | Purpose | Must not modify |
|---|---|---|
| `Container` | Sole width + side-padding primitive | Padding scale / max-width without a `03` spec change |
| `PageSection` | Outer wrapper; owns vertical rhythm + tone | `toneStyles`/`spacingStyles` without a `01` update |
| `Grid` | Generic responsive CSS grid | `colSpanMap`/`gapStyles` without a `03` update |
| `Navbar` | Persistent header; permanently translucent | The permanent-translucent decision (not scroll-triggered) |
| `Footer` | Persistent footer; free-trial form + branch info | Real branch/contact data (owned by `config/site.ts`) |
| `StickyMobileCTA` | Fixed-bottom mobile action bar (3 equal actions) | The flat three-equal-actions treatment |

### 6.2 Motion — `src/components/motion/`

| Component | Purpose | Must not modify |
|---|---|---|
| `AnimationWrapper` | Generic scroll-triggered reveal (5 variants: `fade-up`, `fade`, `scale-in-settle`, `slide-in-left`, `slide-in-right`) | Variant timing/distance values without a `02` update |
| `ParallaxLayer` | Scroll-linked background drift (banners only) | Mobile/reduced-motion gating logic |
| `MagneticButton` | Cursor-following drift (≤8px, desktop pointer) | The 8px travel cap |
| `KineticHeadline` | Word-by-word masked reveal (peak headlines only) | Stagger/duration/easing values |
| `AnimatedDivider` | Rule that grows into place (scale 0→1) | N/A beyond shared tokens |
| `CountUp` | Numeric roll-up; real value in `sr-only`, animated digits `aria-hidden` | The dual-rendering accessibility pattern |
| `ScrollProgressBar` | Fixed-top scroll-depth indicator | Reduced-motion behavior (remove smoothing, not the bar) |

### 6.3 UI — `src/components/ui/`

| Component | Purpose | Must not modify |
|---|---|---|
| `Button`/`ButtonLink` | Sole button component (4 variants, 2 sizes) | 0px radius (hard edges = action) |
| `Card`/`CardMedia` | Base card geometry (6px radius, hover lift) | 6px radius (soft edges = content) |
| `Badge` | Labeled tag (3 variants) | Color+text pairing (never color alone) |
| `Icon` | `lucide-react` wrapper (4 sizes, scaled stroke) | Size/stroke-width map without a `01 §5` update |
| `Heading`/`Eyebrow`/`BodyText`/`SectionHeader` | Typography component set | `Eyebrow` tone-contrast logic (yellow-on-light fails WCAG) |
| `CardGrid` | Swipeable-mobile/grid-desktop card collection with stagger | Children-based (not render-prop) API |
| `Accordion` | Multi-open disclosure for FAQ | Multi-open (not exclusive) behavior |
| `FormField` (TextField/SelectField/CheckboxGroup) | Form primitives | Real-label requirement (never placeholder-only) |
| `TrialBookingForm` | Free-trial form in Footer | Don't wire to fabricated success — stub is intentional |
| `ProgramCard`/`TrainerCard`/`LocationCard`/`TestimonialCard`/`TestimonialPullQuote`/`PricingTierCard`/`PricingTeaserCallout`/`StatCounter` | Section-specific card renderers | See `12` per-component entries; `TestimonialPullQuote` no-Card treatment, `TrainerCard` no-zoom, `ProgramCard` always-visible CTA row |

### 6.4 Accessibility — `src/components/a11y/`

| Component | Purpose | Must not modify |
|---|---|---|
| `SkipLink` | Skip-to-main-content link | Target id (`#main-content`) without updating `layout.tsx` |
| `VisuallyHidden` | Screen-reader-only wrapper | N/A |
| `LiveRegion` | Announces dynamic content changes | N/A (reserved for future auto-advancing widgets) |

### 6.5 Sections — `src/components/sections/`

`Hero` (+ private `HeroScrollCue`), `TrustStrip`, `Programs` (+ private `TrainingBanner`), `WhyInfiniti`, `Facilities`, `TrainerShowcase`, `Testimonials`, `MembershipCta`, `Locations`, `Faq`, `FinalCta`. Each owns its own layout/composition/choreography. **No section-to-section imports, ever.**

### 6.6 Utility — `src/lib/`

| File | Purpose | Must not modify |
|---|---|---|
| `utils.ts` (`cn`) | Tailwind class-merging | Merge-precedence behavior |
| `design-tokens.ts` | TS mirror of `globals.css` tokens + `getStaggerDelay()` | Any value without a `globals.css`/`01` update first; never add `"use client"` |
| `a11y.ts` | `getDisclosureIds`, `slugify`, `altText` builders | `altText` builder shapes without an a11y review |
| `fonts.ts` | `next/font` loader (Archivo Black + Inter) | Loaded weight set without a perf check |
| `metadata.ts` | SEO/OG/Twitter metadata builder | — |
| `structured-data.ts` | JSON-LD `HealthClub` schema | Never fabricate business facts |

### 6.7 Config & Content

| File | Purpose |
|---|---|
| `config/site.ts` | Single source of truth: name, tagline, contact, branch data. Real data only |
| `config/nav.ts` | `primaryNav` — 6-item nav list shared by Navbar + Footer |
| `content/*.ts` (7 files) | Real copy per section. Never fabricated. Never edit as a side effect of a layout task |
| `types/content.ts` | Shape contracts (`Program`, `Trainer`, `Testimonial`, `LocationSummary`) |

---

## 7. Dependency Direction (`13 §6`)

| I am editing... | I may import from... | I may NOT import from... |
|---|---|---|
| A section (`sections/*.tsx`) | `ui/`, `layout/`, `motion/`, `a11y/`, `lib/`, `content/`, `config/`, `types/` | Any other file in `sections/` |
| A `ui/` component | `motion/`, `lib/`, `types/`, other `ui/` | `sections/`, `layout/` |
| A `layout/` component | `ui/`, `motion/`, `lib/`, `config/` | `sections/` |
| A `motion/` component | `lib/design-tokens.ts` only | `ui/`, `layout/`, `sections/`, `content/`, `config/` |
| An `a11y/` component | Nothing project-internal | Everything in `components/`, `sections/`, `content/` |
| A `lib/` file | `config/` (rare, metadata/structured-data only) | Anything in `components/` or `sections/` |
| A `content/` file | `types/` (type-only) | Everything else |
| A `config/` file | Nothing | Everything else |

**Forbidden shortcuts:** `ui/` → `sections/`; `motion/` → `ui/`/`content/`; section → section; `lib/` → `components/`; `content/` ↔ `config/`.

---

## 8. File Ownership (compressed — see `15` for full detail)

| File | Owns | Must never touch without explicit instruction |
|---|---|---|
| `app/layout.tsx` | Root HTML shell, chrome assembly order | Any section/component internals |
| `app/page.tsx` | Homepage section assembly order | Any section internals |
| `sections/*.tsx` | Own layout, composition, choreography, content wiring | Shared component internals; other sections; real content in `content/*.ts` |
| `layout/{Container,PageSection,Grid}` | Literal responsive-system values | Padding/max-width/col-count without a `03` change |
| `layout/{Navbar,Footer,StickyMobileCTA}` | Own persistent-chrome markup | Real contact/branch/nav data (owned by `config/`) |
| `motion/*.tsx` | Own animation mechanism | Closed motion vocabulary without a `02` update |
| `ui/*.tsx` | Own closed visual vocabulary + public API | Existing prop type/default/removal without full consumer audit; `Button` 0px radius; `Card` 6px radius; `TestimonialPullQuote` no-Card; `TrainerCard` no-zoom; `Eyebrow` tone logic |
| `a11y/*.tsx` | Cross-cutting a11y utility | `SkipLink` target id without updating `layout.tsx` |
| `lib/utils.ts` | `cn` merge behavior | Merge-precedence |
| `lib/design-tokens.ts` | TS token mirror + `getStaggerDelay()` | Values without `globals.css`/`01` first; never `"use client"` |
| `lib/a11y.ts` | Disclosure ids, slugify, altText builders | `altText` shapes without a11y review |
| `config/site.ts` | Real business identity/contact/branch data | Speculatively "fixing" values without confirming with task source |
| `config/nav.ts` | `primaryNav` 6-item list | — (affects both Navbar + Footer simultaneously) |
| `content/*.ts` | Real copy for one section | Shape of exported data without coordinated type + consumer update |
| `types/content.ts` | Shape contracts | In isolation — only as part of coordinated type+content+consumer change |
| `specifications/` | Design/behavior source of truth | Never, as part of an implementation task — flag gaps, don't edit |

---

## 9. Per-Section Quick Index

| Section | Tier | Source file | Spec file | Top V2 corrections |
|---|---|---|---|---|
| Hero | 1 | `Hero.tsx` | `hero-implementation-spec.md` | Use `Container` (not hand-rolled padding); nest zoom+parallax in two layers; consolidate 4 overlay divs → 1 gradient div; monotonic spacing gaps; replace `/` separators with `•` |
| TrustStrip | 1 | `TrustStrip.tsx` | `truststrip-implementation-spec.md` | Add `sm:grid-cols-4` (was 2×2 until `lg:`); remove hover lift on static stats; sync `CountUp` threshold to 0.2; `aria-hidden` on `AnimatedDivider`; consolidate bg layers |
| Programs | 2 | `Programs.tsx` | `programs-implementation-spec.md` | Lock card ratio 4:5 at all breakpoints; left-align header at all breakpoints; featured glow = single pulse (not infinite); hover zoom 1.08→1.04; unify stagger 0–8 across both rows; `TrainingBanner` heading `p`→`h3`; touch `active:` feedback |
| WhyInfiniti | 2 | `WhyInfiniti.tsx` | `whyinfiniti-implementation-spec.md` | 7/5 two-column split at `lg:` (not centered single col); headline → `KineticHeadline`; pricing callout as bordered block on desktop |
| Facilities | 2 | `Facilities.tsx` | `facilities-implementation-spec.md` | Left-align header at all breakpoints; directional gradient on banner (not flat tint); icon background chips; add Ghost CTA link to `/pricing`; mobile gap 32→24px; confirm amenity titles are `h3`; 32px parallax on banner |
| TrainerShowcase | 2 | `TrainerShowcase.tsx` | `trainershowcase-implementation-spec.md` | Wrap `SectionHeader` in `AnimationWrapper`; add `Badge(variant="informational")` to all 6 cards (Wajeed's stays achievement-style); touch `active:` underline feedback |
| Testimonials | 3 | `Testimonials.tsx` | `testimonials-implementation-spec.md` | Wrap featured quotes in `bg-brand-yellow/[0.04]` tint block; `sm:grid-cols-2` for featured row; center/span 5th secondary card; unify stagger 0–7 across featured+secondary+CTA; `mt-8` before CTA |
| MembershipCta | 2 | `MembershipCta.tsx` | `membershipcta-implementation-spec.md` | Widen `max-w-2xl`→`max-w-4xl` (unconstrained at `wide:`); Best-Seller border+tint; `sm:grid-cols-2` intermediate; restore `interactive={true}`; lead with Yearly on mobile; inline price-unit suffixes |
| Locations | 2 | `Locations.tsx` | `locations-implementation-spec.md` | Add `sm:grid-cols-2` (was 1-col until `lg:`); add supporting `body` sentence to `SectionHeader`; keep hover lift (cards are links) |
| Faq | 4 | `Faq.tsx` | `faq-implementation-spec.md` | Widen `max-w-2xl`→`max-w-3xl`; add top/bottom border framing; chevron color change on open (yellow); keep single-block reveal (no per-item stagger — Tier 4) |
| FinalCta | 4 | `FinalCta.tsx` | `finalcta-implementation-spec.md` | Size-differentiate CTAs (primary standard, secondary/tertiary `compact`); radial yellow glow behind headline; pulse on primary only |
| Navbar/Footer/StickyCTA | 4 | `Navbar.tsx`/`Footer.tsx`/`StickyMobileCTA.tsx` | `navbar-footer-implementation-spec.md` | Navbar: current-route persistent underline, hamburger resting affordance, fix duplicate `aria-label="Primary"`; Footer: `sm:grid-cols-2` for top split, "Sign Up" heading `section`→`subsection`, single `AnimationWrapper fade` entrance; StickyCTA: no changes |

---

## 10. Stop Conditions (`11 §9`)

Stop and surface the issue rather than proceeding when:

- A section spec references a value, component, or file that does not exist in the current codebase.
- Two specs give contradictory instructions for the same element.
- A task requires a new color, font, spacing value, or motion timing not already present in `01`/`02`.
- A task would require deleting or renaming a shared component's public prop that other consumers rely on.
- A task has no corresponding spec anywhere in `/specifications` and isn't a straightforward bug fix (typo, broken link, build error).

**Flagging a gap is the correct outcome** — this project prefers a known gap over an unreviewed guess.

---

## 11. QA Gates (`16 §7`) — all binary

| Gate | Pass condition |
|---|---|
| Typecheck | Zero compiler errors |
| Lint | Zero lint errors |
| Build | Succeeds with zero errors |
| Visual | Every relevant `qa/visual-checklist.md` row true at all 7 widths (320/375/390/430/768/1366/1920px) |
| Motion | Every relevant `qa/motion-checklist.md` row true, including full reduced-motion pass |
| Accessibility | Every relevant `qa/accessibility-checklist.md` row true |
| Performance | Every relevant `qa/performance-checklist.md` row true |
| Regression | No sibling section or shared-component consumer visibly changed unintentionally |
| Scope | No file outside the task's stated ownership boundary was modified |

**QA run order:** Typecheck → Lint → Build → Visual → Responsive → Motion → Accessibility → Performance.

---

## 12. Reuse Rules — Short (`14`)

**Core rule:** Before writing any new component/markup/animation/style, prove nothing in `src/components/`, `src/lib/`, or `globals.css`'s token set already does the job.

**Never duplicate:**
- **Components:** `Button`/`ButtonLink`, `Card`/`CardMedia`, `Badge`, `Icon`, `Heading`/`Eyebrow`/`BodyText`/`SectionHeader` are the only sanctioned implementations. Compose `Card` directly for new content types — don't fork.
- **Animations:** Every scroll-reveal = `AnimationWrapper`. Every stagger = `getStaggerDelay()`. Every parallax = `ParallaxLayer` (banners only). `KineticHeadline`/`MagneticButton`/`CountUp`/`AnimatedDivider`/`ScrollProgressBar` each solve one distinct problem — reuse, don't parallel-implement.
- **Spacing:** 8px scale only. No arbitrary `p-[17px]`. Section rhythm via `PageSection` `spacing` prop. Side padding via `Container`.
- **Typography:** Every headline → `Heading`. Every label → `Eyebrow`. Every paragraph → `BodyText`. Never hand-roll `font-display text-4xl font-black` on a raw tag.
- **Layout:** `Container` (width/padding), `PageSection` (section wrapper), `Grid` (fixed columns), `CardGrid` (swipeable card collection). No bespoke top-level wrappers.

**Extend-don't-fork ordering (when an existing component is almost right):**
1. Configuration (existing prop, different value)
2. New optional prop (default preserves existing behavior)
3. Composition at the call site (combine two existing components)
4. New shared primitive (only after 1–3 exhausted; place in correct layer per `13 §4`; document in `12`)

**Forking (copy + rename + modify) is never the right first move.**

---

*End of quick reference. When a value here and a source spec disagree, the source spec wins — fix this file.*