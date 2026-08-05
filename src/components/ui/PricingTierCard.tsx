import { Card } from "./Card";
import { Heading, BodyText } from "./Heading";
import { Badge } from "./Badge";
import type { PricingTier } from "@/content/pricing";

/**
 * PricingTierCard — supports MembershipCta. Composes the base Card rather
 * than redefining styling, per Design-System.md §7. "Best Seller" uses the
 * `highlight` Badge variant (yellow, positive attention) per Design-System.md
 * §8 — anchoring toward the yearly plan without inventing false urgency,
 * consistent with 08-conversion-strategy.md's "legitimate, honest nudge"
 * guidance.
 */
export function PricingTierCard({ tier }: { tier: PricingTier }) {
  return (
    <Card interactive={false} className="relative flex flex-col items-center gap-2 text-center">
      {tier.bestSeller && (
        <Badge variant="highlight" className="absolute -top-3 left-1/2 -translate-x-1/2">
          Best Seller
        </Badge>
      )}
      <BodyText size="caption" className="mt-2 uppercase tracking-wide text-text-secondary">
        {tier.duration}
      </BodyText>
      <Heading level="subsection" as="p" className="text-ink">
        {tier.offerPrice ?? tier.listPrice}
      </Heading>
      {tier.offerPrice && (
        <BodyText size="caption" className="text-text-secondary line-through">
          {tier.listPrice}
        </BodyText>
      )}
    </Card>
  );
}
