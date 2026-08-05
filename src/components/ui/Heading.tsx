import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Heading — §3 Typography System.
 *
 * The single component responsible for every headline on the site, so the
 * two-font system stays enforced everywhere rather than pages picking their
 * own display size ad hoc (the exact problem the current site has today —
 * five-plus competing fonts, per Visual-Design-Specification.md §3).
 */
export type HeadingLevel = "hero" | "section" | "subsection";

const levelStyles: Record<HeadingLevel, string> = {
  hero: "font-display text-hero lg:text-hero-lg",
  section: "font-display text-section lg:text-section-lg",
  subsection: "font-body font-bold text-subsection lg:text-subsection-lg",
};

export interface HeadingProps {
  children: ReactNode;
  level: HeadingLevel;
  /** Semantic HTML tag — kept independent from visual `level` so hierarchy
   *  (h1/h2/h3) can stay correct for screen readers even when a `subsection`
   *  style is needed under an `h2`, etc. (§13 Accessibility). */
  as: ElementType;
  className?: string;
  id?: string;
}

export function Heading({ children, level, as: Tag, className, id }: HeadingProps) {
  return (
    <Tag id={id} className={cn(levelStyles[level], className)}>
      {children}
    </Tag>
  );
}

/**
 * Eyebrow — small uppercase label above a Heading (§3, §Component-Architecture.md).
 *
 * `tone` controls color, not just for theming — it's an accessibility fix.
 * Brand-yellow text on the `surface-light` background measures ~1.16:1
 * contrast (WCAG AA requires 4.5:1 for normal-size text), so Eyebrow must
 * never render yellow-on-light. "dark" (default) keeps the original
 * yellow-on-ink treatment, which has 12:1+ contrast and is correct wherever
 * Eyebrow sits on a dark PageSection (Footer, Trust Strip, Philosophy).
 * "light" swaps to ink text for sections on the light surface — caught
 * while wiring up the Programs/Facilities/Trainers/Locations/FAQ sections,
 * all of which are light-toned and use the Eyebrow-via-SectionHeader
 * pattern. Pass the same tone you gave the parent PageSection.
 */
export function Eyebrow({
  children,
  className,
  tone = "dark",
}: {
  children: ReactNode;
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <p
      className={cn(
        "font-body text-eyebrow lg:text-eyebrow-lg font-semibold uppercase tracking-[0.12em]",
        tone === "dark" ? "text-brand-yellow" : "text-ink",
        className
      )}
    >
      {children}
    </p>
  );
}

/** BodyText — standard paragraph component (§3, §Component-Architecture.md). */
export function BodyText({
  children,
  size = "standard",
  className,
  as: Tag = "p",
}: {
  children: ReactNode;
  size?: "standard" | "large" | "caption";
  className?: string;
  as?: ElementType;
}) {
  const sizeStyles = {
    large: "text-body-lg lg:text-body-lg-desktop",
    standard: "text-body",
    caption: "text-caption lg:text-caption-lg",
  } as const;

  return <Tag className={cn("font-body", sizeStyles[size], className)}>{children}</Tag>;
}

/**
 * SectionHeader — composite Eyebrow + Heading + optional BodyText, per
 * Component-Architecture.md §2 ("this three-part pattern... repeats at the
 * top of nearly every homepage section").
 */
export function SectionHeader({
  eyebrow,
  heading,
  headingAs = "h2",
  body,
  align = "left",
  tone = "light",
  className,
}: {
  eyebrow?: string;
  heading: ReactNode;
  headingAs?: ElementType;
  body?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "text-center items-center" : "text-left sm:text-center lg:text-left lg:items-start",
        className
      )}
    >
      {eyebrow && <Eyebrow tone={tone}>{eyebrow}</Eyebrow>}
      <Heading level="section" as={headingAs} className={tone === "dark" ? "text-white" : "text-ink"}>
        {heading}
      </Heading>
      {body && (
        <BodyText size="large" className={tone === "dark" ? "text-text-secondary-dark" : "text-text-secondary"}>
          {body}
        </BodyText>
      )}
    </div>
  );
}
