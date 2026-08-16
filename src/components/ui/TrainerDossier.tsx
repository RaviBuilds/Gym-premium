import { ArrowRight } from "lucide-react";

import { AnimatedDivider } from "@/components/motion/AnimatedDivider";
import { AnimationWrapper } from "@/components/motion/AnimationWrapper";
import { MaskedLine } from "@/components/motion/MaskedLine";
import { Badge } from "@/components/ui/Badge";
import { BodyText, Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";
import { resolveDossierRows } from "@/components/sections/trainer-showcase/roster";
import type { PlinthVariant } from "@/components/sections/trainer-showcase/roster";
import { getStaggerDelay } from "@/lib/motion-presets";
import { HEX_CLIP } from "@/lib/shapes";
import { cn } from "@/lib/utils";
import type { Trainer } from "@/types/content";

/**
 * TrainerDossier — the elaboration layer that answers "how does this coach
 * work, and how do I book them?" (design.md §5.1's `z-40` row, §6.1, §8.4).
 *
 * Two dossiers live here, and they are different objects rather than two
 * skins of one:
 *
 * - **`variant="roster"`** — an overlay inside a `TrainerPlinth`'s inner frame,
 *   above the label pool, carrying the coach's philosophy line and a "Book a
 *   session" *cue*. Revealed on hover/focus at `lg:`, always visible below it.
 *   Owned by {@link RosterDossier}.
 * - **`variant="lead"`** — the full credential **column** beside the lead
 *   plinth (design.md §6.4): name, role, yellow rule, discipline pips,
 *   credential rows, achievement badge, philosophy line and a real per-coach
 *   CTA. It is not an overlay, has no scrim, and is never hover-gated: it
 *   reveals on the scroll ladder in §8.3 and then simply stays.
 *   Owned by {@link LeadDossier}.
 *
 * They share this file because they answer the same question about a coach, and
 * because the two are the only places in the section where the *elaboration* —
 * as opposed to the identity — of a coach is stated. They share almost no
 * markup, which is why {@link TrainerDossier} is a two-line dispatcher over two
 * components rather than one component full of `variant === …` ternaries.
 *
 * ## Why it is a separate component and not markup inside `TrainerPlinth`
 *
 * design.md §6.1 lists `TrainerDossier` as its own presentational component with
 * no directive, and §6.2 puts it in the same row as `RosterIndexChip` and
 * `RosterCtaTile`. Keeping it here rather than inlining it in the plinth buys
 * two things: the lead column has a home that already owns the "what may be
 * said about a coach beyond their label" question, and the plinth stays a file
 * about *lighting and containment* rather than about copy.
 *
 * ## No `"use client"`, in either variant
 *
 * There is no directive here and there must never be one (Requirement 4.4,
 * design.md §6.2). Neither variant holds React state, runs an effect or binds an
 * event handler.
 *
 * The lead branch composes `MaskedLine`, `AnimationWrapper` and
 * `AnimatedDivider`, which *are* client components — and that changes nothing
 * about this file. A server component may import and render a client component;
 * it is the reverse that needs a directive. Each primitive is its own client
 * boundary receiving plain strings and numbers, so what hydrates is the three
 * primitives the section already ships, never the dossier around them
 * (Requirement 7.8).
 *
 * The roster branch goes further and hydrates nothing at all: its reveal is
 * pure CSS off the ancestor `<a class="group">` in `RosterCard` — `lg:group-hover:`
 * for pointer, `group-focus-within:` for keyboard — so five overlays cost zero
 * client JavaScript.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Shared copy
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The booking label, used by both variants — as `aria-hidden` cue text on the
 * roster overlay, and as the visible label of the lead column's real link.
 *
 * Presentation, not content, so it lives here rather than in the
 * Content_Registry (Requirement 8.3): it states nothing about the coach. It
 * mirrors the wording of each variant's accessible name on purpose — the visitor
 * sees the same promise the anchor makes.
 *
 * **This is why it is not design.md §6.4's "Book with this coach".** The lead's
 * accessible name is fixed by Requirement 6.7 at `Book a session with {name},
 * {title}`, and WCAG 2.5.3 (Label in Name) requires the visible label to be
 * *contained in* that name. "Book a session" is; "Book with this coach" is not.
 * The diagram's phrasing loses to the requirement, and the two variants end up
 * saying the same four words — which is the better outcome anyway.
 */
const AFFORDANCE_LABEL = "Book a session";

// ─────────────────────────────────────────────────────────────────────────────
// Roster overlay
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resting state, and the state the layer returns to (Requirement 4.7).
 *
 * `translate-y-3` is 12px — the smallest distance in the Closed_Motion_Vocabulary
 * and the value design.md §8.4 names for this slide. Nothing else about the
 * layer moves, and nothing about it is hidden with `display` or `visibility`:
 * the text is in the DOM and in the accessibility tree at all times, so a screen
 * reader reaches the philosophy line whether or not anything is hovered.
 */
const DOSSIER_REST_CLASSES = "translate-y-3 opacity-0";

/**
 * The revealed state, at `lg:` and above (Requirements 4.1, 4.2).
 *
 * Two triggers, one end state. `lg:group-hover:` is the pointer path, scoped to
 * `lg:` because Requirement 4.1 describes hover at 1024px and above and because
 * a touch device's synthetic hover would otherwise latch the layer on after a
 * tap. `group-focus-within:` is the keyboard path, and it is `focus-within`
 * rather than `focus-visible` because Requirement 6.4 names that variant for
 * this layer specifically: the moment focus enters the card, the same content
 * hover would have shown is shown.
 *
 * Keyboard parity is therefore not a second code path — it is the same two
 * declarations under a different variant, which is exactly why this component
 * needs no client JavaScript.
 */
const DOSSIER_REVEALED_CLASSES =
  "lg:group-hover:translate-y-0 lg:group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100";

/**
 * Below `lg:`, unconditionally visible (Requirement 5.5).
 *
 * `max-lg:` wins over the resting classes above at every width under 1024px, so
 * there is no interaction — and no `group` ancestor — required for this content
 * to be on screen. It is the same reasoning as `TrainerPlinth`'s label block
 * being outside every hover variant: identity and the facts around it are never
 * gated on a gesture.
 */
const DOSSIER_MOBILE_CLASSES = "max-lg:translate-y-0 max-lg:opacity-100";

/**
 * Transition — `opacity` and `transform` only, `motion-safe:`-gated
 * (Requirements 7.5, 4.7).
 *
 * `duration-500` is the Closed_Motion_Vocabulary's 0.5s and the value design.md
 * §8.4 gives the dossier slide. Because it is a transition rather than a
 * one-way animation, the return to rest on pointer-leave and blur costs no extra
 * declarations — the same 500ms runs backwards (Requirement 4.7).
 *
 * Under `prefers-reduced-motion` the transition never applies, so the revealed
 * state arrives instantly on hover or focus instead of sliding. The end state is
 * unchanged, which is the rule the whole section follows: content availability
 * never depends on animation (design.md §8.5).
 */
const DOSSIER_TRANSITION_CLASSES =
  "ease-out motion-safe:transition-[opacity,transform] motion-safe:duration-500";

/**
 * The scrim behind the dossier text — transparent at **both** ends, on purpose.
 *
 * The layer is anchored just above the label pool, which means its text sits
 * over the photograph itself rather than over the pool's ink, and
 * `text-secondary-dark` over a coach's lit shoulder is not a legible pairing.
 * So the layer carries its own soft ink band.
 *
 * Both ends reach zero alpha because the pool's own gradient is transparent at
 * its top edge, which is exactly where this layer's bottom edge sits. A scrim
 * that was dense at its bottom would meet that transparent edge as a visible
 * horizontal step across the photograph — the same defect the pool's own top
 * fade exists to avoid (see `LABEL_POOL_GRADIENT` in `TrainerPlinth`). Fading
 * out at both ends makes the band read as one continuous darkening from the
 * pool upward, with no edge anywhere.
 *
 * Static: it fades in and out with the layer's own `opacity`, never with its
 * own transition, so no second animated property is introduced (Requirement 7.5).
 */
const DOSSIER_SCRIM_GRADIENT =
  "linear-gradient(to top, transparent 0%, rgba(20,24,29,0.86) 24%, rgba(20,24,29,0.86) 78%, transparent 100%)";

/**
 * Philosophy line treatment, roster overlay.
 *
 * design.md §5.5 specifies `text-text-secondary-dark` for the philosophy line,
 * which is tuned for the lead's dossier column — a text block on the section
 * background. Over a photograph behind a 0.86 scrim, `#a8acb3` loses too much of
 * its margin, so the roster overlay renders it at `text-white/90`. This is the
 * same deviation, for the same reason, already recorded on `ROLE_CLASSES` in
 * `TrainerPlinth`: a colour chosen against the section background does not
 * survive being moved onto a scrim over a photograph, and the fix is the colour,
 * not the scrim. The lead column, which really is on the section background,
 * uses §5.5's token verbatim — see {@link LEAD_PHILOSOPHY_CLASSES}.
 *
 * `max-w-[26ch]` is §5.5's measure, kept verbatim — a reading measure matters
 * more here than in a label, because this is the one sentence on the card that
 * is prose.
 */
const PHILOSOPHY_CLASSES = "max-w-[26ch] text-white/90";

/**
 * The affordance's type: the same tracked micro-caps the discipline pips use, so
 * the overlay reads as part of the card's label system rather than as a button
 * that lost its box.
 *
 * White, and never `brand-yellow`. The roster card spends its single yellow on
 * the name underline (Requirement 2.4, design.md §5.6), so a yellow affordance
 * here would put two accents on a hovered card and break the count. `text-white`
 * against the scrim carries the emphasis instead.
 */
const AFFORDANCE_CLASSES =
  "flex items-center gap-1.5 font-body text-caption font-semibold uppercase tracking-[0.14em] text-white lg:text-caption-lg";

// ─────────────────────────────────────────────────────────────────────────────
// Lead column
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The lead column's reveal ladder — design.md §8.3 rows 11–15, mapped onto the
 * eight things §6.4 puts in this column (Requirements 3.1, 3.9).
 *
 * The ladder has five rungs and the column has eight elements, so three of them
 * share a rung. The mapping is below, and it is deliberate rather than
 * arithmetic: things that read as one unit arrive together.
 *
 * | Element            | Mechanism                        | Delay                       | §8.3 row |
 * |--------------------|----------------------------------|-----------------------------|----------|
 * | Name               | `MaskedLine`                     | 0.25                        | 11 |
 * | Role               | `AnimationWrapper preset="small"`| 0.33                        | 12 |
 * | Yellow rule        | `AnimatedDivider horizontal`     | 0.33                        | 12 (shared) |
 * | Discipline pips    | `AnimationWrapper preset="small"`| 0.41                        | 13 (shared) |
 * | Credential row `i` | `AnimationWrapper preset="small"`| `0.41 + getStaggerDelay(i)` | 13 |
 * | Achievement badge  | `AnimationWrapper preset="small"`| 0.49                        | 14 |
 * | Philosophy line    | `AnimationWrapper preset="small"`| 0.49                        | 14 (shared) |
 * | Per-coach CTA      | `AnimationWrapper preset="small"`| 0.57                        | 15 |
 *
 * Why those three shares and not others:
 *
 * - **Rule with the role.** The rule is the identity block's terminator, not a
 *   step of its own: it draws `scaleX 0 → 1` under the role at the same moment
 *   the role lands, so the name/role/rule group reads as one masthead settling
 *   rather than as three separate arrivals. §8.3 gives the *plinth's* base rule
 *   its own row (8) but names no rung for this one, so it borrows the row it
 *   belongs to visually.
 * - **Pips with the first credential row.** Both are the answer to "what does
 *   this coach do", and `getStaggerDelay(0)` is 0, so the pips and row 0 land on
 *   the same 0.41 rung §8.3 row 13 defines. Giving the pips their own earlier
 *   rung would have meant inventing a delay outside the ladder.
 * - **Philosophy with the badge.** The badge is an inline chip and the
 *   philosophy the paragraph under it; together they are the column's one block
 *   of elaboration, and §8.3 names no sixth rung for prose.
 *
 * Everything above is `duration 0.5` at easing `[0.16, 1, 0.3, 1]` with trigger
 * threshold 0.2 — all from the Closed_Motion_Vocabulary, all supplied by the
 * primitives themselves rather than passed in, so this file invents no timing
 * (Requirement 3.9). Delays past the first rung are the ladder's own numbers;
 * `getStaggerDelay` supplies the 0.08s step and its 6-item cap.
 *
 * Under reduced motion every one of these primitives renders its final state
 * immediately and ignores its delay, so the whole column is readable with no
 * interaction and no animation (Requirement 6.5, design.md §8.5).
 */
const LEAD_DELAYS = {
  name: 0.25,
  role: 0.33,
  rule: 0.33,
  pips: 0.41,
  /** Base for row `i`; the per-row offset is `getStaggerDelay(i)`. */
  credentialRows: 0.41,
  achievement: 0.49,
  philosophy: 0.49,
  cta: 0.57,
} as const;

/**
 * The lead's name — the section's largest name (design.md §5.5).
 *
 * `Heading level="section"` is the display face at the section-heading size, and
 * `as="h3"` keeps the document outline correct under the section's one `<h2>`
 * (Requirement 6.6). The two are independent on purpose, which is the whole
 * reason `Heading` takes both.
 *
 * This is the **only** place the lead's name appears (Requirement 6.10): the lead
 * plinth is rendered with `suppressName`, so its label pool carries the role and
 * pips and no `<h3>`. One name per person, never two — which also means removing
 * the heading below would leave the section's featured coach anonymous, not
 * merely quieter.
 */
const LEAD_NAME_CLASSES = "tracking-tight text-white";

/**
 * Role — §5.5's `text-xs font-medium uppercase tracking-widest text-zinc-400`,
 * kept **verbatim**, unlike in `TrainerPlinth`.
 *
 * Worth being explicit about, because the two files disagree and both are right.
 * `TrainerPlinth` raises the role to `text-white/95`, because there it sits on a
 * scrim over a photograph where Requirement 6.8 sets a 15:1 floor against the
 * Label_Pool. This column is not on the pool: it is a text block on the
 * section's Ink background, which is the surface §5.5's colour was chosen for.
 * `#a1a1aa` on `#14181d` measures ≈7.4:1 — comfortably past WCAG AA for this
 * size, and outside the scope of a criterion written about the label pool.
 *
 * So the deviation stays where the reason for it is, and the spec's token is
 * used where the spec's surface is.
 */
const LEAD_ROLE_CLASSES = "font-body text-xs font-medium uppercase tracking-widest text-zinc-400";

/**
 * The yellow rule under the role — half of the lead's single accent group
 * (Requirement 2.5, design.md §5.6).
 *
 * §5.6 counts the achievement badge and "the existing 12/16px yellow rule under
 * it" as **one** accent, which is what keeps the section's resting yellow count
 * at three: eyebrow, this group, CTA tile. Nothing else in this column may be
 * yellow — that is why the CTA below is white (see {@link LEAD_CTA_CLASSES}) and
 * why the pips reuse the plinth's neutral hex dot.
 *
 * `h-px w-12 lg:w-16` is the exact rule already shipping in this section's
 * header, in `Facilities` and in `TrustStrip`, so the shape is a reuse rather
 * than a new decision. `AnimatedDivider` draws it `scaleX 0 → 1` from the centre
 * and renders it immediately under reduced motion.
 */
const LEAD_RULE_CLASSES = "h-px w-12 bg-brand-yellow lg:w-16";

/**
 * Discipline pips — the 8px hex dot plus tracked micro-caps, matching
 * `TrainerPlinth`'s label block exactly (design.md §5.4 application 3, §5.5).
 *
 * Same clip from `@/lib/shapes`, same `size-2`, same `bg-white/70`, same type —
 * because the pips in the column and the pips in the frame beside it are the
 * same object at the same size, and any drift between them would be visible in a
 * single glance across a 57/43 spread.
 *
 * `text-white/70` is §5.2's ratio and Requirement 6.8's separate 9:1 floor for
 * pips (≈9.4:1 on Ink), a real third step down from the role rather than a
 * fourth shade of near-white.
 */
const LEAD_PIP_DOT_CLASSES = "pointer-events-none size-2 shrink-0 bg-white/70";
const LEAD_PIP_LABEL_CLASSES =
  "font-body text-caption font-semibold uppercase tracking-[0.14em] text-white/70";

/**
 * Credential rows — §5.5's credential-value token, and the reason there is no
 * mono face anywhere near this file (Requirement 2.10).
 *
 * `tabular-nums` is doing the work a monospace font would do elsewhere: it locks
 * every digit to the same advance width, so "9 yrs" and "12 yrs" align down the
 * column without importing a third family into a two-family system
 * (`Archivo Black` + `Inter`, `01-design-system.md` §3). `tracking-[0.08em]` is
 * §5.5's value verbatim — tighter than the pips' 0.14em, because these values
 * are read as words and numbers rather than scanned as tags.
 *
 * The label column is `w-24 shrink-0` so the values start at one x-position for
 * every row. That fixed width is what makes `tabular-nums` visible at all: equal
 * digit widths only read as alignment if the numbers share a left edge.
 */
const LEAD_ROW_LABEL_CLASSES =
  "w-24 shrink-0 font-body text-caption font-semibold uppercase tracking-[0.14em] text-white/70";
const LEAD_ROW_VALUE_CLASSES =
  "font-body text-caption font-semibold tabular-nums tracking-[0.08em] text-white";

/**
 * Philosophy line — §5.5 verbatim: `BodyText size="standard"`,
 * `text-text-secondary-dark`, `max-w-[26ch]`.
 *
 * The measure is the point. This is the one piece of prose in the whole section,
 * and 26 characters is a deliberately narrow column that keeps it reading as a
 * pull-quote beside a photograph rather than as a paragraph of body copy the
 * spread was not designed to hold.
 *
 * Unlike the roster overlay's copy this really is on the section background, so
 * §5.5's colour applies as written — see {@link PHILOSOPHY_CLASSES} for why the
 * overlay cannot use it.
 */
const LEAD_PHILOSOPHY_CLASSES = "max-w-[26ch] text-text-secondary-dark";

/**
 * The per-coach CTA — a real link, and the one interactive element in this
 * column (Requirements 6.4, 6.7).
 *
 * ## Why this one is a control where the roster's is a cue
 *
 * `RosterDossier`'s "Book a session" is `aria-hidden` text inside a card that is
 * already one big anchor, so a second control there would be a nested link. The
 * lead spread has no wrapping anchor — a 48%-wide photograph of a person is not
 * a click target, and the lead's `<article>` sits outside the roster's `<ul>`
 * (Requirement 6.6) — so this column has to carry its own action or the section's
 * featured coach becomes the only coach a visitor cannot book.
 *
 * ## A plain `<a>`, not `ButtonLink`
 *
 * Two reasons, and both are the same ones `RosterCard` records for its own
 * anchor. First, accent budget: `ButtonLink variant="primary"` is
 * `bg-brand-yellow`, and the section's three resting yellows are already spent
 * on the eyebrow, this column's achievement group and the CTA tile
 * (Requirement 2.5). A fourth would turn the spotlight into wallpaper, which
 * `globals.css` names as the brand's own rule. Second, hydration: `ButtonLink`
 * is a client component wrapping `next/link`, and this column already introduces
 * three client boundaries for its reveal — a fourth, for a same-page booking
 * anchor, buys nothing (Requirement 7.8).
 *
 * So the link takes the same tracked micro-caps as the roster's cue and design
 * §6.4's arrow, which also makes the two dossiers state their one promise in one
 * visual language.
 *
 * ## The accessible name, and the two things it must satisfy
 *
 * `aria-label` is `Book a session with {name}, {title}` — byte-identical wording
 * to `RosterCard`'s anchor, because Requirement 6.7 states one rule for every
 * per-coach action in the section and two spellings of it would be a bug a
 * screen-reader user hears and a sighted reviewer never sees. The visible label
 * stays "Book a session" so it remains a substring of that name, per WCAG 2.5.3
 * — see {@link AFFORDANCE_LABEL}.
 *
 * `min-h-11` is the 44px touch-target floor the button system enforces
 * (`Button`'s `baseStyles`), applied here because this link is styled as text
 * and would otherwise be a ~16px-tall tap target. The focus ring is the exact
 * utility trio `RosterCard`, `StripNavigator` and `SceneNavigator` use, so the
 * section introduces no second focus treatment (Requirement 6.4).
 *
 * The arrow's 4px nudge on hover is the link's only interaction cue: `transform`
 * only, `motion-safe:`-gated, 500ms from the Closed_Motion_Vocabulary. A colour
 * change to yellow was the obvious alternative and is exactly what the accent
 * budget above forbids.
 */
const LEAD_CTA_CLASSES = cn(
  "group/lead-cta inline-flex min-h-11 items-center gap-2",
  "font-body text-caption font-semibold uppercase tracking-[0.14em] text-white lg:text-caption-lg",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
);
const LEAD_CTA_ARROW_CLASSES =
  "ease-out motion-safe:transition-transform motion-safe:duration-500 lg:group-hover/lead-cta:translate-x-1";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface TrainerDossierBaseProps {
  /** The coach being elaborated on. Plain JSON-serialisable content. */
  trainer: Trainer;
  /**
   * Placement, supplied by the container.
   *
   * The same division of labour `RosterIndexChip` uses: this component owns the
   * dossier's content and its reveal, while whatever holds it owns *where* it
   * sits — so `TrainerPlinth` can keep the overlay's anchor next to the
   * label-pool height it is derived from, and `LeadCoachStage` can own the 52%
   * column without this file knowing the spread exists.
   */
  className?: string;
}

interface RosterDossierProps extends TrainerDossierBaseProps {
  variant: Extract<PlinthVariant, "roster">;
}

interface LeadDossierProps extends TrainerDossierBaseProps {
  variant: Extract<PlinthVariant, "lead">;
  /**
   * The section-level booking target, used when this coach has no `ctaHref` of
   * their own (Requirement 4.5).
   *
   * Resolved here rather than by the caller because design.md §13.4 puts the
   * `trainer.ctaHref ?? fallbackCtaHref` rule at "the card and the dossier", and
   * mirroring it upward would give one rule two owners. Required rather than
   * defaulted, for the same reason `RosterCard` requires it: a default here would
   * let the lead's action point somewhere the section never chose.
   */
  fallbackCtaHref: string;
}

/**
 * Which dossier this is — the full {@link PlinthVariant} union, as a
 * discriminated union of props rather than one optional-heavy shape.
 *
 * The discriminant carries more than a branch: `fallbackCtaHref` is *required*
 * for the lead and *rejected* for the roster, which is the compiler stating the
 * two facts that matter about these variants. The lead column owns a real link
 * and cannot render without a destination; the roster overlay's booking text is
 * an `aria-hidden` cue inside `RosterCard`'s own anchor and has nothing to do
 * with an href. An optional prop would have made both mistakes silent — a lead
 * column linking nowhere, or a roster call site passing a target that is quietly
 * ignored.
 *
 * Each member's `variant` is written as an `Extract` of `PlinthVariant` rather
 * than a bare string literal, so renaming a variant in the Section_Assembler
 * fails here at compile time instead of leaving a dossier no call site can ask
 * for.
 */
export type TrainerDossierProps = RosterDossierProps | LeadDossierProps;

/**
 * Dispatch to the variant's component.
 *
 * Deliberately thin. The two dossiers share a question, a file and a props
 * discriminant, and essentially nothing else — no wrapper, no shared scrim, no
 * shared layout — so anything more than a branch here would be a place for one
 * variant's concerns to leak into the other's.
 *
 * The switch is exhaustive by the union above, which is why there is no
 * fallback: a third variant would fail to compile rather than render nothing
 * beside the section's featured coach.
 */
export function TrainerDossier(props: TrainerDossierProps) {
  if (props.variant === "lead") {
    return (
      <LeadDossier
        trainer={props.trainer}
        fallbackCtaHref={props.fallbackCtaHref}
        className={props.className}
      />
    );
  }

  return <RosterDossier trainer={props.trainer} className={props.className} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Roster overlay — the philosophy line and a booking cue
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The reveal is CSS, and the content is not conditional on it.
 *
 * Every state is a group variant off the ancestor `<a class="group">` in
 * `RosterCard`: `lg:group-hover:` for pointer, `group-focus-within:` for
 * keyboard. Zero React state, zero effects, zero event handlers, therefore zero
 * hydration for five overlays.
 *
 * The reveal is also *only* a reveal above `lg:`. Below it the layer renders at
 * `opacity-100 translate-y-0` unconditionally (Requirement 5.5), because a phone
 * has no hover and this content — a coach's own words about how they work — is
 * not something a visitor should have to earn with a gesture their device cannot
 * make. That is the whole reason the classes are written as "resting → revealed
 * at `lg:`" plus a `max-lg:` override, rather than as a single set of
 * `group-hover:` variants.
 *
 * ## The affordance is a cue, not a control
 *
 * "Book a session" here is visual only, and deliberately so: `RosterCard` wraps
 * the whole card in exactly one real `<a>` whose accessible name is already
 * `Book a session with {name}, {title}` (Requirements 6.4, 6.7). A second
 * interactive element inside it would be a nested anchor — invalid HTML, a second
 * tab stop per card, and a second thing for a screen reader to announce for one
 * destination. So the affordance is a plain `aria-hidden` span, and the whole
 * layer is `pointer-events-none` so it can never intercept a click meant for the
 * link underneath it. The lead column's CTA is the opposite call, for the
 * opposite reason — see {@link LEAD_CTA_CLASSES}.
 *
 * The philosophy line is **not** `aria-hidden`: it is a fact from the
 * Content_Registry and the only place in the card it is stated.
 */
function RosterDossier({ trainer, className }: Omit<RosterDossierProps, "variant">) {
  /**
   * The philosophy line, if the gym owner has supplied one.
   *
   * Trimmed and length-checked rather than tested for truthiness, matching
   * `TrainerPlinth`'s treatment of `signatureAchievement` and
   * `resolveDossierRows`' treatment of blank certifications: a whitespace-only
   * string in the Content_Registry degrades to "no philosophy" instead of
   * rendering an empty paragraph and the gap above it.
   *
   * Absent for all six coaches today — it is owner input still pending
   * (design.md §16.4) — so the overlay currently carries the affordance alone.
   * That is the intended minimum row of the degradation matrix (§7.3), not a
   * placeholder to fill with invented copy (Requirement 8.3).
   */
  const philosophy = trainer.philosophy?.trim();
  const hasPhilosophy = philosophy !== undefined && philosophy.length > 0;

  return (
    // `pointer-events-none`: the layer is content, but non-interactive content
    // laid over a link, so it must never swallow the click the card exists to
    // receive (Requirement 6.3's reasoning, applied to a non-decorative layer).
    <div
      className={cn(
        // `relative` is a floor, not the placement: the container's `className`
        // supplies `absolute` and tailwind-merge lets it win. It is here so the
        // scrim below always has a positioned ancestor to fill, whatever a call
        // site passes.
        "pointer-events-none relative flex flex-col items-start gap-2 px-4 pt-10 pb-6 lg:px-5",
        DOSSIER_REST_CLASSES,
        DOSSIER_REVEALED_CLASSES,
        DOSSIER_MOBILE_CLASSES,
        DOSSIER_TRANSITION_CLASSES,
        className
      )}
    >
      {/* The ink band the text is legible against. Decorative, so it is hidden
          from assistive tech and untargetable (Requirement 6.3). The generous
          `pt-10` above gives its top fade room to reach zero alpha before the
          layer's own edge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: DOSSIER_SCRIM_GRADIENT }}
      />

      {/* The coach's own words — real content, never aria-hidden, and rendered
          only when the owner has supplied them. */}
      {hasPhilosophy && (
        <BodyText className={cn("relative", PHILOSOPHY_CLASSES)}>{philosophy}</BodyText>
      )}

      {/* The booking cue. `aria-hidden` because the card's one `<a>` already
          announces "Book a session with {name}, {title}" — this is the visual
          half of that same promise, and announcing it twice would make one
          destination sound like two. */}
      <span aria-hidden="true" className={cn("relative", AFFORDANCE_CLASSES)}>
        {AFFORDANCE_LABEL}
        <Icon icon={ArrowRight} size="sm" />
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Lead column — the full credential dossier beside the lead plinth
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The lead's credential column (design.md §6.4, §5.5, §8.3 rows 11–15).
 *
 * Eight things in one fixed order — name, role, yellow rule, discipline pips,
 * credential rows, achievement badge, philosophy line, per-coach CTA — reading
 * top to bottom as identity, then discipline, then evidence, then invitation.
 * The order is §6.4's diagram and the source below follows it literally, so the
 * file reads in the order the column renders.
 *
 * ## Nothing here is hover-gated
 *
 * Unlike {@link RosterDossier} this is not an overlay and has no revealed state:
 * every element arrives once on the §8.3 ladder (see {@link LEAD_DELAYS}) and
 * then stays at rest. There is no scrim either — the column sits on the section's
 * Ink background, which is the surface §5.5's colours were chosen against, so
 * the type needs nothing painted behind it.
 *
 * ## Its one accent group, and the ceiling on it
 *
 * The yellow rule and `Badge variant="achievement"` are counted as **one**
 * accent by design.md §5.6, and that group is the second of the section's three
 * resting yellows (Requirement 2.5, 8.6). The badge is the *yellow* variant here
 * precisely because the roster's is not: yellow achievement styling is exclusive
 * to the lead, which is what keeps the resting count at three no matter how many
 * roster coaches earn an achievement. Nothing else in this column may be yellow —
 * the CTA is white for that reason and the pips reuse the neutral hex dot.
 *
 * ## Degradation, and what today's content actually renders
 *
 * `yearsExperience`, `certifications` and `philosophy` are absent for all six
 * coaches — they are owner inputs still pending (design.md §16.4, Requirement
 * 8.3) — so today's lead column is: name, role, rule, one pip, a single `Focus`
 * credential row, the achievement badge, and the CTA. Every absent field simply
 * omits its own block; no block is a placeholder and none leaves a gap behind,
 * because the rhythm is per-block top margin rather than a container `gap`.
 *
 * One consequence is worth stating rather than hiding, because it is visible in
 * that minimum state: with no years and no certifications, `resolveDossierRows`
 * returns only the `Focus` row, whose value is the same disciplines the pips two
 * lines above already show — so "Fitness Coaching" appears as a pip and again as
 * a row. That is the composition of §6.4 (pips *and* credential rows) meeting the
 * priority order of Requirement 8.2 (`Focus` is the fallback row), not a bug in
 * either. It resolves itself the moment the owner supplies real credentials,
 * since the rows above `Focus` are then the interesting ones. Deduplicating it
 * here would mean this component second-guessing the Section_Assembler's output,
 * which is the one thing it must not do — so it is documented and left visible
 * for the redesign review instead.
 */
function LeadDossier({ trainer, fallbackCtaHref, className }: Omit<LeadDossierProps, "variant">) {
  /**
   * The achievement, if the gym owner has supplied one.
   *
   * Trimmed and length-checked exactly as `TrainerPlinth` does it, so a
   * whitespace-only string degrades to "no achievement" instead of rendering an
   * empty yellow chip — a badge with nothing in it reads as broken markup, which
   * is worse than the absence it is trying to represent. Only
   * `signatureAchievement` is read; the legacy `achievementBadge` field is
   * retained on the type for back-compat and deliberately not consulted, because
   * the content migration already mapped it forward.
   */
  const achievement = trainer.signatureAchievement?.trim();
  const hasAchievement = achievement !== undefined && achievement.length > 0;

  /**
   * The philosophy line. Same trim-and-measure treatment as the roster overlay's,
   * for the same reason.
   */
  const philosophy = trainer.philosophy?.trim();
  const hasPhilosophy = philosophy !== undefined && philosophy.length > 0;

  /**
   * Every discipline the coach has, blanks filtered out.
   *
   * No cap, unlike the roster's `MAX_ROSTER_PIPS`: that ceiling exists because a
   * roster label pool's height is fixed (Requirement 8.5), and this column has
   * room to wrap. Blanks are dropped before rendering so a stray `""` in the
   * Content_Registry costs a pip rather than showing a hex dot with no label.
   */
  const disciplines = trainer.discipline
    .map((discipline) => discipline.trim())
    .filter((discipline) => discipline.length > 0);

  /**
   * The credential rows, resolved by the Section_Assembler at the lead cap of 5
   * (Requirement 8.2, `MAX_DOSSIER_ROWS.lead`).
   *
   * The priority order — Experience, then Certified, then Focus — and the cap are
   * both the assembler's, not this component's: it is the one place that ranking
   * is decided, and re-deciding it here would give one rule two owners. Every row
   * that comes back is guaranteed to carry a non-empty label and value, which is
   * why the map below needs no per-row guard.
   */
  const rows = resolveDossierRows(trainer, "lead");

  return (
    // The column's own box. `items-start` keeps the badge, the rule and the CTA
    // to their content width instead of stretching them across 52% of the spread.
    //
    // Vertical rhythm is per-block `mt-*` rather than a container `gap`, on
    // purpose: three of the eight blocks are conditional on owner-supplied
    // content, and a container gap would still be spending rhythm on the blocks
    // that are not there. Each block owns the space above itself, so an absent
    // one takes its margin with it.
    <div className={cn("flex flex-col items-start", className)}>
      {/* The lead's name, and the ONLY place it appears (Requirement 6.10) — the
          lead plinth renders with `suppressName` because this heading owns that
          identity. `MaskedLine` reveals it as one event rather than per word:
          splitting "Mohammed Wajeed" on whitespace would stagger a person's
          name. In both of MaskedLine's branches the text is in the DOM at full
          opacity, so no-JS and reduced-motion visitors get it too. */}
      <Heading level="section" as="h3" className={LEAD_NAME_CLASSES}>
        <MaskedLine delay={LEAD_DELAYS.name}>{trainer.name}</MaskedLine>
      </Heading>

      {/* Role — tracked micro-caps, §5.5's token verbatim. Free to wrap here,
          unlike the plinth's `truncate`d copy: nothing in this column is
          baseline-matched to five siblings. */}
      <AnimationWrapper preset="small" delay={LEAD_DELAYS.role} className="mt-2">
        <p className={LEAD_ROLE_CLASSES}>{trainer.title}</p>
      </AnimationWrapper>

      {/* The yellow rule — half of the lead's one accent group, and the identity
          block's terminator. Decorative, so `AnimatedDivider` renders a bare
          `div` with no accessible name; it draws `scaleX 0 → 1` and is rendered
          immediately under reduced motion. */}
      <AnimatedDivider
        orientation="horizontal"
        delay={LEAD_DELAYS.rule}
        className={cn("mt-5", LEAD_RULE_CLASSES)}
      />

      {/* Discipline pips — the same hex dot and micro-caps as the plinth's label
          block, wrapping rather than truncating. Real content: the dots are
          decorative and `aria-hidden`, the labels are facts and are not. */}
      {disciplines.length > 0 && (
        <AnimationWrapper
          preset="small"
          delay={LEAD_DELAYS.pips}
          className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2"
        >
          {/* Keyed by value AND position: a coach whose `discipline` array
              repeats a string would otherwise give two siblings the same key. */}
          {disciplines.map((discipline, pipIndex) => (
            <span key={`${discipline}-${pipIndex}`} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={LEAD_PIP_DOT_CLASSES}
                style={{ clipPath: HEX_CLIP }}
              />
              <span className={LEAD_PIP_LABEL_CLASSES}>{discipline}</span>
            </span>
          ))}
        </AnimationWrapper>
      )}

      {/* Credential rows — a real description list, because that is what a
          label/value table of facts is. `AnimationWrapper` renders the `div` that
          groups each `dt`/`dd` pair, which HTML permits inside a `dl` and which
          is what lets every row carry its own rung of the stagger.

          `w-full` on the list so the rows share the column's width and the value
          column starts at one x-position; the label's fixed `w-24` does the rest.
          See LEAD_ROW_VALUE_CLASSES for why the numbers align without a mono
          face (Requirement 2.10). */}
      {rows.length > 0 && (
        <dl className="mt-6 flex w-full flex-col gap-2">
          {rows.map((row, rowIndex) => (
            <AnimationWrapper
              key={`${row.label}-${rowIndex}`}
              preset="small"
              delay={LEAD_DELAYS.credentialRows + getStaggerDelay(rowIndex)}
              className="flex items-baseline gap-3"
            >
              <dt className={LEAD_ROW_LABEL_CLASSES}>{row.label}</dt>
              <dd className={LEAD_ROW_VALUE_CLASSES}>{row.value}</dd>
            </AnimationWrapper>
          ))}
        </dl>
      )}

      {/* The achievement badge — the yellow half of the accent group, and the
          section's second resting yellow. `variant="achievement"` here and
          `informational` on a roster card, which is what keeps the count at
          three for any number of achievement-carrying coaches (Requirement 8.6,
          and see ACHIEVEMENT_BADGE_VARIANT_BY_PLINTH in TrainerPlinth). The
          badge's own padding is left alone: it has room in a column. */}
      {hasAchievement && (
        <AnimationWrapper preset="small" delay={LEAD_DELAYS.achievement} className="mt-6">
          <Badge variant="achievement">{achievement}</Badge>
        </AnimationWrapper>
      )}

      {/* The coach's own words, at §5.5's 26-character measure. Rendered only
          when the owner has supplied them — never a placeholder sentence
          (Requirement 8.3). */}
      {hasPhilosophy && (
        <AnimationWrapper preset="small" delay={LEAD_DELAYS.philosophy} className="mt-5">
          <BodyText className={LEAD_PHILOSOPHY_CLASSES}>{philosophy}</BodyText>
        </AnimationWrapper>
      )}

      {/* The per-coach CTA — this column's one interactive element, and a real
          one (Requirement 6.7). `trainer.ctaHref ?? fallbackCtaHref` is the
          resolution rule design.md §13.4 puts at the dossier.

          A plain `<a>` rather than `next/link` or `ButtonLink`, and white rather
          than yellow — both deliberate, both explained on LEAD_CTA_CLASSES. The
          arrow is decorative (Icon is `aria-hidden` by default) and nudges 4px on
          hover as the link's only interaction cue. */}
      <AnimationWrapper preset="small" delay={LEAD_DELAYS.cta} className="mt-8">
        <a
          href={trainer.ctaHref ?? fallbackCtaHref}
          aria-label={`Book a session with ${trainer.name}, ${trainer.title}`}
          className={LEAD_CTA_CLASSES}
        >
          {AFFORDANCE_LABEL}
          <Icon icon={ArrowRight} size="sm" className={LEAD_CTA_ARROW_CLASSES} />
        </a>
      </AnimationWrapper>
    </div>
  );
}
