"use client";

import Link from "next/link";
import { Phone, MessageCircle, Dumbbell } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { Icon } from "@/components/ui/Icon";
import { useIsOverlayOpen } from "@/lib/overlay-lock";

/**
 * StickyMobileCTA — Homepage-Architecture.md "Sticky Mobile CTA Bar",
 * Component-Architecture.md §7 "StickyMobileCTA".
 *
 * Mobile-only (lg:hidden), fixed bottom bar with exactly three actions —
 * Call, WhatsApp, Book Free Trial — safe-area-aware for modern phones'
 * home-indicator gesture zones. Slides in once on mount rather than
 * appearing instantly, per §11 Micro Interactions ("slides up into view
 * ~250ms after the Hero has scrolled past"); simplified here to a mount-
 * triggered entrance since a scroll-position trigger would need the same
 * scroll-listener this system avoids elsewhere (Navbar) for a cosmetic-only
 * gain — the bar is only visible on mobile, where the Hero fills most of
 * the first viewport anyway, so the practical difference is negligible.
 *
 * Each action keeps a visible text label at all viewport widths the bar
 * supports (down to 360px) rather than icon-only, so no VisuallyHidden
 * label is needed per action — icons are aria-hidden, labels are real text.
 */
export function StickyMobileCTA() {
  const prefersReducedMotion = useReducedMotion();
  const phoneHref = `tel:${siteConfig.contact.phones[0]?.replace(/\s+/g, "")}`;

  /**
   * Slides back out while a modal is open. The trial intercept renders as a
   * bottom sheet on exactly the viewports this bar occupies, so leaving it up
   * would stack two "Free Trial" buttons a few pixels apart — and the bar would
   * sit above the sheet's own safe-area padding. Retreating is not just
   * de-duplication; it is what gives the sheet the bottom edge to land on.
   *
   * Animated rather than unmounted so it returns on dismissal without replaying
   * its entrance from scratch.
   */
  const isOverlayOpen = useIsOverlayOpen();

  return (
    <motion.div
      initial={prefersReducedMotion ? { y: 0 } : { y: "100%" }}
      animate={{ y: isOverlayOpen ? "100%" : 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: prefersReducedMotion || isOverlayOpen ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
      /* `inert`, not `aria-hidden`. The bar is translated off-screen rather than
         unmounted, so its three links are still in the tab order — and
         `aria-hidden` over focusable content is a genuine violation, not just an
         audit warning. `inert` removes both the focusability and the
         accessibility-tree entry in one attribute. The dialog's focus trap covers
         browsers that do not support it. */
      inert={isOverlayOpen}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-dark bg-ink lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-3 divide-x divide-border-dark">
        <a
          href={phoneHref}
          className="flex flex-col items-center gap-1 py-3 text-white transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          <Icon icon={Phone} size="lg" />
          <span className="font-body text-caption font-semibold">Call</span>
        </a>
        <a
          href={siteConfig.links.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 py-3 text-whatsapp transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          <Icon icon={MessageCircle} size="lg" />
          <span className="font-body text-caption font-semibold">WhatsApp</span>
        </a>
        <Link
          href="/#free-trial"
          className="flex flex-col items-center gap-1 bg-brand-yellow py-3 text-ink transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          <Icon icon={Dumbbell} size="lg" />
          <span className="font-body text-caption font-semibold">Free Trial</span>
        </Link>
      </div>
    </motion.div>
  );
}
