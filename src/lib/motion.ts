/** True when the system or the manual override (`data-motion="reduce"` on <html>) asks for less motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.dataset.motion === "reduce"
  );
}
