"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, Phone, Dumbbell, X, Headset } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { siteConfig } from "@/config/site";
import { Icon } from "@/components/ui/Icon";
import { useElementInView } from "@/lib/hooks";
import { useIsOverlayOpen } from "@/lib/overlay-lock";
import { HEX_CLIP } from "@/lib/shapes";
import { cn } from "@/lib/utils";

/**
 * FloatingContactDock — the persistent bottom-right conversion dock: one
 * hexagon trigger that unfurls into WhatsApp, Call and Book Free Trial.
 *
 * ## Desktop only, and why that is not a limitation
 *
 * `hidden lg:flex`. Below `lg:` the site already ships `StickyMobileCTA` — a
 * full-width fixed bottom bar carrying *these exact three actions*, thumb-reachable
 * rather than stranded in a corner, with `layout.tsx` already reserving
 * `padding-bottom` so it never covers the footer's copyright line.
 *
 * Rendering this dock on mobile as well would put Call, WhatsApp and Free Trial on
 * screen twice, in two different shapes, physically overlapping in the same corner.
 * So the two components split the viewport between them: the bar owns everything
 * below 1024px, this dock owns everything above it, and neither is ever visible at
 * the same time as the other. That division is the same one `Navbar` already
 * documents ("coordinating with StickyMobileCTA to avoid redundant competing
 * CTAs") — this file is the third participant in that agreement, not a new rule.
 *
 * ## Where it sits in the z-stack
 *
 * `z-40`, deliberately equal to `StickyMobileCTA` and deliberately below
 * `Navbar`'s `z-50`. The dock is bottom-anchored and the navbar is top-anchored so
 * they cannot overlap geometrically, but keeping the dock underneath means that if
 * the page ever grows a full-screen overlay or drawer off the navbar, the dock goes
 * behind it rather than punching through — which is the failure mode the hero's
 * `SceneNavigator` currently demonstrates at `z-[60]`.
 *
 * ## Two behaviours worth knowing before changing anything
 *
 * 1. **It does not appear until the hero is behind you** ({@link REVEAL_AFTER_PX}).
 *    The hero already presents two large CTAs; a third floating one competing with
 *    them in the first viewport reads as a plugin, not as design.
 * 2. **It hides itself once the trial form is on screen** (`useElementInView`
 *    against {@link TRIAL_FORM_ID}). The dock exists to get a visitor to
 *    `#free-trial`; once they are looking at the form, it is noise, and it would
 *    otherwise sit directly on top of the footer's own back-to-top button in the
 *    same corner.
 * 3. **It withdraws while a modal is open** (`useIsOverlayOpen`). The trial
 *    intercept modal offers these same three actions, so leaving the dock up
 *    would put Call, WhatsApp and Free Trial on screen twice — the exact
 *    duplication the desktop/mobile split above exists to prevent.
 *
 * ## Hexagons, not circles
 *
 * {@link HEX_CLIP} is the site's one non-rectangular shape — the hero's scene
 * thumbnails, the roster index chips, the discipline pips and the Locations CTA
 * tile are all forged from it. A stack of circles in the corner is what every
 * third-party chat widget looks like; the hexagon is what makes this read as part
 * of the same system as everything above it. This is the highest-leverage detail in
 * the file and the one most likely to be "simplified" by accident.
 */

/**
 * How far the visitor scrolls before the dock arrives, in pixels.
 *
 * 640 is just past a laptop hero, so the dock lands as the Trust Strip and
 * Programs come up — the first moment the page is asking a question the dock
 * answers. A `vh`-relative value was the alternative and is worse: it would fire
 * at wildly different content positions between a 720px laptop and a 1440px
 * display, and the hero is a fixed composition rather than a `100vh` block.
 */
const REVEAL_AFTER_PX = 640;

