"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cx } from "@/lib/cx";
import { prefersReducedMotion } from "@/lib/motion";
import styles from "./ScrollScene.module.css";

/** Progress of the scene through the viewport, from 0 (pinned) to 1 (about to leave). */
export type SceneProgress = {
  get: () => number;
  subscribe: (listener: (progress: number) => void) => () => void;
};

const SceneContext = createContext<SceneProgress | null>(null);

/** The progress of the closest ScrollScene, or null outside one. */
export function useSceneProgress(): SceneProgress | null {
  return useContext(SceneContext);
}

function createProgress(): SceneProgress & { set: (value: number) => void } {
  let value = 0;
  const listeners = new Set<(progress: number) => void>();
  return {
    get: () => value,
    set(next) {
      if (next === value) return;
      value = next;
      listeners.forEach((listener) => listener(next));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export type ScrollSceneProps = {
  /** Scroll length of the scene, in viewport heights. The stage stays pinned meanwhile. */
  length?: number;
  className?: string;
  /** Class for the pinned stage (one viewport tall), where the layout lives. */
  stageClassName?: string;
  children: ReactNode;
};

/**
 * A pinned stage that tells a story while the page scrolls past it.
 * Publishes its progress (0 to 1) two ways, so nothing re-renders per frame:
 * - the `--scene-progress` custom property, for CSS (ParallaxLayer, cues);
 * - a subscription (useSceneProgress), for JavaScript (ScrubLottie).
 * Reduced motion: no pinning, the stage shows its final state in the flow.
 */
export function ScrollScene({ length = 3, className, stageClassName, children }: ScrollSceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress] = useState(createProgress);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Reduced motion: a styling switch on the element, no re-render needed
    if (prefersReducedMotion()) {
      element.dataset.static = "";
      progress.set(1);
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const value = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
      element.style.setProperty("--scene-progress", value.toFixed(4));
      progress.set(value);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [progress]);

  return (
    <SceneContext.Provider value={progress}>
      <div
        ref={ref}
        className={cx(styles.scene, className)}
        style={{ "--scene-length": length } as CSSProperties}
      >
        <div className={cx(styles.stage, stageClassName)}>{children}</div>
      </div>
    </SceneContext.Provider>
  );
}
