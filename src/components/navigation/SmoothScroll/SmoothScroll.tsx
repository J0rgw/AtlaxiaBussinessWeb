"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { setSmoothScroll } from "@/lib/smoothScroll";

/**
 * Inertial page scrolling (Lenis), the Cerebrium reference. Native scrolling
 * stays underneath, so sticky elements, IntersectionObserver and keyboard
 * scrolling keep working. Off with reduced motion. Renders nothing.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ autoRaf: true, lerp: 0.1, smoothWheel: true });
    setSmoothScroll(lenis);

    // Turning reduced motion on while the page is open stops the smoothing.
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      lenis.destroy();
      setSmoothScroll(null);
    };
    query.addEventListener("change", onChange);

    return () => {
      query.removeEventListener("change", onChange);
      lenis.destroy();
      setSmoothScroll(null);
    };
  }, []);

  return null;
}
