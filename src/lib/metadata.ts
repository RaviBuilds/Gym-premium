import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

/**
 * SEO defaults — shared metadata builder so every route produces consistent
 * title templates, Open Graph, and Twitter card data instead of each page
 * hand-rolling its own metadata object. Route-level pages pass just the bits
 * that differ (title, description, path) and inherit everything else.
 */
export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "",
  image = siteConfig.ogImage,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
}): Metadata {
  const url = `${siteConfig.url}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      images: [{ url: image, width: 1200, height: 630, alt: siteConfig.name }],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "gym in Hyderabad",
    "Gachibowli gym",
    "Rethibowli gym",
    "Crossfit Hyderabad",
    "personal trainer Hyderabad",
    "affordable gym membership Hyderabad",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  ...buildMetadata({ title: `${siteConfig.name} — ${siteConfig.tagline}` }),
};
