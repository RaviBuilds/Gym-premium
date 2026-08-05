# Programs — Implementation Spec (Version 2)

*Reads against [00-design-principles.md](../00-design-principles.md), [01-design-system.md](../01-design-system.md), [02-motion-system.md](../02-motion-system.md), [03-responsive-system.md](../03-responsive-system.md). Version 1 source: `src/components/sections/Programs.tsx`.*

---

## 1. Section Purpose

Lets every visitor recognize their specific interest (someone who searched "kickboxing Hyderabad" or "crossfit Gachibowli") within the first two sections, and demonstrates genuine program depth as a differentiator against unbranded local gyms. Each of the 9 cards is itself a CTA — the whole card links to that program's page.

## 2. Design Philosophy

Athletic, energetic, but organized — nine programs is a lot of content, and the section's credibility depends on it feeling curated, not crammed. The mid-grid `TrainingBanner` exists to give the eye a rest and inject one more emotional beat between the two card rows.

## 3. Storytelling Goal

Eyebrow → Heading → subhead → first row of 3 cards → banner (breather beat) → second row of 6 cards. The numbering (01–09) should read as one continuous sequence across both rows, reinforcing "nine distinct, deliberately chosen programs," not "two separate grids."

## 4. Visual Hierarchy

1. Program card grid (9 cards, numbered 01–09)
2. Section heading ("Nine ways to get after it")
3. `TrainingBanner` mid-grid CTA ("Explore Training")
4. Eyebrow / subhead
5. Mobile swipe-hint

## 5. Desktop Layout Specification

- Header block: left-aligned at all desktop widths (see §15 for the alignment correction).
- Card grid: `lg:grid-cols-3 lg:gap-8` — unchanged, 3×3 across two rows (3 + 6).
- Card aspect ratio: **lock to 4:5 (portrait) at every breakpoint** — see §15 for why the current mobile/tablet/desktop ratio flip (4:5 → 16:10 → 4:5) is corrected to a single consistent ratio.
- `TrainingBanner`: full-bleed via negative margins, `lg:h-[26rem]` (416px), parallax-enabled (desktop only).
- Featured card (Crossfit): keep the yellow glow ring, but change the animation from infinite pulse to a single one-time pulse on scroll-entry (see §9/§15) — the ring itself stays permanently visible at rest, only the *pulsing* stops being infinite.

## 6. Tablet Layout Specification

