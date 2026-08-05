import { siteConfig } from "@/config/site";

/**
 * JSON-LD structured data — helps search engines understand this is a real,
 * two-location local business (directly supporting the "is this legit"
 * trust question from Homepage-Experience-Blueprint.md's User Psychology
 * section, and improving local-search visibility, which matters given the
 * audience profile in 03-target-audience.md is local and search-driven).
 *
 * Rendered once in the root layout as a <script type="application/ld+json">.
 */
export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "HealthClub",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    foundingDate: String(siteConfig.foundedYear),
    founder: {
      "@type": "Person",
      name: siteConfig.founder,
    },
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phones[0],
    location: Object.values(siteConfig.branches).map((branch) => ({
      "@type": "Place",
      name: `${siteConfig.name} ${branch.name}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: branch.address,
        addressLocality: "Hyderabad",
        addressRegion: "Telangana",
        addressCountry: "IN",
      },
    })),
  };
}
