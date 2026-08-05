# 03 — Responsive System (Version 2)

*Breakpoints and container behavior are unchanged from Version 1 — they are correct. This document exists to close two real gaps found during the Version 1 audit: inconsistent breakpoint stepping between sections (some sections jump 1→3 columns with no tablet step, others step gracefully), and a missing explicit behavior table at the five device widths the brief requires (320/375/390/430/768).*

---

## 1. Breakpoints (closed, unchanged)

| Name | Range | Tailwind prefix |
|---|---|---|
| Mobile | 0–639px | (none / base) |
| Tablet | 640–1023px | `sm:` |
| Desktop | 1024–1439px | `lg:` |
| Large Desktop / Wide | 1440px+ | `wide:` |

## 2. Container & Grid (closed, unchanged)

| Property | Value |
|---|---|
| Max content width | 1280px (`max-w-content`) |
| Side padding — Wide (≥1440px) | 80px |
| Side padding — Desktop (1024–1439px) | 48px |
| Side padding — Tablet (640–1023px) | 24px |
| Side padding — Mobile (<640px) | 16px |
| Grid — Desktop | 12 columns, 24px gutter |
| Grid — Tablet | 8 columns, 20px gutter |
| Grid — Mobile | 4 columns, 16px gutter |

Every card grid must align to this underlying column structure — no card floats at an arbitrary offset.

## 3. Breakpoint-Stepping Rule (NEW — Version 2 correction)

**Finding from Version 1 audit:** breakpoint stepping is inconsistent across sections. Some grids step 1-col → `sm:`2-col → `lg:`3-col (Testimonials secondary grid, Facilities icon grid, TrainerShowcase); others jump straight from 1-col to 3-col with no tablet step (MembershipCta: `grid-cols-1` → `sm:grid-cols-3`), and others skip the tablet step entirely by using `lg:` as the first breakpoint (Locations: `grid-cols-1` → `lg:grid-cols-2`, meaning a 768px tablet gets the same single-column treatment as a 375px phone despite having room for two columns side by side).

**Rule going forward:** any grid with ≥2 items must define an explicit tablet-tier column count at `sm:` (640px), even if that tier differs from both mobile and desktop. A grid may only skip the `sm:` tier if the content genuinely cannot support an intermediate layout (rare — flag it explicitly in the section spec if so, don't skip silently).

**Per-section correction required** (detailed again in each section's own spec, cross-referenced here for visibility):
- **Locations:** add `sm:grid-cols-2` so two location cards sit side-by-side starting at tablet (640px), not desktop (1024px) — see [locations-implementation-spec.md](sections/locations-implementation-spec.md).
- **MembershipCta:** add an explicit tablet tier — 3 pricing cards should not jump straight from stacked-mobile to 3-across at 640px, which is too narrow for 3 comfortable card columns; see [membershipcta-implementation-spec.md](sections/membershipcta-implementation-spec.md) for the corrected stepping.

## 4. Explicit Device-Width Behavior

Every section spec must state behavior at these five widths. General rules that apply sitewide, stated once here so section specs only need to note *exceptions*:

| Width | Device class | General behavior |
|---|---|---|
| **320px** | Smallest supported (old/small Android) | Single column everywhere. Side padding 16px. All headings at mobile type scale. No horizontal overflow permitted — this is the tightest test case; if content fits at 320px it fits everywhere below tablet. Buttons stack full-width. |
| **375px** | iPhone SE / small iPhone | Same as 320px — single column, 16px padding. Slightly more breathing room but no layout change from 320px. |
| **390px** | iPhone 12/13/14 standard | Same single-column mobile layout. This is the most common real-world mobile testing width — treat it as the mobile baseline for visual QA screenshots. |
| **430px** | iPhone Pro Max / large Android | Still mobile layout (single column, 16px padding) — 430px is below the 640px tablet threshold, so nothing changes structurally here versus 390px, only available line-length for text increases slightly. |
| **768px** | iPad portrait / small tablet | **Crosses into Tablet tier (≥640px).** Side padding jumps to 24px. Grids adopt their `sm:` column count per §3's rule. Section headers may shift alignment per the section's own spec (see [01-design-system.md](01-design-system.md) alignment rule: left-aligned desktop, center-aligned mobile — 768px generally reads as "desktop-like" enough to test both ways per section). |

**No-overflow rule:** at every width above, `overflow-x: hidden` must never be relied upon to hide a layout mistake (e.g. Locations' `overflow-hidden` on `PageSection` exists specifically to clip intentional slide-in-left/right animation travel, not to mask overflowing content — this distinction matters for QA, see [qa/visual-checklist.md](qa/visual-checklist.md)).

## 5. Touch Targets (closed, unchanged)

Every interactive element (buttons, nav links, accordion headers, card tap areas, icon-only buttons) maintains a minimum 44×44px touch target regardless of visual size — extend hit area with padding if the visual element is smaller.

## 6. Card Grid Responsive Reference

Corrected stepping per §3, cross-referenced against each section:

| Section | Mobile (<640px) | Tablet (640–1023px) | Desktop (≥1024px) |
|---|---|---|---|
| Programs | Swipeable strip, ~1.2 cards visible | 2-col grid | 3×3 grid |
| Facilities icon grid | 1 col | 2 col | 3 col |
| TrainerShowcase | Swipeable snap-scroll carousel, 85% card width | 2 col grid | 3 col grid |
| Testimonials — featured | 1 col | 1 col | 2 col (at `lg:`) — acceptable exception per §3, only 2 items exist and a tablet 2-col split would cramp the pull-quote's required breathing room |
| Testimonials — secondary | 1 col | 2 col | 3 col |
| MembershipCta | 1 col, stacked | **2 col (corrected — was 3 col jump)** | 3 col |
| Locations | 1 col, stacked | **2 col (corrected — was 1 col until desktop)** | 2 col |
