import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Larger touch-icon variant of icon.tsx — see that file's doc comment for why this is generated rather than cropped from the real logo asset. */
export default function AppleIcon() {
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
          fontSize: 96,
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
