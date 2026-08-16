# Requirements Document

## Introduction

This document specifies the requirements for the "Train With Experts" section redesign — Concept B, "The Lit Plinth" — as derived from [design.md](./design.md). The section under redesign is `src/components/sections/TrainerShowcase.tsx`, rendered on the homepage between `Facilities` and `Testimonials`, with eyebrow "Train With Experts" and heading "Six trainers. Zero guesswork."

The redesign replaces a wall of loose transparent PNG cutouts with a **lit coaching floor**: one lead coach on a cinematic plinth carrying a full dossier, five coaches in a disciplined containment grid where every card carries the same frame, the same index numeral, the same credential structure and one controlled yellow accent, and a sixth grid cell that converts.

Requirements below are grounded in the design's problem statement (P1–P8), its success criteria (SC1–SC9), and the constraint systems it inherits: the closed motion vocabulary and Tier 2 cap in `specifications/02-motion-system.md`, the two-family type rule and accent discipline in `specifications/01-design-system.md`, the shared virtual camera in `src/lib/motion/camera-tokens.ts`, and the content-honesty rule in `specifications/sections/trainershowcase-implementation-spec.md` §16.

Requirement areas map one-to-one to the areas named in design.md §14:

| Req | Area |
|---|---|
| 1 | Roster composition — every coach present, ordered, indexed |
| 2 | Containment and visual language — plinth, labels, motif, accent discipline |
| 3 | Scroll choreography — sequence, stagger, camera planes |
| 4 | Interaction — hover, focus, touch feedback |
| 5 | Responsive behaviour — desktop, tablet, mobile |
| 6 | Accessibility — semantics, keyboard, contrast, reduced motion |
| 7 | Performance — asset strategy, composited properties, hydration budget |
| 8 | Content integrity — honest data, graceful degradation |

## Glossary

- **Trainer_Showcase**: The homepage section component rendering the "Train With Experts" content, including its header, lead coach stage, roster grid and footer.
- **Section_Assembler**: The pure logic layer that turns the `trainers` content array plus a presentation-order list into the section's render model (`lead`, `roster`, `indices`, `combinedYears`). Comprises `assembleSection`, `resolveLead`, `resolveRoster`, `formatIndex`, `resolveCombinedYears` and `resolveDossierRows`.
- **Trainer_Plinth**: The shared presentational frame every coach is composed from. Consists of a non-clipping outer wrapper holding the backlight, and an inner `overflow-hidden` frame holding the plinth surface, edge light, texture plane, backdrop plate, grounding layers, cutout, label pool, hex index chip, label block and dossier layer.
- **Plinth_Surface**: The lit vertical face at the base of the inner frame — a static top-to-bottom white gradient (0.055 → 0.015 → transparent), not a card fill.
- **Label_Pool**: The ink gradient occupying the bottom 38% of the inner frame (`rgba(20,24,29,0.92)` → `rgba(20,24,29,0.72)` → transparent), over which the label block is drawn.
- **Label_Block**: The name, role and discipline pips, pinned to the inner frame's bottom padding.
- **Hex_Index_Chip**: A flat-top hexagon chip (36px, 40px at `lg:`) containing a two-digit index numeral in `font-display`, always `aria-hidden`.
- **Dossier_Layer**: The overlay carrying the philosophy line and the "Book a session" affordance. Revealed on hover/focus at `lg:` and above; always visible below `lg:`.
- **Trainer_Dossier**: The lead coach's credential column (name, role, rule, discipline pips, credential rows, achievement badge, philosophy line, CTA), rendered beside the lead plinth at `lg:` and stacked below it otherwise.
- **Lead_Coach**: The single trainer given the featured plinth spread and index `01`. Resolved by the `lead: true` flag, falling back to `trainers[0]`.
- **Roster**: The trainers other than the Lead_Coach, in presentation order, carrying indices `02` upward.
- **Roster_Card**: One roster coach's list item — a single `<a>` wrapping a Trainer_Plinth in `variant="roster"`.
- **Roster_Grid**: The container rendering the Roster_Cards plus the CTA tile — a swipe strip below 640px, a two-column grid from 640px to 1023px, a three-column grid at 1024px and above.
- **Roster_Cta_Tile**: The sixth grid cell — a hex-motif booking tile carrying the section-level primary action.
- **Roster_Atmosphere**: The section's single `deepBackground` camera plane, carrying the texture plane, hex wash and vignette.
- **Camera_System**: The existing shared virtual camera — `MotionCameraProvider`, `useCameraLayer`, `CameraLayer`, `CameraGroup`, and the tokens and `resolveAmplitude` in `src/lib/motion/camera-tokens.ts`.
- **Camera_Plane**: One subscription to the Camera_System via `CameraLayer` or `CameraGroup`, identified by a depth token.
- **Masked_Line**: The single-line masked reveal primitive — one `overflow-hidden` wrapper plus one `translateY` from 110% to 0%.
- **Content_Registry**: The trainer content source `src/content/trainers.ts` and the `Trainer` / `TrainerCredential` types in `src/types/content.ts`.
- **Blend_Zone**: The top 128px and bottom 128px of the section, where the Facilities→dark and dark→Testimonials dissolve hand-offs live.
- **Closed_Motion_Vocabulary**: The fixed timing values in `specifications/02-motion-system.md` §1 — durations 0.18s / 0.5s / 1.2s, easing `[0.16, 1, 0.3, 1]`, distances 12 / 24 / 40 / 48px, stagger 0.08s capped at 6 items, scroll trigger threshold 0.2.
- **Tier_2_Cap**: The motion-system rule assigning Trainer_Showcase to "Tier 2 — Building", permitting exactly one added depth cue and forbidding it from out-animating the Tier 3 Testimonials section below it.
- **Reduced_Motion**: The user-agent state `prefers-reduced-motion: reduce`, which resolves Camera_System `intensity` to 0.
- **Composited_Property**: A CSS property the compositor can animate without layout or paint — `transform` and `opacity` only.

