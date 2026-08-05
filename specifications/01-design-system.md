# 01 — Design System (Version 2)

*Exact values only. Every value below already exists in the codebase (`src/app/globals.css` `@theme` block and `src/lib/design-tokens.ts`) — Version 2 does not introduce new tokens, it defines new *rules for combining* the existing ones. Where Version 2 adds a genuinely new value (marked **NEW**), it is derived from the existing scale, never invented independently.*

---

## 1. Color

| Token | Hex | CSS var | Use |
|---|---|---|---|
| Brand Yellow | `#FFDE01` | `--color-brand-yellow` | CTAs, key numbers, active states, section markers. Spotlight only — never >10% of a viewport. |
| Ink | `#14181D` | `--color-ink` | Dark section backgrounds, primary text on light. |
| Surface Light | `#FAF9F6` | `--color-surface-light` | Default page background. |
| Surface Card | `#FFFFFF` | `--color-surface-card` | Card backgrounds on Surface Light. |
| Border Subtle | `#E5E3DC` | `--color-border-subtle` | Card borders/dividers on light backgrounds. |
| Border Dark | `#2A2F36` | `--color-border-dark` | Dividers on dark sections. |
| Text Primary | `#14181D` | `--color-text-primary` | Body copy on light backgrounds. |
| Text Secondary | `#5B6069` | `--color-text-secondary` | Supporting/caption text on light backgrounds. |
| Text Primary Dark | `#FFFFFF` | `--color-text-primary-dark` | Body copy on dark backgrounds. |
| Text Secondary Dark | `#A8ACB3` | `--color-text-secondary-dark` | Supporting/caption text on dark backgrounds. |
| Success | `#1E8E5A` | `--color-success` | Form success only. Never decorative. |
| Warning | `#B7791F` | `--color-warning` | Non-blocking form warnings only. |
| Error | `#C13B3B` | `--color-error` | Form validation errors only. |
| WhatsApp Green | `#25D366` | `--color-whatsapp` | WhatsApp CTA only — the single deliberate palette exception. |

**Contrast floor:** every text/background pairing above clears WCAG AA (4.5:1 body, 3:1 large ≥24px). Primary button text is Ink-on-Yellow (12:1+), never white-on-yellow. This is a closed rule — see [00-design-principles.md](00-design-principles.md) §2.

**NEW — Depth overlays (for scroll/parallax sections, §2 of [02-motion-system.md](02-motion-system.md)):** dark sections may use Ink at reduced opacity as a scrim, always as a directional gradient (never a flat tint) — `linear-gradient(135deg, rgba(20,24,29,0.85) 0%, rgba(20,24,29,0.35) 55%, rgba(20,24,29,0.1) 100%)` is the canonical Hero scrim and the template for any new scrim (adjust stops, never the color).

---

## 2. Typography

Two families, no exceptions: **Archivo Black** (`--font-display`) for headlines only; **Inter** (`--font-body`) for everything else.

| Role | Mobile | Desktop (`-lg`) | Weight | Line-height | Letter-spacing |
|---|---|---|---|---|---|
| Hero Display *(homepage Hero only)* | 44px (2.75rem) | 104px (6.5rem) | 900 | 1.1 / 1 | -0.02em / -0.03em |
| Hero Headline *(all other hero-scale use)* | 36px (2.25rem) | 64px (4rem) | 900 | 1.05 | -0.02em |
| Section Heading (H2) | 28px (1.75rem) | 48px (3rem) | 900 | 1.1 | -0.01em |
| Subsection Heading (H3) | 20px (1.25rem) | 28px (1.75rem) | 700 | 1.2 | normal |
| Eyebrow label | 13px (0.8125rem) | 14px (0.875rem) | 600 | 1.4 | 0.12em, uppercase |
| Body — large | 18px (1.125rem) | 20px (1.25rem) | 400 | 1.5 | normal |
| Body — standard | 16px (1rem) | 16px (1rem) | 400 | 1.6 | normal |
| Body — caption | 13px (0.8125rem) | 14px (0.875rem) | 400 | 1.5 | normal |
| Button label | 16px (1rem) | 16px (1rem) | 600 | 1 | 0.02em |
| Stat number | 28px (1.75rem) | 40px (2.5rem) | 900 | 1 | -0.01em |

