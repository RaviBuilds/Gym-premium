import { Quote, Star } from "lucide-react";
import { BodyText } from "./Heading";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types/content";

/**
 * TestimonialCard — Editorial Evidence Fragment (Real Results redesign,
 * Phase 3).
 *
 * Despite the name (kept for import stability — see Testimonials.tsx), this
 * renders no card: no white surface, no shadow, no radius, no border, no
 * equal-height box. Each of the five supporting reviews is a numbered
 * fragment — index + quote + reviewer + stars — sitting directly on the
 * section's background, separated from its neighbors by spacing and a thin
 * rule rather than a container.
 *
 * The index (`01`–`05`) is purely editorial — muted ink, never yellow,
 * `aria-hidden` — matching the two-digit numeral convention already
 * shared with Programs/TrainerShowcase elsewhere on the site. It is not a
 * ranking; it is the section's restrained "measurement language" motif.
 */
export function TestimonialCard({
  testimonial,
  index,
  className,
}: {
  testimonial: Testimonial;
  /** 1-based position within the evidence field — rendered as "01".."05". */
  index: number;
  className?: string;
}) {
  const displayIndex = String(index).padStart(2, "0");

  return (
    <div className={cn("group flex flex-col gap-4 border-t border-border-subtle pt-6", className)}>
      <div className="flex items-baseline gap-3">
        <span
          aria-hidden="true"
          className="font-display text-caption font-semibold text-text-secondary/50 transition-colors duration-300 ease-out motion-safe:group-hover:text-brand-yellow motion-safe:group-focus-within:text-brand-yellow"
        >
          {displayIndex}
        </span>
        <Icon
          icon={Quote}
          size="default"
          className="text-text-secondary/40 transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
        />
      </div>
      <BodyText size="standard" className="text-text-primary">
        {testimonial.quote}
      </BodyText>
      <footer className="flex items-center gap-3">
        <span className="font-body text-caption font-semibold text-text-secondary">
          {testimonial.reviewerName}
        </span>
        <div className="flex gap-0.5" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon key={i} icon={Star} size="sm" className="fill-brand-yellow text-brand-yellow" />
          ))}
        </div>
      </footer>
    </div>
  );
}
