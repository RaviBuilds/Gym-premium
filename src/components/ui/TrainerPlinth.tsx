import Image from "next/image";

import { MaskedLine } from "@/components/motion/MaskedLine";
import { Badge } from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";
import { Heading } from "@/components/ui/Heading";
import type { HeadingLevel } from "@/components/ui/Heading";
import { RosterIndexChip } from "@/components/ui/RosterIndexChip";
import { TrainerDossier } from "@/components/ui/TrainerDossier";
import { MAX_ROSTER_PIPS } from "@/components/sections/trainer-showcase/roster";
import type { PlinthVariant } from "@/components/sections/trainer-showcase/roster";
import { HEX_CLIP } from "@/lib/shapes";
import { cn } from "@/lib/utils";
import type { Trainer } from "@/types/content";

/**
 * TrainerPlinth — the one containment frame every coach in "Train With Experts"
 * is composed from (design.md §5.1, §13.2).
 *
 * The section's original problem (P1) was not lighting or typography: it was
 * that a transparent PNG cutout on flat near-black has nothing to stand on and
 * nothing to be framed by, so six people read as six floating silhouettes. This
 * component is the fix. It gives each cutout a lit vertical face to stand
 * against, a hairline edge to be framed by, a texture plane for material, and a
 * contact shadow plus floor light to sit them on the floor — all beneath the
 * photograph, all static, all invisible to assistive tech.
 *
 * ## The two-wrapper containment rule — read this before restructuring
 *
 * There are exactly two boxes here and their clipping behaviour is opposite by
 * design (Requirement 2.6). This is Phase 5's hard-won compositing lesson,
 * carried forward verbatim, and it is the single easiest thing to break:
 *
 * 1. **Outer wrapper — `relative`, and NEVER `overflow-hidden`.** Its only job
 *    is to hold the backlight and give it room to bleed past the frame
 *    (`-inset-4 lg:-inset-6`) and reach zero alpha in open space. Phase 4 had
 *    the backlight trapped inside the same clipping box as the cutout, so its
 *    residual opacity was sliced into a straight edge — which is precisely what
 *    rendered as a visible grey rectangle behind every trainer. Adding
 *    `overflow-hidden` (or a `clip-path`, or a `mask`) to this element
 *    reintroduces that rectangle.
 * 2. **Inner frame — `relative overflow-hidden aspect-[4/5]`.** The clipping
 *    boundary. Everything except the backlight lives inside it, so an oversized
 *    graphic — a texture tile, a hex chip, a display numeral, a cutout scaled to
 *    1.04 on hover — can never escape the frame or widen the page. It also
 *    fixes the frame's aspect ratio, which is what keeps this component's CLS
 *    contribution at 0 (Requirement 7.7).
 *
 * The bleed is kept deliberately small: the roster's grid gutters are 32–40px,
 * so a wider spread would let adjacent coaches' backlights merge into one wash.
 *
 * ## Why this component ships zero client JavaScript
 *
 * There is no `"use client"` directive here, and there must never be one
 * (Requirement 7.8, design.md §6.2). `TrainerPlinth` renders in whichever tree
 * imports it, which today is the Server tree for all six coaches — so six
 * plinths cost the homepage's hydration budget exactly nothing.
 *
 * That is affordable because the component holds no state, runs no effects and
 * binds no event handlers. Every interaction the design asks for is expressed as
 * a CSS group variant off the ancestor `<a class="group">` in `RosterCard`:
 * `lg:group-hover:`, `group-focus-visible:` and `group-focus-within:`. A
 * `useState`-driven hover would force this file — and therefore `RosterCard` and
 * all five of its instances — into the client bundle for an effect Tailwind
 * already expresses. It would also need a second code path for keyboard users,
 * where `group-focus-within:` gives that parity for free.
 *
 * Everything animated is `transform` or `opacity` only, gated behind
 * `motion-safe:`. No animated `filter`, no animated `box-shadow`, no
 * `backdrop-filter` (Requirements 7.5, 7.7). The file contains exactly one
 * `filter` — the backdrop plate's `grayscale brightness-75` — and it is a fixed
 * value that no variant, breakpoint or interaction ever changes, so the filter
 * pass runs once at paint and never again. Read
 * {@link BACKDROP_PLATE_FILTER_CLASS} before "fixing" it.
 *
 * ## Paint order inside the inner frame
 *
 * Layers are ordered bottom → top by the z-index scale in design.md §5.1, and
 * the source below follows that order top-to-bottom so the file reads the way
 * the frame composites. Ranges are left deliberately sparse so later layers can
 * slot in without renumbering:
 *
 * | z    | Layer                                    | Owner     |
 * |------|------------------------------------------|-----------|
 * | —    | Backlight (on the outer wrapper)          | this file |
 * | 0    | Plinth surface gradient                   | this file |
 * | 0    | Frame edge light (hairline + light side)   | this file |
 * | 1    | Texture plane                             | this file |
 * | 5    | Backdrop plate (`hidden lg:block`)        | this file |
 * | 6    | Grounding — contact shadow + floor light  | this file |
 * | 10   | Cutout                                    | this file |
 * | 20   | Label pool                                | this file |
 * | 30   | Hex index chip + label block              | this file |
 * | 40   | Dossier layer (roster only)               | TrainerDossier |
 *
 * Every layer this file paints is decorative, and every one of them carries both
 * `aria-hidden="true"` and `pointer-events-none` (Requirement 6.3). Two things
 * are the exception, because they are real content rather than lighting: the
 * cutout, which carries `trainer.imageAlt` from the Content_Registry
 * (Requirement 6.9), and the label block at z-30, which carries the coach's
 * name, role and discipline.
 *
 * ## Identity is never hover-gated
 *
 * The label block sits in normal flow at opacity 1 with no interaction of any
 * kind (Requirement 6.2). On a roster card the name is a real `<h3>`, the role and
 * at least one discipline value are plain text beside it, and none of the three is
 * behind a `group-hover:` variant. Only *elaboration* — the philosophy line and
 * the booking affordance in `TrainerDossier` — waits for hover or focus, and only
 * above `lg:` (Requirement 5.5). A visitor who never moves their pointer still
 * learns who every coach is and what they coach.
 *
 * ## What the label block states, by variant
 *
 * The two variants state different facts, and that is a content rule rather than a
 * styling one (Requirement 8.7):
 *
 * - **`roster`** — name, role, up to `MAX_ROSTER_PIPS` discipline pips, and the
 *   achievement badge when the coach has one. The card is that coach's only
 *   appearance in the section, so the frame carries all of it.
 * - **`lead`** — the **role only**. The frame is one half of a spread whose other
 *   half is a full `TrainerDossier` column, and that column owns the name, the
 *   pips and the achievement. Stating any of them here too would put the same fact
 *   twice inside one spread — two yellow achievement chips 52% of a container
 *   apart. The name is dropped by `suppressName`; the pips and the badge by the
 *   variant itself.
 */

/**
 * Texture plane tuning — the in-frame material pass.
 *
 * Reuses the already-approved Programs asset and renders it as a CSS
 * `background-image`, never a second `next/image`: the pattern has to TILE, and
 * six extra image elements for a 6%-opacity texture would be six requests and
 * six paints bought for nothing (Requirement 7.4).
 *
 * `SIZE` scales the tile to the frame's full width at its natural aspect ratio
 * so it is never stretched, and `REPEAT` stacks copies downward so the plane
 * stays continuous however tall the frame gets.
 *
 * The mask is expressed in **percentages, not pixels**, which is the one place
 * this diverges from `Programs.tsx`'s 56px fade. That plane spans a whole card
 * row of roughly fixed height; this one lines a frame whose height ranges from
 * about 200px in the mobile swipe strip to about 600px on the lead spread, and a
 * fixed 56px fade would eat a quarter of the small frame while barely touching
 * the large one. Percentages keep the fade proportionate at every breakpoint,
 * so the texture never terminates on a hard horizontal edge inside the frame.
 */
