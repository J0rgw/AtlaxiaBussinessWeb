"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { ProcessFlow, type ProcessFlowProps } from "./ProcessFlow";

export type ProcessFlowRevealProps = Omit<ProcessFlowProps, "activeIndex"> & {
  /** Time between steps while the flow plays, in milliseconds. */
  stepDuration?: number;
};

/**
 * ProcessFlow that plays once when it scrolls into view: steps are reached one
 * after another until the last one. The final state is also what renders
 * without JavaScript, with reduced motion, and when the flow is already visible
 * on load (no replay, no flash).
 */
export function ProcessFlowReveal({ stepDuration = 450, ...props }: ProcessFlowRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const last = props.steps.length - 1;
  const [activeIndex, setActiveIndex] = useState<number | null>(last);

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;

    let timer: ReturnType<typeof setInterval> | undefined;
    let armed = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (!armed) {
          // First report. Already on screen: keep the final state instead of replaying.
          if (entry.isIntersecting) {
            observer.disconnect();
            return;
          }
          armed = true;
          setActiveIndex(null);
          return;
        }
        if (!entry.isIntersecting) return;

        observer.disconnect();
        let index = 0;
        setActiveIndex(index);
        timer = setInterval(() => {
          index += 1;
          setActiveIndex(index);
          if (index >= last) clearInterval(timer);
        }, stepDuration);
      },
      { threshold: 0.35 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [last, stepDuration]);

  return (
    <div ref={ref}>
      <ProcessFlow
        {...props}
        activeIndex={activeIndex}
        // At rest the last step is only highlighted, not "current"
        announceCurrent={activeIndex !== null && activeIndex < last}
      />
    </div>
  );
}
