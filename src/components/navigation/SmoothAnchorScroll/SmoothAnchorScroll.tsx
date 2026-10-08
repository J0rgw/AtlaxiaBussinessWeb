"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { getSmoothScroll } from "@/lib/smoothScroll";

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
      const lenis = getSmoothScroll();
      if (lenis) {
        // Same landing point as native anchors: honor the target's scroll-margin-top.
        const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
        lenis.scrollTo(target, { offset: -margin });
      } else {
        target.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "start",
        });
      }

      if (window.location.hash !== `#${id}`) {
        // Keep the router's history state so back and forward keep working.
        window.history.pushState(window.history.state, "", `#${id}`);
      }

      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
