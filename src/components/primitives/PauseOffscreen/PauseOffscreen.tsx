"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";

export type PauseOffscreenProps = ComponentPropsWithoutRef<"div">;

/**
 * A plain div that carries `data-paused` while it is off screen, so the CSS of
 * a looping illustration can stop its animations there (for example
 * `.frame[data-paused] * { animation-play-state: paused }`). A loop nobody
 * sees would otherwise keep the whole page rendering every frame.
 */
export function PauseOffscreen(props: PauseOffscreenProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      // The latest entry wins when one callback reports several crossings
      const entry = entries.at(-1);
      if (entry) element.toggleAttribute("data-paused", !entry.isIntersecting);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} {...props} />;
}
