import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { cn, CUSTOM_FONT_SIZES } from "./utils";

/**
 * Regression guard for a silent, mobile-only failure mode.
 *
 * tailwind-merge cannot read a Tailwind v4 CSS `@theme`, so every custom
 * `text-<token>` looks like a colour to it unless it is registered in the
 * `font-size` group. When it is not registered, `cn()` treats the size and the
 * colour as conflicting and drops whichever came first — which is always the
 * size, because components supply the size and call sites supply the colour.
 * The `lg:` half of each pair survives (a prefixed class never conflicts with an
 * unprefixed one), so the whole type scale collapses below 1024px while desktop
 * looks perfect. Nothing throws and nothing logs; the only symptom is that
 * headings and body copy render at the same inherited size on a phone.
 */
describe("cn — custom font-size tokens survive a colour on the same element", () => {
  it.each([...CUSTOM_FONT_SIZES])("keeps text-%s when a colour follows it", (size) => {
    expect(cn(`text-${size}`, "text-white")).toBe(`text-${size} text-white`);
  });

  it.each([
    ["Heading level=section", "font-display text-section lg:text-section-lg", "text-white"],
    [
      "Heading level=subsection",
      "font-body font-bold text-subsection lg:text-subsection-lg",
      "text-ink",
    ],
    ["Heading level=hero", "font-display text-hero lg:text-hero-lg", "text-white"],
    [
      "BodyText size=large",
      "font-body text-body sm:text-body-lg lg:text-body-lg-desktop",
      "text-white/85",
    ],
    ["BodyText size=standard", "font-body text-body", "text-text-secondary"],
    ["BodyText size=caption", "font-body text-caption lg:text-caption-lg", "text-white/70"],
    [
      "Eyebrow",
      "font-body text-eyebrow lg:text-eyebrow-lg font-semibold uppercase tracking-[0.12em]",
      "text-brand-yellow",
    ],
  ])("%s keeps its base size", (_name, componentClasses, callerColour) => {
    const [baseSize] = componentClasses.match(/(?<![:\w-])text-[a-z-]+/) ?? [];
    expect(baseSize).toBeDefined();
    expect(cn(componentClasses, callerColour).split(" ")).toContain(baseSize);
  });
});

describe("cn — normal conflict resolution is unaffected", () => {
  it("lets a later custom size override an earlier one", () => {
    expect(cn("text-body", "text-subsection")).toBe("text-subsection");
  });

  it("lets a built-in size override a custom one", () => {
    expect(cn("text-subsection", "text-2xl")).toBe("text-2xl");
  });

  it("still de-duplicates colours", () => {
    expect(cn("text-white", "text-ink")).toBe("text-ink");
  });

  it("still de-duplicates spacing", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });
});

describe("CUSTOM_FONT_SIZES stays in sync with the @theme block", () => {
  it("registers every --text-* token declared in globals.css", () => {
    const css = readFileSync(resolve(__dirname, "../app/globals.css"), "utf8");

    // `--text-hero: 2.25rem` is a size token; `--text-hero--line-height: 1.05`
    // is one of its companion properties, so anything containing `--` is
    // filtered back out after the greedy name match.
    const declared = new Set<string>();
    for (const match of css.matchAll(/--text-([a-z0-9-]+):/g)) {
      const name = match[1];
      if (name && !name.includes("--")) {
        declared.add(name);
      }
    }

    expect([...declared].sort()).toEqual([...CUSTOM_FONT_SIZES].sort());
  });
});
