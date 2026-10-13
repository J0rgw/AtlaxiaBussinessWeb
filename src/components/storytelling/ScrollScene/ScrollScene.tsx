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
  /**
   * Runs `callback` once in the scenes' next frame, after every scene has been
   * measured: for followers that keep moving after the scroll stops (easing).
   * Called while the scene publishes, it runs in that same frame.
   */
  frame: (callback: () => void) => void;
};

const SceneContext = createContext<SceneProgress | null>(null);

/** The progress of the closest ScrollScene, or null outside one. */
export function useSceneProgress(): SceneProgress | null {
  return useContext(SceneContext);
}

/*
  One frame loop for every scene on the page. On scroll or resize, a single
  animation frame first measures all the scenes and only then publishes their
  progress, so their listeners (figures, tracks) write after every read. A
  read after a write would force a style and layout pass in the middle of the
  frame, once per scene.
*/
type Measured = { measure: () => number; publish: (value: number) => void };

const scenes = new Set<Measured>();
let pending: Array<() => void> = [];
let frame = 0;
let publishing = false;

function tick() {
  frame = 0;
  const measured = Array.from(scenes, (scene) => [scene, scene.measure()] as const);
  publishing = true;
  measured.forEach(([scene, value]) => scene.publish(value));
  publishing = false;
  const callbacks = pending;
  pending = [];
  callbacks.forEach((callback) => callback());
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(tick);
}

function track(scene: Measured) {
  if (!scenes.size) {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
  }
  scenes.add(scene);
  scene.publish(scene.measure());
  return () => {
    scenes.delete(scene);
    if (scenes.size) return;
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    pending = [];
  };
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
    frame(callback) {
      pending.push(callback);
      // While the scenes publish, it runs later in this same frame
      if (!publishing) schedule();
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
 * - a subscription (useSceneProgress), for JavaScript (ScrubFigure, ScrubLottie).
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

    let written = "";
    return track({
      measure() {
        const rect = element.getBoundingClientRect();
        const travel = rect.height - window.innerHeight;
        return travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
      },
      publish(value) {
        const text = value.toFixed(4);
        if (text !== written) element.style.setProperty("--scene-progress", text);
        written = text;
        progress.set(value);
      },
    });
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
