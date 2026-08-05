export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Six of the most homepage-relevant questions, drawn verbatim in substance
 * from the real 21-item FAQ already documented in 01-business-analysis.md.
 * Chosen to avoid repeating content already covered elsewhere on the
 * homepage (pricing logic is covered in WhyInfiniti/MembershipCta, hours
 * are covered in Locations) — these six fill gaps a first-time visitor
 * would still have.
 */
export const faqs: FaqItem[] = [
  {
    question: "How do I join Infiniti Fitness?",
    answer:
      "Sign up online with Join Now, or just walk into either branch during opening hours — our team will help you pick the right plan on the spot.",
  },
  {
    question: "Can I try before I commit?",
    answer:
      "Yes — we offer a free trial so you can train with us before joining. No pressure, no upfront payment.",
  },
  {
    question: "Is there a minimum age to join?",
    answer: "Yes, members must be 17 years or older.",
  },
  {
    question: "Can I transfer my membership to someone else?",
    answer:
      "Yes. Memberships are transferable to a friend or family member for a small registration fee.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "Cash, card, and all major UPI apps — GooglePay, PhonePe, Paytm — plus net banking.",
  },
  {
    question: "Do you have lockers and a changing room?",
    answer:
      "Yes, at both branches — lockers for use during your workout, plus a changing room, washroom, and steam room.",
  },
];
