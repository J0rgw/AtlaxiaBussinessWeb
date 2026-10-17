import type Lenis from "lenis";

// The single Lenis instance of the page, when inertial scrolling is active.
let instance: Lenis | null = null;
// Restarts its frame loop, which sleeps while nothing moves (see SmoothScroll).
let wake: (() => void) | null = null;

export function setSmoothScroll(lenis: Lenis | null, onWake: (() => void) | null = null) {
  instance = lenis;
  wake = lenis ? onWake : null;
}

/** Null when smooth scrolling is off (reduced motion, not mounted, Storybook). */
export function getSmoothScroll(): Lenis | null {
  return instance;
}

/** Call after a programmatic `scrollTo` on the instance, so the sleeping frame loop runs it. */
export function wakeSmoothScroll() {
  wake?.();
}
