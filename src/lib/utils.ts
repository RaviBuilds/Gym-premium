import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class lists safely — clsx handles conditional/falsy values,
 * tailwind-merge resolves conflicting utilities (e.g. a component default of
 * "px-4" overridden by a caller's "px-6") so the last one wins instead of
 * both landing in the DOM. Every component in this system should compose
 * classes through this helper rather than raw string concatenation.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
