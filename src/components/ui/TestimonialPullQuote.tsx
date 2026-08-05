import { Quote, Star } from "lucide-react";
import { BodyText } from "./Heading";
import { Icon } from "./Icon";
import { Badge } from "./Badge";
import type { Testimonial } from "@/types/content";

/**
 * TestimonialPullQuote — Homepage-Architecture.md §6, Design-System.md §7.
 *
 * Deliberately does NOT use Card — per the spec, the featured testimonial
 * treatment has no shadow, no border, no background container. It should
 * read as a magazine pull-quote sitting directly on the section background.
 *
 * The quote's key stat (e.g. "-10kg in 3 months") is rendered from
 * `attributeTag` as its own large, bold callout rather than attempting to
 * bold a substring inside the free-text quote — the content model doesn't
 * carry rich-text markup, and attributeTag already captures the number
 * cleanly and reliably.
 *
 * Star row is a static 5/5 (the content model has no numeric rating field —
 * every testimonial here was hand-picked as a positive real review) —
 * purely decorative reinforcement, `aria-hidden`, since the reviewer's name
 * and quote already carry the actual accessible content.
 */
export function TestimonialPullQuote({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="relative flex flex-col gap-4">
      <div className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Icon key={i} icon={Star} size="sm" className="fill-brand-yellow text-brand-yellow" />
        ))}
      </div>
      <Icon icon={Quote} size="xl" className="text-brand-yellow/40" aria-hidden />
      <blockquote>
        <BodyText size="large" className="text-text-primary">
          {testimonial.quote}
        </BodyText>
      </blockquote>
      <figcaption className="flex flex-wrap items-center gap-3">
        <span className="font-body text-caption font-semibold text-text-secondary">
          {testimonial.reviewerName}
        </span>
        {testimonial.attributeTag && <Badge variant="achievement">{testimonial.attributeTag}</Badge>}
      </figcaption>
    </figure>
  );
}
