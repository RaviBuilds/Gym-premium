import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { defaultMetadata } from "@/lib/metadata";
import { buildOrganizationSchema } from "@/lib/structured-data";
import { SkipLink } from "@/components/a11y";
import { Navbar, Footer, StickyMobileCTA, FloatingContactDock } from "@/components/layout";
import { ScrollProgressBar } from "@/components/motion";
import { MotionCameraProvider } from "@/lib/motion";
import "./globals.css";

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#14181D",
};

/**
 * Root layout — configures fonts (next/font, §3 Typography System),
 * sitewide metadata (§14/§SEO defaults), and the Organization structured
 * data block (this is public marketing metadata only, no PII).
 *
 * Navbar/Footer/StickyMobileCTA render here so every route gets consistent
 * global chrome without each page re-assembling it — per
 * Homepage-Architecture.md, these are persistent/global elements, not
 * scroll-triggered homepage sections. StickyMobileCTA renders alongside
 * Footer (not inside it) since it's fixed-position and independent of
 * scroll depth.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  const organizationSchema = buildOrganizationSchema();

  return (
    <html lang="en" className={fontVariables}>
      {/*
        pb-[...] reserves space for StickyMobileCTA (fixed bottom-0, mobile-only).
        Without it, the fixed bar covers the last ~76px of page content on every
        mobile viewport — specifically the Footer's copyright line. 76px covers
        the bar's icon+label+padding; safe-area-inset-bottom is added on top
        since the bar itself pads for it (env() stacks correctly here since both
        add the same inset once). Removed entirely at lg: since the bar itself
        is lg:hidden.
      */}
      <body className="overflow-x-hidden antialiased pb-[calc(76px+env(safe-area-inset-bottom))] lg:pb-0">
        {/* Static, build-time-known JSON-LD — no user input reaches this. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/*
          MotionCameraProvider wraps all chrome and page content so every
          section shares one scroll source, one velocity signal and one
          intensity multiplier. It renders no DOM of its own and nothing inside
          it re-renders on scroll — scroll position and velocity are
          MotionValues, so `children` here stay server-rendered exactly as
          before. Placed above Navbar/Footer, not just <main>, so persistent
          chrome can join the same camera later without another provider.
        */}
        <MotionCameraProvider>
          <SkipLink />
          <ScrollProgressBar />
          <Navbar />
          <main id="main-content">{children}</main>
          <Footer />
          {/*
            The two conversion docks split the viewport between them and are
            never both visible: StickyMobileCTA is `lg:hidden`, the floating
            dock is `hidden lg:flex`. Both carry the same three actions (Call,
            WhatsApp, Free Trial), so overlapping them would duplicate every
            CTA in the same corner. See FloatingContactDock's doc comment.
          */}
          <StickyMobileCTA />
          <FloatingContactDock />
        </MotionCameraProvider>
      </body>
    </html>
  );
}