**Rules (closed, unchanged from Version 1):**
- One Hero Display per page, homepage only. One Section Heading (H2) per `PageSection`. Never skip a level.
- Eyebrows: always uppercase, always 0.12em tracking. This is the only uppercase text on the site.
- Buttons: sentence case or capitalize-first-word, never uppercase.
- Bold in body copy: sparingly, for genuine inline emphasis only (e.g. **"10 kg"** inside a testimonial) — never a substitute for heading hierarchy.

---

## 3. Spacing

Base unit 8px. Full scale: **8 / 16 / 24 / 32 / 48 / 64 / 96 / 128px** (Tailwind `p-2/4/6/8/12/16/24/32`).

| Context | Desktop (≥1024px) | Tablet (640–1023px) | Mobile (<640px) |
|---|---|---|---|
| Standard section vertical padding | 96px | 64px | 56px |
| Compressed section (low-priority, e.g. Extras-tier content) | 64px | 48px | 40px |
| Container side padding | 80px (≥1440px) / 48px (1024–1439px) | 24px | 16px |
| Max content width | 1280px | — | — |

**NEW — Compositional whitespace tier** (Version 2 addition, derived from the existing scale, not a new number): sections identified in [00-design-principles.md](00-design-principles.md) §3 as needing "confident whitespace" (Hero, WhyInfiniti, Testimonials featured quotes) may use the **128px** step for internal element separation on desktop where the current build uses 64px or 96px — e.g. gap between a featured pull-quote and the CTA beneath it. This is still a scale value, never an arbitrary px number.

---

## 4. Radius & Elevation

| Element type | Radius | Rule |
|---|---|---|
| Buttons, badges, dividers | 0px | Hard edge = action. Never rounded, no exceptions. |
| Cards, content containers, images-in-cards | 6px (`--radius-card`) | Soft edge = content. |

| Shadow | Value | Use |
|---|---|---|
| Card resting | `0 2px 8px rgb(20 24 29 / 0.08)` | Default card elevation. |
| Card hover | `0 20px 40px rgb(20 24 29 / 0.2)` | On hover/focus-within lift. |
| Button resting | `0 4px 16px rgb(255 222 1 / 0.25)` | Primary button glow. |
| Button hover | `0 6px 20px rgb(255 222 1 / 0.35)` | Primary button hover glow. |

**NEW — Elevation tiers for depth composition** (Version 2, derived from existing shadow values by intensity only, no new shadow colors): where a section uses layered/parallax imagery (see [02-motion-system.md](02-motion-system.md) §4), a foreground layer may use Card Hover shadow at rest (not just on hover) to read as physically closer than a background layer using Card Resting — this is the only place elevation is used compositionally rather than interactively.

---

## 5. Iconography

- Style: line icons, 2px stroke at 24×24 native grid (scale proportionally: 1.5px at 16px, 2.5px at 32px).
- Size scale: 16px (inline in Badge/small text) / 20px (default inline, nav, forms) / 24px (standalone decorative) / 32px (Sticky Mobile CTA touch targets).
- Spacing: 8px between icon and its paired text, always.
- Color: inherits context text color (Ink on light, White on dark). Sole exception: WhatsApp icon uses WhatsApp Green.
- One icon library sitewide (`lucide-react`, per current implementation) — no per-section substitutions.

---

## 6. Card Type Reference

| Card type | Image ratio | Radius | Padding (desktop/mobile) | Hover behavior |
|---|---|---|---|---|
| Program Card | 16:10 | 6px | 24px / 20px | Image scales 1.0→1.04x (clipped to radius) + shared lift/shadow |
| Trainer Card | 4:5 | 6px | 24px / 20px | Shared lift/shadow only — no image zoom (dignity over energy) |
| Testimonial Card (secondary) | none (text-led) | 6px | 28px / 24px | No hover lift (sits in a scrollable strip) |
| Testimonial Pull-Quote (featured) | none | **no card treatment** | — | Not a `Card` — oversized yellow quotation mark + inline stat emphasis, set directly on section background |
| Location Card | 16:9 | 6px | 24px / 20px | Shared lift/shadow |
| Extra/utility card | varies | 6px | 20px / 16px | No hover lift (deliberately lowest-priority) |

Full per-card motion and layout detail lives in each section's implementation spec — this table is the cross-reference index only.
