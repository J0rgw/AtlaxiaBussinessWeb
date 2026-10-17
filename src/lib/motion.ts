/** True when the system or the manual override (`data-motion="reduce"` on <html>) asks for less motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.dataset.motion === "reduce"
  );
}

/** The site's --ease-in-out, cubic-bezier(0.65, 0, 0.35, 1), as a function (cubic in-out). */
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

/** The site's --ease-out, cubic-bezier(0.25, 1, 0.5, 1), as a function (quartic out). */
export const easeOut = (t: number) => 1 - (1 - t) ** 4;

/** One frame at 60 Hz, the unit of the per-frame easing constants. */
export const FRAME_MS = 1000 / 60;

/**
 * Share of the remaining distance an eased follower covers after `elapsed` ms,
 * given its share per 60 Hz frame. Per time, not per frame: the follower trails
 * the same at 60 or 120 Hz and does not stall when a frame is dropped. The first
 * step of a movement (`elapsed` null) counts as one frame; a stall as four at most.
 */
export function followShare(perFrame: number, elapsed: number | null): number {
  const frames = elapsed === null ? 1 : Math.min(4, Math.max(0, elapsed) / FRAME_MS);
  return 1 - (1 - perFrame) ** frames;
}

/**
 * Elapsed time between a follower's frames, for `followShare`. Null on the first
 * frame of a movement; call `rest()` when the follower settles, so the next
 * movement starts from one frame and not from the whole pause.
 */
export function createFrameClock() {
  let last: number | null = null;
  return {
    elapsed(time: number) {
      const elapsed = last === null ? null : time - last;
      last = time;
      return elapsed;
    },
    rest() {
      last = null;
    },
  };
}
