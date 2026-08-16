import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep Next's file tracing scoped to this app when another lockfile exists
  // in the parent workspace directory.
  outputFileTracingRoot: process.cwd(),
  images: {
    // AVIF first, WebP fallback — see Visual-Design-Specification.md §14 (Image optimization).
    formats: ["image/avif", "image/webp"],
    // Every `quality` value the app actually asks for, declared once. Next 15
    // warns on any unlisted value and Next 16 will reject it outright, so this
    // list is the allowlist rather than a hint: 55 for TrainerPlinth's backdrop
    // plate (greyscaled, dimmed and composited at 16% — detail a higher quality
    // would buy is destroyed downstream), 75 because it is Next's own default and
    // what the trainer cutouts and every other `next/image` here rely on.
    qualities: [55, 75],
  },
  eslint: {
    dirs: ["src"],
  },
};

export default nextConfig;