const TEXTURE_URL = "url('/images/sections/programs/luxury-grid-pattern.webp')";
const TEXTURE_SIZE = "100% auto"; // full width, natural aspect ratio — no stretch
const TEXTURE_REPEAT = "repeat-y"; // tile downward so the plane never runs out
const TEXTURE_FADE_MASK =
  "linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%)";

/**
 * Responsive texture opacity (Requirement 5.8): 0.045 below 640px, 0.055 from
 * 640–1023px, 0.06 at 1024px and above.
 *
 * **Note on a spec discrepancy.** design.md §5.1's paint-order table lists a
 * flat `opacity 0.06` for this plane. Requirement 5.8 asks for the three-step
 * ramp above. The requirement wins, and the two are reconcilable rather than
 * contradictory: 0.06 is the `lg:` value in both documents, and the ramp only
 * lowers the plane on smaller frames — where the tile is scaled down, its lines
 * land closer together, and a flat 6% starts to read as noise instead of
 * material. The requirement is the tuned version of the same number.
 */
const TEXTURE_OPACITY_CLASS = "opacity-[0.045] sm:opacity-[0.055] lg:opacity-[0.06]";

/**
 * Backlight radials — soft photographic bounce behind the subject, not a glow.
 *
 * Preserved verbatim from the Phase 5 implementation, including the origin at
 * ~30–32% down the frame (head/shoulder height for an `object-bottom` portrait)
 * and the three-stop falloff. Peak alpha stays under the design's ceilings:
 * ≤13% white for the roster, ≤11% brand-yellow for the lead (design.md §5.1).
 *
 * The lead's warmth is why it is a separate value rather than one shared
 * gradient — it is the section's featured coach and reads a half-stop warmer
 * than the roster, which stays neutral so five neutral cards do not compete
 * with the one accented spread.
 */
const BACKLIGHT_BY_VARIANT: Record<PlinthVariant, string> = {
  lead: "bg-[radial-gradient(ellipse_75%_60%_at_50%_30%,_rgba(234,179,8,0.11)_0%,_rgba(234,179,8,0.035)_45%,_transparent_75%)]",
  roster:
    "bg-[radial-gradient(ellipse_70%_55%_at_50%_32%,_rgba(255,255,255,0.13)_0%,_rgba(255,255,255,0.04)_45%,_transparent_72%)]",
};

/**
 * Plinth surface — the lit vertical face the cutout stands against.
 *
 * A three-stop white gradient reaching transparent at 72%, deliberately **not**
 * a card fill: a flat panel behind a cutout reads as a box, whereas a gradient
 * that dies out two-thirds down reads as a surface catching light from above.
 * Values are exactly those specified in design.md §5.1 — they are tuned, and
 * raising the 0.055 peak is what turns the surface back into a box.
 */
const PLINTH_SURFACE_GRADIENT =
  "linear-gradient(180deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.015) 45%, transparent 72%)";

/**
 * Backdrop plate visibility — `hidden lg:block`, and it has to be exactly that
 * (Requirement 5.6, design.md §5.1's `z-5` row).
 *
 * The plate is the only layer in this component that costs a network request, so
 * "hidden below `lg:`" has to mean *not fetched* below `lg:`, not merely *not
 * visible*. Only `display: none` delivers that. `opacity-0 lg:opacity-100`,
 * `invisible lg:visible` and a `clip-path` all keep the element in the layout
 * tree, which keeps its `<img>` in the browser's lazy-load queue — so a phone
 * would download six 100–200KB backdrops it can never reveal, on a section that
 * sits well below the fold. `display: none` removes the box entirely and the
 * fetch never enters the queue.
 *
 * The same mechanism is what task 9.2 uses to mount one of the swipe strip and
 * the grid without double-fetching either tree's cutouts (Requirement 5.7), so
 * changing this one to an opacity trick would also make that pattern look
 * optional. It is not.
 *
 * Consequence worth stating: the plate's reveal is desktop-only by construction,
 * so the hover and focus classes below need no `max-lg:` reset. Below `lg:` the
 * element does not exist to be revealed, and Requirement 8.8's other three
 * hover cues — cutout scale, plinth lift, accent draw — carry the
 * interaction on their own there, exactly as they do for a coach who has no
 * `backdropSrc` at all.
 */
const BACKDROP_PLATE_VISIBILITY_CLASS = "hidden lg:block";

/**
 * Backdrop plate treatment — a static `filter`, deliberately.
 *
 * `grayscale` strips the photo's colour so the plate reads as depth behind the
 * coach rather than as a second, competing photograph, and `brightness-75`
 * drops it far enough under the plinth surface that the cutout keeps its
 * separation. Both values are exactly what design.md §5.1 specifies.
 *
 * **This is a `filter`, and that is intentional — do not "fix" it.**
 * Requirement 7.5 bans *animated* `filter`, animated `box-shadow` and
 * `backdrop-filter`, because those re-run a paint the compositor cannot skip on
 * every frame. A filter with a fixed value is a different thing: it resolves
 * once when the layer is first painted and is then baked into the layer the
 * compositor reuses. The animated property here is `opacity` and nothing else
 * (see {@link BACKDROP_PLATE_OPACITY_CLASSES}), which is why the two rules do
 * not actually collide.
 *
 * It lives on the `<img>` rather than on the wrapper on purpose, which keeps the
 * two concerns in separate boxes: the wrapper owns whether the layer exists and
 * how opaque it is, the image owns how it looks. A `filter` on the wrapper would
 * also make it a containing block for its descendants — harmless today, and a
 * trap for whoever adds the next child.
 */
const BACKDROP_PLATE_FILTER_CLASS = "grayscale brightness-75";

/**
 * The plate's opacity, at rest and revealed: `0 → 0.16` on hover/focus
 * (Requirement 4.1, design.md §5.1).
 *
 * 0.16 is a ceiling, not a starting point. The plate sits *under* the grounding
 * radials and the cutout but *over* the texture plane, so anything brighter
 * starts to compete with the plinth surface for the eye and the frame stops
 * reading as one lit object. At 16% it registers as the room behind the coach
 * coming faintly into focus, which is the whole intent.
 *
 * Variants match the convention the rest of this section uses — `lg:group-hover:`
 * for pointer, `group-focus-visible:` for keyboard, both off the ancestor
 * `<a class="group">` in `RosterCard` — so keyboard users get the same reveal
 * with no second code path and no client JavaScript. `focus-visible` rather than
 * `focus-within` because the anchor *is* the focusable element here; the wider
 * `focus-within` is reserved for the dossier layer, where Requirement 6.4 names
 * it explicitly.
 *
 * Only `opacity` transitions, and the transition is `motion-safe:`-gated so a
 * reduced-motion visitor gets the same end state instantly instead of a
 * half-second cross-fade. The `duration-500` is the Closed_Motion_Vocabulary's
 * 0.5s value — no new timing is introduced.
 */
const BACKDROP_PLATE_OPACITY_CLASSES =
  "opacity-0 lg:group-hover:opacity-[0.16] group-focus-visible:opacity-[0.16]";
