export interface PricingTier {
  duration: string;
  listPrice: string;
  offerPrice?: string;
  bestSeller?: boolean;
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
  { duration: "Daily", listPrice: "₹199" },
  { duration: "Monthly", listPrice: "₹2,799", offerPrice: "₹1,999" },
  { duration: "Yearly", listPrice: "₹15,999", offerPrice: "₹9,499", bestSeller: true },
];
