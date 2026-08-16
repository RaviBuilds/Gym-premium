/**
 * Section_Assembler — the pure logic layer behind the "Train With Experts"
 * section (design.md §13.5 / §13.6).
 *
 * This module is the single home for every render decision the section makes
 * about *which* coach appears *where*, and *what facts* may be stated about
 * them. Everything here is a pure function of its arguments: no I/O, no
 * module-scope side effects, no React, no DOM. The only observable effect is a
 * development-only `console.warn` on content-authoring mistakes, which is
 * documented per function.
 *
 * Deliberately carries **no** `"use client"` directive so it stays importable
 * from both the Server tree (`TrainerShowcase`, `RosterGrid`, `RosterCard`) and
 * the Client tree (`RosterAtmosphere` and friends).
 *
 * Layout of this file, in build order:
 *   1. Index formatting      — `formatIndex`
 *   2. Lead resolution       — `resolveLead`
 *   3. Roster resolution     — `resolveRoster`
 *   4. Combined years        — `resolveCombinedYears`
 *   5. Dossier rows          — `MAX_DOSSIER_ROWS`, `MAX_ROSTER_PIPS`,
 *                              `PlinthVariant`, `resolveDossierRows`
 *   6. Section assembly      — `SectionModel`, `assembleSection`
 *
 * Sections 1–5 are the parts; section 6 is the one entry point the section
 * itself calls. Read it last — it composes everything above and is where the
 * roster's "every coach exactly once, indexed 01..0N" guarantee is stated.
 */

import type { Trainer, TrainerCredential } from "@/types/content";

// ─────────────────────────────────────────────────────────────────────────────
// Dev warnings
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Emit a content-authoring warning in development only, matching the house
 * pattern used by `useMotionCamera` in `src/lib/motion/MotionCameraProvider.tsx`.
 * Stripped from production bundles by the `NODE_ENV` guard, so shipping content
 * mistakes are loud locally and silent for visitors.
 */
