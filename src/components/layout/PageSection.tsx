import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "./Container";

export type SectionTone = "light" | "dark" | "transparent";
export type SectionSpacing = "standard" | "compact" | "hero";

const toneStyles: Record<SectionTone, string> = {
  light: "bg-surface-light text-text-primary",
  dark: "bg-ink text-text-primary-dark",
  transparent: "bg-transparent",
};

/**
 * Vertical padding scale — §2 Layout System ("Section vertical rhythm") and
 * §12 Mobile Experience ("compresses from the desktop 96px down to 56px").
 *  standard  py-14 lg:py-24   56px mobile / 96px desktop
 *  compact   py-10 lg:py-16   40px mobile / 64px desktop (Extras section)
 *  hero      handled entirely by the Hero component itself (§5) — PageSection
 *            renders it with spacing="hero" to opt out of the padding above.
 */
const spacingStyles: Record<SectionSpacing, string> = {
  standard: "py-14 lg:py-24",
  compact: "py-10 lg:py-16",
  hero: "",
};

export interface PageSectionProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Background/text tone for the whole section. */
  tone?: SectionTone;
  /** Vertical rhythm — see spacingStyles above. */
  spacing?: SectionSpacing;
  /**
   * "full" (default) lets the section's background span edge-to-edge while
   * its content is still constrained by an inner Container. "content" skips
   * the inner Container entirely for sections that manage their own width
   * (e.g. a section composing multiple Containers).
   */
  bleed?: "full" | "content";
  /** Optional id for in-page nav / anchor links. */
  id?: string;
  /** Passed straight to the inner Container's `width` prop. */
  containerWidth?: "content" | "full";
}

/**
 * The outer wrapper every homepage section sits inside — §2 Layout System,
 * §Component-Architecture.md "PageSection". Every section (Hero, Trust Strip,
 * Programs, Philosophy, Trainers, Testimonials, Locations, Extras, Final CTA)
 * should be built as a PageSection so vertical rhythm and max-width stay
 * consistent without each section reinventing its own padding.
 */
export function PageSection({
  children,
  className,
  as: Tag = "section",
  tone = "light",
  spacing = "standard",
  bleed = "full",
  id,
  containerWidth = "content",
}: PageSectionProps) {
  const content =
    bleed === "full" ? (
      <Container width={containerWidth}>{children}</Container>
    ) : (
      children
    );

  return (
    <Tag
      id={id}
      className={cn(toneStyles[tone], spacingStyles[spacing], className)}
    >
      {content}
    </Tag>
  );
}