const BACKDROP_PLATE_TRANSITION_CLASSES =
  "ease-out motion-safe:transition-opacity motion-safe:duration-500";

/**
 * `next/image` `quality` for the plate (Requirement 7.2).
 *
 * The cutouts keep Next's default 75, because they are the photograph a visitor
 * actually looks at. The plate is greyscaled, dimmed to 75% brightness and then
 * composited at 16% opacity behind a person — three passes that destroy exactly
 * the detail a higher quality would have paid for. 55 is the point where the
 * bytes drop meaningfully and nothing visible changes.
 */
const BACKDROP_PLATE_QUALITY = 55;

/**
 * Grounding — the two radials that put the subject on the floor rather than in
 * front of it. Phase 5 geometry, unchanged.
 *
 * `CONTACT_SHADOW` is the dense ellipse directly under the feet, sized 70% × 12%
 * and bottom-centred by its call site. `FLOOR_LIGHT` is the wider, much fainter
 * pool of bounced light at 92% height.
 *
 * Both are radials on purpose. An earlier pass used a full-width `180deg` linear
 * band for the floor light, which cannot fade left or right, so it clipped into
 * a visible horizontal strip at the frame's edges. A radial fades on every side
 * and has no edge to clip.
 */
const CONTACT_SHADOW_GRADIENT = "radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, transparent 65%)";
const FLOOR_LIGHT_GRADIENT =
  "radial-gradient(ellipse 55% 40% at 50% 92%, rgba(255,255,255,0.06) 0%, transparent 70%)";

/**
 * Label pool — the ink gradient the label block is drawn over (design.md §5.1,
 * §5.2).
 *
 * Three stops rising from `rgba(20,24,29,0.92)` at the frame's bottom edge to
 * fully transparent at the pool's top, which is where the two competing needs
 * meet: white type over 92% ink composited on the section's Ink background
 * measures ≈18:1, comfortably past Requirement 6.8's 15:1 floor, while the
 * gradient's own top reaching zero alpha means the pool never terminates on a
 * visible horizontal band across the photograph. A flat 92% scrim would clear
 * the contrast bar just as well and read as a black bar taped over the coach's
 * legs.
 *
 * `0deg` because the gradient is authored bottom-up: stop 0% is the frame's
 * bottom edge, which is the densest end.
 */
const LABEL_POOL_GRADIENT =
  "linear-gradient(0deg, rgba(20,24,29,0.92) 0%, rgba(20,24,29,0.72) 45%, transparent 100%)";

/**
 * The pool's height — **38% of the frame, for every coach, always**
 * (Requirement 8.5, and the postcondition in design.md §13.2).
 *
 * This one constant is the reason the roster reads as a lineup rather than five
 * separate cards, so it is worth being explicit about what it is *not*: it is
 * not derived from the label block's content, it does not grow for a coach who
 * has an achievement badge, and it does not shrink for one whose `discipline`
 * array holds a single entry. It is a percentage of a frame whose aspect ratio
 * is fixed at 4:5, which makes the pool's rendered height a pure function of the
 * frame's width — i.e. of variant and breakpoint only.
 *
 * That is what puts every variable-length value — the philosophy line, the
 * credential rows — in the dossier overlay instead of in here. Anything
 * that can be one line for one coach and three for another cannot live in a box
 * whose height is not allowed to change.
 */
const LABEL_POOL_HEIGHT_CLASS = "h-[38%]";

/**
 * The label block's frame padding and internal rhythm — the geometric fix for P2
 * (design.md §5.2, §5.5, Requirement 2.2).
 *
 * Before this, names sat *below* each frame and therefore keyed off the bottom
 * of the subject's cutout, so a coach whose PNG carried more headroom got a name
 * sitting lower than their neighbour's. Six coaches, six different label
 * positions, and no amount of grid tidiness could hide it.
 *
 * The fix is to measure from the frame instead of from the subject: the block is
 * absolutely pinned to the frame's own bottom edge and inset by a fixed padding,
 * with a fixed internal rhythm above it. The offset from the frame's bottom edge
 * to the name baseline is then the sum of four constants — bottom padding, the
 * credential row's fixed height, `gap-2`, and the role's line box, plus `gap-1`
 * — none of which depends on the coach. Five roster names land on the same
 * baseline by construction rather than by luck.
 *
 * The two gaps are different values on purpose, and cannot come from one flex
 * container: name→role is `gap-1` because a name and its role are one unit, and
 * role→pips is `gap-2` because the pips are a separate class of information. So
 * the block nests a `gap-1` identity group inside a `gap-2` column.
 */
const LABEL_BLOCK_PADDING_CLASS = "p-4 lg:p-5";

/**
 * Fixed height for the credential row that closes the **roster** label block —
 * the pips, and the achievement badge when there is one.
 *
 * Roster only, because that row exists only there: Requirement 8.7 gives the lead
 * variant a label block of the role alone, so the lead has no credential row to
 * size. Nothing about the geometry below changes as a result — this constant, its
 * value and its call site are exactly what they were when the lead also rendered
 * pips, since the row was always sized against the five roster cards that share a
 * baseline and never against the lead, which has no sibling to match.
 *
 * **This is the load-bearing half of Requirement 2.2.** Bottom-pinning the block
 * only fixes the name's baseline if everything *below* the name is also fixed,
 * and the badge is taller than a pip row: `Badge`'s own `py-1.5` at
 * `text-caption` measures ≈31px against ≈20px for a bare pip. Left to size
 * itself, a coach with `signatureAchievement` would push their name ~11px higher
 * than the coach beside them — the exact defect this task exists to remove,
 * reintroduced through the back door.
 *
 * `h-7` (28px) is therefore asserted on the row and holds whatever it contains:
 * a bare pip row, a pip plus a badge, or nothing at all. Both cases are centred
 * in it, so the slot is never visibly empty at the top or bottom. It is a
 * constant rather than a breakpoint ramp because the pip and badge type is
 * `text-caption` at every width, so there is nothing for a ramp to track.
 *
 * The badge's padding is trimmed to `px-2 py-0.5` at the call site to fit inside
 * that slot with margin. Its font size is untouched: `Badge` owns its type, and
 * overriding a component's type from a call site is how a design system starts
 * drifting.
 */
const CREDENTIAL_ROW_HEIGHT_CLASS = "h-7";

/**
 * Type treatments for the label block, mapped to design.md §5.5.
 *
 * ### The one deliberate deviation: role colour
 *
 * §5.5 specifies `text-zinc-400` for the role, carried over unchanged from the
 * current implementation — where the role sits on the section background, not on
 * a scrim over a photograph. Measured over this pool, `#a1a1aa` composited on
 * Ink is ≈7.4:1, and Requirement 6.8 puts the floor for **both** the name and
 * the role at 15:1. The requirement wins, so the role renders at `text-white/95`
 * (≈16.6:1), which keeps a measurable margin above the floor.
 *
 * Nothing is lost by it. The role's subordination to the name was never carried
 * by colour: it is 12px micro-caps at `font-medium` with wide tracking, under a
 * 20–28px bold name. The size, weight and tracking do the hierarchy, and they
 * are exactly as §5.5 specifies.
 *
 * Pips stay at `text-white/70` (≈9.4:1) — the ratio §5.2 names and Requirement
 * 6.8's separate 9:1 floor for pips allows, and a real third step down from the
 * role rather than a fourth shade of near-white.
 */
