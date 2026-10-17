"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { cx } from "@/lib/cx";
import styles from "./PauseOffscreen.module.css";

export type PauseOffscreenProps = ComponentPropsWithoutRef<"div">;

/**
 * A plain div whose CSS animations pause while it is off screen, so a looping
 * illustration does not keep the whole page rendering where nobody sees it.
 * The state is also on the element (`data-paused`) for scripts inside it.
 */
export function PauseOffscreen({ className, ...props }: PauseOffscreenProps) {
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

  return <div ref={ref} className={cx(styles.root, className)} {...props} />;
}
