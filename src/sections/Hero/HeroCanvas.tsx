"use client";

import { useEffect, useRef, type ReactNode } from "react";

type HeroCanvasProps = {
  className?: string;
  children: ReactNode;
};

/**
 * Wrapper for the hero drawing that pauses its looping animations while it is
 * off screen, so the page does not keep painting a backdrop nobody sees.
 */
export function HeroCanvas({ className, children }: HeroCanvasProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      element.toggleAttribute("data-paused", !entry.isIntersecting);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} aria-hidden="true">
      {children}
    </div>
  );
}