## Requirements

### Requirement 1: Roster Composition — Every Coach Present, Ordered, Indexed

**User Story:** As a visitor, I want to see the gym's full coaching roster presented in a deliberate order with a clear lead, so that I understand who coaches here and who the gym puts forward first.

*Addresses P4 (no hierarchy). Supports SC4 (index numeral motif).*

#### Acceptance Criteria

1. WHEN the Section_Assembler assembles the section from a trainer array of length 1 or greater, THE Section_Assembler SHALL produce a Lead_Coach and a Roster whose union contains every trainer from the input array exactly once.
2. WHEN the Section_Assembler assigns index numerals, THE Section_Assembler SHALL assign `"01"` to the Lead_Coach and `String(i + 2).padStart(2, "0")` to the Roster entry at zero-based position `i`, producing a contiguous set of two-digit indices from `"01"` through `formatIndex(trainerCount)`.
3. WHERE exactly one trainer sets `lead: true`, THE Section_Assembler SHALL select that trainer as the Lead_Coach and exclude that trainer from the Roster.
4. IF no trainer sets `lead: true`, THEN THE Section_Assembler SHALL select the first trainer in the content array as the Lead_Coach and emit a development-only console warning.
5. IF more than one trainer sets `lead: true`, THEN THE Section_Assembler SHALL select the first such trainer as the Lead_Coach and emit a development-only console warning.
6. WHEN the Trainer_Showcase resolves the Roster, THE Section_Assembler SHALL order the Roster by a local presentation-order slug list that is independent of the declaration order in the Content_Registry.
7. IF a slug in the presentation-order list matches no trainer in the Content_Registry, THEN THE Section_Assembler SHALL throw an `Error` at module scope naming the unmatched slug, so that the failure occurs at build time.
8. WHERE the Roster contains between 4 and 7 entries, THE Roster_Grid SHALL render every Roster_Card followed by the Roster_Cta_Tile as the final cell without any code change.

### Requirement 2: Containment and Visual Language

**User Story:** As a visitor, I want each coach to read as a photographed person standing on a lit surface inside a frame, so that the section looks designed rather than assembled from loose cutouts.

*Addresses P1 (floating cutouts), P2 (inconsistent labels), P3 (no depth parity). Satisfies SC2, SC3, SC4, SC6.*

#### Acceptance Criteria

