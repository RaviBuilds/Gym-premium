import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps {
  children: ReactNode;
  className?: string;
  /**
   * Render element — defaults to a plain div. Pass "section"/"header"/etc.
   * when the container itself should carry the semantic tag (rare; usually
   * PageSection owns that and Container just constrains width inside it).
   */
  as?: ElementType;
  /**
   * "content" (default) caps at the 1280px max content width from
   * Visual-Design-Specification.md §2. "full" removes the cap — used for
   * a full-bleed child inside a full-bleed PageSection that still needs an
   * inner content-width column for text (e.g. Hero copy over an edge-to-
   * edge photo).
   */
  width?: "content" | "full";
}

/**
 * Horizontal width + side-padding primitive — §2 Layout System.
 *
 * Container width max-w-content px-4 sm:px-6 lg:px-12 wide:px-20
 *  <640px       16px   §2 "16px on mobile"
 *  640–1023px   24px   §2 "24px on tablet"
 *  1024–1439px  48px   §2 "48px on standard desktop"
 *  ≥1440px      80px   §2 "80px on large desktop"
 */
export function Container({
  children,
  className,
  as: Tag = "div",
  width = "content",
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-12 wide:px-20",
        width === "content" && "max-w-content",
        className
      )}
    >
      {children}
    </Tag>
  );
}
