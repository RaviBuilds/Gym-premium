import { Quote, Star } from "lucide-react";
import { BodyText } from "./Heading";
import { Icon } from "./Icon";
import { AnimationWrapper } from "@/components/motion";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types/content";

/**
 * TestimonialPullQuote — Results As Hero Typography (Real Results redesign,
 * Phase 3).
 *
 * Each featured story is composed from two primitives — a Result block
 * (the oversized `10 KG` / `2 YEARS` figure, its micro-label caption, and
 * one thin yellow rule) and a Quote block (the testimonial copy, reviewer
 * name and star row) — stacked vertically within the story's own column and
 * arranged by `align`:
 *
 *  - `"result-first"` (Lalith): result leads, quote follows, both
 *    left-aligned.
 *  - `"quote-first"` (Samba): quote leads, result follows, and the result
 *    right-aligns instead of left-aligning — same design DNA, mirrored
 *    reading direction, so the two stories relate without being copies of
 *    one template.
 *
 * The caller (Testimonials.tsx) places the two stories side-by-side as two
 * columns at `lg:` and stacked at every width below it (Phase 3 Revision 1)
 * — this component only owns each story's *internal* composition, not the
 * two-story layout.
 *
 * The result is the section's primary visual device (`text-result-lg`,
 * §Phase 3 plan H) — larger than the quote's body type by design, so it
 * dominates regardless of which primitive comes first in reading order.
 *
 * No Card, no shadow, no border, no background — this still isn't a UI
 * component, it's a magazine pull-quote sitting directly on the section's
 * off-white background, same as Phase 1.
 */
export type PullQuoteAlign = "result-first" | "quote-first";

/**
 * Splits an `attributeTag` string (e.g. "-10kg in 3 months", "2-year member")
 * into a large editorial "value" and a small supporting "caption", without
 * fabricating anything — this is pure reformatting of the existing content
 * string, not new data. Returns null for a shape the parser doesn't
 * recognize, so the caller can fall back to omitting the result block
 * entirely rather than rendering something malformed.
 *
 * Handles two shapes seen in the real content:
 *  - "10kg in 3 months"  → number + unit glued together, then free text
 *  - "2-year member"     → number-hyphen-unit, then free text (unit pluralized
 *                          when the leading number isn't 1)
 */
function parseAttributeTag(tag: string): { value: string; caption: string } | null {
  const cleaned = tag.trim().replace(/^-/, "");

  const hyphenated = cleaned.match(/^(\d+)-([a-zA-Z]+)\s+(.+)$/);
  if (hyphenated && hyphenated[1] && hyphenated[2] && hyphenated[3]) {
    const [, num, unit, rest] = hyphenated;
    const pluralUnit = num === "1" ? unit : `${unit}s`;
    return { value: `${num} ${pluralUnit.toUpperCase()}`, caption: rest.toUpperCase() };
  }

  const glued = cleaned.match(/^(\d+)([a-zA-Z]+)\s+(.+)$/);
  if (glued && glued[1] && glued[2] && glued[3]) {
    const [, num, unit, rest] = glued;
    return { value: `${num} ${unit.toUpperCase()}`, caption: rest.toUpperCase() };
  }

  return null;
}

/**
 * The result block — the section's primary visual device. `text-result-lg`
 * (96px desktop / 48px mobile, §globals.css) is a Real-Results-only token,
 * deliberately larger than the section heading so the number dominates the
 * composition it sits in. Right-aligns under `quote-first` so Samba's block
 * mirrors Lalith's rather than repeating it.
 */
function ResultBlock({
  value,
  caption,
  align,
}: {
  value: string;
  caption: string;
  align: PullQuoteAlign;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "quote-first" && "items-start lg:items-end lg:text-right"
      )}
    >
      <div className="flex flex-col gap-1">
        <span className="font-display text-result text-ink lg:text-result-lg">{value}</span>
        <span className="font-body text-caption font-semibold uppercase tracking-[0.12em] text-text-secondary lg:text-caption-lg">
          {caption}
        </span>
      </div>
      {/* One short editorial rule per result — the section's only
          decorative yellow besides the eyebrow and CTA. Subtly widens on
          hover/focus of the whole story (§Phase 3 hover plan). Final
          micro-polish: Samba's resting width is a touch narrower (`w-8` vs
          Lalith's `w-10`) so it reads as quieter/more integrated — Samba's
          result is the resolution of its quote, not a second independent
          headline. Both still expand to `w-12` on hover/focus. */}
      <span
        aria-hidden="true"
        className={cn(
          "h-0.5 bg-brand-yellow transition-[width] duration-300 ease-out motion-safe:group-hover:w-12",
          align === "quote-first" ? "w-8 lg:self-end" : "w-10"
        )}
      />
    </div>
  );
}