1. WHEN the Trainer_Plinth renders a coach, THE Trainer_Plinth SHALL compose the Plinth_Surface, a 1px frame edge light, a contact-shadow radial and a floor-light radial beneath the cutout, so that the cutout renders against a surface and inside a frame edge at every breakpoint.
2. WHEN the Trainer_Plinth renders the Label_Block, THE Trainer_Plinth SHALL pin the Label_Block to the inner frame's own bottom padding over the Label_Pool, so that the vertical offset from the frame's bottom edge to the name baseline is equal within 1px across all Roster_Cards at a given viewport width.
3. THE Trainer_Showcase SHALL carry at least three motifs shared with the Hero and Programs sections: two-digit index numerals, the flat-top hexagon shape, and a repeating texture plane rendered at opacity 0.06 at `lg:` and above.
4. WHILE a Roster_Card is at rest, THE Roster_Card SHALL render exactly zero descendants using `brand-yellow` as a text or background colour, and on hover or focus SHALL render exactly one such descendant, being the name underline. This holds unconditionally, including for a Roster_Card whose coach supplies `signatureAchievement`, because the roster achievement badge uses the non-yellow `informational` variant per criterion 8.6.
5. THE Trainer_Showcase SHALL render exactly three resting brand-yellow accents at section level: the eyebrow, the Lead_Coach achievement accent group, and the Roster_Cta_Tile primary action. This count SHALL be independent of how many coaches supply `signatureAchievement`.
6. THE Trainer_Plinth SHALL render its outer wrapper without `overflow-hidden` and its inner frame with `overflow-hidden`, so that the backlight fades to zero alpha in open space and oversized graphics cannot escape the frame.
7. THE Trainer_Plinth SHALL render the index numeral inside a single Hex_Index_Chip and SHALL render exactly one numeral per coach.
8. THE Trainer_Showcase SHALL preserve the existing top blend, bottom blend, warm radial wash and section vignette unchanged, and SHALL paint no new layer within the Blend_Zone.
9. THE Trainer_Showcase SHALL render every roster frame at aspect ratio 4:5 with `object-cover object-bottom`, so that frame geometry is uniform regardless of source-photo aspect ratio.
10. THE Trainer_Showcase SHALL use only the type tokens already defined in `globals.css` and only the two existing font families, deriving numeric alignment from `tabular-nums`.

### Requirement 3: Scroll Choreography

**User Story:** As a visitor scrolling the page, I want the section to reveal itself in a sequence I can feel, so that scrolling is rewarded without the section stealing the page's emotional peak.

*Addresses P4 (simultaneous arrival), P6 (entrance-only motion). Satisfies SC5, and respects the Tier_2_Cap.*

#### Acceptance Criteria

1. WHEN the Trainer_Showcase enters the viewport, THE Trainer_Showcase SHALL reveal its groups in the order header, Lead_Coach stage, Roster tray, footer counter, each triggered by its own `whileInView` at threshold 0.2.
2. WHEN the Roster_Grid reveals its six cells, THE Roster_Grid SHALL apply `getStaggerDelay(i)` for zero-based cell index `i`, producing delays that increase monotonically with `i` and never exceed 0.48 seconds.
3. WHEN a Camera_Plane computes its vertical offset, THE Camera_System SHALL produce `y = (clamp(progress, 0, 1) − 0.5) × amplitude`, bounded to the closed interval `[−amplitude/2, +amplitude/2]`, and equal to 0 at progress 0.5.
4. WHEN the Camera_System resolves a plane's amplitude, THE Camera_System SHALL return a value of 0 or greater, and SHALL return exactly 0 when intensity is 0.
5. THE Trainer_Showcase SHALL subscribe to the Camera_System exactly three times: one `deepBackground` plane for Roster_Atmosphere, one `sectionMedia` plane for the Lead_Coach plinth, and one `interactive` plane wrapping the whole Roster tray.
6. THE Trainer_Showcase SHALL contain zero `useScroll` calls outside the Camera_System.
7. WHILE the Roster tray drifts on its `interactive` plane, THE Roster_Grid SHALL hold every Roster_Card rigid relative to every other Roster_Card.
8. THE Trainer_Showcase SHALL animate only `transform` and `opacity`, and SHALL express masked line reveals as `overflow-hidden` plus `translateY`.
9. THE Trainer_Showcase SHALL use only values from the Closed_Motion_Vocabulary for every duration, easing, distance and stagger value.
10. THE Trainer_Showcase SHALL run zero infinite or looping animations.
11. WHERE every coach in the Content_Registry supplies `yearsExperience`, THE Trainer_Showcase SHALL animate the combined-years figure with `CountUp` over 1.2 seconds triggered at viewport threshold 0.4.
12. THE Trainer_Showcase SHALL reveal the Roster tray as one continuous stagger sequence across all grid rows, indexed 0 through 5, rather than one sequence per row.

