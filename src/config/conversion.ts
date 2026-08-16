/**
 * conversion.ts — the tuning surface for scroll-triggered conversion campaigns.
 *
 * Every number that decides *when* and *how often* a campaign appears lives
 * here, separate from the component that renders it. That separation is the
 * point: these values are the ones that get changed in response to funnel data,
 * usually by someone who is not going to read a 200-line React component to find
 * out where "7 days" is written. Copy sits alongside them for the same reason.
 *
 * No `"use client"` — plain constants, importable from either environment.
 */

/**
 * The trial intercept: a lead-capture modal fired once the visitor has read the
 * trainer roster.
 *
 * The trainers section is the placement, not an arbitrary scroll depth, because
 * it is where the page has finished making its case. Six coaches with
 * credentials is the trust beat; the ask belongs immediately after it, while the
 * page's argument is still the thing on the visitor's mind. Waiting for the
 * footer form means waiting for a scroll that most visitors never finish.
 */
export const trialIntercept = {
  /**
   * The section whose exit arms the campaign — `TrainerShowcase`'s own
   * `id="trainers"`, already in the DOM and already a nav target. Because the
   * trigger is anchored to this element, the campaign self-disables on any route
   * that does not render it; there is no route allowlist to keep in sync.
   */
  anchorId: "trainers",

  /**
   * Suppress while this element is on screen — the `TrialBookingForm` block in
   * `Footer`, the same anchor every CTA on the site already targets. A visitor
   * looking at the form does not need to be asked to find the form.
   */
  suppressWhileVisibleId: "free-trial",

  /**
   * Pause between the trigger firing and the modal opening.
   *
   * 600ms, and it is doing real work rather than being a polite delay. A modal
   * that appears in the same frame as the scroll gesture feels like the page
   * grabbed the visitor's hand; a beat later reads as the page responding. It
   * also absorbs fast flick-scrolls, where the anchor is crossed and left behind
   * inside 200ms and the visitor was never reading.
   */
  settleDelayMs: 600,

  /**
   * Floor on time-on-page before the modal may open at all.
   *
   * Filters bounce traffic, and covers the returning visitor whose browser
   * restores scroll position mid-page — without it the anchor trigger is
   * satisfied on the first frame and the modal reads as a load-time interstitial,
   * which is both hostile and the specific thing search guidance penalises.
   */
  minTimeOnPageMs: 12_000,

  /** Days a dismissal holds. A "no" that expires tomorrow was not heard. */
  dismissCooldownDays: 7,

  /**
   * Storage key, version-suffixed. Bumping `v1` is how a future change to the
   * record's meaning gets a clean slate instead of misreading old timestamps —
   * cheaper than a migration for data whose worst-case loss is one visitor
   * seeing one popup again.
   */
  storageKey: "if.trial-intercept.v1",

  /** Campaign name in analytics events. */
  campaignId: "trial-intercept",

  copy: {
    /** Leads with the objection, not the offer — "no card" is the real blocker. */
    eyebrow: "Free Trial · No Card Needed",
    /**
     * "This week" rather than "today": a gym visit is a scheduling decision, and
     * a deadline the visitor cannot meet reads as pressure instead of urgency.
     */
    heading: "Meet your coach this week.",
    /**
     * "Not just a tour" is the one clause doing new work here. The nav's own
     * "Book Free Trial" button already told this visitor a trial exists; by the
     * time this modal opens they have scrolled past all six coaches, so simply
     * repeating "free trial" teaches them nothing they don't already know. What
     * they don't yet know is that the free session is *coached*, not a walk-
     * through — that's the fact this sentence adds.
     */
    body:
      "One free session at Gachibowli or Rethibowli — not just a tour. Tell us your goal and we'll match you with the coach who trains for it.",
    /** Real hours from siteConfig's branches, stated once as reassurance. */
    reassurance: "Two Hyderabad locations · Mon–Sat, 6–11 AM & 5–10 PM",
    /**
     * The line under the coach photo. Deliberately "one of six coaches", not
     * "your coach" or "coached by {name}" — the body copy already promises the
     * gym will *match* the visitor to whichever coach fits their goal, and
     * captioning one specific face as the assignment would contradict that the
     * moment a different coach actually leads the session. This states a true
     * fact (he is on the roster, the achievement is real) without asserting an
     * outcome nobody has decided yet.
     */
    coachCaption: "One of six coaches on the floor",
    /**
     * Three actions, ordered by commitment — the same intent ladder
     * `FloatingContactDock` uses. Three is the ceiling: a fourth turns a decision
     * into a menu, and menus get closed.
     */
    primaryCta: "Book Free Trial",
    whatsappCta: "WhatsApp Now",
    /**
     * "Call Now" rather than "Call the gym" — every other action here is a verb
     * ("Book", "WhatsApp"); naming the destination instead of the action was the
     * one CTA in the set that read as information rather than an instruction.
     */
    callCta: "Call Now",
    dismiss: "Maybe later",
  },
} as const;
