import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // The app's tsconfig uses `jsx: "preserve"` for Next.js, so the test
  // transform has to opt into the automatic runtime itself.
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    passWithNoTests: true,
    css: false,
  },
});
