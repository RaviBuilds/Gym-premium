import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * The sitemap lists **real routes only**, which today means exactly one: `/`.
 *
 * ## Why this no longer derives from `primaryNav`
 *
 * It used to be `["", ...primaryNav.map((item) => item.href)]`, which was correct
 * while those items were paths. They are now same-page anchors (`/#programs`,
 * `/#pricing`, …) because the routes they named were never built — see
 * `src/config/nav.ts`. Mapping them into a sitemap would emit six URLs that are
 * all the homepage wearing different fragments.
 *
 * That is not merely redundant, it is invalid. Crawlers discard the fragment when
 * canonicalising a URL, so `https://…/#programs` and `https://…/` are the same
 * document — a sitemap declaring six of them is asking Google to index one page
 * six times, which is a duplicate-content signal rather than a coverage win. The
 * old version also listed six URLs that returned 404s, which is worse.
 *
 * ## Adding routes later
 *
 * When `/programs`, `/pricing` and the rest exist as real pages, list them here.
 * Deliberately not re-derived from `primaryNav`: the two lists answer different
 * questions. Navigation is an editorial choice about what deserves a top-level
 * link, and a sitemap is a factual claim about what URLs resolve. Coupling them
 * is what produced a sitemap full of 404s in the first place — a route can exist
 * without being in the nav, and now a nav item can exist without being a route.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