const NAME_CLASSES = "tracking-tight text-white";
const ROLE_CLASSES = "font-body text-xs font-medium uppercase tracking-widest text-white/95";
const PIP_LABEL_CLASSES =
  "truncate font-body text-caption font-semibold uppercase tracking-[0.14em] text-white/70";

/**
 * The role line's box, by variant — and the fix for the section's most visible
 * polish defect (Requirement 2.2, 8.5).
 *
 * ## What was wrong with `truncate` on the roster
 *
 * Both variants used to render the role as `truncate`, single-line, and the reason
 * given was sound: a title that wrapped to a second line would push the name up
 * and break the baseline every roster card shares. The consequence, though, was
 * that three of the five roster coaches shipped visible mid-word ellipses at
 * `lg:` — a 3-column card is ~400px wide, and "Personal Trainer & Fitness
 * Counsellor" at 12px micro-caps with `tracking-widest` does not fit in it. Two
 * others were one word from the same fate. An ellipsis in the middle of a person's
 * job title is not a graceful degradation; it reads as a layout that was never
 * checked.
 *
 * ## Why a *fixed* two-line box, not `min-h` and not `line-clamp` alone
 *
 * `h-8` (32px = exactly two lines of `text-xs`/`leading-4`) is asserted rather than
 * minimum, and that is the whole trick: the box is two lines tall whether the title
 * needs one line or two, so it contributes the **same** height on every card and
 * the name's baseline stays locked across the row. `min-h-8` would have let a
 * three-line title grow the box and reintroduce exactly the drift `truncate` was
 * guarding against; `line-clamp-2` without the fixed height would do the same for
 * one-line titles, shrinking their box by 16px relative to their neighbours'.
 *
 * `line-clamp-2` then handles the pathological case — a title too long for even two
 * lines still clips instead of overflowing the pool — so the guarantee is
 * unconditional on content, which is what Requirement 8.5 asks of the label pool.
 * `leading-4` is stated explicitly rather than inherited from `text-xs`'s default
 * `line-height: 1rem`, because the fixed height is arithmetic on that value and a
 * theme change to the token should not silently make `h-8` mean 1.8 lines.
 *
 * ## The lead keeps `truncate`, deliberately
 *
 * The lead plinth is one frame with no sibling to baseline-match, so reserving a
 * second line there buys nothing and would leave 16px of empty pool under a
 * one-line role. Its title ("Fitness Guru") is also the shortest in the registry on
 * a frame 447px wide, so the truncation it keeps can never fire. Keyed by variant
 * rather than by `framesCredentials`: that flag answers "does the frame own this
 * coach's credentials", which is a different question that happens to have the same
 * answer today, and conflating the two is how one change starts deciding two things.
 */
const ROLE_BOX_CLASS_BY_VARIANT: Record<PlinthVariant, string> = {
  lead: "truncate",
  roster: "line-clamp-2 h-8 leading-4",
};

/**
 * Visual weight of the coach's name, by variant (design.md §5.5).
 *
 * The lead is the section's largest name at display weight; roster names use the
 * bold body face, which is what lets five of them share one baseline without any
 * single card shouting. The semantic tag is `h3` in both cases regardless — the
 * heading level is the document's outline, the visual level is typography, and
 * `Heading` keeps the two independent on purpose.
 *
 * In practice the lead entry is only reachable when a lead plinth renders
 * without `suppressName`, which the section never does: `LeadCoachStage` passes
 * `suppressName` because its dossier column owns the lead's identity, and
 * Requirement 8.7 puts the role alone in the lead label block for that reason. It
 * is defined anyway so the variant is total — a plinth asked for a lead name
 * renders one at the right weight instead of silently borrowing the roster's.
 */
const NAME_LEVEL_BY_VARIANT: Record<PlinthVariant, HeadingLevel> = {
  lead: "section",
  roster: "subsection",
};

/**
 * The `Badge` variant the plinth's achievement badge uses — `informational`, and
 * only ever `informational` (Requirements 2.4, 8.6, design.md §5.6).
 *
 * ## Why the plinth's badge is not the yellow one
 *
 * `Badge variant="achievement"` is `bg-ink text-brand-yellow`, so it spends the
 * section's scarcest resource. The design's budget is **three** resting yellow
 * points forming a triangle down the page: the eyebrow, the lead's achievement
 * group in `TrainerDossier`, and the CTA tile. A roster card must therefore
 * render **zero** brand-yellow descendants at rest, with its one yellow — the
 * name underline — appearing on hover or focus only.
 *
 * That collides with the yellow variant the moment a roster coach earns an
 * achievement, which is not hypothetical: `signatureAchievement` is an optional
 * field any of the six may be given, and today `mohammed-wajeed` already carries
 * "Mr Nizamabad". Had the roster used the yellow variant, the third achievement
 * in the content file would have quietly turned the spotlight into wallpaper —
 * the failure `globals.css` names as the brand's own rule — and nothing in the
 * code would have flagged it. `informational` (`bg-ink text-white`) already
 * exists and says the same thing in white, so the resting count holds at three
 * for **any** number of achievement-carrying coaches.
 *
 * ## Why it is one constant rather than a per-variant map
 *
 * This used to be a `Record<PlinthVariant, BadgeVariant>` whose `lead` entry was
 * `"achievement"`, on the assumption that a lead plinth might carry the yellow
 * badge itself. Requirement 8.7 removed that case: the lead variant's label block
 * renders the role and nothing else, because the `TrainerDossier` column beside it
 * owns the Lead_Coach's credentials and renders the yellow
 * `Badge variant="achievement"` there. A lead plinth therefore has no badge to
 * style, the map's `lead` entry was unreachable, and a map with one live key is a
 * map that invites someone to "fix" the dead one back into existence.
 *
 * So the yellow achievement treatment has exactly one owner in the section —
 * `TrainerDossier`'s lead column — and this file states the non-yellow half of
 * that split. Note what neither half is: a new `Badge` variant. The trade is a
 * variant *choice*, not new surface area, so `Badge` is untouched.
 */
const ACHIEVEMENT_BADGE_VARIANT: BadgeVariant = "informational";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Interaction states (Requirements 4.1–4.4, 4.6, 4.7, design.md §8.4)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Requirement 4.1 names **six** things that happen together when a pointer
 * hovers a roster card at 1024px and above, and Requirement 4.2 requires keyboard
 * focus to reach the same six end states. They are owned as follows:
 *
 * | # | End state                        | Owner                              |
 * |---|----------------------------------|------------------------------------|
 * | 1 | cutout `scale(1.04)` from feet   | {@link CUTOUT_SCALE_CLASSES}       |
 * | 2 | plinth lifts 6px                 | {@link PLINTH_LIFT_CLASSES}        |
 * | 3 | backdrop plate to opacity 0.16   | `BACKDROP_PLATE_OPACITY_CLASSES`   |
 * | 4 | name underline draws 0% → 100%   | {@link NAME_UNDERLINE_CLASSES}     |
 * | 5 | hex chip glow to opacity 0.14    | `RosterIndexChip`                  |
 * | 6 | dossier to opacity 1, offset 0   | `TrainerDossier`                   |
 *
 * Four rules hold across all six, and are worth stating once here rather than six
 * times below:
 *
 * 1. **Every state is a CSS group variant** off the ancestor `<a class="group">`
 *    in `RosterCard` — `lg:group-hover:`, `group-focus-visible:`,
 *    `group-focus-within:`, `group-active:`. There is no React state, no effect
 *    and no event handler in this file or in `TrainerDossier` / `RosterIndexChip`
 *    (Requirement 4.4), which is what keeps five cards at zero hydration cost.
 * 2. **They are transitions, not animations.** Nothing here is a keyframe
 *    sequence, so every state returns to its resting value when the pointer or
 *    focus leaves, over the same duration, with no extra declarations
 *    (Requirement 4.7).
 * 3. **Only `transform` and `opacity` animate** (Requirement 7.5) — with one
 *    documented exception, the underline's `background-size`; see
 *    {@link NAME_UNDERLINE_CLASSES}.
 * 4. **Nothing follows the cursor.** No `mousemove`, no pointer-driven custom
 *    property, no per-card camera. The card responds to *being* hovered, never to
 *    *where* it is hovered (Requirement 4.6, design.md §8.4).
 *
 * `motion-safe:` gates the **transitions**, not the end states, everywhere except
 * the press. A reduced-motion visitor still gets the revealed card — the reveal
 * simply arrives instantly instead of over 500ms (design.md §8.5). The press
 * scale is the one state design.md §8.5 removes outright under reduced motion,
 * so there the variant itself is gated.
 */

