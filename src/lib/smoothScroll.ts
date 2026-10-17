import type Lenis from "lenis";

// The single Lenis instance of the page, when inertial scrolling is active.
let instance: Lenis | null = null;
// Restarts its frame loop, which sleeps while nothing moves (see SmoothScroll).
let wake: (() => void) | null = null;

/** Registers the page's Lenis and the function that wakes its frame loop. */
export function setSmoothScroll(lenis: Lenis, onWake: () => void): void;
export function setSmoothScroll(lenis: null): void;
export function setSmoothScroll(lenis: Lenis | null, onWake?: () => void) {
  instance = lenis;
  wake = lenis ? (onWake ?? null) : null;
}

/** Null when smooth scrolling is off (reduced motion, not mounted, Storybook). */
export function getSmoothScroll(): Lenis | null {
  return instance;
}

type ScrollToArgs = Parameters<Lenis["scrollTo"]>;

/**
 * Scrolls through Lenis and wakes its frame loop. Calling `scrollTo` on the
 * instance directly would start an animation the sleeping loop never runs.
 * Returns false when smooth scrolling is off.
 */
export function smoothScrollTo(...args: ScrollToArgs): boolean {
  if (!instance) return false;
  instance.scrollTo(...args);
  wake?.();
  return true;
}
