// Registers the jest-dom matchers (toBeInTheDocument, toHaveClass, …) on
// Vitest's `expect`. Imported via `setupFiles` in vitest.config.ts.
import "@testing-library/jest-dom/vitest";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Observer stubs — the two browser APIs jsdom does not implement
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * jsdom ships neither `IntersectionObserver` nor `ResizeObserver`, and both are
 * constructed *during mount* by code this project cannot mount a DOM test
 * without:
 *
 * - **`IntersectionObserver`** — framer-motion's `whileInView` feature calls
 *   `new IntersectionObserver(...)` from its `mount()` path with no guard for the
 *   API being absent (`framer-motion/.../features/viewport/observers.mjs`). Every
 *   `whileInView` element in the tree therefore throws `ReferenceError` the
 *   moment it renders — `MaskedLine`, `AnimationWrapper` and `KineticHeadline`,
 *   which between them wrap most of the page's text.
 * - **`ResizeObserver`** — `useCameraLayer` constructs one in a layout effect to
 *   measure the plane it drives (`src/lib/motion/use-camera-layer.ts`), so any
 *   section that subscribes to the camera throws on mount too.
 *
 * Both stubs are registered on `globalThis` **only if the name is not already
 * defined**. That ordering matters in two directions: a future jsdom release that
 * implements either API keeps its real implementation rather than being silently
 * downgraded to these no-ops, and a single test that needs to drive intersection
 * or resize behaviour can install its own fake before this file's guard runs —
 * or overwrite it afterwards — without fighting a definition it did not ask for.
 *
 * ## What these deliberately do NOT do
 *
 * Neither stub ever invokes its callback. They exist so components can *mount*,
 * not so scroll- or size-driven behaviour can be asserted, and pretending
 * otherwise would be worse than doing nothing: a stub that fabricated
 * intersection entries would report geometry jsdom has never computed (every
 * element there has a zero-sized `getBoundingClientRect`), so any test trusting
 * it would be asserting against invented numbers.
 *
 * The consequence for `IntersectionObserver` is worth stating plainly, because it
 * shapes what a DOM test may assert. framer-motion only sets its `whileInView`
 * variant active from inside the observer callback, so with a never-firing
 * observer **a `whileInView` element stays at its `initial` state forever** — a
 * `MaskedLine`'s inner span sits at `y: 110%`, an `AnimationWrapper`'s child at
 * `opacity: 0`. Tests must therefore treat that initial state as the expected
 * rendered output and assert on structure, DOM content, classes and props rather
 * than on any post-reveal transform. Asserting "the text is visible" against
 * these stubs would be asserting something the stubs guarantee is false. The
 * reduced-motion branches are the exception: those render plain elements in their
 * final state with no observer involved, so they are directly testable by
 * stubbing `matchMedia` instead.
 *
 * `ResizeObserver`'s never-firing callback is comparatively harmless — the camera
 * hook already does one direct `getBoundingClientRect()` read before it observes,
 * and in jsdom that returns height 0, which resolves the layer's amplitude to 0
 * and parks it. A parked camera layer renders its children with no transform,
 * which is exactly the state a structural test wants.
 */

/**
 * `IntersectionObserver` — full interface shape, no behaviour.
 *
 * The `root` / `rootMargin` / `thresholds` trio is echoed back from the options
 * rather than hard-coded so the stub reports what it was actually asked for.
 * framer-motion serialises those options as a cache key for the observers it
 * shares between elements, so a stub that lied about them would be a stub that
 * quietly diverges from the real API's contract for no gain.
 *
 * The `callback` parameter is accepted and never stored: there is nothing to fire
 * it from, and holding a reference would suggest otherwise.
 */
class IntersectionObserverStub implements IntersectionObserver {
  readonly root: Element | Document | null;
  readonly rootMargin: string;
  readonly thresholds: ReadonlyArray<number>;

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.root = options?.root ?? null;
    // The spec's own defaults: no margin, and a single 0 threshold.
    this.rootMargin = options?.rootMargin ?? "0px";
    const threshold = options?.threshold ?? 0;
    this.thresholds = Object.freeze(
      typeof threshold === "number" ? [threshold] : [...threshold].sort((a, b) => a - b)
    );
  }

  // Parameterless on purpose. The arguments are unused, and naming them would
  // trip `@typescript-eslint/no-unused-vars` — `npm run lint` has to come back
  // clean, warnings included. A parameterless method is still assignable to the
  // real signature, so `implements IntersectionObserver` still holds.
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}

  /** Always empty: nothing is ever observed, so there is nothing to hand back. */
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

/**
 * `ResizeObserver` — the three methods the interface has, and nothing else.
 *
 * No constructor is declared at all: the real one takes a callback this stub has
 * no use for, and omitting it keeps the class free of an unused parameter while
 * staying assignable to `typeof ResizeObserver` (a construct signature that
 * accepts fewer arguments than the target is still assignable to it).
 */
class ResizeObserverStub implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = IntersectionObserverStub;
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = ResizeObserverStub;
}
