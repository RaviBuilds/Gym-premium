"use client";

/**
 * analytics.ts — one narrow seam for conversion events.
 *
 * The site ships no analytics vendor today. That is exactly why this file
 * exists: a scroll-triggered popup that cannot be measured is indistinguishable
 * from a popup that annoys people, and the decision to keep or kill it has to
 * rest on an impression-to-click ratio rather than on taste. Emitting the events
 * now costs nothing and means the day GTM, Plausible or GA4 is added, the funnel
 * already has data flowing into it.
 *
 * `window.dataLayer` is the target because it is the lowest common denominator:
 * Google Tag Manager consumes it natively, and every other vendor can be fed
 * from it with a custom trigger. If it does not exist, `track` pushes into an
 * array it creates itself — so events raised before the GTM snippet loads are
 * not dropped, they are replayed when it arrives. That ordering is the usual
 * reason "the popup fires no events" turns out to be false.
 *
 * No PII passes through here, by construction: callers send an event name and
 * flat scalar metadata (which campaign, which channel, why it closed). The
 * visitor's name, phone and goal live in `TrialBookingForm` and must stay there.
 */

type AnalyticsPayload = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

/**
 * Push one event. Never throws — an analytics failure must not be able to take
 * a conversion CTA down with it, which is a real risk here because every call
 * site is inside a click handler that also has to navigate.
 */
export function track(event: string, payload: AnalyticsPayload = {}): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ event, ...payload });
  } catch {
    // Deliberately silent. See above.
  }
}

/**
 * The four events a scroll-triggered campaign needs, named as a union so a typo
 * fails `tsc` rather than quietly creating a fifth event nobody reports on.
 *
 * - `impression` the modal was actually shown
 * - `dismiss`    closed without taking an action (carries the reason)
 * - `cta_click`  an action was taken (carries the channel)
 * - `suppressed` eligible, triggered, but withheld — the diagnostic that
 *                explains a low impression count without guesswork
 */
export type CampaignEvent = "impression" | "dismiss" | "cta_click" | "suppressed";

/** Namespaced so campaign events group cleanly in any downstream tool. */
export function trackCampaign(
  event: CampaignEvent,
  campaign: string,
  payload: AnalyticsPayload = {}
): void {
  track(`campaign_${event}`, { campaign, ...payload });
}
