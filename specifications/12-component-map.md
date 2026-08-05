# 12 — Component Map

*A complete inventory of every reusable component in `src/components/`, plus the configuration/content/utility modules sections depend on. Values, timings, and colors referenced below are defined once in [01-design-system.md](01-design-system.md)/[02-motion-system.md](02-motion-system.md) — not repeated here. Use this document to answer "where does responsibility for X already live" before writing anything new; cross-reference [14-reuse-rules.md](14-reuse-rules.md) for the policy this map exists to support, and [15-file-ownership.md](15-file-ownership.md) for what each file may/must-not modify.*

---

## How to Read This Document

Each entry states: **Category**, **Purpose**, **Responsibilities**, **Public API**, **Dependencies**, **Consumers**, **Reusable by**, **Must not modify**, **Related documentation**. "Consumers" lists files that currently import the component — treat this as a starting point, not ground truth; grep the live codebase before changing a public API (see [11-ai-implementation-manual.md](11-ai-implementation-manual.md) §12).

---

## Layout Components — `src/components/layout/`

### Container (`Container.tsx`)
- **Category:** Layout
- **Purpose:** The sole horizontal width + side-padding primitive sitewide.
- **Responsibilities:** Caps content at `max-w-content` (1280px) when `width="content"`; applies the responsive side-padding scale (16/24/48/80px) via Tailwind's `px-4 sm:px-6 lg:px-12 wide:px-20`.
- **Public API:** `children`, `className?`, `as?: ElementType` (default `div`), `width?: "content" | "full"` (default `content`).
- **Dependencies:** `cn` (`src/lib/utils.ts`).
- **Consumers:** `PageSection` (internally, when `bleed="full"`), `Navbar`, `Footer`, `Hero` (via `PageSection`), every section indirectly through `PageSection`.
- **Reusable by:** Any layout or section component needing standard content width.
- **Must not modify:** The padding scale or max-width value without updating [03-responsive-system.md](03-responsive-system.md) §2 first — this is the literal implementation of that spec's numbers.
- **Related documentation:** [03-responsive-system.md](03-responsive-system.md) §2.