### Requirement 4: Interaction

**User Story:** As a visitor interested in a specific coach, I want hovering, focusing or tapping a card to reveal how that coach works and how to book them, so that I can act on interest at the moment it appears.

*Addresses P8 (no conversion affordance). Supports SC6 and SC9.*

#### Acceptance Criteria

1. WHEN a pointer hovers a Roster_Card at 1024px and above, THE Roster_Card SHALL scale the cutout to 1.04 about `bottom center`, lift the plinth by 6px, raise the backdrop plate to opacity 0.16, draw the name underline from 0% to 100% width, raise the Hex_Index_Chip glow to opacity 0.14, and slide the Dossier_Layer to opacity 1 and offset 0.
2. WHEN keyboard focus enters a Roster_Card's link, THE Roster_Card SHALL apply the same visual end states specified in criterion 4.1, including making the Dossier_Layer content visible at opacity 1.
3. WHEN a visitor presses a Roster_Card by touch or pointer, THE Roster_Card SHALL scale to 0.98 over 180ms and draw the name underline, so that tapping produces a visible cue.
4. THE Roster_Card SHALL express every hover, focus and press state as a CSS group variant, holding zero React state, zero effects and zero event handlers.
5. WHEN a visitor activates a Roster_Card, THE Roster_Card SHALL navigate to `trainer.ctaHref` when that field is present and to the section-level booking target otherwise.
6. THE Trainer_Showcase SHALL implement zero cursor-following or pointer-tracking effects on any card or plinth.
7. WHILE a pointer leaves a Roster_Card or focus leaves its link, THE Roster_Card SHALL return every state from criterion 4.1 to its resting value.

### Requirement 5: Responsive Behaviour

**User Story:** As a visitor on a phone, tablet or desktop, I want the section to present the same roster and the same facts in a layout suited to my device, so that nothing is lost or broken on the device I actually use.

*Addresses P7 (wasted space). Supports SC2 and SC3 at every breakpoint.*

#### Acceptance Criteria

1. WHILE the viewport width is 1024px or greater, THE Trainer_Showcase SHALL render the Lead_Coach as a 48%/52% two-column spread capped at 980px wide and vertically centred, and the Roster_Grid as three columns across two rows, with the Roster_Cta_Tile in the final cell.
   - *Revised from 57%/43% uncapped. At the full 1280px content width the 57% column put the Lead_Plinth at 702px wide and therefore 878px tall (`aspect-[4/5]` derives height from width), which cost roughly three viewports of scroll for one coach and left the 43% dossier column — one credential row today — with a void beneath it. The cap is on the spread's **width**, never the frame's height: a `max-height` on the frame would override the derived height, re-crop the cutout horizontally and falsify both Property 20 and the CLS-0 guarantee in Requirement 7.7.*
