import type { LucideIcon } from "lucide-react";
import { Sunrise, CalendarDays, Crown } from "lucide-react";

export interface PricingTier {
  duration: string;
  listPrice: string;
  offerPrice?: string;
  bestSeller?: boolean;
  /**
   * Decorative plan glyph — same role as Facility.icon (src/content/
   * facilities.ts): a structural/symbolic mark, not business data. Sunrise
   * for a single day, a calendar for a recurring monthly commitment, a
   * crown for the plan the section recommends. Purely visual — never
   * implies a feature, benefit, or claim the plan doesn't actually have.
   */
  icon: LucideIcon;
}

/**
 * Singles membership pricing — real figures from the live site's Join Now
 * page, documented in 01-business-analysis.md. Homepage shows a compact
 * subset (not the full per-branch/couples table, which belongs on a
 * dedicated Pricing page) — Daily, Monthly, and Yearly cover the three
 * decision points most homepage visitors actually compare: "try me cheap,"
 * "commit for a bit," "best value." Figures shown are Gachibowli's, as the
 * flagship branch; the full Pricing page carries the per-branch split.
 */
export const homepagePricingTiers: PricingTier[] = [
  { duration: "Daily", listPrice: "₹199", icon: Sunrise },
  { duration: "Monthly", listPrice: "₹2,799", offerPrice: "₹1,999", icon: CalendarDays },
  { duration: "Yearly", listPrice: "₹15,999", offerPrice: "₹9,499", bestSeller: true, icon: Crown },
];