/**
 * Shared 500ms transform transition for the two hover transforms.
 *
 * `duration-500` is the Closed_Motion_Vocabulary's 0.5s and the value design.md
 * §8.4 gives both the subject scale and the plinth lift (Requirement 3.9). They
 * share one constant because they must stay in step: the frame rising while the
 * subject inside it scales at a different rate is what reads as two objects
 * instead of one lit plinth.
 */
const HOVER_TRANSFORM_TRANSITION_CLASSES =
  "ease-out motion-safe:transition-transform motion-safe:duration-500";

/**
 * State 2 — the plinth lift: the whole frame rises 6px on hover/focus.
 *
 * `-translate-y-1.5` is exactly −6px (0.375rem at the 16px root), so no arbitrary
 * value is introduced for a distance the spacing scale already has.
 *
 * It lives on the **outer wrapper**, not the inner frame, which is what makes it
 * read as the plinth lifting rather than the picture sliding inside its frame:
 * the backlight is a child of the outer wrapper, so it travels with the frame and
 * the bounce stays behind the subject. Putting it on the inner frame would leave
 * the backlight pinned in place, and a 6px slip between a subject and their own
 * bounce light is visible even if it is hard to name.
 *
 * The wrapper already establishes a containing block for the backlight, so adding
 * a transform here changes no layout — it only makes the wrapper a stacking
 * context, which it effectively already was.
 */
const PLINTH_LIFT_CLASSES = "lg:group-hover:-translate-y-1.5 group-focus-visible:-translate-y-1.5";

/**
 * State 1 — the cutout scales to 1.04 about `bottom center`.
 *
 * The origin is already set on the image (`origin-bottom`, task 6.1) and it is
 * load-bearing: a centre-origin scale lifts the coach's feet off the plinth and
 * undoes the contact shadow and floor light beneath them (design.md §8.4). Scale
 * from the feet and the subject grows *into* the frame, which is what a step
 * forward looks like.
 *
 * 1.04 is `scalePresets.medium` expressed as a class rather than imported,
 * because a CSS variant cannot read a JS constant — the same reason
 * `BACKDROP_PLATE_OPACITY_CLASSES` spells 0.16 out. The inner frame's
 * `overflow-hidden` is what makes the 4% overscan safe: the enlarged subject is
 * clipped to the frame and can never widen the page (Requirement 5.4).
 */
const CUTOUT_SCALE_CLASSES = "lg:group-hover:scale-[1.04] group-focus-visible:scale-[1.04]";

/**
 * Press feedback — the card scales to 0.98 over 180ms (Requirement 4.3).
 *
 * Two deliberate choices:
 *
 * - **`group-active:` rather than `active:`.** design.md §8.4 names the `active:`
 *   pseudo-class, and on this element the two would usually agree, since `:active`
 *   matches the ancestors of the pressed element. But the card's press target is
 *   the whole `<a>`, which is larger than this frame — a press that lands on the
 *   link's own box outside the frame would not make the frame `:active`, while
 *   `group-active:` fires from the anchor itself and therefore always matches the
 *   thing the visitor actually pressed.
 * - **The inner frame, not the outer wrapper.** The wrapper owns the 500ms lift;
 *   putting a 180ms scale on the same element would mean one `transition-duration`
 *   for two states with different timings, and the press would inherit the lift's
 *   half-second. Separate elements keep both durations honest.
 *
 * `motion-safe:` gates the *state* here, not just the transition, because
 * design.md §8.5 removes the press scale outright under reduced motion rather
 * than making it instant — a 180ms tap cue has nothing to offer a visitor who
 * asked for no motion.
 *
 * 180ms is the Closed_Motion_Vocabulary's 0.18s (Requirement 3.9).
 */
const FRAME_PRESS_CLASSES = "motion-safe:group-active:scale-[0.98]";
const FRAME_PRESS_TRANSITION_CLASSES =
  "ease-out motion-safe:transition-transform motion-safe:duration-180";

/**
 * State 4 — the name underline: a 2px brand-yellow rule drawn 0% → 100% under the
 * coach's name. **This is the card's one and only yellow** (Requirement 2.4,
 * design.md §5.6).
 *
 * ## The technique is the sitewide one, deliberately
 *
 * `Facilities`, `Accordion`, `Footer` and `Button variant="ghost"` all draw this
 * rule the same way: a `bg-linear-to-r` gradient in the accent colour, sized
 * `0% 2px`, pinned `bg-left-bottom`, `bg-no-repeat`, grown to `100% 2px` under an
 * interaction variant. `Facilities` records in its own comment that the pattern
 * is sitewide. Reusing it means the underline in this section is the same object
 * a visitor has already seen twice on the page, and there is no second underline
 * mechanism to keep in agreement.
 *
 * ## The one deviation from Requirement 7.5, stated plainly
 *
 * `background-size` is neither `transform` nor `opacity`. Requirement 7.5 asks
 * for those two only, so this is a knowing exception rather than an oversight,
 * and it is worth being precise about the trade:
 *
 * - The alternative that satisfies the letter of the rule is a 2px child element
 *   animating `scaleX` from an `origin-left`. That is a real option and it is what
 *   a strict reading would demand.
 * - It was not taken because the sitewide pattern already exists, is already
 *   audited, and appears in four other components. Introducing a second technique
 *   for the same 2px rule in one section would make the section the odd one out
 *   and leave the next person guessing which is house style.
 * - The performance cost is bounded: `background-size` triggers a repaint of the
 *   underline's own box — a 2px strip a name wide — and no layout at all, because
 *   the element's box is unchanged (`pb-1` reserves the space at rest). So it
 *   costs a paint, not a reflow, and contributes nothing to CLS
 *   (Requirement 7.7).
 *
 * If a later pass decides Requirement 7.5 must hold literally, the fix is the
 * `scaleX` child described above and it belongs in every one of the five call
 * sites at once, not just this one.
 *
 * ## Timing: 500ms, not Facilities' 400/300
 *
 * design.md §8.4 gives this draw "400ms in / 300ms out" and `Facilities`
 * implements exactly that. Requirement 3.9 admits only 0.18s / 0.5s / 1.2s, and
 * neither 400 nor 300 is in that set, so the draw runs at `duration-500` here.
 * The technique is inherited; the timing is the section's own.
 *
 * ## Triggers
 *
 * Hover and focus for the states Requirements 4.1 and 4.2 pair, plus
 * `group-active:` so a touch visitor — who has no hover to give — still sees the
 * accent draw when they press the card (Requirement 4.3). Unlike the press scale,
 * the variants here are **not** `motion-safe:`-gated: design.md §8.5 keeps the
 * accent's end state reachable under reduced motion and only drops the animated
 * growth, which is what gating the transition alone achieves. `Facilities` gates
 * the variants themselves; this section's reduced-motion contract is the stricter
 * one, so it gates less.
 */
