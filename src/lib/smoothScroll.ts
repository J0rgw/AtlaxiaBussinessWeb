import type Lenis from "lenis";

// The single Lenis instance of the page, when inertial scrolling is active.
let instance: Lenis | null = null;

export function setSmoothScroll(lenis: Lenis | null) {
  instance = lenis;
}

/**
 * Null when smooth scrolling is off (reduced motion, not mounted, Storybook).
 * Its `scrollTo` also wakes the frame loop, which sleeps while nothing moves.
 */
export function getSmoothScroll(): Lenis | null {
  return instance;
}
