"use client";

import { useEffect } from "react";
import { easeInOut, easeOut, prefersReducedMotion } from "@/lib/motion";
import { getSmoothScroll } from "@/lib/smoothScroll";

/** Beyond this many viewports a jump cuts to one viewport before the target and glides in. */
const LONG_JUMP = 2.5;

type JumpPlan = {
  /** Distance to cover instantly first (long jumps), in px; 0 when the whole way is animated. */
  cut: number;
  /** Seconds of the animated part. */
  duration: number;
  easing: (t: number) => number;
};

/**
 * How to travel `distance` px (signed). A time-based animation keeps every
 * frame's step small; animating 15 viewports in a second would still move
 * several viewports per frame through the heaviest scenes, so long jumps cut
 * to one viewport before the target and glide the rest.
 */
export function planJump(distance: number, viewport: number): JumpPlan {
  const size = Math.abs(distance);
  if (size > LONG_JUMP * viewport) {
    return { cut: distance - Math.sign(distance) * viewport, duration: 0.9, easing: easeOut };
  }
  const duration = Math.min(1.2, Math.max(0.6, 0.45 + (0.25 * size) / viewport));
  return { cut: 0, duration, easing: easeInOut };
}

function isPlainLeftClick(event: MouseEvent) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/**
 * Smooth scrolling for every same-page anchor (`href="#id"`), with one delegated
 * listener. CSS `scroll-behavior: smooth` stays as the no-JS fallback; this makes
 * the behavior independent of the browser and framework handling of fragments.
 *
 * It also moves focus to the target (without a second jump), so keyboard and
 * screen reader users continue from the section they asked for.
 * Honors prefers-reduced-motion. Renders nothing.
 */
export function SmoothAnchorScroll() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || !isPlainLeftClick(event)) return;
      const link = (event.target as Element | null)?.closest?.("a[href^='#']");
      if (!(link instanceof HTMLAnchorElement)) return;

      const id = decodeURIComponent(link.hash.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (!target) return;

      event.preventDefault();
      if (window.location.hash !== `#${id}`) {
        // Before moving: the entry being left keeps the position the reader was at,
        // so Back returns there (not to the end of a long jump's cut).
        // Keep the router's history state so back and forward keep working.
        window.history.pushState(window.history.state, "", `#${id}`);
      }

      const lenis = getSmoothScroll();
      if (lenis) {
        // Same landing as native anchors: the target's scroll-margin-top and the root's
        // scroll-padding-top, measured once and passed to Lenis as a position.
        const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
        const padding =
          parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
        const distance = target.getBoundingClientRect().top - margin - padding;
        const start = lenis.animatedScroll;
        const { cut, duration, easing } = planJump(distance, window.innerHeight);
        if (cut) lenis.scrollTo(start + cut, { immediate: true });
        lenis.scrollTo(start + distance, { duration, easing });
      } else {
        target.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "start",
        });
      }

      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
