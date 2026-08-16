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
  // A purpose-cropped 1200x630 JPEG — the exact dimensions Open Graph and
  // Twitter both want, so no platform re-crops it unpredictably.
  //
  // This previously pointed at `/images/hero/hero-training.jpg`, with a comment
  // claiming it was "a real asset, not a 404". It was a 404: no such file has
  // ever existed in `public/images/hero/`, which holds `hero-gym-wide.webp`,
  // `hero-strength-closeup.webp` and seven other `.webp` files — and no `.jpg`
  // at all. So every WhatsApp, Twitter and Facebook share of this site rendered
  // a blank preview card, which is the one thing the original comment was
  // written to prevent, and it matters most for exactly the audience
  // 03-target-audience.md describes: people who pass gym links around on
  // WhatsApp.
  //
  // Generated from the hero's own wide gym shot, so the preview matches the
  // first thing a visitor sees on arrival:
  //   ffmpeg -y -i public/images/hero/hero-gym-wide.webp \
  //     -vf "scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630" \
  //     -q:v 3 public/og-default.jpg
  //
  // JPEG rather than WebP deliberately: WebP OG images are still unreliable
  // across scrapers, and a preview image is the one place to pick the format
  // with the widest support rather than the smallest bytes.
  ogImage: `${SITE_URL}/og-default.jpg`,
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
