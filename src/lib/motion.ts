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
