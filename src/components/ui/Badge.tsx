import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Badge — §6 Card Design / §Component-Architecture.md "Badge".
 *
 * Three variants:
 *  highlight       "Best Seller" — positive attention, yellow
 *  informational   "Ladies Only · 12-4PM" — must pair color with text, NEVER
 *                  rely on color alone (§Homepage-Architecture.md accessibility
 *                  note, §13 Accessibility)
 *  achievement     "Mr Nizamabad" competitive title — dark/ink with yellow text
 *
 * Radius is always 0 — badges are part of the "hard edges mean action /
 * signal" family alongside buttons (§15 Final Design Rules).
 */
export type BadgeVariant = "highlight" | "informational" | "achievement";

const variantStyles: Record<BadgeVariant, string> = {
  highlight: "bg-brand-yellow text-ink",
  informational: "bg-ink text-white",
  achievement: "bg-ink text-brand-yellow",
};

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  icon?: ReactNode;
  className?: string;
}

export function Badge({ children, variant = "highlight", icon, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-none px-3 py-1.5",
        "font-body text-caption font-semibold uppercase tracking-wide",
        variantStyles[variant],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