const NAME_UNDERLINE_CLASSES = cn(
  "inline-block bg-linear-to-r from-brand-yellow to-brand-yellow bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-1",
  "ease-out motion-safe:transition-[background-size] motion-safe:duration-500",
  "lg:group-hover:bg-[length:100%_2px] group-focus-visible:bg-[length:100%_2px] group-active:bg-[length:100%_2px]"
);

/**
 * State 6 — where the dossier layer sits in the frame (design.md §5.1's `z-40`
 * row). The layer's own reveal, scrim and copy belong to `TrainerDossier`; this
 * constant is only its anchor, following the same split `RosterIndexChip` uses.
 *
 * `bottom-[38%]` is keyed to {@link LABEL_POOL_HEIGHT_CLASS} — it parks the
 * layer's bottom edge exactly on the label pool's top edge, and the two literals
 * must be changed together. Two things fall out of that choice:
 *
 * 1. **It never collides with the label block.** The block is pinned inside the
 *    pool, so anchoring above the pool's top edge means the dossier cannot cover
 *    the name, the role or the pips — which matters most below `lg:`, where the
 *    dossier is permanently visible (Requirement 5.5) and would otherwise sit on
 *    top of the identity it is elaborating.
 * 2. **It is a fraction of a fixed-ratio frame, so it costs no layout.** The
 *    frame is `aspect-[4/5]`, so 38% resolves from the frame's width alone, and
 *    the overlay's content can grow to any height without moving the card
 *    (Requirement 8.5) — it grows upward inside a box that clips.
 *
 * `z-40` is the top of the paint order in design.md §5.1, above the label block
 * at `z-30`.
 */
const DOSSIER_LAYER_ANCHOR_CLASSES = "absolute inset-x-0 bottom-[38%] z-40";

export interface TrainerPlinthProps {
  /** The coach being framed. Plain JSON-serialisable content (design.md §6.2). */
  trainer: Trainer;
  /** Which treatment: the featured lead spread, or a roster grid cell. */
  variant: PlinthVariant;
  /**
   * Two-digit display index, e.g. `"01"` — produced by `formatIndex`. Rendered
   * `aria-hidden` inside the hex index chip, so it is decoration only and never
   * carries identity.
   *
   * Rendered in exactly one {@link RosterIndexChip} per plinth, holding exactly
   * one numeral (Requirement 2.7). Nothing reads it for layout, so a
   * three-digit value overflows the chip visibly rather than being truncated
   * into a wrong number — see `formatIndex`.
   */
  index: string;
  /**
   * `next/image` `sizes` for this call site's rendered width (Requirement 7.1).
   *
   * Required, and deliberately a prop rather than a constant: the plinth is
   * rendered at 48% of a capped container on the lead spread, at a third of the grid
   * on desktop roster cells, at a half on tablet and at 85vw in the mobile swipe
   * strip. Only the call site knows which, so only the call site can describe it
   * honestly — a hard-coded value here would make five of those six cases
   * over- or under-fetch.
   */
  imageSizes: string;
  /**
   * Suppress the in-frame name. Set on the lead, whose dossier column owns
   * identity, so each coach's name appears exactly once in the accessibility
   * tree (Requirement 6.10).
   *
   * Suppresses the `<h3>` and nothing else — the role still renders, because the
   * role is the one label the lead plinth keeps (Requirement 8.7) and an
   * unlabelled 48%-wide photograph of a person is not a frame, it is a poster.
   *
   * **The discipline pips and the achievement badge are not this prop's business.**
   * They are omitted by the `lead` variant itself, because the dossier column
   * beside the plinth states both — the pips two lines under the name it owns, and
   * the achievement as the yellow `Badge variant="achievement"` that is the
   * section's second resting accent. Rendering them in the frame as well would put
   * two "Mr Nizamabad" chips and two sets of pips in one spread, which is exactly
   * the duplication Requirement 8.7 exists to forbid. So `suppressName` is about
   * the accessibility tree's one-name-per-coach rule, and the variant is about
   * which facts the frame is allowed to state at all; keeping the two separate is
   * why a roster plinth given `suppressName` still shows its pips.
   *
   * The label block's geometry is unaffected either way: it is pinned to the
   * frame's bottom edge, so removing the name shortens the block from the top and
   * leaves everything below it exactly where it was.
   */
  suppressName?: boolean;
  /** Extra classes for the outer wrapper. Must not introduce clipping. */
  className?: string;
}

