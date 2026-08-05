import { Quote, Star } from "lucide-react";
import { Card } from "./Card";
import { BodyText } from "./Heading";
import { Icon } from "./Icon";
import type { Testimonial } from "@/types/content";

/**
 * TestimonialCard — the secondary (non-featured) testimonial treatment.
 * Design-System.md §7: "text-led, no image by default... padding increases
 * slightly" — the spec's exact 28px isn't on the 8px spacing scale (24/32
 * are the nearest tokens), so this snaps to the standard Card padding (24px)
 * rather than introducing an off-scale one-off value, per Design-System.md §4
 * ("don't invent a new token... use Tailwind's own p-* utilities directly").
 *
 * Star row mirrors TestimonialPullQuote's — static 5/5, decorative,
 * `aria-hidden` — for the same reason: no numeric rating field exists on the
 * content model, and the real accessible content is the quote + name.
 */
export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card interactive={false} className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <Icon icon={Quote} size="lg" className="text-brand-yellow" aria-hidden />
        <div className="flex gap-0.5" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon key={i} icon={Star} size="sm" className="fill-brand-yellow text-brand-yellow" />
          ))}
        </div>
      </div>
      <BodyText size="standard" className="flex-1 text-text-primary">
        {testimonial.quote}
      </BodyText>
      <footer className="font-body text-caption font-semibold text-text-secondary">
        {testimonial.reviewerName}
      </footer>
    </Card>
  );
}
