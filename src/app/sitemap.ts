import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { primaryNav } from "@/config/nav";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", ...primaryNav.map((item) => item.href)];

  return routes.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
}