/**
 * The anchor the dock hides itself against — the `TrialBookingForm` block in the
 * footer, which is the same `id` every CTA on the page already targets.
 *
 * Matched by `id` rather than by a ref, because the form lives in `Footer`, several
 * levels away in a different subtree, and threading a ref up through `layout.tsx`
 * to a fixed-position sibling would couple two components that currently share
 * nothing but a URL fragment. `useElementInView` owns that observer now, since
 * the trial intercept modal suppresses itself against the same element for the
 * same reason and the two must not drift apart on what "visible" means.
 */
const TRIAL_FORM_ID = "free-trial";

/**
 * How far the form must be into the viewport to count. `-20%` from the bottom
 * edge means it has to be genuinely on screen, not peeking into the last few
 * pixels. Shared verbatim with `TrialInterceptModal`.
 */
const TRIAL_FORM_ROOT_MARGIN = "0px 0px -20% 0px";

/**
 * The dock's actions, in DOM order — which is also bottom-to-top visual order,
 * since the stack is `flex-col-reverse`.
 *
 * Ordered by commitment, closest to the thumb first: WhatsApp is the lowest-effort
 * way to start a conversation, a phone call is a bigger ask, and the trial form is
 * the real conversion. A visitor scanning up the stack reads a ladder of intent.
 *
 * `external` drives `target="_blank"` + `rel="noopener noreferrer"`, and is set
 * only on WhatsApp — `tel:` and same-page anchors must never open a tab.
 *
 * The phone number is `phones[0]`, matching `StickyMobileCTA` exactly so the site
 * has one "call us" number rather than two that differ by component.
 * `siteConfig.contact.phones` holds a second line; if the gym wants both surfaced,
 * this action becomes a branch picker rather than gaining a sibling, because two
 * adjacent unlabelled call buttons are a coin toss for the visitor.
 */
interface DockAction {
  key: string;
  label: string;
  href: string;
  icon: typeof MessageCircle;
  external?: boolean;
  /** Tailwind classes for the hexagon face. */
  faceClass: string;
  /** Whether this action carries the resting attention pulse. */
  pulse?: boolean;
}

const DOCK_ACTIONS: readonly DockAction[] = [
  {
    key: "whatsapp",
    label: "Chat on WhatsApp",
    href: siteConfig.links.whatsapp,
    icon: MessageCircle,
    external: true,
    // `text-ink`, not `text-white`: white-on-`#25D366` measures ≈1.98:1,
    // which fails WCAG AA's 4.5:1 floor outright. See the matching fix and
    // measurement note on Button's `whatsapp` variant.
    faceClass: "bg-whatsapp text-ink",
    pulse: true,
  },
  {
    key: "call",
    label: "Call us",
    href: `tel:${siteConfig.contact.phones[0]?.replace(/\s+/g, "")}`,
    icon: Phone,
    faceClass: "bg-white text-ink",
  },
  {
    key: "trial",
    label: "Book Free Trial",
    href: "/#free-trial",
    icon: Dumbbell,
    faceClass: "bg-brand-yellow text-ink",
  },
] as const;

/**
 * The hexagon face — one geometry for the trigger and all three actions.
 *
 * `size-14` (56px) clears the 44px touch-target floor with margin, which a
 * hexagon needs more than a square does: the clip removes the corners, so the
 * *hittable* area is roughly 75% of the box and a 44px hexagon would present about
 * 38px of real target. Sizing up is cheaper than fighting the geometry.
 */
const HEX_FACE_CLASSES =
  "relative grid size-14 place-items-center transition-transform duration-300 ease-out motion-safe:group-hover/action:scale-105 motion-safe:active:scale-95";

/** The label pill that slides in to the left of each action. */
const LABEL_CLASSES =
  "pointer-events-none whitespace-nowrap rounded-sm border border-white/10 bg-ink/95 px-3 py-2 font-body text-caption font-semibold uppercase tracking-[0.12em] text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm";

