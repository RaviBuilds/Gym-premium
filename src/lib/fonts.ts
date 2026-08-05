import { Archivo_Black, Inter } from "next/font/google";

/**
 * Two-family type system — Visual-Design-Specification.md §3.
 *
 * Display / Headline face: heavy, condensed, geometric sans. Used ONLY for
 * headlines (Hero, section titles, Philosophy band's key line). Archivo Black
 * is the closest widely-available match to the spec's "Archivo Black or
 * equivalent weight/character" recommendation.
 *
 * Body / UI face: clean, highly legible grotesk with a full weight range.
 * Used for everything else — subheadings, body copy, buttons, captions, nav,
 * forms. Inter is named directly in the spec.
 *
 * Only the weights actually used are loaded (§14 Performance: "not every
 * available weight of each family"). Archivo Black ships one weight (900)
 * by design. Inter loads 400/500/600/700 to cover body/caption/button/bold-
 * emphasis needs without pulling the full family.
 */

export const fontDisplay = Archivo_Black({
  subsets: ["latin"],
  weight: "400", // Archivo Black's only cut; visually reads as the spec's "Black/900"
  variable: "--font-archivo-black",
  display: "swap",
});

export const fontBody = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

/** Combined className to spread onto <html> in the root layout. */
export const fontVariables = `${fontDisplay.variable} ${fontBody.variable}`;