2. WHILE the viewport width is between 640px and 1023px, THE Trainer_Showcase SHALL render the Lead_Coach plinth full width with the Trainer_Dossier stacked below it, and the Roster_Grid as two columns across three rows.
3. WHILE the viewport width is below 640px, THE Roster_Grid SHALL render a horizontally snapping swipe strip at 85% card width with a `StripNavigator` below it, and SHALL render the Roster_Cta_Tile as the strip's final cell.
4. THE Trainer_Showcase SHALL keep `document.documentElement.scrollWidth` less than or equal to `clientWidth` at viewport widths 320, 375, 390, 430, 768, 1024 and 1440px.
5. WHILE the viewport width is below 1024px, THE Dossier_Layer SHALL render at opacity 1 and offset 0 without requiring any interaction.
6. WHILE the viewport width is below 1024px, THE Trainer_Plinth SHALL render the backdrop plate layer at `display: none`, so that the layer paints nothing and its lazily-loaded image is never fetched. THE Trainer_Plinth SHALL achieve this with a `hidden lg:block` wrapper rather than an opacity or visibility change, since only `display: none` suppresses the fetch.
7. WHEN the Roster_Grid renders, THE Roster_Grid SHALL mount exactly one of the swipe-strip tree and the grid tree as a displayed tree at a given viewport width, hiding the other with `display: none`, so that no coach is presented twice and images in the hidden tree are never fetched.
8. THE Trainer_Showcase SHALL render the texture plane at opacity 0.045 below 640px, 0.055 between 640px and 1023px, and 0.06 at 1024px and above.
9. THE Trainer_Showcase SHALL pin no element at any viewport width and SHALL intercept no scroll or touch events.

### Requirement 6: Accessibility

**User Story:** As a visitor using a screen reader, a keyboard, or reduced-motion settings, I want every coach and every stated fact to be reachable and readable, so that the section's content does not depend on sight, a pointer, or animation.

*Satisfies SC7 and SC9.*

#### Acceptance Criteria

1. WHEN the Trainer_Showcase renders, THE Trainer_Showcase SHALL expose exactly one heading-level-3 element whose accessible name contains that coach's name, for each coach in the section.
2. WHILE a Roster_Card is at rest and has received no pointer or keyboard interaction, THE Roster_Card SHALL render the coach's name, role and at least one discipline value in flow at opacity 1.
3. THE Trainer_Showcase SHALL mark every atmosphere, backlight, texture, grounding, halo, index-numeral and backdrop-plate layer with `aria-hidden="true"` and `pointer-events: none`.
4. WHEN a keyboard user tabs through the section, THE Trainer_Showcase SHALL expose one real `<a>` element per Roster_Card plus the Roster_Cta_Tile action, SHALL render a 2px `brand-yellow` focus outline at 2px offset on the focused link, and SHALL reveal that card's Dossier_Layer content on `focus-within`.
5. WHILE Reduced_Motion is active, THE Trainer_Showcase SHALL render every coach's name, role, discipline, credentials and call to action readable without interaction, SHALL resolve every Camera_Plane to `y = 0` with no dolly and no `will-change`, and SHALL report an identity computed `transform` on every element at rest.
6. THE Trainer_Showcase SHALL render the section heading as `<h2>`, each coach name as `<h3>`, the Roster as a `<ul>` with one `<li>` per Roster_Card, and the Lead_Coach as an `<article>` outside that list.
7. WHEN the Trainer_Showcase renders a per-coach action, THE Trainer_Showcase SHALL set its accessible name to `Book a session with {name}, {title}`.
8. THE Trainer_Showcase SHALL render name and role text at a contrast ratio of at least 15:1 against the Label_Pool, discipline pips at a ratio of at least 9:1, and the eyebrow at a ratio of at least 12:1 against the section background.
9. THE Trainer_Showcase SHALL set each cutout's `alt` to the coach's name and role from the Content_Registry, and SHALL set the backdrop plate's `alt` to the empty string.
10. THE Trainer_Showcase SHALL render the coach's name exactly once per coach in the accessibility tree, suppressing the in-frame name on the Lead_Coach plinth because the Trainer_Dossier carries that identity.
11. IF the Camera_System provider is absent, THEN THE Trainer_Showcase SHALL render complete and static at intensity 0 and emit a development-only warning.

### Requirement 7: Performance

**User Story:** As a visitor on a mid-range phone, I want the section to load and scroll without stutter or layout jumps, so that the page feels as composed as it looks.

*Satisfies SC8.*

#### Acceptance Criteria

