"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { acquireOverlayLock } from "@/lib/overlay-lock";
import { useIsBelowDesktop } from "@/lib/use-viewport";
import { MOTION_EASING } from "@/lib/motion-presets";
import { cn } from "@/lib/utils";

/**
 * Dialog — the site's modal primitive: portal, backdrop, focus containment,
 * scroll lock, and a responsive shape that is a centred panel on desktop and a
 * bottom sheet on a phone.
 *
 * ## Why this exists as a primitive rather than inside its one caller
 *
 * A modal is the one UI pattern where "roughly right" is broken. Six behaviours
 * have to be correct simultaneously or the thing is a keyboard trap, a scroll
 * trap, or invisible to a screen reader — and every one of them is easy to omit
 * and impossible to notice with a mouse. Writing them once here means the second
 * modal this site grows inherits all six instead of re-deriving four of them:
 *
 * 1. Focus moves in on open and returns to its origin on close.
 * 2. Tab and Shift+Tab cycle **within** the panel.
 * 3. Escape closes.
 * 4. The backdrop closes on click.
 * 5. Page scroll freezes underneath (via {@link acquireOverlayLock}).
 * 6. `role="dialog"` + `aria-modal` + a real accessible name.
 *
 * ## Two shapes, one component
 *
 * Below `lg:` this is a bottom sheet; at `lg:` and up it is a centred panel. The
 * split is not cosmetic. On a phone the bottom edge is the reachable edge, and
 * a sheet that covers roughly a third of the viewport stays clear of
 * [Google's intrusive-interstitial
 * guidance](https://developers.google.com/search/docs/appearance/page-experience)
 * in a way that a full-screen takeover does not. The site already treats that
 * edge as the action zone: `StickyMobileCTA` lives there, which is also why
 * `acquireOverlayLock` withdraws it while a dialog is open.
 *
 * Geometry is CSS (a flex positioner, `items-end lg:items-center`) and only the
 * *animation distance* reads the breakpoint in JS, because a sheet has to travel
 * its own height's worth of the way up to read as a sheet, while a centred panel
 * should barely move. Positioning with Tailwind's `-translate-y-1/2` was the
 * alternative and is a trap: framer-motion writes `transform` inline, so the
 * utility and the animation would fight over the same property.
 *
 * ## What the caller owns
 *
 * The panel's surface — background, padding, border, content. This component
 * deliberately paints no chrome beyond the backdrop, so a dialog is not forced
 * into one visual treatment. It does set `rounded-none` by default, which is the
 * brand's hard-edge rule (§15) rather than a defensive default.
 */

export type DialogCloseReason = "escape" | "backdrop" | "close-button" | "action";

export interface DialogProps {
  open: boolean;
  /**
   * Reason-carrying, because the caller almost always needs to distinguish
   * "walked away" from "took the action" — a campaign that records a dismissal
   * when someone actually clicked WhatsApp has corrupted its own funnel data.
   */
  onClose: (reason: DialogCloseReason) => void;
  /** `id` of the element naming the dialog — usually its heading. Required. */
  labelledBy: string;
  /** `id` of the element describing it — usually the supporting paragraph. */
  describedBy?: string;
  children: ReactNode;
  /** Classes for the panel surface. */
  className?: string;
}

/**
 * What counts as focusable for the trap. Intentionally not exhaustive of every
 * exotic case (`contenteditable`, `audio[controls]`) — it covers what this
 * design system actually renders inside a dialog, and a list that lies about
 * being complete is worse than one that states its scope.
 */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function Dialog({
  open,
  onClose,
  labelledBy,
  describedBy,
  children,
  className,
}: DialogProps) {
  const prefersReducedMotion = useReducedMotion();
  const isBelowDesktop = useIsBelowDesktop();

  const panelRef = useRef<HTMLDivElement>(null);
  /** Where focus came from, so it can be handed back on close. */
  const originRef = useRef<HTMLElement | null>(null);

  /**
   * Portals need a target that only exists on the client. Resolving it in an
   * effect rather than guarding on `typeof document` keeps the server render and
   * the first client render identical — the dialog contributes no DOM to either,
   * which is correct given `open` can never be true on a first paint.
   */
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => setPortalTarget(document.body), []);

  /** Scroll freeze + dock withdrawal, released automatically on close. */
  useEffect(() => {
    if (!open) {
      return;
    }

    return acquireOverlayLock();
  }, [open]);

  /**
   * Focus in, then focus back.
   *
   * Focus lands on the **panel itself** (`tabIndex={-1}`), not on the first
   * button. A screen reader then announces the dialog's name and description
   * before its actions, which is the difference between "Meet your coach this
   * week, one free session at either location" and a bare "Book Free Trial,
   * button" with no context. Tab moves into the actions from there.
   *
   * `preventScroll: true` on the way back matters more than it looks: the origin
   * element for a scroll-triggered dialog is usually `<body>` or something far up
   * the page, and restoring focus without it would yank the visitor back to
   * wherever they were when it opened — undoing any scroll the dialog's own
   * action just performed.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    originRef.current = document.activeElement as HTMLElement | null;

    // One frame late, so the panel exists in the DOM by the time we focus it.
    const frame = requestAnimationFrame(() => {
      panelRef.current?.focus({ preventScroll: true });
    });

    return () => {
      cancelAnimationFrame(frame);

      const origin = originRef.current;

      if (origin !== null && document.contains(origin)) {
        origin.focus({ preventScroll: true });
      }

      originRef.current = null;
    };
  }, [open]);

  /**
   * Escape closes; Tab cycles inside the panel.
   *
   * Bound to `document` in the capture phase so it wins regardless of where
   * focus actually is — including the case where focus has escaped the panel
   * entirely (a browser find bar, an autofill dropdown), which is exactly when a
   * trap that only listens on the panel stops working.
   */
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose("escape");
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const panel = panelRef.current;

      if (panel === null) {
        return;
      }

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((node) => node.offsetParent !== null || node === document.activeElement);

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      // Nothing focusable inside: keep focus on the panel rather than letting
      // Tab walk out into a page the visitor cannot see.
      if (first === undefined || last === undefined) {
        event.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }

      const active = document.activeElement;

      if (!panel.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    document.addEventListener("keydown", onKeyDown, true);

    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, onKeyDown]);

  if (portalTarget === null) {
    return null;
  }

  /**
   * A sheet travels far enough to read as arriving from the bottom edge; a
   * centred panel lifts 16px and settles. Reduced motion gets neither — a
   * cross-fade at zero duration, which is the honest reading of the preference
   * for an element that appears unbidden.
   */
  const hidden = prefersReducedMotion
    ? { opacity: 0 }
    : isBelowDesktop
      ? { opacity: 0, y: 64 }
      : { opacity: 0, y: 16, scale: 0.97 };

  const visible = prefersReducedMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0, scale: 1 };

  return createPortal(
    <AnimatePresence>
      {open && (
        /**
         * The positioner. `z-[70]` sits above `Navbar` (`z-50`) and both
         * conversion docks (`z-40`) — a modal that the sticky navbar punches
         * through is the most common z-stack failure in this pattern, and the
         * docks are hidden anyway via the overlay lock.
         */
        <div className="fixed inset-0 z-[70] flex items-end justify-center lg:items-center lg:p-6">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: MOTION_EASING }}
            onClick={() => onClose("backdrop")}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            aria-describedby={describedBy}
            tabIndex={-1}
            className={cn(
              "relative w-full rounded-none outline-none lg:max-w-lg",
              className
            )}
            initial={hidden}
            animate={visible}
            exit={hidden}
            transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: MOTION_EASING }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    portalTarget
  );
}
