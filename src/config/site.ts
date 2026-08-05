/**
 * Site-wide configuration — single source of truth for name, description,
 * URLs, and contact/branch data used across metadata, structured data, and
 * components (Footer, Sticky Mobile CTA, Location cards).
 *
 * Values are drawn directly from /docs/01-business-analysis.md and
 * /docs/05-information-architecture.md — nothing invented. Phone numbers,
 * addresses, and hours match the corrected (non-typo, reconciled) versions
 * flagged in the audit, not the current live site's inconsistent copies.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.infinitifitness.in";

export const siteConfig = {
  name: "Infiniti Fitness",
  tagline: "Advanced | Comfortable | Economical",
  description:
    "Infiniti Fitness is a Hyderabad gym with two locations (Gachibowli & Rethibowli) offering Crossfit, HIIT, Strength Training, Kickboxing, and more — real trainers, honest pricing, since 2016.",
  url: SITE_URL,
  // Points at a real, existing photo rather than a placeholder path — a
  // missing OG image silently breaks link previews on WhatsApp/Twitter/
  // Facebook, which matters given this audience shares gym links over
  // WhatsApp per 03-target-audience.md. Swap for a purpose-cropped 1200x630
  // image if one is ever produced; until then this is a real asset, not a 404.
  ogImage: `${SITE_URL}/images/hero/hero-training.jpg`,
  founder: "Omar Siddiqui",
  foundedYear: 2016,
  links: {
    whatsapp: "https://wa.me/919703573111",
  },
  contact: {
    email: "info@infinitifitness.in",
    phones: ["+91 97035 73111", "+91 97035 73579"],
  },
  branches: {
    gachibowli: {
      name: "Gachibowli",
      address:
        "City Pearl, Gachibowli Road, Vinayak Nagar, Indira Nagar, Near HDFC Bank, Gachibowli, Hyderabad, Telangana, 500032",
      hours: {
        days: "Monday to Saturday",
        unisex: "6:00 AM–11:00 AM & 5:00 PM–10:00 PM",
        ladiesOnly: null as string | null,
      },
    },
    rethibowli: {
      name: "Rethibowli",
      address: "Hyder Plaza, Pillar No. 53, Rethibowli, Hyderabad - 500028, Telangana, India",
      hours: {
        days: "Monday to Saturday",
        unisex: "6:00 AM–11:00 AM & 5:00 PM–10:00 PM",
        ladiesOnly: "12:00 PM–4:00 PM",
      },
    },
  },
} as const;

export type BranchKey = keyof typeof siteConfig.branches;