/**
 * The focus ring, borrowed verbatim from `RosterCard`, `TrainerDossier`,
 * `StripNavigator` and `RosterFooter` so the dock introduces no second focus
 * treatment. It sits on the outer element rather than the clipped face, because a
 * `clip-path` cuts an `outline` off along with the corners.
 */
const FOCUS_RING_CLASSES =
  "rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-yellow";

export function FloatingContactDock() {
  const prefersReducedMotion = useReducedMotion();
  const panelId = useId();

  const [isRevealed, setIsRevealed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  /** See {@link TRIAL_FORM_ID} — behaviour 2 in this file's header. */
  const isFormInView = useElementInView(TRIAL_FORM_ID, {
    rootMargin: TRIAL_FORM_ROOT_MARGIN,
  });

  /** See behaviour 3 — a modal is open, so this dock's actions are duplicated. */
  const isOverlayOpen = useIsOverlayOpen();

  /**
   * Reveal on scroll depth.
   *
   * A plain `scroll` listener rather than the site's camera system or framer's
   * `useScroll`, for two reasons. This needs a single boolean threshold crossing,
   * not a continuous `MotionValue`, and the dock is fixed to the viewport rather
   * than parallaxing against content — so subscribing to the shared camera would
   * add a reader to a system built for scroll-linked *transforms* and get nothing
   * back. `passive: true` keeps it off the main thread's critical path, and the
   * state only ever flips twice.
   */
  useEffect(() => {
    const evaluate = () => setIsRevealed(window.scrollY > REVEAL_AFTER_PX);

    evaluate();
    window.addEventListener("scroll", evaluate, { passive: true });

    return () => window.removeEventListener("scroll", evaluate);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  /**
   * Escape closes the stack and returns focus to the trigger — the standard
   * expectation for any expanding disclosure, and the reason the trigger is a real
   * `<button>` with `aria-expanded` rather than a hover-only affordance.
   *
   * Bound only while open, so the page carries no idle key listener.
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  const isVisible = isRevealed && !isFormInView && !isOverlayOpen;

  return (
    /**
     * The dock's root owns three things: fixed placement, the hover intent that
     * expands the stack, and `focus-within` so a keyboard user tabbing into any
     * action keeps the stack open.
     *
     * Hover *and* click both work, deliberately. Hover is what makes this feel
     * immediate on a desktop demo; the click target is what makes it usable on a
     * touch-capable laptop, where `:hover` either never fires or sticks after a
     * tap. Neither alone covers both machines.
     */
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-6 right-6 z-40 hidden flex-col items-end gap-3 lg:flex wide:bottom-8 wide:right-8"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
          /* `onMouseLeave` belongs on the root but `onMouseEnter` deliberately does
             NOT — it lives on the trigger instead. The collapsed stack still
             occupies its full layout height at `opacity-0`, so an enter handler up
             here would make a ~200px invisible column in the corner hover-sensitive
             and the dock would spring open whenever the cursor passed near
             bottom-right content. Opening from the trigger and closing from the
             root gives the intended pair: the button opens it, moving up into the
             actions keeps it open because the cursor is still inside the root, and
             leaving the dock entirely closes it. */
          onMouseLeave={close}
          onFocus={() => setIsOpen(true)}
          onBlur={(event) => {
            // Only collapse when focus leaves the dock entirely — moving between
            // actions keeps it open.
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              close();
            }
          }}
        >
          {/* THE ACTION STACK.
              `flex-col-reverse` so DOM order (WhatsApp → Call → Trial) renders
              bottom-to-top: the first action sits nearest the trigger and the
              thumb, while a screen reader still hears them in intent order.

              Kept mounted and animated rather than conditionally rendered, so the
              labels are always in the accessibility tree — a collapsed dock is
              still fully described to a screen reader, and `aria-hidden` is never
              applied to real content. `pointer-events-none` while closed is what
              stops an invisible stack from intercepting clicks. */}
          <div
            id={panelId}
            className={cn(
              "flex flex-col-reverse items-end gap-3",
              !isOpen && "pointer-events-none"
            )}
          >
            {DOCK_ACTIONS.map((action, index) => {
              const content = (
                <>
                  <span className={LABEL_CLASSES}>{action.label}</span>

                  <span className={cn(HEX_FACE_CLASSES, action.faceClass)} style={{ clipPath: HEX_CLIP }}>
                    <Icon icon={action.icon} size="lg" />
                  </span>
                </>
              );

              /**
               * The resting pulse on WhatsApp — a ring that expands and fades
               * behind the face, drawing the eye to the single lowest-friction
               * action without animating the button itself.
               *
               * `motion-reduce:hidden` rather than a paused animation: the whole
               * element is decorative, so the honest reduced-motion answer is for
               * it not to exist. It is also `pointer-events-none` and outside the
               * clipped face, so it can bleed past the hexagon's edge the way a
               * glow should.
               */
              const pulse = action.pulse ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -z-10 motion-safe:animate-ping motion-reduce:hidden"
                  style={{ clipPath: HEX_CLIP, background: "rgba(37,211,102,0.35)" }}
                />
              ) : null;

              const sharedClassName = cn(
                "group/action relative flex items-center gap-3",
                FOCUS_RING_CLASSES
              );

              const style = {
                transitionDelay: prefersReducedMotion ? "0ms" : `${index * 45}ms`,
              };

              /**
               * A plain `div`, not a `motion.div`: the stagger here is a CSS
               * `transition-delay` per item, which costs no JavaScript and no
               * animation frame once settled. framer-motion earns its place on the
               * dock's own entrance below, where `AnimatePresence` is doing real
               * work on unmount — a variants tree for three items that only ever
               * fade and shift 8px would be machinery for its own sake.
               */
              return (
                <div
                  key={action.key}
                  className={cn(
                    "flex items-center gap-3 transition-[opacity,transform] duration-300 ease-out",
                    isOpen
                      ? "translate-y-0 opacity-100"
                      : "pointer-events-none translate-y-2 opacity-0"
                  )}
                  style={style}
                >
                  {/* `next/link` for the same-page anchor so it routes without a
                      reload; plain `<a>` for `tel:` and WhatsApp, which are
                      external protocols `Link` has no business wrapping. */}
                  {action.href.startsWith("/") ? (
                    <Link href={action.href} className={sharedClassName} onClick={close}>
                      {pulse}
                      {content}
                    </Link>
                  ) : (
                    <a
                      href={action.href}
                      className={sharedClassName}
                      {...(action.external === true
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      onClick={close}
                    >
                      {pulse}
                      {content}
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          {/* THE TRIGGER — a real button, so the stack is a keyboard-operable
              disclosure rather than a hover-only flourish.

              `aria-expanded` + `aria-controls` describe the relationship, and the
              accessible name switches with state so a screen reader user is told
              what the button will do next rather than what it is. */}
          <button
            ref={triggerRef}
            type="button"
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={isOpen ? "Close contact options" : "Open contact options"}
            onClick={() => setIsOpen((open) => !open)}
            onMouseEnter={() => setIsOpen(true)}
            className={cn("group/action relative", FOCUS_RING_CLASSES)}
          >
            {/* Ambient glow, outside the clipped face so it can bleed. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-3 -z-10 motion-safe:animate-[logo-breathe_5s_ease-in-out_infinite]"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(255,222,1,0.28) 0%, transparent 70%)",
              }}
            />

            <span
              className={cn(HEX_FACE_CLASSES, "bg-brand-yellow text-ink")}
              style={{ clipPath: HEX_CLIP }}
            >
              {/* The icon swap doubles as the open/closed cue. Rotating a single
                  glyph was the alternative; two glyphs read faster, and `X` is the
                  universally understood "this closes" mark. */}
              <Icon icon={isOpen ? X : Headset} size="lg" />
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
