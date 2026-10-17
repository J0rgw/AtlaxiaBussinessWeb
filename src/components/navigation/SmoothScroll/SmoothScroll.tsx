"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { FRAME_MS, prefersReducedMotion } from "@/lib/motion";
import { setSmoothScroll } from "@/lib/smoothScroll";

/**
 * Inertial page scrolling (Lenis), the Cerebrium reference. Native scrolling
 * stays underneath, so sticky elements, IntersectionObserver and keyboard
 * scrolling keep working. Off with reduced motion. Renders nothing.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });

    // Lenis's own loop (autoRaf) asks for a frame forever, so an idle page kept
    // rendering 60 frames a second. This one runs only while Lenis animates.
    let frame = 0;
    const loop = (time: number) => {
      // After a pause, count one frame instead of the pause (or of nothing)
      if (!lenis.time) lenis.time = time - FRAME_MS;
      lenis.raf(time);
      if (lenis.isScrolling === "smooth") {
        frame = requestAnimationFrame(loop);
      } else {
        frame = 0;
        lenis.time = 0;
      }
    };
    // Every animation starts in scrollTo (the wheel, anchors and code): wake the loop there.
    const scrollTo = lenis.scrollTo.bind(lenis);
    lenis.scrollTo = (target, options) => {
      scrollTo(target, options);
      if (!options?.immediate && !frame) frame = requestAnimationFrame(loop);
    };
    setSmoothScroll(lenis);

    const stop = () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      setSmoothScroll(null);
    };

    // Turning reduced motion on while the page is open stops the smoothing.
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) stop();
    };
    query.addEventListener("change", onChange);

    return () => {
      query.removeEventListener("change", onChange);
      stop();
    };
  }, []);

  return null;
}