function warnInDevelopment(message: string): void {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[trainer-showcase] ${message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Index formatting
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Two-digit display index for the hex index chip — `1` → `"01"`.
 *
 * Total over `n ∈ ℕ` by construction: `padStart` only ever pads, never
 * truncates, so there is nothing to guard.
 *
 * - `n <= 9`  → zero-padded to exactly 2 characters (`0` → `"00"`, `9` → `"09"`)
 * - `n <= 99` → already 2 characters, returned unchanged
 * - `n >= 100` → returned at its natural width (`100` → `"100"`). The numeral
 *   grows rather than being clipped or wrapped, because silently rendering
 *   `"10"` for coach 100 would be a lie about the roster. A roster that large
 *   is a design problem, not a formatting one; the chip is sized for two digits
 *   and the wider numeral is the visible signal.
 *
 * `Number.isInteger(n) && n >= 0` is the documented precondition (design.md
 * §13.5) and the only input the assembler ever supplies. Non-integer or
 * negative values are not rejected — they simply stringify as-is (`-1` →
 * `"-1"`, `1.5` → `"1.5"`), keeping the function total.
 */
export function formatIndex(n: number): string {
  return String(n).padStart(2, "0");
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Lead resolution
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve the Lead_Coach — the trainer given the featured plinth spread and
 * index `01`.
 *
 * Selection is by the `lead: true` flag rather than array position, so the
 * Content_Registry can be reordered without silently changing who the gym puts
 * forward first.
 *
 * - Exactly one trainer flagged → that trainer (Requirement 1.3).
 * - No trainer flagged → `trainers[0]`, plus a development-only warning
 *   (Requirement 1.4).
 * - More than one flagged → the **first** flagged trainer, plus a
 *   development-only warning (Requirement 1.5).
 *
 * Pure apart from those warnings, and deterministic: the same array always
 * yields the same element.
 *
 * @throws {Error} when `trainers` is empty. Requirement 1.1 scopes the
 * Section_Assembler to arrays of length 1 or greater, so an empty roster is a
 * programmer error rather than a content state to degrade for. Failing loudly
 * beats returning `undefined` and widening the return type for every caller
 * downstream.
 */
export function resolveLead(trainers: readonly Trainer[]): Trainer {
  const [first] = trainers;

  if (first === undefined) {
    throw new Error(
      "[trainer-showcase] resolveLead received an empty trainer array. The section requires at least one trainer — check that src/content/trainers.ts is populated and that the array reached this call unfiltered."
    );
  }

  const flagged = trainers.filter((trainer) => trainer.lead === true);
  const [firstFlagged, secondFlagged] = flagged;

  if (firstFlagged === undefined) {
    warnInDevelopment(
      `No trainer sets \`lead: true\`, so "${first.name}" (${first.slug}) was used as the lead by array position. Set \`lead: true\` on the intended lead coach in src/content/trainers.ts to make the choice explicit.`
    );
    return first;
  }

  if (secondFlagged !== undefined) {
    warnInDevelopment(
      `${flagged.length} trainers set \`lead: true\` (${flagged
        .map((trainer) => trainer.slug)
        .join(", ")}). Only "${firstFlagged.name}" (${
        firstFlagged.slug
      }) was used as the lead. Remove \`lead: true\` from the others in src/content/trainers.ts — exactly one trainer may carry the flag.`
    );
  }

  return firstFlagged;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Roster resolution
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve the Roster — every coach other than the Lead_Coach, in the order the
 * section presents them (indices `02` upward).
 *
 * The signature mirrors design.md §13.5 and composes directly with
 * `assembleSection` (task 3.10), which calls `resolveLead` first and hands the
 * result straight through as `lead`: the lead is resolved once and the
 * exclusion here is exact rather than re-derived.
 *
 * Ordering comes **only** from `order` — the local `ROSTER_PRESENTATION_ORDER`
 * slug list in `TrainerShowcase`. The function walks `order`, not `trainers`,
 * so reordering `src/content/trainers.ts` cannot change who appears where
 * (Requirement 1.6). Declaration order in the Content_Registry is used for
 * nothing except the lead fallback in `resolveLead`.
 *
 * The Lead_Coach is never in the result (Requirement 1.3).
 *
 * ### Failure modes — all loud, all at module scope
 *
 * This runs at module scope inside a Server Component, so a `throw` here fails
 * `next build` rather than a visitor's render. That is the point: a content typo
 * should cost a red build, never a silent hole in the roster. Each case below
 * names the offending slug so the message alone is enough to fix the list.
 *
 * - **Unknown slug** — a slug in `order` matching no trainer throws
 *   (Requirement 1.7). Left unchecked it would drop a grid cell.
 * - **Trainer omitted from `order`** — a coach present in `trainers` but absent
 *   from `order` also throws. Requirement 1.1 makes `{lead} ∪ roster` cover
 *   every trainer exactly once, so silently dropping a coach the gym employs is
 *   the same class of mistake as naming one who does not exist, and gets the
 *   same treatment.
 * - **Duplicate slug** — a slug repeated in `order` throws, since it would
 *   render one coach twice and break the "exactly once" half of Requirement 1.1
 *   along with the contiguous indices built from this array.
 * - **Lead's slug in `order`** — tolerated, not fatal. It is skipped and a
 *   development-only warning is emitted. Requirement 1.3 is unconditional, so
 *   excluding the lead defensively is strictly safer than trusting the list;
 *   and unlike the cases above, the rendered section is still correct and
 *   complete, which does not justify failing a build. Duplicate lead entries
 *   are skipped the same way and warn once each.
 *
 * Pure apart from that one warning, and deterministic: the same arguments always
 * yield the same array, freshly allocated (a mutable `Trainer[]` per §13.5, so
 * callers may sort or slice it without cloning).
 *
 * @param trainers The full Content_Registry array, in declaration order.
 * @param order Slug list deciding roster order. Must cover every non-lead
 * trainer exactly once.
 * @param lead The Lead_Coach, as returned by {@link resolveLead}.
 * @throws {Error} on an unknown slug, a duplicate slug, or a trainer missing
 * from `order` — message names the slugs involved.
 */
export function resolveRoster(
  trainers: readonly Trainer[],
  order: readonly string[],
  lead: Trainer
): Trainer[] {
  const bySlug = new Map(trainers.map((trainer) => [trainer.slug, trainer]));
  const placed = new Set<string>();
  const roster: Trainer[] = [];

  for (const slug of order) {
    const trainer = bySlug.get(slug);

    if (trainer === undefined) {
      throw new Error(
        `[trainer-showcase] resolveRoster could not find a trainer with slug "${slug}". Every slug in ROSTER_PRESENTATION_ORDER must match a trainer in src/content/trainers.ts — check for a typo or a renamed slug.`
      );
    }

    if (slug === lead.slug) {
      warnInDevelopment(
        `ROSTER_PRESENTATION_ORDER lists the lead coach "${lead.name}" (${lead.slug}), who already carries index 01 on the lead plinth. The entry was ignored — remove it from the order list, which should name roster coaches only.`
      );
      continue;
    }

    if (placed.has(slug)) {
      throw new Error(
        `[trainer-showcase] resolveRoster received the slug "${slug}" more than once in ROSTER_PRESENTATION_ORDER. Each coach may appear exactly once, or the roster would render them twice and the index numerals would no longer be contiguous.`
      );
    }

    placed.add(slug);
    roster.push(trainer);
  }

  const omitted = trainers
    .filter((trainer) => trainer.slug !== lead.slug && !placed.has(trainer.slug))
    .map((trainer) => trainer.slug);

  if (omitted.length > 0) {
    throw new Error(
      `[trainer-showcase] resolveRoster found ${omitted.length} trainer(s) absent from ROSTER_PRESENTATION_ORDER: ${omitted.join(
        ", "
      )}. Every coach in src/content/trainers.ts must be placed, either as the lead or somewhere in the order list — add the missing slug(s) rather than leaving a coach unrendered.`
    );
  }

  return roster;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Combined years
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve the combined-years figure — the total time on the floor the section
 * may claim for the coaching team as a whole.
 *
 * The footer publishes this number as a plain statement of fact ("N years on
 * the floor between them"), so the only two honest answers are the **exact**
 * total or **nothing at all**. A sum over the coaches who happen to have the
 * field would be a wrong number wearing the clothes of a true one: it reads as
 * the team's full experience while actually being a floor on it. This function
 * therefore returns `null` the moment a single coach omits `yearsExperience`,
 * and `RosterFooter` (task 9.3) drops the figure and its sentence entirely
 * rather than showing a smaller one (Requirement 8.1, design.md §7.2).
 *
 * - Every trainer supplies `yearsExperience` → the exact sum, `>= 0`.
 * - One or more omit it → `null`. Never a partial sum.
 *
 * The two branches are exhaustive and mutually exclusive, which is the
 * biconditional Requirement 8.1 states and Property 6 (design.md §13.5) tests:
 * the result is `null` **iff** at least one trainer is missing the field.
 *
 * `undefined` is tested explicitly rather than by truthiness, because a coach
 * genuinely in their first year may legitimately carry `yearsExperience: 0` —
 * a falsy value that is nonetheless supplied, and must count as supplied.
 *
 * ### Empty array → `0`, deliberately
 *
 * An empty roster vacuously satisfies "every trainer supplies the field", so
 * the sum of nothing is `0` and that is what comes back — not `null`. This is
 * the one case worth arguing about, since "0 years on the floor between them"
 * would be a grim fact to publish. Two things settle it:
 *
 * 1. The biconditional above is the contract. Returning `null` for `[]` would
 *    make the function answer `null` for an input where no field is missing,
 *    breaking the very property that makes the figure trustworthy and leaving
 *    callers unable to read `null` as "a coach is missing data".
 * 2. The zero-coach section does not exist. Requirement 1.1 scopes the
 *    Section_Assembler to one trainer or more, and `resolveLead` throws on an
 *    empty array before `assembleSection` ever reaches this call — so there is
 *    no render in which `0` could reach the footer.
 *
 * In other words the honesty risk is unreachable, while the cost of bending the
 * contract to dodge it is real. The empty case stays mathematically correct and
 * the empty roster stays a build failure, which is where that problem belongs.
 *
 * ### Today's answer is `null`
 *
 * All six shipped coaches deliberately omit `yearsExperience` — it is owner
 * input still pending, and design.md §7.2 forbids estimating it — so this
 * returns `null` against the real Content_Registry and the footer figure is
 * omitted. That is the system working, not a bug to patch: the fix is the owner
 * supplying six numbers in `src/content/trainers.ts`, never a guess here.
 *
 * Fully pure: no warnings, no I/O. Missing data is the expected state rather
 * than an authoring mistake, so there is nothing here to complain about.
 *
 * @param trainers Every coach the section renders — the lead included, since
 * the figure covers the whole team.
 * @returns The exact total, or `null` when any coach omits the field.
 */
export function resolveCombinedYears(trainers: readonly Trainer[]): number | null {
  let total = 0;

  for (const trainer of trainers) {
    if (trainer.yearsExperience === undefined) {
      return null;
    }

    total += trainer.yearsExperience;
  }

  return total;
}
// ─────────────────────────────────────────────────────────────────────────────
// 5. Dossier rows
// ─────────────────────────────────────────────────────────────────────────────

/**
 * How many credential rows each plinth variant may show.
 *
 * The lead coach owns a full dossier column beside its plinth, so it can carry
 * five rows without crowding. A roster card carries its rows inside a label pool
 * whose height must stay identical across all five cards (Requirement 8.5), so
 * two is the ceiling that fixed height affords.
 *
 * `as const` keeps the values as literals and makes the keys the single source
 * of truth for {@link PlinthVariant}; `satisfies` checks the shape without
 * widening either.
 */
export const MAX_DOSSIER_ROWS = { lead: 5, roster: 2 } as const satisfies Record<
  string,
  number
>;

/**
 * How many hex discipline pips a roster label pool may show (design.md §13.2).
 *
 * Lives here beside {@link MAX_DOSSIER_ROWS} because both caps exist for the
 * same reason — the roster label pool's fixed height — and are easier to keep
 * consistent when they are read from one place. Consumed by the label block in
 * `TrainerPlinth`, not by anything in this module.
 */
export const MAX_ROSTER_PIPS = 2;

/**
 * The two plinth treatments: the featured lead spread, and a roster grid cell.
 *
 * Derived from {@link MAX_DOSSIER_ROWS} rather than declared separately, so a
 * variant can never exist without a row cap.
 */
export type PlinthVariant = keyof typeof MAX_DOSSIER_ROWS;

/**
 * Resolve the credential rows a coach's dossier may state — the label/value
 * facts rendered beside or beneath their plinth (design.md §13.6).
 *
 * Priority order is fixed at `Experience` → `Certified` → `Focus`, and the row
 * count is capped at `MAX_DOSSIER_ROWS[variant]`. The order is a ranking by
 * value, not a layout convenience: years on the floor outrank a certification
 * list, which outranks the discipline restatement the card already shows as
 * pips. So when the cap bites, what gets dropped is always the least
 * interesting fact available (Requirement 8.2).
 *
 * ### Two invariants this function exists to hold
 *
 * 1. **Never more than the cap.** `rows.length <= maxRows` holds at every
 *    boundary, including each iteration of the certification loop, which breaks
 *    the moment the cap is reached rather than trimming afterwards.
 * 2. **Never an empty row.** No row is emitted for an absent field, and no
 *    emitted row carries an empty `label` or `value`. A row reading
 *    `CERTIFIED —` is worse than no row: it reads as missing data on a surface
 *    whose whole job is stating facts.
 *
 * A coach with **zero** optional fields still yields exactly one row — `Focus`,
 * built from the required `discipline` array — which is what puts the lower
 * bound of Requirement 8.2 at 1 rather than 0, and means no card can render an
 * empty dossier (design.md §7.3, the minimum row of the degradation matrix).
 *
 * `yearsExperience` is tested against `undefined` explicitly rather than by
 * truthiness, for the same reason as in {@link resolveCombinedYears}: a coach in
 * their first year may legitimately carry `yearsExperience: 0`, which is falsy
 * but supplied, and supplied data gets stated.
 *
 * ### The cap, not the matrix, decides where certifications stop
 *
 * §7.3 describes the roster showing "first cert only". That is the outcome for
 * the coach the matrix has in mind — one with `yearsExperience`, whose
 * Experience row leaves exactly one of the two roster slots free. A roster coach
 * with certifications and no years fills both slots with certifications and no
 * `Focus` row, because two named certifications say more than a restatement of
 * the pips already visible in the label pool. The cap is the rule; the matrix
 * row is one of its cases.
 *
 * ### Empty `discipline` degrades quietly, and warns
 *
 * `discipline` is required by the `Trainer` type and by Requirement 8.4, and
 * `trainer.discipline.length >= 1` is the documented precondition, so an empty
 * (or all-blank) array is a content-authoring mistake rather than a state to
 * design for. It is handled anyway: the `Focus` row is skipped and a
 * development-only warning names the coach. Requirement 8.2's guarantee is
 * conditional on that precondition, so returning fewer rows there is honest,
 * where emitting `{ label: "Focus", value: "" }` would break invariant 2 for
 * every caller downstream. Blank certification strings are skipped the same way
 * and for the same reason.
 *
 * Pure apart from those warnings, and deterministic: the same coach and variant
 * always yield the same rows, freshly allocated.
 *
 * @param trainer The coach whose facts are being stated.
 * @param variant Which plinth treatment is asking, which sets the row cap.
 * @returns Between 1 and `MAX_DOSSIER_ROWS[variant]` rows, in priority order.
 */
export function resolveDossierRows(
  trainer: Trainer,
  variant: PlinthVariant
): TrainerCredential[] {
  const maxRows = MAX_DOSSIER_ROWS[variant];
  const rows: TrainerCredential[] = [];

  // Every cap is >= 2, so the Experience row can never overrun it on its own.
  if (trainer.yearsExperience !== undefined) {
    rows.push({ label: "Experience", value: `${trainer.yearsExperience} yrs` });
  }

  if (trainer.certifications !== undefined) {
    for (const certification of trainer.certifications) {
      // INVARIANT: rows.length <= maxRows at every iteration boundary.
      if (rows.length >= maxRows) {
        break;
      }

      const value = certification.trim();

      if (value.length === 0) {
        warnInDevelopment(
          `"${trainer.name}" (${trainer.slug}) has a blank entry in \`certifications\`, which was skipped — a credential row with no value reads as missing data. Remove the empty string from src/content/trainers.ts, or name the certification.`
        );
        continue;
      }

      rows.push({ label: "Certified", value });
    }
  }

  if (rows.length < maxRows) {
    const focus = trainer.discipline
      .map((discipline) => discipline.trim())
      .filter((discipline) => discipline.length > 0);

    if (focus.length === 0) {
      warnInDevelopment(
        `"${trainer.name}" (${trainer.slug}) has no usable \`discipline\` values, so the Focus row was omitted and the dossier may be empty. Every coach needs at least one discipline in src/content/trainers.ts — it is what answers "what do they actually coach?".`
      );
    } else {
      rows.push({ label: "Focus", value: focus.join(" · ") });
    }
  }

  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Section assembly
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The section's render model — everything `TrainerShowcase` needs to know about
 * *who* appears *where*, resolved once at module scope (design.md §13.6).
 *
 * Deliberately holds data only: coaches, their display indices and one number.
 * No hrefs, no class names, no components. Presentation decisions stay in the
 * components that make them, so this stays testable as plain values.
 */
export interface SectionModel {
  /** The featured coach, on the lit plinth spread at index `"01"`. */
  lead: Trainer;
  /** Every other coach, in presentation order, at indices `"02"` upward. */
  roster: Trainer[];
  /**
   * Display index per coach, keyed by slug — `{ "mohammed-wajeed": "01", … }`.
   *
   * Slug-keyed rather than positional because every consumer already holds a
   * `Trainer` when it needs the numeral (`indices[trainer.slug]`), and slugs are
   * unique across the Content_Registry, so the key is both convenient and safe.
   * A parallel array would force call sites to carry an index alongside the
   * coach and keep the two in step by hand — exactly the bookkeeping this map
   * removes.
   *
   * Contains one entry per trainer, so `Object.keys(indices).length` is the
   * roster size and `Object.values(indices)` is the full multiset of numerals —
   * enough to assert uniqueness and contiguity without relying on key order.
   * Order-sensitive checks should map `[lead, ...roster]` through the map rather
   * than reading key insertion order, which is an implementation detail.
   */
  indices: Readonly<Record<string, string>>;
  /** Exact combined years across the whole team, or `null`. See {@link resolveCombinedYears}. */
  combinedYears: number | null;
}

/**
 * Assemble the section's render model — the Section_Assembler's single entry
 * point (design.md §13.6).
 *
 * Called once at module scope in `TrainerShowcase`, not per render: the model is
 * a pure function of content that never changes at runtime, so resolving it
 * during the module's evaluation means content mistakes surface while
 * `next build` runs rather than while a visitor scrolls.
 *
 * Composition order is fixed, because each step depends on the last:
 *
 * 1. {@link resolveLead} — who the gym puts forward first (Requirement 1.3–1.5).
 * 2. {@link resolveRoster} — everyone else, in presentation order, with the lead
 *    from step 1 excluded exactly rather than re-derived (Requirement 1.6, 1.7).
 * 3. The index map — `"01"` for the lead, then `formatIndex(i + 2)` walking the
 *    roster in order (Requirement 1.2).
 * 4. {@link resolveCombinedYears} — over the **full** `trainers` array, lead
 *    included, since the footer's figure claims the whole team's time on the
 *    floor and not just the grid's (Requirement 8.1).
 *
 * Every step delegates. This function adds no resolution logic of its own, so
 * there is exactly one place to change any rule and no second copy to drift.
 *
 * ### Requirement 1.1 is inherited, not re-checked here
 *
 * `{lead} ∪ roster` containing every trainer exactly once is enforced upstream:
 * {@link resolveRoster} throws on an unknown slug, a duplicate slug, or a coach
 * missing from `order`, which between them rule out both halves of the
 * guarantee. This function does not re-validate it. That is intentional — the
 * invariant needs one owner, and duplicating the checks here would mean two
 * error messages for one mistake and two places to keep in agreement. What is
 * checked below is only the one failure `resolveRoster` cannot see.
 *
 * ### Indices are contiguous by construction
 *
 * The counter starts at 2 and increments once per roster coach, so the assigned
 * numerals are `01` for the lead followed by `02..0N` with no gaps and no
 * repeats, and the loop invariant from §13.6 holds at every boundary: the
 * numerals assigned so far are unique and contiguous from `01`, and the counter
 * always equals `1 + (number of indices assigned)`. Nothing sorts, filters or
 * de-duplicates after the fact, so there is no step at which contiguity could be
 * lost — which is what Property 2 asserts.
 *
 * Pure apart from the development-only warnings inherited from
 * {@link resolveLead} and {@link resolveRoster}, and deterministic: the same
 * arguments always yield an equal model, freshly allocated.
 *
 * @param trainers The full Content_Registry array, length 1 or greater.
 * @param order Slug list deciding roster order, covering every non-lead trainer
 * exactly once.
 * @param fallbackCtaHref The section-level booking target, accepted for parity
 * with the call site in design.md §13.7 and validated here so a blank value is
 * caught once at module scope. It is deliberately **absent from the returned
 * model**: per-coach link resolution is `trainer.ctaHref ?? fallbackCtaHref` at
 * the card and dossier (design.md §13.4, Property 22), and mirroring it into the
 * model would give that one rule two owners. Optional, so the helper stays
 * callable as `assembleSection(trainers, order)` in tests.
 * @throws {Error} when `trainers` is empty, when `order` is malformed (see
 * {@link resolveRoster}), or when two trainers share a slug.
 */
export function assembleSection(
  trainers: readonly Trainer[],
  order: readonly string[],
  fallbackCtaHref?: string
): SectionModel {
  if (fallbackCtaHref !== undefined && fallbackCtaHref.trim().length === 0) {
    warnInDevelopment(
      "assembleSection received a blank `fallbackCtaHref`. Every coach without their own `ctaHref` falls back to it, so a blank value ships cards that link nowhere — pass the section's booking target (e.g. \"/contact?intent=trial\")."
    );
  }

  const lead = resolveLead(trainers);
  const roster = resolveRoster(trainers, order, lead);

  const indices: Record<string, string> = { [lead.slug]: formatIndex(1) };

  let position = 2;

  for (const coach of roster) {
    // INVARIANT: every slug assigned so far carries a unique index, contiguous
    // from 01 and increasing by exactly 1 per assignment; `position` always
    // equals 1 + the number of indices assigned.
    indices[coach.slug] = formatIndex(position);
    position += 1;
  }

  // The one check `resolveRoster` cannot make: it keys trainers by slug, so two
  // coaches sharing a slug collapse into one entry there and one index here.
  // Left alone that silently drops a coach the gym employs — the same outcome
  // Requirement 1.1 rules out — so it fails the build like the other omissions.
  if (Object.keys(indices).length !== trainers.length) {
    throw new Error(
      `[trainer-showcase] assembleSection indexed ${Object.keys(indices).length} coach(es) from ${trainers.length} trainer(s), which means two trainers in src/content/trainers.ts share a slug. Slugs are the roster's identity — they key the index numerals, the presentation order and the image paths — so give each coach a unique one.`
    );
  }

  return { lead, roster, indices, combinedYears: resolveCombinedYears(trainers) };
}
