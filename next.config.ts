import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // AVIF first, WebP fallback — see Visual-Design-Specification.md §14 (Image optimization).
    formats: ["image/avif", "image/webp"],
  },
  eslint: {
    dirs: ["src"],
  },
};

export default nextConfig;