export function TrainerPlinth({
  trainer,
  variant,
  index,
  imageSizes,
  suppressName = false,
  className,
}: TrainerPlinthProps) {
  /**
   * Which facts this variant's label block is allowed to state (Requirement 8.7).
   *
   * The roster card is a coach's only appearance in the section, so its label
   * block carries their name, role, pips and — when there is one — their
   * achievement. The lead's plinth is one half of a spread whose other half is a
   * full `TrainerDossier` column, and that column states the name, the pips and
   * the achievement. So the lead frame states the **role only**: one fact per
   * spread, stated once, which is what stops two "Mr Nizamabad" chips and two sets
   * of pips appearing 52% of a container apart.
   *
   * Expressed as one boolean rather than as three `variant === "roster"` checks
   * further down, because it is one decision — "does the frame own this coach's
   * credentials, or does a column beside it?" — and splitting it into three would
   * let a later change answer it differently in three places.
   */
  const framesCredentials = variant === "roster";

  /**
   * The achievement, if the gym owner has supplied one.
   *
   * Trimmed and length-checked rather than tested for truthiness, so a
   * whitespace-only string in the Content_Registry degrades to "no achievement"
   * instead of rendering an empty badge — a chip with nothing in it reads as
   * broken markup, which is worse than the absence it is trying to represent.
   * This mirrors how `resolveDossierRows` treats blank certification strings.
   *
   * Only `signatureAchievement` is read. The legacy `achievementBadge` field is
   * retained on the `Trainer` type for back-compat with the section this one
   * replaces, and deliberately not consulted here: the content migration already
   * mapped it forward, so reading both would give one fact two sources of truth.
   *
   * Read only when this variant frames credentials, per Requirement 8.7 — the
   * lead's achievement is `TrainerDossier`'s to render, in yellow, once.
   */
  const achievement = trainer.signatureAchievement?.trim();
  const hasAchievement =
    framesCredentials && achievement !== undefined && achievement.length > 0;

  /**
   * The backdrop plate's source, if the coach has one (Requirement 8.8).
   *
   * Trimmed and length-checked for the same reason `achievement` is, though the
   * failure it prevents is louder: `next/image` given a blank or whitespace-only
   * `src` throws rather than degrading, so a stray `backdropSrc: " "` in the
   * Content_Registry would take the whole section down instead of costing it one
   * decorative layer. "Present" therefore means "a usable path", and a blank
   * value degrades to the same graceful no-plate case as an absent one.
   *
   * Normalised to `string | undefined` rather than paired with a boolean flag,
   * because `undefined` is the one shape that narrows: the JSX guard below then
   * hands `Image` a definite `src` without a non-null assertion.
   */
  const trimmedBackdrop = trainer.backdropSrc?.trim();
  const backdrop =
    trimmedBackdrop !== undefined && trimmedBackdrop.length > 0 ? trimmedBackdrop : undefined;

  /**
   * The discipline pips, capped — and empty on the lead.
   *
   * Two rules compose here, in this order:
   *
   * 1. **The lead states no pips at all** (Requirement 8.7). Its dossier column
   *    renders them, so a pip in the frame would be the same fact twice in one
   *    spread. `framesCredentials` short-circuits before any cap is applied,
   *    rather than the cap resolving to 0, so the reason is legible: this is an
   *    ownership rule, not a space constraint.
   * 2. **`MAX_ROSTER_PIPS` (2), traded down to 1 for an achievement**
   *    (Requirement 8.6). The roster's label pool has a fixed height that affords
   *    one row, and when there is an achievement the badge takes the slot the
   *    second pip would have had — "Mr Nizamabad" outranks a second restatement
   *    of what the coach coaches.
   *
   * Blank entries are filtered first so the cap counts usable values rather than
   * array positions — otherwise a coach whose first discipline is `""` would show
   * one empty pip and drop their real one.
   */
  const disciplines = trainer.discipline
    .map((discipline) => discipline.trim())
    .filter((discipline) => discipline.length > 0);
  const pips = framesCredentials
    ? disciplines.slice(0, hasAchievement ? 1 : MAX_ROSTER_PIPS)
    : [];

  return (
    // OUTER WRAPPER — `relative`, and never clipping. See the two-wrapper
    // containment rule in this file's doc comment before changing this line.
    //
    // Also the plinth lift: the frame and its backlight rise 6px together on
    // hover/focus (state 2 of Requirement 4.1). See PLINTH_LIFT_CLASSES.
    <div
      className={cn(
        "relative",
        HOVER_TRANSFORM_TRANSITION_CLASSES,
        PLINTH_LIFT_CLASSES,
        className
      )}
    >
      {/* Backlight — the one layer that lives outside the clipping frame, so it
          fades out in open space instead of terminating on a clip boundary. */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -inset-4 z-0 lg:-inset-6",
          BACKLIGHT_BY_VARIANT[variant]
        )}
      />

      {/* INNER FRAME — the clipping boundary and the fixed 4:5 geometry every
          coach shares (Requirement 2.9). `z-[1]` seats it above the bleeding
          backlight; it carries no background of its own, so the backlight still
          shows through around the subject's silhouette.

          It also carries the press feedback — a 0.98 scale over 180ms — which is
          on this element rather than the wrapper so the press keeps its own
          duration instead of inheriting the lift's 500ms. See
          FRAME_PRESS_CLASSES. */}
      <div
        className={cn(
          "relative z-[1] overflow-hidden aspect-[4/5]",
          FRAME_PRESS_TRANSITION_CLASSES,
          FRAME_PRESS_CLASSES
        )}
      >
        {/* z-0 — Plinth surface. The lit face the subject stands against. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{ background: PLINTH_SURFACE_GRADIENT }}
        />

        {/* z-0 — Frame edge light. A 1px hairline on the top and left edges,
            which is where a single overhead-left key light would catch a real
            plinth. Kept as its own decorative layer rather than a border on the
            frame element, because the frame holds real content (the cutout, and
            later the label block) and therefore cannot itself be aria-hidden. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 border-t border-l border-white/10"
        />
        {/* z-0 — and the brighter vertical hairline down the light side, which
            is what actually sells "lit edge" rather than "1px outline". */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-0 w-px bg-linear-to-b from-transparent via-white/22 to-transparent"
        />

        {/* z-1 — Texture plane. A CSS background-image, never a second
            next/image (Requirement 7.4). Edge-masked so the tile never ends on
            a hard horizontal line inside the frame. */}
        <div
          aria-hidden="true"
          className={cn("pointer-events-none absolute inset-0 z-[1]", TEXTURE_OPACITY_CLASS)}
          style={{
            backgroundImage: TEXTURE_URL,
            backgroundSize: TEXTURE_SIZE,
            backgroundRepeat: TEXTURE_REPEAT,
            backgroundPosition: "top center",
            WebkitMaskImage: TEXTURE_FADE_MASK,
            maskImage: TEXTURE_FADE_MASK,
          }}
        />

        {/* z-5 — Backdrop plate. The room behind the coach, faded up on
            hover/focus at `lg:` and above.

            Conditional on the coach actually having one (Requirement 8.8): five
            of the six carry a `/back/{slug}.jpg`, the field is optional, and a
            coach without one simply has no depth plate — the cutout scale, the
            plinth lift and the accent draw still make their card
            respond, so nothing about the interaction depends on this layer
            existing.

            Decorative twice over, so it carries `aria-hidden="true"` and
            `pointer-events-none` on the wrapper (Requirement 6.3) and `alt=""`
            on the image (Requirement 6.9). It is a photograph of a room, behind
            a photograph of a person, at 16% opacity: there is no fact in it to
            announce, and giving it alt text would make a screen reader describe
            lighting.

            `hidden lg:block` is load-bearing, not a styling choice — see
            BACKDROP_PLATE_VISIBILITY_CLASS. Do not swap it for an opacity or
            visibility variant. */}
        {backdrop !== undefined && (
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 z-[5]",
              BACKDROP_PLATE_VISIBILITY_CLASS,
              BACKDROP_PLATE_OPACITY_CLASSES,
              BACKDROP_PLATE_TRANSITION_CLASSES
            )}
          >
            {/* `sizes` is the plinth's own `imageSizes`, and that is honest
                rather than convenient: the plate is `inset-0` on the inner
                frame, so its rendered width IS the frame's width — the same box
                the cutout at z-10 measures. The prop describes widths at every
                breakpoint while the plate only ever fetches at `lg:` and above,
                which costs nothing: the narrower entries in the string are for
                widths where this element is `display: none` and no request is
                made at all.
                Lazy, never `priority`, `quality={55}` (Requirements 7.1, 7.2).
                The filter is static — read BACKDROP_PLATE_FILTER_CLASS. */}
            <Image
              src={backdrop}
              alt=""
              fill
              sizes={imageSizes}
              loading="lazy"
              quality={BACKDROP_PLATE_QUALITY}
              className={cn("object-cover", BACKDROP_PLATE_FILTER_CLASS)}
            />
          </div>
        )}

        {/* z-6 — Grounding, part 1: the contact shadow directly beneath the
            feet. Bottom-centred at 70% × 12% of the frame. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] mx-auto h-[12%] w-[70%]"
          style={{ background: CONTACT_SHADOW_GRADIENT }}
        />
        {/* z-6 — Grounding, part 2: the wider, fainter pool of floor light. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[6]"
          style={{ background: FLOOR_LIGHT_GRADIENT }}
        />

        {/* z-10 — The cutout. Real content, so it is the one layer here that is
            not aria-hidden: its alt text comes straight from the
            Content_Registry (Requirement 6.9).
            `object-bottom` grounds every coach on the frame's own bottom edge
            regardless of how much headroom their source PNG carries, which is
            what makes the five roster frames read as one lineup.
            `origin-bottom` is transform-origin: bottom center, which is what
            makes the hover scale grow the subject up from their feet rather than
            out from their chest — see CUTOUT_SCALE_CLASSES.
            Lazy, and explicitly never `priority`: this section sits well below
            the fold, so six eager cutouts would compete with the Hero's LCP
            image for bandwidth (Requirement 7.1). */}
        <Image
          src={trainer.imageSrc}
          alt={trainer.imageAlt}
          fill
          sizes={imageSizes}
          loading="lazy"
          className={cn(
            "z-10 object-cover object-bottom origin-bottom",
            HOVER_TRANSFORM_TRANSITION_CLASSES,
            CUTOUT_SCALE_CLASSES
          )}
        />

        {/* z-20 — Label pool. The scrim the label block is legible against, and
            the one box in this component whose height is not allowed to respond
            to content (Requirement 8.5). Decorative: the type it sits under is
            what carries meaning, so the gradient itself is aria-hidden. */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 z-20",
            LABEL_POOL_HEIGHT_CLASS
          )}
          style={{ background: LABEL_POOL_GRADIENT }}
        />

        {/* z-30 — Hex index chip, in the frame's top-right corner on the same
            padding the label block uses, so the numeral and the name share one
            margin and the frame reads as a single ruled object. Top-right is
            where Programs already puts its numerals (design.md §5.3). */}
        <RosterIndexChip index={index} className="absolute right-4 top-4 z-30 lg:right-5 lg:top-5" />

        {/* z-30 — Label block. Real content, so this is the one subtree inside
            the frame besides the cutout that is NOT aria-hidden.

            Pinned to the frame's bottom edge and inset by a fixed padding, which
            is the whole geometric fix: the name's offset is measured from the
            frame, never from where the subject's cutout happens to end
            (Requirement 2.2). Do not make any height or gap here conditional on
            which optional fields the coach has. The credential row below IS
            conditional — on the *variant*, which is a different thing: variant and
            breakpoint are exactly what the pool's height is allowed to depend on
            (Requirement 8.5), and every roster card resolves the same branch. */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-30 flex flex-col gap-2",
            LABEL_BLOCK_PADDING_CLASS
          )}
        >
          {/* Identity group — name and role are one unit at `gap-1`. `min-w-0`
              lets the role's clamp engage instead of the flex item refusing
              to shrink below its content. */}
          <div className="flex min-w-0 flex-col gap-1">
            {!suppressName && (
              // The coach's name — a real <h3>, once per coach (Requirements 6.1,
              // 6.6, 6.10). MaskedLine reveals it as one event rather than
              // per-word: splitting "Mohammed Wajeed" on whitespace would stagger
              // a person's name, and the text is in the DOM at full opacity in
              // both its motion and reduced-motion branches.
              <Heading
                level={NAME_LEVEL_BY_VARIANT[variant]}
                as="h3"
                className={NAME_CLASSES}
              >
                {/* The name underline — the card's one yellow, at 0% width until
                    the card is hovered, focused or pressed (Requirements 2.4,
                    4.1). It wraps MaskedLine rather than sitting inside it
                    because MaskedLine's `overflow-hidden` mask would shave a rule
                    drawn at its own bottom edge; from out here the underline
                    tracks the name's box and the mask only handles the reveal.
                    See NAME_UNDERLINE_CLASSES — including the noted
                    `background-size` deviation from Requirement 7.5. */}
                <span className={NAME_UNDERLINE_CLASSES}>
                  <MaskedLine>{trainer.name}</MaskedLine>
                </span>
              </Heading>
            )}

            {/* Role — tracked micro-caps in a box of fixed height, so a long
                title wraps to a second line instead of ellipsising mid-word while
                the name's baseline stays locked across the row. See
                {@link ROLE_BOX_CLASS_BY_VARIANT} for why the height is asserted
                rather than minimum, and why the lead keeps single-line. */}
            <p className={cn(ROLE_CLASSES, ROLE_BOX_CLASS_BY_VARIANT[variant])}>
              {trainer.title}
            </p>
          </div>

          {/* Credential row — the pips and the achievement badge, at a fixed
              height whatever it holds. See CREDENTIAL_ROW_HEIGHT_CLASS for why
              this is not allowed to size itself. `overflow-hidden` contains the
              content rather than letting it push the row, so the geometry holds
              even for content longer than the row was tuned for.

              Rendered for the roster only (Requirement 8.7). The lead's dossier
              column states its pips and its achievement, so the lead frame keeps
              the role alone and drops this row entirely rather than reserving 28px
              of empty pool for facts it is not allowed to state. The roster's
              geometry is untouched by that: this row, its height and its contents
              are exactly what they were, and the pool's height stays a function of
              variant and breakpoint only (Requirement 8.5) — the lead is one card
              with no sibling to baseline-match, so a shorter block there matches
              nothing less well than before. */}
          {framesCredentials && (
            <div
              className={cn(
                "flex items-center gap-2 overflow-hidden",
                CREDENTIAL_ROW_HEIGHT_CLASS
              )}
            >
              {/* The pips — ONE hex dot and ONE joined line, not one chip per
                  discipline.

                  This used to map each discipline into its own dot + truncating
                  label, and at `lg:` the result was two ellipses on one row
                  ("● PERSONAL TR… ● FITNESS COUN…"): a 3-column card is ~400px
                  wide, each chip got less than half of that, and neither label
                  fitted. Two truncated fragments state strictly less than one
                  truncated sentence and cost more space to do it.

                  Joining with `·` is not a new pattern — `resolveDossierRows`
                  already builds the lead's `Focus` row as `discipline.join(" · ")`,
                  so the roster now reads the same way its own dossier does, with a
                  single motif dot introducing the line. `PIP_LABEL_CLASSES` keeps
                  `truncate` as the backstop: with the whole row to work in it does
                  not fire for any coach in the registry today, and if a longer
                  title set ever arrives the degradation is one ellipsis at the end
                  of a readable line rather than two mid-word.

                  No `key` is needed now that this is one element rather than a
                  mapped list, which also retires the value-and-position keying the
                  old block needed for coaches with a repeated discipline. */}
              {pips.length > 0 && (
                <span className="flex min-w-0 items-center gap-1.5">
                  {/* 8px hex dot — the third and smallest application of the
                      section's shape motif (design.md §5.4). Decorative. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none size-2 shrink-0 bg-white/70"
                    style={{ clipPath: HEX_CLIP }}
                  />
                  <span className={PIP_LABEL_CLASSES}>{pips.join(" · ")}</span>
                </span>
              )}

              {/* The achievement badge, in the slot the second pip would have had,
                  and never in yellow — see ACHIEVEMENT_BADGE_VARIANT, which is
                  what keeps the section's three-accent budget true for any number
                  of achievement-carrying coaches. The yellow achievement badge
                  belongs to the lead's dossier column alone. */}
              {hasAchievement && (
                <Badge variant={ACHIEVEMENT_BADGE_VARIANT} className="shrink-0 px-2 py-0.5">
                  {achievement}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* z-40 — Dossier layer: the philosophy line and the booking cue, revealed
            on hover/focus at `lg:` and permanently visible below it
            (Requirements 4.1, 4.2, 5.5).

            Roster only, as design.md §5.1's `z-40` row specifies. The lead's
            dossier is not an overlay at all — it is the credential column beside
            the plinth (§6.4), built in task 7.8 — so rendering one here for the
            lead would state the same facts twice in one spread and put a scrim
            over the section's featured photograph.

            Placement is this file's (see DOSSIER_LAYER_ANCHOR_CLASSES); the
            reveal, the scrim and the copy are TrainerDossier's. */}
        {variant === "roster" && (
          <TrainerDossier
            trainer={trainer}
            variant="roster"
            className={DOSSIER_LAYER_ANCHOR_CLASSES}
          />
        )}
      </div>
    </div>
  );
}
