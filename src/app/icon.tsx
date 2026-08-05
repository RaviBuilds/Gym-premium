import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Programmatic favicon — Design-System.md flags that no proper square
 * vector mark exists yet in the current asset library (the real logo file
 * is a 741×222 wide lockup; the live site's own favicon reuses that same
 * wide asset squished into square/round icon slots, a visible bug the
 * original audit called out explicitly). Rather than repeat that mistake,
 * or risk mis-cropping the real logo into an arbitrary square without a
 * reliable way to verify the crop looks right, this generates a clean,
 * on-brand monogram at build time from the same design tokens as
 * everything else (Ink background, Primary Yellow mark, Archivo-Black-
 * style weight) — a legitimate stand-in until a real vector square mark is
 * commissioned, per that doc's recommendation. See also apple-icon.tsx for
 * the larger touch-icon variant.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#14181D",
          color: "#FFDE01",
          fontSize: 18,
          fontWeight: 900,
          fontFamily: "sans-serif",
          letterSpacing: "-0.02em",
        }}
      >
        IF
      </div>
    ),
    { ...size }
  );
}