1. THE Trainer_Showcase SHALL serve all six cutouts through `next/image` with lazy loading, no `priority` flag, and a `sizes` attribute matching each call site's rendered width.
2. WHERE the viewport width is 1024px or greater, THE Trainer_Plinth SHALL render the backdrop plate through `next/image` with lazy loading and `quality={55}`.
3. THE Content_Registry SHALL supply every backdrop plate at 200KB or less, which requires recompressing `public/back/mohammed-wajeed.jpg` from its current 717KB before release.
4. THE Trainer_Showcase SHALL render the texture plane as a CSS `background-image` reusing `public/images/sections/programs/luxury-grid-pattern.webp`, adding zero additional `next/image` instances.
5. THE Trainer_Showcase SHALL animate zero non-Composited_Property values, and SHALL apply no `filter`, animated `box-shadow` or `backdrop-filter`.
6. THE Trainer_Showcase SHALL apply `will-change` only through the Camera_System, and only to the two overscan planes.
7. THE Trainer_Showcase SHALL contribute 0 to Cumulative Layout Shift, achieved by fixing every frame's aspect ratio, containing oversized type inside `overflow-hidden`, and restricting interaction states to `transform` and `opacity`.
8. THE Trainer_Showcase SHALL remain a Server Component, SHALL ship zero client JavaScript for Roster_Cards and Trainer_Plinths, and SHALL add at most three hydrated client components.
9. WHILE a visitor scrolls the section, THE Trainer_Showcase SHALL trigger zero React re-renders, driving all camera motion through `MotionValue` state.
10. THE Trainer_Showcase SHALL register at most four scroll subscriptions.

### Requirement 8: Content Integrity

**User Story:** As the gym owner, I want the section to state only facts I have supplied and to look complete whatever subset of those facts exists, so that the page never publishes an invented or partial claim about my staff.

*Addresses P5 (thin supporting copy). Satisfies SC1.*

#### Acceptance Criteria

1. WHEN the Trainer_Showcase resolves the combined-years figure, THE Section_Assembler SHALL return the exact sum of `yearsExperience` across all trainers when every trainer supplies that field, and SHALL return `null` when one or more trainers omit it; and WHERE the result is `null`, THE Trainer_Showcase SHALL omit the combined-years figure and its sentence.
2. WHEN the Section_Assembler resolves dossier rows for a coach whose `discipline` array holds at least one value, THE Section_Assembler SHALL return between 1 and `MAX_DOSSIER_ROWS[variant]` rows — 2 for the roster variant and 5 for the lead variant — each with a non-empty label and a non-empty value, ordered Experience, then Certified, then Focus.
3. THE Content_Registry SHALL populate `yearsExperience`, `certifications`, `philosophy` and `signatureAchievement` only from facts supplied by the gym owner, and SHALL derive `discipline` values by rewording each coach's existing `title`.
4. THE Content_Registry SHALL require `discipline` on every trainer and SHALL treat `yearsExperience`, `certifications`, `signatureAchievement`, `philosophy`, `backdropSrc`, `ctaHref` and `lead` as optional fields.
5. WHILE a Roster_Card renders at a given viewport width, THE Trainer_Plinth SHALL hold the Label_Pool's rendered height constant regardless of which optional trainer fields are populated, placing every variable-length value in the Dossier_Layer overlay.
6. WHERE a coach supplies `signatureAchievement`, THE Trainer_Plinth SHALL render the achievement badge in the roster variant in place of the second discipline pip row and truncate the pips to one, using `Badge variant="informational"` so that the accent budget in criteria 2.4 and 2.5 holds for any number of achievement-carrying coaches; and THE Trainer_Dossier SHALL render the Lead_Coach's achievement as `Badge variant="achievement"` in the lead column, which is the sole owner of the yellow achievement treatment.
7. WHILE the Trainer_Plinth renders in the lead variant, THE Trainer_Plinth SHALL render the role only in its Label_Block, omitting the name, the discipline pips and the achievement badge, because the Trainer_Dossier column beside it owns the Lead_Coach's identity and credentials; so that no fact about the Lead_Coach is stated twice within the lead spread.
8. IF a coach's `backdropSrc` is absent, THEN THE Trainer_Plinth SHALL omit the backdrop plate layer and SHALL still express hover and focus through the cutout scale, the plinth lift and the accent draw.
9. IF a cutout asset returns 404, THEN THE Trainer_Plinth SHALL render the image's alt text over the Plinth_Surface and SHALL still render the frame, Label_Pool, Hex_Index_Chip and Dossier_Layer.
10. THE Trainer_Showcase SHALL pass only JSON-serialisable trainer data across the Server-to-Client boundary, containing no functions, `Date` values or class instances.
