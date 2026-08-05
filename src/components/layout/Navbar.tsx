"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { primaryNav } from "@/config/nav";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Container } from "./Container";

/**
 * Navbar — Homepage-Architecture.md "Navbar" (persistent/global element).
 *
 * Transparent-over-hero, solid-on-scroll is achieved with a plain CSS
 * backdrop-blur + background-color pinned to the top of the viewport at all
 * times — not a scroll-listener-driven opacity swap. This is deliberately
 * cheaper than tracking scroll position in JS (Design-System.md §10/§14:
 * avoid scroll-linked JS recalculation where CSS will do), and reads fine
 * over both the dark Hero and the light sections beneath it because the
 * bar's own background is always the translucent ink tone, never fully
 * transparent — so nav text contrast never depends on what's scrolled
 * behind it.
 *
 * No CTA button in the mobile bar (§Component-Architecture.md Navbar note):
 * "coordinating with StickyMobileCTA to avoid redundant competing CTAs" —
 * on mobile, the Sticky CTA bar owns the Book Free Trial action.
 */
export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <header className="sticky top-0 z-50 border-b border-border-dark bg-ink/95 backdrop-blur-sm">
      <Container>
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="shrink-0" aria-label="Infiniti Fitness home">
            <Image
              src="/images/brand/logo.png"
              alt="Infiniti Fitness"
              width={741}
              height={222}
              className="h-10 w-auto"
              priority
            />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group relative font-body text-body font-medium text-white"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-brand-yellow transition-all duration-200 ease-out group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden lg:block">
            <ButtonLink href="/#free-trial" variant="primary" size="compact">
              Book Free Trial
            </ButtonLink>
          </div>

          <button
            type="button"
            className="flex size-11 items-center justify-center text-white lg:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-panel"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <Icon icon={isMenuOpen ? X : Menu} size="lg" />
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-nav-panel"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border-dark bg-ink lg:hidden"
          >
            <Container>
              <nav aria-label="Primary" className="flex flex-col py-4">
                {primaryNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="border-b border-border-dark py-4 font-body text-body-lg font-medium text-white last:border-b-0"
                  >
                    {item.label}
                  </Link>
                ))}
                <ButtonLink href="/#free-trial" variant="primary" className="mt-4 justify-center">
                  Book Free Trial
                </ButtonLink>
              </nav>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
