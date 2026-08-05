import type { Testimonial } from "@/types/content";

/**
 * Real, named member testimonials — Homepage-Architecture.md §6 Real Results.
 * Verbatim from the live site's Google-review-style testimonial carousel
 * (01-business-analysis.md audit). Two are promoted to featured pull-quote
 * treatment per Visual-Design-Specification.md §6 — Lalith's specific
 * weight-loss number and Samba's multi-year tenure are the two strongest,
 * most credible proof points on the whole site and shouldn't be flattened
 * into a uniform carousel card equal to the rest.
 */
export const testimonials: Testimonial[] = [
  {
    id: "lalith-prabhakar",
    reviewerName: "Lalith Prabhakar",
    quote:
      "10 kg and counting — that's the weight I've lost in 3 months. I was trained by the morning trainer, who took the time to build a diet plan based on my BMI.",
    featured: true,
    attributeTag: "-10kg in 3 months",
  },
  {
    id: "samba-sai-kumar",
    reviewerName: "Samba Sai Kumar",
    quote:
      "Gym equipment, cleanliness — all of it is awesome. Our morning and evening coaches are super trainers. I've been working out here for the past two years.",
    featured: true,
    attributeTag: "2-year member",
  },
  {
    id: "zubair-ali",
    reviewerName: "Zubair Ali",
    quote:
      "Professional and well-spoken staff. All the equipment is too good and well maintained. Plus, there's a separate floor for crossfit. Best place to workout.",
  },
  {
    id: "syed-zohaib",
    reviewerName: "Syed Zohaib",
    quote:
      "Amazing experience with the trainer. The gym is complete with a small café that has an appetising menu.",
  },
  {
    id: "srinjoy-kar",
    reviewerName: "Srinjoy Kar",
    quote:
      "Best place in Hyderabad to tone your body. Reasonable fee structure and good guidance from the trainer, with special diet plans provided.",
  },
  {
    id: "tarun-pande",
    reviewerName: "Tarun Pande",
    quote:
      "Best in its class — well spaced, with modern equipment. The owner and management are genuinely friendly.",
  },
  {
    id: "rupesh-deshmukh",
    reviewerName: "Rupesh Deshmukh",
    quote: "Clean, well run, and they maintained real precautionary measures against COVID.",
  },
];

export const featuredTestimonials = testimonials.filter((t) => t.featured);
export const secondaryTestimonials = testimonials.filter((t) => !t.featured);
