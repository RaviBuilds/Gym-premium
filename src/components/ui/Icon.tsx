import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Icon — §8 Iconography.
 *
 * Wraps lucide-react (line icons, consistent stroke, rounded joins — matches
 * the spec's "line icons, not filled/solid" requirement out of the box) so
 * every icon in the system passes through one component with one enforced
 * size scale, rather than call sites hardcoding arbitrary px values.
 *
 * Size scale (§8):
 *  sm      16px   inline with small text (inside a Badge)
 *  default 20px   default inline use — nav items, form fields
 *  lg      24px   standalone decorative marks (Trust Strip, etc.)
 *  xl      32px   Sticky Mobile CTA icon-action buttons
 *
 * Stroke width scales inversely with size so visual weight stays constant
 * (§8: "1.5px at 16px... 2.5px at 32px") rather than lucide's flat default.
 */
export type IconSize = "sm" | "default" | "lg" | "xl";

const sizeMap: Record<IconSize, { px: number; className: string; strokeWidth: number }> = {
  sm: { px: 16, className: "size-4", strokeWidth: 1.5 },
  default: { px: 20, className: "size-5", strokeWidth: 2 },
  lg: { px: 24, className: "size-6", strokeWidth: 2 },
  xl: { px: 32, className: "size-8", strokeWidth: 2.5 },
};

export interface IconProps {
  icon: LucideIcon;
  size?: IconSize;
  className?: string;
  /**
   * Icons inherit their context's text color by default (§8: "icons should
   * almost never introduce a new color into a section"). Only pass a color
   * className for the one deliberate exception — the WhatsApp mark.
   */
  "aria-hidden"?: boolean;
}

export function Icon({ icon: LucideIconComponent, size = "default", className, ...props }: IconProps) {
  const { className: sizeClass, strokeWidth } = sizeMap[size];

  return (
    <LucideIconComponent
      className={cn(sizeClass, "shrink-0", className)}
      strokeWidth={strokeWidth}
      aria-hidden={props["aria-hidden"] ?? true}
    />
  );
}
