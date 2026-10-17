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

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });

    // Lenis's own loop (autoRaf) asks for a frame forever, so an idle page kept
    // rendering 60 frames a second. This one runs only while Lenis animates and
    // wakes on the next wheel gesture or programmatic scroll.
    let frame = 0;
    const loop = (time: number) => {
      // After a pause, count one frame instead of the pause (or of nothing)
      if (!lenis.time) lenis.time = time - 1000 / 60;
      lenis.raf(time);
      if (lenis.isScrolling === "smooth") {
        frame = requestAnimationFrame(loop);
      } else {
        frame = 0;
        lenis.time = 0;
      }
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(loop);
    };
    // Touch scrolling is native (syncTouch off): only the wheel needs the loop
    const stopWaking = lenis.on("virtual-scroll", ({ event }) => {
      if (event.type === "wheel") wake();
    });
    setSmoothScroll(lenis, wake);

    let stopped = false;
    const stop = () => {
      if (stopped) return;
      stopped = true;
      stopWaking();
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
