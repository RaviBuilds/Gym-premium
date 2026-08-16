"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const MS_PER_DAY = 86_400_000;

export interface UseCampaignGateOptions {
  /** `localStorage` key holding this campaign's cross-session record. */
  storageKey: string;
  /** Days a dismissal suppresses the campaign for. */
  dismissCooldownDays: number;
  /** Milliseconds on the page before the campaign may show at all. */
  minTimeOnPageMs: number;
}

export interface CampaignGate {
  /**
   * Storage permits it *and* the dwell timer has elapsed. `false` on the server
   * and on first client paint, always — see the note on initial state below.
   */
  isEligible: boolean;
  /** Called when the campaign actually renders. Closes the session. */
  markShown: () => void;
  /** Closed without acting — starts the cooldown. */
  markDismissed: () => void;
  /** Took an action — suppresses the campaign permanently. */
  markConverted: () => void;
}

/**
 * The persisted record. Every field is a millisecond timestamp so the format
 * needs no migration to answer a question it was not originally asked ("how long
 * ago?" is arithmetic, not a schema change).
 */
interface CampaignRecord {
  dismissedAt?: number;
  convertedAt?: number;
  lastShownAt?: number;
}

/**
 * Storage is wrapped because it throws rather than degrades in two situations
 * that are both ordinary: Safari private browsing, and any browser with
 * site-data blocked. An exception thrown while deciding whether to show a promo
 * would take the whole page's hydration down with it, so every access here fails
 * closed — unreadable storage is treated as "no record", which lets the campaign
 * show once and then behave as session-only.
 */
function readRecord(storageKey: string): CampaignRecord {
  try {
    const raw = window.localStorage.getItem(storageKey);

    if (raw === null) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null) {
      return {};
    }

    return parsed as CampaignRecord;
  } catch {
    return {};
  }
}

function writeRecord(storageKey: string, patch: CampaignRecord): void {
  try {
    const next = { ...readRecord(storageKey), ...patch };
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    // Fails closed — see above.
  }
}

function readShownThisSession(storageKey: string): boolean {
  try {
    return window.sessionStorage.getItem(storageKey) !== null;
  } catch {
    return false;
  }
}

function writeShownThisSession(storageKey: string): void {
  try {
    window.sessionStorage.setItem(storageKey, "1");
  } catch {
    // Fails closed — see above.
  }
}

/**
 * useCampaignGate — the frequency-capping half of a scroll-triggered campaign,
 * deliberately separated from the trigger and from the UI.
 *
 * This split is the whole design. A popup is three independent decisions:
 *
 * | Decision | Owner |
 * |---|---|
 * | *when* in the page | `useAnchorPassed` |
 * | *whether at all* | this hook |
 * | *what it looks like* | `TrialInterceptModal` |
 *
 * Keeping them apart is what makes the funnel tunable without touching the
 * component, and it is why the same gate can front a second campaign later
 * without any of this logic being written twice.
 *
 * ## The four rules, and why each one is here
 *
 * 1. **Once per session** (`sessionStorage`). A second showing in one visit
 *    converts near zero and is the single thing that makes a site feel like it
 *    is shouting. This is the rule most often left out and most often regretted.
 * 2. **Dismissal has a cooldown** (`localStorage`, default 7 days). A visitor who
 *    closed it said no. Asking again tomorrow is not persistence, it is not
 *    listening.
 * 3. **Conversion suppresses permanently.** Someone who has already tapped
 *    WhatsApp or opened the trial form must never see the ask again — showing it
 *    to an existing lead is the worst impression the campaign can make.
 * 4. **A minimum dwell time.** Bounce traffic should never see it. This also
 *    covers the browser-scroll-restoration case, where a returning visitor lands
 *    mid-page and the anchor trigger is satisfied on the first frame; without a
 *    dwell floor the modal would appear to open "on load", which is both hostile
 *    and the pattern Google's intrusive-interstitial guidance targets.
 *
 * ## Initial state is always ineligible, on purpose
 *
 * `isEligible` starts `false` and can only become `true` inside an effect. Both
 * storage reads and the dwell timer are client-only, so any other starting value
 * would either mismatch during hydration or flash the modal for one frame before
 * the record loads. The cost is that the campaign can never render on the first
 * paint — which is exactly the intent.
 */
export function useCampaignGate({
  storageKey,
  dismissCooldownDays,
  minTimeOnPageMs,
}: UseCampaignGateOptions): CampaignGate {
  const [storageAllows, setStorageAllows] = useState(false);
  const [hasDwelled, setHasDwelled] = useState(false);

  useEffect(() => {
    if (readShownThisSession(storageKey)) {
      return;
    }

    const record = readRecord(storageKey);

    if (typeof record.convertedAt === "number") {
      return;
    }

    if (
      typeof record.dismissedAt === "number" &&
      Date.now() - record.dismissedAt < dismissCooldownDays * MS_PER_DAY
    ) {
      return;
    }

    setStorageAllows(true);
  }, [storageKey, dismissCooldownDays]);

  useEffect(() => {
    if (minTimeOnPageMs <= 0) {
      setHasDwelled(true);
      return;
    }

    const timer = window.setTimeout(() => setHasDwelled(true), minTimeOnPageMs);

    return () => window.clearTimeout(timer);
  }, [minTimeOnPageMs]);

  const markShown = useCallback(() => {
    writeShownThisSession(storageKey);
    writeRecord(storageKey, { lastShownAt: Date.now() });
  }, [storageKey]);

  /**
   * Both terminal marks also flip `storageAllows` to `false` in React state, not
   * just in storage. Storage is only re-read on mount, so without this the gate
   * would keep reporting "eligible" for the rest of the visit and any consumer
   * relying on it to stay closed would have to track that itself.
   */
  const markDismissed = useCallback(() => {
    writeRecord(storageKey, { dismissedAt: Date.now() });
    setStorageAllows(false);
  }, [storageKey]);

  const markConverted = useCallback(() => {
    writeRecord(storageKey, { convertedAt: Date.now() });
    setStorageAllows(false);
  }, [storageKey]);

  return useMemo(
    () => ({
      isEligible: storageAllows && hasDwelled,
      markShown,
      markDismissed,
      markConverted,
    }),
    [storageAllows, hasDwelled, markShown, markDismissed, markConverted]
  );
}
