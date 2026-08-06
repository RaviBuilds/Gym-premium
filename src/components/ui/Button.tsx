"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Button — §9 Button System.
 *
 * Four variants map directly to the spec:
 *  primary    solid yellow / ink text, yellow-glow shadow, invert-on-hover
 *  secondary  2px outline, transparent bg, invert-on-hover
 *  ghost      no border/bg, underline-on-hover-only (low-emphasis text link)
 *  whatsapp   WhatsApp green — the one deliberate palette exception (§8)
 *
 * Radius is always 0 (rounded-none) — brand signature, never overridden
 * (§15 Final Design Rules: "hard edges mean action... never blurred").
 */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "whatsapp";
export type ButtonSize = "default" | "compact";

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-none font-body text-button " +
  "transition-colors duration-[180ms] ease-out disabled:pointer-events-none disabled:opacity-40 " +
  "min-h-11 min-w-11"; // 44x44px minimum touch target — §12 Mobile Experience

const sizeStyles: Record<ButtonSize, string> = {
  default: "px-8 py-4", // 32px horizontal / 16px vertical — §9
  compact: "px-5 py-3",
};

const variantStyles: Record<ButtonVariant, string> = {
  // Exit-easing asymmetry: hover-in at 300ms, hover-out at 400ms so the
  // button settles back slower than it rose — reads as having inertia
  // rather than snapping. Transform + shadow only (GPU-accelerated).
  primary:
    "transform-gpu bg-brand-yellow text-ink shadow-button transition-[background-color,color,box-shadow,transform] duration-400 ease-out hover:bg-white hover:text-brand-yellow hover:shadow-glow-yellow hover:-translate-y-1 hover:duration-300",
  secondary:
    "bg-transparent border-2 border-current text-current transition-[color,border-color,background-color] duration-400 ease-out hover:border-brand-yellow hover:text-brand-yellow hover:bg-white/5 hover:duration-300",
  ghost:
    "bg-transparent text-text-secondary p-0 min-h-0 transition-[color,background-size] duration-300 ease-out hover:text-text-primary hover:duration-200 bg-linear-to-r from-ink to-ink bg-[length:0%_1px] bg-left-bottom bg-no-repeat hover:bg-[length:100%_1px] focus-visible:bg-[length:100%_1px]",
  whatsapp: "bg-whatsapp text-white transition-colors duration-400 ease-out hover:bg-whatsapp/90 hover:duration-300",
};

interface SharedProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading icon (e.g. WhatsApp mark) — 20px per §8 Iconography default inline size. */
  icon?: ReactNode;
  isLoading?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Framer Motion's HTMLMotionProps redefines a handful of DOM event handlers
 * (onAnimationStart/End, onDrag*, onTransitionEnd) with its own signatures so
 * they can carry animation-definition data instead of a raw DOM event.
 * Omitting the native versions here avoids the resulting type conflict when
 * spreading standard HTML attributes onto a motion.button/motion.span.
 */
type MotionConflictingHandlers =
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onTransitionEnd";

export type ButtonProps = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | MotionConflictingHandlers> & {
    href?: undefined;
  };

export type ButtonLinkProps = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href" | MotionConflictingHandlers> & {
    href: string;
  };

/** Press-state scale feedback — §1 Motion Vocabulary: scale(0.97) on press
 *  at 180ms (motion.duration.fast) with easeOut, back to 1 on release.
 *  `as const` narrows the easing array to the tuple type Framer Motion's
 *  `Transition` expects (`[number, number, number, number]`), not `number[]`. */
const pressAnimation = {
  whileTap: { scale: 0.97 },
  transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] as const },
};

/**
 * Renders a real <button> when no `href` is given, or a Next.js <Link> when
 * one is — so callers never have to pick between "Button" and "ButtonLink"
 * components themselves. Both share identical visual treatment.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "default", icon, isLoading, children, className, disabled, ...props },
    ref
  ) {
    return (
      <motion.button
        ref={ref}
        className={cn(baseStyles, variant !== "ghost" && sizeStyles[size], variantStyles[variant], className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...pressAnimation}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          icon
        )}
        {children}
      </motion.button>
    );
  }
);

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  function ButtonLink({ variant = "primary", size = "default", icon, children, className, href, ...props }, ref) {
    const isExternal = href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:");

    const content = (
      <motion.span
        className={cn(
          baseStyles,
          variant !== "ghost" && sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...pressAnimation}
      >
        {icon}
        {children}
      </motion.span>
    );

    if (isExternal) {
      return (
        <a ref={ref} href={href} {...props}>
          {content}
        </a>
      );
    }

    return (
      <Link ref={ref} href={href} {...props}>
        {content}
      </Link>
    );
  }
);