- Grid: `sm:grid-cols-2 sm:gap-6` — unchanged.
- Card ratio: 4:5 (unified per §5 — Version 1's tablet-only 16:10 flip is removed).
- Header alignment: left-aligned — **correction**, removing Version 1's tablet-only center-alignment (see §15).
- `TrainingBanner`: `sm:h-72` (288px), parallax disabled (<1024px).

## 7. Mobile Layout Specification

- Card grid: horizontal swipe-snap strip, `w-[85%] shrink-0 snap-start`, `gap-4` — unchanged, correct pattern.
- Swipe hint text ("Swipe to explore all 9 programs"): visible `sm:hidden` — unchanged.
- Card ratio: 4:5 — unchanged (mobile already used this ratio in Version 1).
- `TrainingBanner`: `h-56` (224px), parallax disabled.

**At exact widths:**
- **320/375/390/430px:** identical swipe-strip behavior, card width `85%` of viewport throughout.
- **768px:** enters the corrected tablet tier — 2-column static grid, left-aligned header (not centered, per §15's correction).

## 8. Spacing System

| Relationship | Value |
|---|---|
| Header block internal gap | 12px (`gap-3`) — unchanged |
| Header → first card row | 40px (`gap-10` on outer wrapper) — unchanged |
| Card grid gap | 16px mobile / 24px tablet / 32px desktop — unchanged |
| First row → `TrainingBanner` | 56px mobile / 80px tablet / 96px desktop (`my-14`/`lg:my-20`) — unchanged |
| `TrainingBanner` internal content gap | 16px (`gap-4`) — unchanged |

## 9. Motion Choreography

Tier 2 — Building (per [02-motion-system.md](../02-motion-system.md) §2).

- Header: Eyebrow fade-up (no delay) → `KineticHeadline` word-mask heading → subhead fade-up (delay 0.35s) — unchanged.
- Card grids: `getStaggerDelay(index)` per row — **correction:** the two `CardGrid` instances (row 1: 3 cards, row 2: 6 cards) must share one continuous stagger index (0 through 8), not two independently-reset sequences. This makes the motion timing match the visible 01–09 numbering the cards already display.
- `TrainingBanner`: `ParallaxLayer` (desktop only, per §6/§7), plus 4 sequential fade-ups (eyebrow/heading/body/CTA at 0/0.1/0.2/0.3s delay) — unchanged.
- Featured card glow: **change from `animate-[card-glow_3s_ease-in-out_infinite]` (infinite) to a single scroll-triggered pulse** — plays the same glow keyframe exactly once when the card enters viewport (`whileInView`, `once: true`), then holds at its resting glow state (the static box-shadow glow, per Version 1's "resting" state that already exists independent of the animation). See §15.
- ProgramCard hover: consolidate the two independently-stacked hover transforms (outer `motion.div` scale 1.012 + inner `Card` translateY -6px/shadow) into a single hover animation definition combining both effects — same visual result, one transform declaration instead of two nested ones.

**Reduced motion:** card-glow pulse never plays (single static glow shown), `ParallaxLayer` disabled, `KineticHeadline` shows full text immediately, all stagger delays collapse to instant appearance — unchanged sitewide rule.

## 10. Scroll Behaviour

- `TrainingBanner` background image: scroll-linked parallax, 32px max drift, desktop only (≥1024px) — per [02-motion-system.md](../02-motion-system.md) §4, this section qualifies for parallax because it has a genuine full-bleed banner.
- Card grid itself: no parallax (it's a card grid, not a banner) — entrance stagger only.

## 11. Micro Interactions

- ProgramCard hover (desktop only, `lg:group-hover`): image zoom 1.0→1.04x (unchanged value — **correction from Version 1's 1.08x**, see §15), "View Program" underline grows 0→100% over 300ms, arrow icon translates +4px.
- **NEW — touch equivalent:** since `lg:group-hover` never fires on touch devices (confirmed gap in Version 1 audit), add a `active:` state on the card's root that triggers the same underline-grow and a brief (150ms) image opacity dip to 0.92, so tapping a card on mobile/tablet gives the same "this registered" feedback desktop hover provides. This does not require JS — pure CSS `:active` pseudo-class, matching the pattern already used correctly in `StickyMobileCTA`.
- Card press-state: standard `active:scale-[0.98]` on touch, consistent with the button press pattern elsewhere.

## 12. Accessibility

- Each `ProgramCard`: full-card `<Link>` with descriptive `aria-label` ("Crossfit training at Infiniti Fitness — view program details") — unchanged, already correct.
- `TrainingBanner` heading: **change `as="p"` to `as="h3"`** — currently styled as a heading but rendered as a paragraph, meaning it's invisible to screen-reader heading navigation despite carrying section-heading visual weight. This is a genuine structural fix, not a style change (see §15).
- Number badges, gradient overlays, swipe-hint icon: `aria-hidden` — unchanged, correct.
- Mobile swipe strip: verify keyboard/Tab order moves through all 9 cards sequentially even though they're visually a horizontal scroll strip — if not already true, add `tabIndex` in document order (should be automatic since it's DOM order, not visual order, but confirm no CSS `overflow` trap prevents focus-triggered scroll-into-view).

## 13. Performance Constraints

- ProgramCard images: `sizes` attribute already correctly tuned per breakpoint — unchanged, keep exact values.
- No `priority` on program images (correct, below fold).
- `TrainingBanner` image: no `priority` (correct).
- Consolidated hover transform (per §9) reduces redundant animation calculation on hover — minor but real cost reduction.

## 14. Acceptance Criteria

- ✓ No horizontal overflow at any tested width.
- ✓ Card numbering (01–09) and motion stagger both read as one continuous sequence, not two resets.
- ✓ Card aspect ratio is 4:5 at every breakpoint — no mid-breakpoint ratio flip.
- ✓ Featured card's glow pulse fires exactly once per page visit, not continuously.
- ✓ Tablet width (768px) shows left-aligned header, 2-column grid.
- ✓ Touch devices receive visible feedback (underline/opacity dip) on card tap, not just the swipe gesture itself.
- ✓ `TrainingBanner`'s heading is reachable via screen-reader heading navigation (verify with a heading-outline check, e.g. browser dev tools accessibility tree).
- ✓ Reduced motion: no infinite glow, no parallax, no zoom-on-hover-substitute needed (hover doesn't apply under reduced motion by definition, but verify no lingering animation timer).

## 15. Design Rationale

**Why lock the card ratio to 4:5 at every breakpoint instead of the current 4:5→16:10→4:5 flip:** a ratio that changes and then changes back has no visible purpose to the visitor and creates real production risk — 9 different source photos each need to look correct at three different crops instead of one, and the middle (tablet) breakpoint is the one most likely to end up with an awkward crop nobody explicitly checked. One consistent ratio is both simpler to produce correctly and more consistent with the "one type system, one color system... applied without exception" principle in [00-design-principles.md](../00-design-principles.md) §2 — that principle should extend to photography ratios too.

**Why change the featured card's glow from infinite to single-pulse:** [00-design-principles.md](../00-design-principles.md) §3's "escalating choreography" principle explicitly says motion complexity should track a section's *emotional weight*, and separately, `ParallaxLayer`'s own doc comments in the codebase state the design philosophy as "subtle... not gimmicky." An infinite 3-second pulse running forever on one card, regardless of whether anyone is looking at it, is the single clearest violation of that stated philosophy found anywhere in the Version 1 audit. A one-time pulse on scroll-entry still marks the card as special without becoming a permanent distraction for a visitor who lingers on the page.

**Why reduce the hover zoom from 1.08x to 1.04x:** 1.08x is a large enough zoom that it can reveal the edge of the image's crop/whitespace on some source photos and reads as slightly aggressive next to the site's otherwise restrained motion language — 1.04x (already the documented target value in `Visual-Design-Specification.md` §6/§10) is the correct value; Version 1's Programs implementation drifted to 1.08x specifically for this one card type without a stated reason.

**Why fix the header alignment (remove the tablet-only center step):** an alignment rule that is left→center→left across three breakpoints has no design rationale anywhere in the codebase's own comments — it reads as an accident of applying two different alignment utilities that happened to compound at the middle breakpoint, not a decision. Left-aligned throughout matches [01-design-system.md](../01-design-system.md)'s stated alignment rule ("left-aligned on desktop... this isn't inconsistency, it's intentional") — but that same rule should be intentional and *consistent*, not left-center-left.

**Why change `TrainingBanner`'s heading tag from `p` to `h3`:** this is a correctness fix, not a design decision — the element is styled with `Heading level="section"`, visually indistinguishable from a real heading, sitting between two real `h2`s in the document flow. A screen reader user navigating by heading will skip a mid-page moment that a sighted user perceives as a headline. `h3` (not `h2`) because it's a sub-moment within the Programs section, not a new top-level section.

## 16. Implementation Notes for Gemini

- Change `TrainingBanner`'s `Heading` `as` prop from `"p"` to `"h3"` — no visual change, structural fix only.
- Merge the two `CardGrid` instances' stagger index into one continuous sequence (index 0–8 across both rows) — the simplest implementation is to pass an explicit `startIndex` prop to the second `CardGrid` instance (value 3) if `CardGrid` doesn't already support continuing an index across instances; add that prop if needed.
- Set every `ProgramCard`'s image aspect ratio to `aspect-[4/5]` unconditionally — remove the `sm:aspect-[16/10] lg:aspect-[4/5]` override.
- Remove the header's `sm:text-center` class, keep `text-left` at every breakpoint.
- Change the featured (Crossfit) card's glow animation from `motion-safe:animate-[card-glow_3s_ease-in-out_infinite]` to a `whileInView` triggered single-play version of the same `card-glow` keyframe (or equivalent Framer Motion variant), landing on the existing static resting-glow box-shadow once complete.
- Change `lg:group-hover:scale-[1.08]` to `lg:group-hover:scale-[1.04]` on ProgramCard images.
- Add an `active:` (touch) equivalent for the underline-grow and a brief opacity dip on the card image, scoped so it doesn't also fire on desktop mouse clicks in a way that conflicts with the existing hover treatment (use `@media (hover: none)` scoping or an equivalent Tailwind `pointer-` variant if available, otherwise gate via `active:` which is safe on both input types).
- Do not change any copy, any program's photo, the 9-card content set, or the number badge styling.
- Do not add a tablet-specific card ratio — the whole point of this fix is removing the ratio flip, not relocating it.