/**
 * The quote block — testimonial copy, reviewer name and stars. Stars sit
 * inline with the byline (never above the result — §Phase 3 hierarchy:
 * RESULT → QUOTE → NAME+STARS).
 *
 * Phase 4: the quote glyph is repositioned from "floating above the text"
 * to overlapping the first line, cropped so only its inner ~70% shows —
 * an editorial punctuation mark integrated into the copy rather than a
 * decorative icon sitting beside it. The crop wrapper is intentionally
 * smaller than the icon itself (`size-11`/`size-14` crop vs. `size-16`/
 * `size-20` icon ≈ 69–70% visible) and `overflow-hidden`, with the icon
 * anchored to the wrapper's near corner so the far corner is cropped away.
 * `glyphSide` mirrors both the crop anchor and the icon's own corner so
 * Samba's glyph isn't a flipped duplicate of Lalith's treatment — it's the
 * same mark, anchored from the opposite edge.
 *
 * `maxWidthClassName` constrains the quote's reading measure independently
 * of its grid cell (Phase 4 §1/§2) — Lalith's narrower than Samba's — so
 * the two featured columns stop reading as two equal-width blocks.
 */
function QuoteBlock({
  testimonial,
  glyphSide,
  maxWidthClassName,
}: {
  testimonial: Testimonial;
  glyphSide: "left" | "right";
  maxWidthClassName?: string;
}) {
  return (
    <figure className={cn("relative flex flex-col gap-6 pt-2", maxWidthClassName)}>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-2 size-11 overflow-hidden lg:size-14",
          glyphSide === "left" ? "-left-3" : "-right-3"
        )}
      >
        <Icon
          icon={Quote}
          className={cn(
            "absolute size-16 text-brand-yellow/35 transition-transform duration-300 ease-out motion-safe:group-hover:scale-105 lg:size-20",
            glyphSide === "left" ? "top-0 left-0" : "top-0 right-0"
          )}
        />
      </span>
      <blockquote className="relative z-10">
        <BodyText size="large" className="text-text-primary">
          {testimonial.quote}
        </BodyText>
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <span className="font-body text-caption font-semibold text-text-secondary">
          {testimonial.reviewerName}
        </span>
        <div className="flex gap-0.5" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon key={i} icon={Star} size="sm" className="fill-brand-yellow text-brand-yellow" />
          ))}
        </div>
      </figcaption>
    </figure>
  );
}

export function TestimonialPullQuote({
  testimonial,
  align,
  resultDelay,
  quoteDelay,
}: {
  testimonial: Testimonial;
  align: PullQuoteAlign;
  /** Seconds — delay for the result block's own scale-in-settle reveal
   *  (§Phase 3 motion sequence: result arrives as its own beat). */
  resultDelay: number;
  /** Seconds — delay for the quote+identity block's reveal, one beat after
   *  its result (§Phase 3 motion sequence). */
  quoteDelay: number;
}) {
  const result = testimonial.attributeTag ? parseAttributeTag(testimonial.attributeTag) : null;
  const glyphSide = align === "result-first" ? "left" : "right";

  // Every featured testimonial in the real content set carries an
  // attributeTag (that's the definition of "featured" here), so this is a
  // defensive fallback, not an expected path — render the quote alone
  // rather than a malformed result block.
  if (!result) {
    return (
      <div className="group">
        <AnimationWrapper preset="medium" delay={quoteDelay}>
          <QuoteBlock testimonial={testimonial} glyphSide={glyphSide} />
        </AnimationWrapper>
      </div>
    );
  }

  // Phase 4: each story gets its own internal rhythm rather than a shared
  // gap-10 — Lalith's quote tucks up close under its result (tighter gap +
  // a small upward pull), Samba's keeps a plain, slightly looser rhythm
  // since its quote leads rather than follows. Measure caps are lg+ only
  // (unconstrained below lg, where the column itself is already the only
  // width available) and differ per story so the two columns stop reading
  // as equal-width blocks.
  //
  // Final micro-polish: Samba's gap tightened from gap-10 to gap-6 (still
  // one step looser than Lalith's gap-6-with-negative-margin combo, so the
  // two stories don't use identical values) and its result gets a small
  // lg:-mt-1 pull toward the quote above it — so "2 YEARS" reads as the
  // punchline of its own quote rather than large text sitting in the
  // story's lower whitespace. Below lg, both stacking order and spacing
  // stay in plain document flow (the -mt-1 is lg-only).
  const resultBlock = (
    <AnimationWrapper
      variant="scale-in-settle"
      delay={resultDelay}
      className={align === "quote-first" ? "lg:-mt-1" : undefined}
    >
      <ResultBlock value={result.value} caption={result.caption} align={align} />
    </AnimationWrapper>
  );
  const quoteBlock = (
    <AnimationWrapper
      preset="medium"
      delay={quoteDelay}
      className={align === "result-first" ? "lg:-mt-2" : undefined}
    >
      <QuoteBlock
        testimonial={testimonial}
        glyphSide={glyphSide}
        maxWidthClassName={align === "result-first" ? "lg:max-w-[34ch]" : "lg:max-w-[42ch]"}
      />
    </AnimationWrapper>
  );

  return (
    <div className="group flex flex-col gap-6">
      {align === "result-first" ? (
        <>
          {resultBlock}
          {quoteBlock}
        </>
      ) : (
        <>
          {quoteBlock}
          {resultBlock}
        </>
      )}
    </div>
  );
}
