"use client";

import { useSyncExternalStore } from "react";

/**
 * overlay-lock — the one place that knows "a blocking overlay is on screen".
 *
 * Two problems live here, and they are the same problem counted twice.
 *
 * ## 1. The docks have to get out of the way
 *
 * `StickyMobileCTA` and `FloatingContactDock` both carry Call / WhatsApp /
 * Book Free Trial, and both are `fixed` at `z-40`. Any modal that also offers
 * those three actions would put every one of them on screen twice — which is
 * precisely the duplication `FloatingContactDock`'s doc comment exists to
 * prevent between itself and the mobile bar. Raising the modal's `z-index`
 * above them does not fix it: on a phone the sheet sits directly on top of the
 * bar, so the visitor sees two "Free Trial" buttons stacked 8px apart.
 *
 * So the docks subscribe here and withdraw while an overlay is open. They are
 * `fixed`-position siblings of the modal in completely different subtrees, so a
 * React context would mean wrapping `layout.tsx` in yet another provider whose
 * only job is to let three leaf components agree on one boolean. A module-scope
 * store read through `useSyncExternalStore` gets the same result with no
 * provider, no prop threading, and — because the snapshot is a primitive —
 * re-renders only the components that actually read it.
 *
 * ## 2. The page behind must not scroll
 *
 * Owned here rather than in `Dialog`, because the lock and the scroll freeze
 * have to share one counter. Two overlays open at once (a dialog opening a
 * confirm dialog, say) means the first one closing must **not** restore
 * scrolling, and any implementation that stores "was scrolling allowed?" per
 * component gets that wrong the moment a second component exists.
 *
 * The freeze goes on `<html>`, not `<body>`. Per CSS overflow propagation only
 * the root element's overflow reaches the viewport, and `<body>` here already
 * carries `overflow-x-hidden` from `layout.tsx` — which makes `<html>` the
 * scroll container, so `body { overflow: hidden }` would be a no-op on the
 * thing that actually scrolls.
 *
 * `padding-right` compensation matters more than it looks: removing a classic
 * desktop scrollbar without it shifts the entire page ~15px left the instant
 * the modal opens, which reads as the layout breaking at the exact moment you
 * are asking someone to convert.
 */

/**
 * How many overlays are currently open. A counter rather than a boolean so
 * nested or overlapping overlays release correctly — see the header.
 */
let lockCount = 0;

const listeners = new Set<() => void>();

/** Inline styles displaced by the scroll freeze, restored on the last release. */
let restoreOverflow = "";
let restorePaddingRight = "";

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): boolean {
  return lockCount > 0;
}

/**
 * The server always renders as "no overlay open", which is the only honest
 * answer: an overlay is opened by a client effect, so no server render can ever
 * have one. This keeps `useSyncExternalStore` from tripping a hydration
 * mismatch on the docks, which are server-rendered.
 */
function getServerSnapshot(): boolean {
  return false;
}

function freezeScroll(): void {
  const root = document.documentElement;

  restoreOverflow = root.style.overflow;
  restorePaddingRight = root.style.paddingRight;

  // Measured *before* overflow changes, or it always reads 0.
  const scrollbarWidth = window.innerWidth - root.clientWidth;

  root.style.overflow = "hidden";

  if (scrollbarWidth > 0) {
    root.style.paddingRight = `${scrollbarWidth}px`;
  }
}

function thawScroll(): void {
  const root = document.documentElement;

  root.style.overflow = restoreOverflow;
  root.style.paddingRight = restorePaddingRight;
}

/**
 * Claim the overlay lock: hides the conversion docks and freezes page scroll.
 *
 * Returns the matching release function rather than exposing a `release()`
 * export, so a caller cannot release a lock it never took — the effect that
 * acquires simply returns this as its cleanup. Idempotent, because React 19's
 * StrictMode double-invokes effects in development and a naive decrement would
 * drive the counter negative.
 */
export function acquireOverlayLock(): () => void {
  lockCount += 1;

  if (lockCount === 1) {
    freezeScroll();
  }

  emit();

  let released = false;

  return () => {
    if (released) {
      return;
    }

    released = true;
    lockCount = Math.max(0, lockCount - 1);

    if (lockCount === 0) {
      thawScroll();
    }

    emit();
  };
}

/**
 * Whether any blocking overlay is currently open.
 *
 * Read by the two conversion docks so they can withdraw. Anything else that
 * pins itself to the viewport should read this too rather than inventing a
 * second way to find out.
 */
export function useIsOverlayOpen(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
