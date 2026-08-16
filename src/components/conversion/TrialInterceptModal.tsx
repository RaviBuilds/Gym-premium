"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { MouseEvent } from "react";
import Image from "next/image";
import { Dumbbell, MessageCircle, Phone, X } from "lucide-react";
import { useReducedMotion } from "framer-motion";

import { Dialog, type DialogCloseReason } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { BodyText, Eyebrow, Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";
import { HEX_CLIP, HEX_CLIP_INSET } from "@/lib/shapes";
import { trialIntercept } from "@/config/conversion";
import { siteConfig } from "@/config/site";
import { trainers } from "@/content/trainers";
import { trackCampaign } from "@/lib/analytics";
import { useAnchorPassed, useCampaignGate, useElementInView } from "@/lib/hooks";
import type { Trainer } from "@/types/content";

/**
 * The face on the offer — resolved once at module scope, same pattern
 * `TrainerShowcase` uses for `SECTION` (a typo here should fail the build, not
 * quietly render an undefined photo to a visitor mid-scroll).
 *
 * Deliberately the trainer marked `lead: true` in `content/trainers.ts` — the
 * same coach `TrainerShowcase` just finished presenting on the lead plinth two
 * sections up. Picking anyone else would introduce a seventh "who is this"
 * question the modal has no room to answer; reusing the lead means the visitor
 * has already been told who he is by the time this opens.
 */
function resolveLeadCoach(): Trainer {
  const found = trainers.find((trainer) => trainer.lead === true);

  if (found === undefined) {
    throw new Error(
      "[trial-intercept] No trainer in content/trainers.ts is marked `lead: true`. TrialInterceptModal needs the lead coach's photo — check src/content/trainers.ts."
    );
  }

  return found;
}

const LEAD_COACH: Trainer = resolveLeadCoach();

/**
 * TrialInterceptModal — the scroll-triggered lead-capture modal that opens once
 * the visitor has read the trainer roster.
 *
 * ## What this file is, and is not
 *
 * It is the *composition*: it wires a trigger, a gate and a dialog together and
 * paints one surface. It owns none of those three mechanisms, and that is what
 * keeps it readable:
 *
 * | Concern | Owner |
 * |---|---|
 * | when in the page | `useAnchorPassed("trainers")` |
 * | whether at all (session / cooldown / dwell) | `useCampaignGate` |
 * | withhold while the form is visible | `useElementInView("free-trial")` |
 * | focus, escape, backdrop, scroll lock, shape | `Dialog` |
 * | timings, copy, storage key | `config/conversion.ts` |
 *
 * ## It offers no fourth channel, and adds no new destination
 *
 * The three actions are the three the site already has — `/#free-trial`,
 * `siteConfig.links.whatsapp`, and `phones[0]` — in the same commitment order
 * `FloatingContactDock` uses, and pointing at the same targets. A modal that
 * introduced a route or a number of its own would be a second conversion system
 * competing with the one the rest of the page spent twelve sections building.
 *
 * ## The photo is the lead coach, not a stock face
 *
 * `LEAD_COACH` resolves the trainer marked `lead: true` in
 * `content/trainers.ts` — the same coach the visitor just saw two sections up on
 * `TrainerShowcase`'s lead plinth. That reuse is the point: introducing a face
 * this modal has never shown before would ask "who is this?" at the exact
 * moment the copy is asking for a decision. His `signatureAchievement`
 * ("Mr Nizamabad") renders through `Badge`, unchanged from the Content Honesty
 * Contract `content/trainers.ts` already documents — nothing here invents a
 * credential. The photo is `lg:`-only; see its inline comment for why a phone
 * sheet does not carry it.
 *
 * ## Why the primary CTA cancels its own navigation
 *
 * `Book Free Trial` is a real `<a href="/#free-trial">` — right-click, middle-
 * click and "copy link" all behave — but its handler calls `preventDefault` and
 * scrolls manually after the dialog has closed. It has to: the dialog freezes
 * page scroll while open, and a hash navigation that lands in the same frame as
 * the close either fights the freeze or scrolls before the modal is gone. Closing
 * first, then scrolling, is the only ordering where both are correct.
 *
 * ## Mounted globally, scoped by content
 *
 * Renders from `layout.tsx` beside the two docks, because like them it is
 * viewport-fixed chrome rather than a section of the page. It costs nothing on
 * routes without a `#trainers` element: the observer finds no anchor and the
 * campaign never arms.
 */

/** Delay before scrolling to the form, covering the dialog's 400ms exit. */
const EXIT_SETTLE_MS = 280;

/** Which action was taken, as reported to analytics. */
type Channel = "trial" | "whatsapp" | "call";

export function TrialInterceptModal() {
  const prefersReducedMotion = useReducedMotion();

  const headingId = useId();
  const bodyId = useId();

  const [isOpen, setIsOpen] = useState(false);
  /**
   * Distinct from the gate's session flag, and both are needed. The gate's flag
   * is persisted and survives a reload; this one is the in-render latch that
   * stops the open-effect re-firing while the same mount is still deciding
   * things. Without it, any dependency change between the trigger and the timer
   * completing could queue a second open.
   */
  const [hasFired, setHasFired] = useState(false);

  /**
   * One suppression event per visit, not one per scroll direction change. The
   * form entering and leaving the viewport is a continuous signal, so without
   * this latch a visitor scrubbing around the footer would emit a dozen
   * identical events and make the diagnostic useless as a count.
   */
  const hasLoggedSuppression = useRef(false);

  const gate = useCampaignGate({
    storageKey: trialIntercept.storageKey,
    dismissCooldownDays: trialIntercept.dismissCooldownDays,
    minTimeOnPageMs: trialIntercept.minTimeOnPageMs,
  });

  /**
   * Withheld while the trial form is on screen. `-20%` from the bottom means the
   * form has to be genuinely in view, not merely peeking into the last few
   * pixels — matching the margin `FloatingContactDock` uses against the same
   * element, so the two never disagree about whether the form is "visible".
   */
  const isFormInView = useElementInView(trialIntercept.suppressWhileVisibleId, {
    rootMargin: "0px 0px -20% 0px",
  });

  /**
   * The trigger only observes while the campaign could actually run. Passing the
   * gate in as `enabled` also gets the dwell case right for free: if the visitor
   * scrolls past the trainers before the 12s floor, the observer is not yet
   * mounted — and when it mounts afterwards, `IntersectionObserver` reports the
   * anchor's existing position, so the trigger fires then rather than being lost.
   */
  const hasPassedTrainers = useAnchorPassed(trialIntercept.anchorId, {
    enabled: gate.isEligible && !hasFired,
  });

  useEffect(() => {
    if (!hasPassedTrainers || !gate.isEligible || hasFired) {
      return;
    }

    /**
     * Suppression is recorded rather than silently obeyed. Without this event, a
     * campaign that is eligible and triggering but never showing looks identical
     * in the data to one that is never triggering at all.
     */
    if (isFormInView) {
      if (!hasLoggedSuppression.current) {
        hasLoggedSuppression.current = true;
        trackCampaign("suppressed", trialIntercept.campaignId, { reason: "form_in_view" });
      }

      return;
    }

    const timer = window.setTimeout(() => {
      setIsOpen(true);
      setHasFired(true);
      gate.markShown();
      trackCampaign("impression", trialIntercept.campaignId, {
        anchor: trialIntercept.anchorId,
      });
    }, trialIntercept.settleDelayMs);

    return () => window.clearTimeout(timer);
  }, [hasPassedTrainers, isFormInView, hasFired, gate]);

  const handleClose = useCallback(
    (reason: DialogCloseReason) => {
      setIsOpen(false);

      // "action" means a CTA closed it — that path records its own conversion.
      if (reason === "action") {
        return;
      }

      gate.markDismissed();
      trackCampaign("dismiss", trialIntercept.campaignId, { reason });
    },
    [gate]
  );

  const handleAction = useCallback(
    (channel: Channel) => {
      gate.markConverted();
      trackCampaign("cta_click", trialIntercept.campaignId, { channel });
      setIsOpen(false);
    },
    [gate]
  );

  /**
   * The primary CTA. Closes first, then scrolls — see the note in this file's
   * header on why the anchor's own navigation is cancelled.
   *
   * `replaceState` rather than `pushState`: the visitor did not navigate
   * anywhere, so Back should return them to wherever they came from, not undo a
   * scroll.
   */
  const handleTrialClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      handleAction("trial");

      window.setTimeout(() => {
        const form = document.getElementById(trialIntercept.suppressWhileVisibleId);

        form?.scrollIntoView({
          behavior: prefersReducedMotion === true ? "auto" : "smooth",
          block: "start",
        });

        window.history.replaceState(null, "", `#${trialIntercept.suppressWhileVisibleId}`);
      }, EXIT_SETTLE_MS);
    },
    [handleAction, prefersReducedMotion]
  );

  const phoneHref = `tel:${siteConfig.contact.phones[0]?.replace(/\s+/g, "")}`;
  const { copy } = trialIntercept;

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      labelledBy={headingId}
      describedBy={bodyId}
      /**
       * The panel surface. Ink ground so it reads as part of the dark sections it
       * interrupts, a 2px yellow top edge so the mobile sheet has a defined
       * leading edge rather than dissolving into the dimmed page behind it, and
       * `rounded-none` inherited from `Dialog` — hard edges mean action (§15).
       *
       * Bottom padding carries `env(safe-area-inset-bottom)` via the wrapper
       * below, because as a sheet this element sits directly on a phone's home-
       * indicator gesture zone.
       */
      /**
       * `lg:max-w-2xl` overrides `Dialog`'s own `lg:max-w-lg` default (512px →
       * 672px). `tailwind-merge` resolves the conflict since both are in the
       * same `max-width` group and this one is later in the merge order. The
       * wider panel exists specifically for the photo column: at 512px, a
       * 168px image plus its padding left barely 280px for two side-by-side
       * buttons, tight enough that "WhatsApp Now" would wrap. 672px gives the
       * two-button row room without the photo crowding it.
       */
      className="border-t-2 border-brand-yellow bg-ink shadow-[0_-8px_40px_rgba(0,0,0,0.55)] lg:max-w-2xl lg:border lg:border-white/10 lg:border-t-2 lg:border-t-brand-yellow lg:shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
    >
      {/* Close. Sits on its OWN row above the content grid rather than
          absolutely pinned into the corner — the previous version overlapped
          the panel's 2px yellow top edge, which reads as a collision the moment
          you look for it. A 44px target (§12) with a visible label: an
          icon-only dismiss with no accessible name is the most common way this
          pattern becomes unclosable without a mouse. */}
      <div className="flex justify-end px-3 pt-3 lg:px-4 lg:pt-4">
        <button
          type="button"
          onClick={() => handleClose("close-button")}
          aria-label="Close"
          className="grid size-11 place-items-center rounded-none border border-white/15 text-text-secondary-dark transition-colors duration-200 ease-out hover:border-white/30 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
        >
          <Icon icon={X} size="lg" />
        </button>
      </div>

      <div
        className="relative flex flex-col gap-5 px-5 pb-5 pt-2 sm:px-7 sm:pb-7 lg:flex-row lg:gap-0 lg:px-0 lg:pb-0 lg:pt-0"
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        {/* The coach photo, and why it earns a place here.
            A popup asking for trust with pure type-on-black is asking harder
            than it needs to — a face is the single biggest lever conversion
            creative relies on, and this section already has six real ones. The
            achievement badge is genuine content from `content/trainers.ts`
            (`Mr Nizamabad`), not invented copy — see Requirement 8.6's Content
            Honesty Contract, which this reuses rather than restates. Hidden
            below `lg:` where a portrait would eat the sheet's limited vertical
            room and compete with the actions for thumb reach; the eyebrow and
            heading alone still carry the offer there. */}
        <div className="relative hidden shrink-0 lg:block lg:w-[168px]">
          <div
            className="relative h-full min-h-[280px] overflow-hidden bg-ink"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 90% 70% at 50% 20%, rgba(255,222,1,0.1) 0%, transparent 70%)",
            }}
          >
            <Image
              src={LEAD_COACH.imageSrc}
              alt=""
              fill
              sizes="168px"
              className="object-cover object-top"
            />
            {/* Pool the photo into the copy column rather than cutting on a hard
                vertical edge — the same "no visible seam" reasoning
                `TrainerPlinth`'s label pool uses, applied sideways. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 w-1/2"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(20,24,29,0.92) 100%)",
              }}
            />

            {/* The one hex-chip achievement mark this section reuses — same
                geometry as `RosterIndexChip`, carrying a real badge instead of
                an index numeral. */}
            <div
              aria-hidden="true"
              className="absolute bottom-3 left-3 flex size-9 items-center justify-center"
              style={{ clipPath: HEX_CLIP }}
            >
              <span className="absolute inset-0 bg-ink/80" style={{ clipPath: HEX_CLIP }} />
              <span
                className="absolute inset-[2px] flex items-center justify-center bg-ink"
                style={{ clipPath: HEX_CLIP_INSET }}
              >
                <Icon icon={Dumbbell} size="sm" className="text-brand-yellow" />
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-5 lg:gap-6 lg:px-8 lg:py-8">
          {/* Copy block. */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Eyebrow tone="dark">{copy.eyebrow}</Eyebrow>
              {/* Real achievement from the Content_Registry, not invented copy —
                  see the header note above. Hidden below `lg:` since it names
                  the coach the hidden photo belongs to. Guarded rather than
                  asserted: `signatureAchievement` is optional on `Trainer`, and
                  the badge should simply not render for whichever coach is
                  ever marked `lead: true` next if they carry no achievement. */}
              {LEAD_COACH.signatureAchievement !== undefined && (
                <Badge variant="informational" className="hidden px-2 py-0.5 lg:inline-flex">
                  {LEAD_COACH.signatureAchievement}
                </Badge>
              )}
            </div>

            {/* `subsection` rather than `section`: this is a 512px panel, not a
                full-bleed section, and Archivo Black at the section size wraps
                to four lines inside a phone sheet. `h2` because the dialog is
                its own labelling context. */}
            <Heading level="subsection" as="h2" id={headingId} className="text-white">
              {copy.heading}
            </Heading>

            <BodyText id={bodyId} className="text-text-secondary-dark">
              {copy.body}
            </BodyText>
          </div>

          {/* Actions, in commitment order. Stacked and full-width on a phone so
              each one is a thumb-sized target; the two lower-commitment
              channels share a row from `sm:` up, where there is room. */}
          <div className="flex flex-col gap-3">
            <ButtonLink
              href="/#free-trial"
              onClick={handleTrialClick}
              variant="primary"
              className="w-full"
            >
              {copy.primaryCta}
            </ButtonLink>

            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href={siteConfig.links.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleAction("whatsapp")}
                variant="whatsapp"
                icon={<Icon icon={MessageCircle} />}
                className="w-full"
              >
                {copy.whatsappCta}
              </ButtonLink>

              <ButtonLink
                href={phoneHref}
                onClick={() => handleAction("call")}
                variant="secondary"
                icon={<Icon icon={Phone} />}
                className="w-full text-white"
              >
                {copy.callCta}
              </ButtonLink>
            </div>
          </div>

          {/* Closing row: the reassurance line, and the low-emphasis way out.
              "Maybe later" exists next to the X on purpose — a visible verbal
              dismissal converts better than an icon alone, because it tells the
              visitor the offer is declinable and stops the modal reading as a
              trap. */}
          <div className="flex flex-col gap-3 border-t border-border-dark pt-4 sm:flex-row sm:items-center sm:justify-between">
            <BodyText size="caption" className="text-text-secondary-dark">
              {copy.reassurance}
            </BodyText>

            <Button
              variant="ghost"
              onClick={() => handleClose("close-button")}
              className="self-start text-text-secondary-dark hover:text-white sm:self-auto"
            >
              {copy.dismiss}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
