import { cn } from "@/lib/utils";
import { ButtonLink } from "./Button";
import { BodyText } from "./Heading";

/**
 * PricingTeaserCallout — Homepage-Architecture.md §4 Philosophy / Value Story.
 *
 * The single most important sentence on the homepage for a comparison
 * shopper, per that section's spec — surfaces a real starting price on the
 * homepage itself rather than hiding it behind a Pricing page click.
 * Assumes a dark section background (white text), matching where the
 * Philosophy band is placed on the homepage.
 */
export function PricingTeaserCallout({
  priceText,
  className,
}: {
  priceText: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-4 border-l-4 border-brand-yellow pl-6 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <BodyText size="large" className="font-bold text-white">
        {priceText}
      </BodyText>
      {/* `/#pricing` — the MembershipCta section, not a `/pricing` route, which
          does not exist. See src/config/nav.ts. */}
      <ButtonLink href="/#pricing" variant="primary" size="compact">
        View Membership Plans
      </ButtonLink>
    </div>
  );
}