### PageSection (`PageSection.tsx`)
- **Category:** Layout
- **Purpose:** The outer wrapper every homepage section renders inside; owns vertical rhythm and tone.
- **Responsibilities:** Applies `tone` (light/dark/transparent) background+text color pairing; applies `spacing` (standard/compact/hero) vertical padding; optionally wraps children in `Container`.
- **Public API:** `children`, `className?`, `as?: ElementType` (default `section`), `tone?: SectionTone` (default `light`), `spacing?: SectionSpacing` (default `standard`), `bleed?: "full" | "content"` (default `full`), `id?`, `containerWidth?`.
- **Dependencies:** `Container`, `cn`.
- **Consumers:** Every file in `src/components/sections/` except `Hero.tsx` (Hero manages its own full-viewport section tag directly, per its own spec §5).
- **Reusable by:** Any new homepage section.
- **Must not modify:** The `toneStyles`/`spacingStyles` value maps without a corresponding [01-design-system.md](01-design-system.md) update — these are the literal color/spacing tokens, not arbitrary styling.
- **Related documentation:** [01-design-system.md](01-design-system.md) §1/§3, [02-motion-system.md](02-motion-system.md) §2 (tone often correlates with a section's motion tier, but is not the same axis).

### Grid (`Grid.tsx`)
- **Category:** Layout
- **Purpose:** Generic responsive CSS grid primitive built on the 12/8/4-column system.
- **Responsibilities:** Translates a `columns` config (per-tier target column count) into the correct `grid-cols-*` Tailwind classes at each breakpoint; applies gap tier.
- **Public API:** `children`, `className?`, `columns: { mobile?, tablet?, desktop? }`, `gap?: "sm" | "md" | "lg"` (default `md`).
- **Dependencies:** `cn`.
- **Consumers:** None currently in `src/components/sections/` (superseded for card layouts by `CardGrid`, which layers stagger/swipe behavior on top) — available for any future non-card, non-swipeable multi-column layout.
- **Reusable by:** Any layout needing fixed multi-column behavior without `CardGrid`'s scroll-snap/stagger behavior.
- **Must not modify:** The `colSpanMap`/`gapStyles` value maps without a [03-responsive-system.md](03-responsive-system.md) update.
- **Related documentation:** [03-responsive-system.md](03-responsive-system.md) §2.

### Navbar (`Navbar.tsx`)
- **Category:** Layout
- **Purpose:** Persistent global site header — logo, primary nav, desktop CTA, mobile hamburger + slide-down panel.
- **Responsibilities:** Renders `primaryNav` links; toggles mobile panel open/closed state; owns the permanently-translucent `bg-ink/95 backdrop-blur-sm` treatment (deliberately not scroll-triggered — see [navbar-footer-implementation-spec.md](sections/navbar-footer-implementation-spec.md) §15).
- **Public API:** None (no props) — configuration comes from `src/config/nav.ts` and `src/config/site.ts`.
- **Dependencies:** `Container`, `ButtonLink`, `Icon`, `primaryNav` config, `framer-motion` (`AnimatePresence` for panel).
- **Consumers:** `src/app/layout.tsx` (root layout, renders once sitewide).
- **Reusable by:** Nothing — this is a singleton, rendered exactly once.
- **Must not modify:** The decision to keep the bar permanently translucent (not scroll-triggered) — this is an explicit, reasoned rejection per spec §15, not an open option.
- **Related documentation:** [navbar-footer-implementation-spec.md](sections/navbar-footer-implementation-spec.md).

### Footer (`Footer.tsx`)
- **Category:** Layout
- **Purpose:** Persistent global site footer — free-trial form, branch info, nav/contact links, brand signature, copyright.
- **Responsibilities:** Renders `TrialBookingForm`; iterates `siteConfig.branches` for branch cards; iterates `primaryNav` for the Explore column; computes copyright year server-side.
- **Public API:** None (no props).
- **Dependencies:** `Container`, `Icon`, `Heading`/`BodyText`/`Eyebrow`, `TrialBookingForm`, `siteConfig`, `primaryNav`.
- **Consumers:** `src/app/layout.tsx` (root layout, renders once sitewide).
- **Reusable by:** Nothing — singleton.
- **Must not modify:** Real branch/contact data (owned by `src/config/site.ts`, not this file) — Footer only renders it.
- **Related documentation:** [navbar-footer-implementation-spec.md](sections/navbar-footer-implementation-spec.md).

### StickyMobileCTA (`StickyMobileCTA.tsx`)
- **Category:** Layout
- **Purpose:** Fixed-bottom, mobile-only action bar — Call / WhatsApp / Book Free Trial.
- **Responsibilities:** Renders exactly three equal-status actions (per spec §15's explicit rationale for why these are *not* size-differentiated like `FinalCta`'s CTAs); mount-triggered slide-up entrance; safe-area-aware bottom padding.
- **Public API:** None (no props).
- **Dependencies:** `Icon`, `siteConfig`, `framer-motion`.
- **Consumers:** `src/app/layout.tsx` (root layout, renders once sitewide, alongside Footer not inside it).
- **Reusable by:** Nothing — singleton.
- **Must not modify:** The flat three-equal-actions treatment — see [navbar-footer-implementation-spec.md](sections/navbar-footer-implementation-spec.md) §15 for why this must never be changed to match `FinalCta`'s differentiated pattern.
- **Related documentation:** [navbar-footer-implementation-spec.md](sections/navbar-footer-implementation-spec.md).

---

## Motion Components — `src/components/motion/`

### AnimationWrapper (`AnimationWrapper.tsx`)
- **Category:** Motion
- **Purpose:** The single generic scroll-triggered reveal component used by nearly every section.
- **Responsibilities:** Implements five `RevealVariant`s (`fade-up`, `fade`, `scale-in-settle`, `slide-in-left`, `slide-in-right`); gates all motion behind `useReducedMotion()`, rendering final state instantly when active.
- **Public API:** `children`, `variant?: RevealVariant` (default `fade-up`), `delay?: number`, `duration?: number`, `className?`, `repeat?: boolean` (default `false`).
- **Dependencies:** `framer-motion`, `motion` design tokens (`src/lib/design-tokens.ts`).
- **Consumers:** Every section component except `Navbar`/`Footer` composition paths that don't need entrance motion; also wrapped internally by `CardGrid`.
- **Reusable by:** Any new section or component needing scroll-triggered entrance motion.
- **Must not modify:** The `variants` timing/distance values without a [02-motion-system.md](02-motion-system.md) update — these are the literal implementation of that spec's closed vocabulary (§1).
- **Related documentation:** [02-motion-system.md](02-motion-system.md) §1, §3, §5.

### ParallaxLayer (`ParallaxLayer.tsx`)
- **Category:** Motion
- **Purpose:** The sole continuous, scroll-position-linked transform in the system — background drift for banner/full-bleed imagery.
- **Responsibilities:** Applies a scroll-linked `y` transform capped at `motionTokens.distance.parallaxMax`; disables itself below the `lg` (1024px) breakpoint by default (`disableOnMobile`); disables itself entirely under `prefers-reduced-motion`.
- **Public API:** `children`, `className?`, `disableOnMobile?: boolean` (default `true`).
- **Dependencies:** `framer-motion` (`useScroll`, `useTransform`), `motion` design tokens.
- **Consumers:** `Hero.tsx`, `Programs.tsx` (`TrainingBanner`), `Facilities.tsx`.
- **Reusable by:** Any new section with a full-bleed/banner image, per [02-motion-system.md](02-motion-system.md) §4's rule of application — never applied to a pure card-grid or text section.
- **Must not modify:** The mobile/reduced-motion gating logic — an earlier version only toggled a CSS hint and still ran the transform on mobile; the current gating is the fix and must not regress (see the component's own doc comment for the incident this corrected).
- **Related documentation:** [02-motion-system.md](02-motion-system.md) §4.

### MagneticButton (`MagneticButton.tsx`)
- **Category:** Motion
- **Purpose:** Wraps a `Button`/`ButtonLink` so it drifts toward the cursor on hover (desktop pointer only).
- **Responsibilities:** Tracks pointer position within the wrapped element's bounds; caps travel at `motionTokens.distance.magneticMax` (8px); disables entirely under `prefers-reduced-motion`.
- **Public API:** `children`, `className?`.
- **Dependencies:** `framer-motion` (`useMotionValue`, `useSpring`), `motion` design tokens.
- **Consumers:** `Hero.tsx` (primary CTA only — secondary CTA is deliberately not magnetic, per [hero-implementation-spec.md](sections/hero-implementation-spec.md) §11), `Programs.tsx` (`TrainingBanner`'s CTA).
- **Reusable by:** Any single, primary CTA that should read as the one deliberate emphasis point in its context — not for secondary/tertiary actions in the same group (reinforces hierarchy through interaction, not just color).
- **Must not modify:** The 8px travel cap — matches [02-motion-system.md](02-motion-system.md) §1's closed distance vocabulary.
- **Related documentation:** [02-motion-system.md](02-motion-system.md) §1.

### KineticHeadline (`KineticHeadline.tsx`)
- **Category:** Motion
- **Purpose:** Word-by-word masked reveal, reserved for the single highest-impact headline treatment on the page.
- **Responsibilities:** Splits text on whitespace, wraps each word in an `overflow-hidden` mask, animates each word up into view with a per-word stagger; renders plain final text instantly under `prefers-reduced-motion`.
- **Public API:** `text: string`, `as?: ElementType` (default `span`), `className?`.
- **Dependencies:** `framer-motion`, `motion` design tokens.
- **Consumers:** `Hero.tsx` (both headline lines), `Programs.tsx` (section headline).
- **Reusable by:** A new section's single primary headline, if that section has been deliberately elevated to this treatment in its spec — not a default choice for every heading (every other headline sitewide still uses `AnimationWrapper`'s shared fade-up per the component's own doc comment).
- **Must not modify:** The stagger/duration/easing values — pulled from the same shared `motion` token vocabulary `AnimationWrapper` uses, not independently invented.
- **Related documentation:** [02-motion-system.md](02-motion-system.md) §1.

### AnimatedDivider (`AnimatedDivider.tsx`)
- **Category:** Motion
- **Purpose:** A rule that grows into place (scale 0→1) rather than simply appearing.
- **Responsibilities:** Animates `scaleX`/`scaleY` from 0→1 depending on `orientation`; renders the final static rule instantly under `prefers-reduced-motion`.
- **Public API:** `delay?: number`, `className?`, `orientation?: "vertical" | "horizontal"` (default `vertical`).
- **Dependencies:** `framer-motion`, `motion` design tokens.
- **Consumers:** `TrustStrip.tsx` (horizontal top accent rule).
- **Reusable by:** Any section needing a rule/divider that reads as "assembling deliberately" rather than a static border.
- **Must not modify:** N/A — no closed values beyond the shared duration/easing tokens.
- **Related documentation:** [02-motion-system.md](02-motion-system.md) §1.

### CountUp (`CountUp.tsx`)
- **Category:** Motion
- **Purpose:** Numeric rolling-count animation for stat display.
- **Responsibilities:** Animates from 0 to `end` over the counter duration with ease-out-cubic easing, triggered once on scroll entry; **always** renders the real final value as accessible text (`sr-only` span) regardless of animation/reduced-motion state — the visual animated digits are `aria-hidden`.
- **Public API:** `end: number`, `prefix?: string`, `suffix?: string`, `duration?: number`, `className?`.
- **Dependencies:** `framer-motion` (`useInView`), `motion` design tokens.
- **Consumers:** `StatCounter.tsx` (when `variant="count"`), `Hero.tsx` (trust row's location count).
- **Reusable by:** Any numeric stat that should roll up rather than appear static — not every stat qualifies (`StatCounter`'s `variant="static"` exists specifically because "Since 2016" should not count through intermediate years).
- **Must not modify:** The dual-rendering pattern (real value in `sr-only`, animated value `aria-hidden`) — this is the hard accessibility requirement from [04-accessibility.md](04-accessibility.md) §7, not an optional detail.
- **Related documentation:** [02-motion-system.md](02-motion-system.md) §1, [04-accessibility.md](04-accessibility.md) §7.

### ScrollProgressBar (`ScrollProgressBar.tsx`)
- **Category:** Motion
- **Purpose:** Thin fixed-top indicator of scroll depth through the whole page.
- **Responsibilities:** Tracks `scrollYProgress` sitewide; smooths via spring unless `prefers-reduced-motion`, in which case it snaps directly to scroll position (informational, not decorative — the bar itself is never hidden under reduced motion, only its smoothing).
- **Public API:** None (no props).
- **Dependencies:** `framer-motion` (`useScroll`, `useSpring`).
- **Consumers:** `src/app/layout.tsx` (root layout, renders once sitewide).
- **Reusable by:** Nothing — singleton.
- **Must not modify:** The reduced-motion behavior (remove smoothing, not remove the bar) — this is a deliberate exception to "reduced motion = static state," reasoned in the component's own doc comment as orientation information, not motion-for-motion's-sake.
- **Related documentation:** [02-motion-system.md](02-motion-system.md) §5.

---

## UI Components — `src/components/ui/`

### Button / ButtonLink (`Button.tsx`)
- **Category:** UI
- **Purpose:** The sole button/button-styled-link component sitewide.
- **Responsibilities:** Four variants (`primary`/`secondary`/`ghost`/`whatsapp`), two sizes (`default`/`compact`); renders a real `<button>` or a Next.js `<Link>`/`<a>` (`ButtonLink`) sharing identical visual treatment; owns the `scale(0.97)` press-state feedback; enforces `min-h-11 min-w-11` (44px) touch target.
- **Public API:** `ButtonProps`/`ButtonLinkProps`: `variant?`, `size?`, `icon?`, `isLoading?`, `children`, `className?`, plus standard button/anchor attributes (`href` required on `ButtonLinkProps`, forbidden on `ButtonProps`).
- **Dependencies:** `framer-motion`, `next/link`, `lucide-react` (`Loader2`), `cn`.
- **Consumers:** Nearly every section (`Hero`, `Programs`, `WhyInfiniti`, `MembershipCta`, `Locations`, `Testimonials`, `FinalCta`), `Navbar`, `Footer` (via `TrialBookingForm`), `PricingTeaserCallout`, `LocationCard`.
- **Reusable by:** Any interactive action sitewide — this is the only sanctioned way to render a button-styled element.
- **Must not modify:** Radius (always 0 — the "hard edges mean action" brand signature per [01-design-system.md](01-design-system.md) §4) — never override to rounded in any consumer.
- **Related documentation:** [01-design-system.md](01-design-system.md) §4, [04-accessibility.md](04-accessibility.md) §8.

### Card / CardMedia (`Card.tsx`)
- **Category:** UI
- **Purpose:** Base card geometry (radius, padding, shadow, hover lift) shared by every card type.
- **Responsibilities:** Owns 6px radius, resting/hover shadow pair, `translateY(-4px)`-equivalent hover lift (`y: -6`), 220ms transition; `interactive?` prop disables hover lift for non-interactive/carousel contexts; `CardMedia` provides the image-fills-top-of-card slot with ratio presets (`landscape`/`portrait`/`square`).
- **Public API:** `CardProps`: `children`, `interactive?: boolean` (default `true`), `padding?: "default" | "compact"`, plus standard div attributes. `CardMedia`: `children`, `className?`, `ratio?: "landscape" | "portrait" | "square"` (default `landscape`).
- **Dependencies:** `framer-motion`, `cn`.
- **Consumers:** `ProgramCard`, `TrainerCard`, `LocationCard`, `TestimonialCard`, `PricingTierCard`. **Not** used by `TestimonialPullQuote` (deliberately — see that component's entry below).
- **Reusable by:** Any new card-shaped content type.
- **Must not modify:** Radius (6px, never 0 — cards are the "soft edges mean content" half of the radius law, the inverse of `Button`'s rule) without a [01-design-system.md](01-design-system.md) update.
- **Related documentation:** [01-design-system.md](01-design-system.md) §4, §6.

### Badge (`Badge.tsx`)
- **Category:** UI
- **Purpose:** Small labeled tag for highlight/informational/achievement states.
- **Responsibilities:** Three variants (`highlight`/`informational`/`achievement`); always radius 0 (part of the button/badge/divider "hard edges" family); always pairs color with real text — never a color-only signal.
- **Public API:** `children`, `variant?: BadgeVariant` (default `highlight`), `icon?`, `className?`.
- **Dependencies:** `cn`.
- **Consumers:** `ProgramCard` (Flagship Format), `TrainerCard` (achievement titles), `LocationCard` (Ladies Only), `TestimonialPullQuote` (attribute tag), `PricingTierCard` (Best Seller).
- **Reusable by:** Any new labeled-state need — never introduce a second badge-like component.
- **Must not modify:** The color+text pairing requirement — see [04-accessibility.md](04-accessibility.md) §5, this is a hard accessibility rule, not a styling default.
- **Related documentation:** [01-design-system.md](01-design-system.md) §4, [04-accessibility.md](04-accessibility.md) §5.

### Icon (`Icon.tsx`)
- **Category:** UI
- **Purpose:** Single wrapper around `lucide-react` enforcing one size scale and stroke-width table sitewide.
- **Responsibilities:** Four sizes (`sm`/`default`/`lg`/`xl` → 16/20/24/32px) with inversely-scaled stroke width; defaults `aria-hidden="true"` unless explicitly overridden.
- **Public API:** `icon: LucideIcon`, `size?: IconSize` (default `default`), `className?`, `"aria-hidden"?`.
- **Dependencies:** `lucide-react`, `cn`.
- **Consumers:** Nearly every section and layout component that renders an icon.
- **Reusable by:** Any icon usage sitewide — this is the only sanctioned icon entry point; never import a `lucide-react` icon directly into a section without wrapping it in `Icon`.
- **Must not modify:** The size/stroke-width map without a [01-design-system.md](01-design-system.md) §5 update.
- **Related documentation:** [01-design-system.md](01-design-system.md) §5.

### Heading / Eyebrow / BodyText / SectionHeader (`Heading.tsx`)
- **Category:** UI
- **Purpose:** The complete typography component set — every headline, label, and body paragraph sitewide routes through one of these four exports.
- **Responsibilities:** `Heading` maps `level` (`hero`/`section`/`subsection`) to the two-font type scale, independent of the semantic `as` tag (so visual size and heading-level accessibility can differ correctly). `Eyebrow` enforces uppercase+tracking and a `tone` prop that is an accessibility fix, not a style choice (yellow-on-light fails contrast). `BodyText` provides the three body sizes. `SectionHeader` is the composite eyebrow+heading+body pattern repeating at the top of nearly every section.
- **Public API:** `Heading`: `children`, `level: HeadingLevel`, `as: ElementType`, `className?`, `id?`. `Eyebrow`: `children`, `className?`, `tone?: "dark" | "light"` (default `dark`). `BodyText`: `children`, `size?`, `className?`, `as?`. `SectionHeader`: `eyebrow?`, `heading`, `headingAs?`, `body?`, `align?`, `tone?`, `className?`.
- **Dependencies:** `cn`.
- **Consumers:** Every section component.
- **Reusable by:** Any headline/label/body text sitewide — never hand-roll typography classes on a raw `<h2>`/`<p>` outside this component set.
- **Must not modify:** The `Eyebrow` tone-contrast logic — yellow-on-light measures ~1.16:1, a WCAG AA failure; this is a correctness fix embedded in the component, not a theming option to bypass.
- **Related documentation:** [01-design-system.md](01-design-system.md) §2, [04-accessibility.md](04-accessibility.md) §5.

### CardGrid (`CardGrid.tsx`)
- **Category:** UI
- **Purpose:** The card-collection layout pattern — fixed multi-column grid on tablet/desktop, horizontally swipeable scroll-snap strip on mobile, with built-in scroll-reveal stagger.
- **Responsibilities:** Takes pre-rendered `children` (not a render-prop, per its own doc comment on the Server/Client Component serialization boundary); wraps each child in `AnimationWrapper` using `getStaggerDelay()` keyed to child position.
- **Public API:** `children`, `columns: 2 | 3 | 4`, `className?`.
- **Dependencies:** `AnimationWrapper`, `getStaggerDelay` (`src/lib/design-tokens.ts`), `cn`.
- **Consumers:** `Programs.tsx` (two instances, one per row), `TrainerShowcase.tsx`.
- **Reusable by:** Any new card collection needing the swipeable-mobile/grid-desktop pattern with stagger — this is the one addition beyond `Grid` flagged as purpose-built for card sections; do not reimplement its scroll-snap logic elsewhere.
- **Must not modify:** The children-based (not render-prop) API — changing this would break the Server/Client Component boundary it was specifically designed around.
- **Related documentation:** [02-motion-system.md](02-motion-system.md) §3, [03-responsive-system.md](03-responsive-system.md) §6, [04-accessibility.md](04-accessibility.md) §2 (keyboard nav verification item for this component's mobile mode).

### Accordion (`Accordion.tsx`)
- **Category:** UI
- **Purpose:** Multi-open disclosure pattern for the FAQ section.
- **Responsibilities:** Renders each item as a real `<button>` inside an `<h3>`; owns `aria-expanded`/`aria-controls`/`role="region"` wiring via `getDisclosureIds`; independent per-item open state (not exclusive single-open).
- **Public API:** `items: AccordionItemData[]`, `className?`.
- **Dependencies:** `getDisclosureIds`/`slugify` (`src/lib/a11y.ts`), `Icon`, `BodyText`, `framer-motion`.
- **Consumers:** `Faq.tsx`.
- **Reusable by:** Any future disclosure-pattern content — the `getDisclosureIds` helper is explicitly shared with any future Tabs component per its own doc comment.
- **Must not modify:** The multi-open (not exclusive) behavior — a deliberate FAQ-pattern choice, not an oversight.
- **Related documentation:** [04-accessibility.md](04-accessibility.md) §5.

### FormField — TextField / SelectField / CheckboxGroup (`FormField.tsx`)
- **Category:** UI
- **Purpose:** The complete form-field primitive set.
- **Responsibilities:** Real, persistent `<label>` elements always (never placeholder-only); error state wiring (`aria-invalid`/`aria-describedby`); `CheckboxGroup` uses a real `<fieldset>`/`<legend>` pair.
- **Public API:** `TextFieldProps`: `label`, `error?`, plus input attributes. `SelectFieldProps`: `label`, `options`, `error?`, plus select attributes. `CheckboxGroupProps`: `legend`, `name`, `options`.
- **Dependencies:** `cn`.
- **Consumers:** `TrialBookingForm.tsx`.
- **Reusable by:** Any future form sitewide.
- **Must not modify:** The real-label requirement — see [04-accessibility.md](04-accessibility.md) §7, "never placeholder-only text standing in for a label."
- **Related documentation:** [04-accessibility.md](04-accessibility.md) §7.

### TrialBookingForm (`TrialBookingForm.tsx`)
- **Category:** Content / UI (composite)
- **Purpose:** The free-trial booking form rendered inside Footer.
- **Responsibilities:** Renders the real field structure (name/email/phone/branch/day/time-slot) matching the live site's existing form; client-side submission stub only — **no backend endpoint exists** (explicitly flagged as a TODO in the component itself).
- **Public API:** None (no props).
- **Dependencies:** `TextField`/`SelectField`/`CheckboxGroup`, `Button`, `Heading`/`BodyText`.
- **Consumers:** `Footer.tsx`.
- **Reusable by:** Nothing else currently — singleton usage.
- **Must not modify:** Do not wire this to a fabricated "success" without a real backend — the stub is intentional and documented; wiring a real endpoint is a backend task outside this component's current scope, not a silent fix to apply unprompted.
- **Related documentation:** None beyond its own file comment.

### ProgramCard / TrainerCard / LocationCard / TestimonialCard / TestimonialPullQuote / PricingTierCard / PricingTeaserCallout / StatCounter
- **Category:** UI (content-card family)
- **Purpose:** Per-content-type card/callout renderers, each composing `Card`/`CardMedia` (except `TestimonialPullQuote`, deliberately) plus `Heading`/`BodyText`/`Badge`/`Icon`.
- **Responsibilities (per component):**
  - `ProgramCard` — program discipline card; per-slug focal-point image crop overrides; featured (Crossfit) glow treatment; permanently-visible "View Program" CTA row (not hover-only, for touch parity).
  - `TrainerCard` — trainer portrait card; no image hover-zoom (deliberately, "uncanny at close crop" per its own comment); underline-grow hover on name instead.
  - `LocationCard` — branch card; Ladies Only badge pairs color with real text.
  - `TestimonialCard` — secondary (non-featured) testimonial; `interactive={false}` (sits in a scrollable strip, hover would compete with swipe intent).
  - `TestimonialPullQuote` — featured testimonial; **deliberately does not use `Card`** — no shadow/border, reads as a magazine pull-quote directly on the section background.
  - `PricingTierCard` — membership tier card; `interactive={false}`.
  - `PricingTeaserCallout` — single-sentence price teaser with a yellow left-border accent; assumes a dark section background.
  - `StatCounter` — Trust Strip stat; hardcodes yellow-on-dark text (assumes dark parent section, like `Eyebrow`'s tone assumption); `variant="count"` uses `CountUp`, `variant="static"` does not.
- **Public API:** Each takes its corresponding content-model object (`Program`/`Trainer`/`LocationSummary`/`Testimonial`/`PricingTier`) from `src/types/content.ts` or `src/content/pricing.ts`, plus component-specific extras (`index`, `featured` on `ProgramCard`; `priceText` on `PricingTeaserCallout`; `value`/`label`/`prefix`/`suffix`/`variant` on `StatCounter`).
- **Dependencies:** `Card`/`CardMedia`, `Heading`/`BodyText`/`Eyebrow`, `Badge`, `Icon`, `ButtonLink` (on `LocationCard`), `CountUp` (on `StatCounter`), `next/image`.
- **Consumers:** `Programs.tsx`, `TrainerShowcase.tsx`, `Locations.tsx`, `Testimonials.tsx`, `MembershipCta.tsx`, `WhyInfiniti.tsx`, `TrustStrip.tsx`.
- **Reusable by:** Nothing beyond their one designated section each — these are section-specific card renderers, not generic primitives. A new section needing a *new* content type should compose `Card`/`CardMedia` directly rather than generalizing one of these.
- **Must not modify:** `TestimonialPullQuote`'s no-Card treatment (a stated design decision, not a missed composition); `TrainerCard`'s no-zoom-on-hover rule; `ProgramCard`'s always-visible (not hover-only) CTA row.
- **Related documentation:** [01-design-system.md](01-design-system.md) §6, individual section specs in `sections/`.

---

## Accessibility Components — `src/components/a11y/`

### SkipLink (`SkipLink.tsx`)
- **Category:** Accessibility
- **Purpose:** Standard "skip to main content" link.
- **Responsibilities:** Visually hidden until keyboard focus, then appears top-left; targets `#main-content` (the `<main>` landmark in root layout).
- **Public API:** None.
- **Dependencies:** `cn`.
- **Consumers:** `src/app/layout.tsx`.
- **Reusable by:** Nothing — singleton.
- **Must not modify:** Its target id (`#main-content`) without updating `layout.tsx`'s `<main>` in the same change.
- **Related documentation:** [04-accessibility.md](04-accessibility.md) §2.

### VisuallyHidden (`VisuallyHidden.tsx`)
- **Category:** Accessibility
- **Purpose:** Screen-reader-only content wrapper, semantically explicit alternative to a bare `sr-only` className.
- **Public API:** `children`, `as?: ElementType` (default `span`).
- **Dependencies:** None.
- **Consumers:** Available sitewide; used implicitly via the `sr-only` pattern inside `CountUp` directly rather than through this component currently — both achieve the identical technique.
- **Reusable by:** Any component needing screen-reader-only content, when call-site clarity ("this is deliberately hidden") is worth an explicit component over a raw utility class.
- **Related documentation:** [04-accessibility.md](04-accessibility.md) §7.

### LiveRegion (`LiveRegion.tsx`)
- **Category:** Accessibility
- **Purpose:** Announces dynamic content changes to screen readers.
- **Responsibilities:** `aria-live` region with re-announce-on-change logic (via a microtask reset so identical consecutive messages still announce).
- **Public API:** `message: string`, `politeness?: "polite" | "assertive"` (default `polite`).
- **Dependencies:** None beyond React.
- **Consumers:** None currently wired into a section — reserved for any future auto-advancing carousel/content per [04-accessibility.md](04-accessibility.md) §5's live-region requirement for auto-advancing content. No current section auto-advances.
- **Reusable by:** Any future auto-advancing widget.
- **Related documentation:** [04-accessibility.md](04-accessibility.md) §5.

---

## Section Components — `src/components/sections/`

Each section is a thin Server Component composing layout + UI + motion primitives with content from `src/content/*.ts`. See [15-file-ownership.md](15-file-ownership.md) for what each section does/doesn't own, and each `sections/*-implementation-spec.md` for full behavioral detail. Listed here only for category completeness and cross-reference:

`Hero`, `TrustStrip`, `Programs` (+ private `TrainingBanner` sub-component), `WhyInfiniti`, `Facilities`, `TrainerShowcase`, `Testimonials`, `MembershipCta`, `Locations`, `Faq`, `FinalCta` — each exported from `src/components/sections/index.ts` and assembled in scroll order by `src/app/page.tsx`. `HeroScrollCue` is a private motion sub-component of `Hero`, isolated into its own file specifically so its `useReducedMotion()` client-side loop doesn't force the whole `Hero` Server Component to become a Client Component.

---

## Utility — `src/lib/`

| File | Category | Purpose | Must not modify |
|---|---|---|---|
| `utils.ts` (`cn`) | Utility | Merges Tailwind class lists (clsx + tailwind-merge) — every component composes classes through this. | The merge order/behavior — components rely on "last class wins" conflict resolution. |
| `design-tokens.ts` | Utility / Configuration | TypeScript mirror of `globals.css`'s design tokens, for non-CSS contexts (Framer Motion transitions, `CountUp` durations). Also owns `getStaggerDelay()`. | Any value here must already exist in `globals.css`/[01-design-system.md](01-design-system.md) first — never the reverse. |
| `a11y.ts` | Utility | `getDisclosureIds`, `slugify`, `altText` builders. | The `altText` builder shapes — centralizes the descriptive-alt-text pattern; changing the shape sitewide requires an accessibility review. |
| `fonts.ts` | Configuration | `next/font/google` loader config for Archivo Black + Inter. | The loaded weight sets (900 display; 400/500/600/700 body) — adding a weight has a real performance cost per [qa/performance-checklist.md](qa/performance-checklist.md) Font Loading section. |
| `metadata.ts` | Configuration | `buildMetadata()` + `defaultMetadata` for SEO/OG/Twitter tags. | — |
| `structured-data.ts` | Configuration | JSON-LD `HealthClub` schema builder. | Real business data only — sourced from `siteConfig`. |

## Configuration — `src/config/`

| File | Category | Purpose |
|---|---|---|
| `site.ts` | Configuration | Single source of truth for name, tagline, contact, branch data (address/hours/ladies-only slot). Real data only, reconciled from business records — see the file's own comment. |
| `nav.ts` | Configuration | `primaryNav` — the 6-item primary navigation list, shared by `Navbar` and `Footer`. |

## Content — `src/content/`

Seven files (`facilities.ts`, `faqs.ts`, `locations.ts`, `pricing.ts`, `programs.ts`, `testimonials.ts`, `trainers.ts`), each exporting a typed array/object matching a shape in `src/types/content.ts`. Category: **Content**. Each file is the sole source of real copy for its section — see [00-design-principles.md](00-design-principles.md) §2.6, real content only, never fabricated.

## Types — `src/types/`

`content.ts` defines `Program`, `Trainer`, `Testimonial`, `LocationSummary` — re-exported from `index.ts`. Category: **Configuration/Content** (shape contracts, not runtime behavior). Any content-model shape change must update every content file and every consuming card component in the same change.
