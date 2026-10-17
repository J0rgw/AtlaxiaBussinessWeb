"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useSceneProgress } from "@/components/storytelling/ScrollScene";
import { cx } from "@/lib/cx";
import { prefersReducedMotion } from "@/lib/motion";
import { queueFigure } from "./loader";
import { createPlayer, type Player } from "./player";
import styles from "./ScrubFigure.module.css";

export type ScrubFigureProps = {
  /**
   * Base path of an anatomy figure under public/, without extension
   * ("/animations/anatomy/sector-water"): its .svg and .json timeline.
   */
  src: string;
  /** Part of the scene progress that plays the whole figure (0 to 1). */
  range?: readonly [number, number];
  /** Fixed position (0 to 1) instead of following a scene: stills, storyboards. */
  progress?: number;
  /** Width / height of the figure's viewBox, so the box is sized before it loads. */
  aspect?: number;
  /** Where the drawing sits when its box is not the same shape. */
  align?: "center" | "start";
  className?: string;
};

/**
 * Easing towards the scroll position, per 60 Hz frame: 1 follows exactly, lower
 * is smoother. Applied per elapsed time, so the figure trails the page the same
 * at 60 or 120 Hz and does not stall when a frame is dropped.
 */
const FOLLOW = 0.2;
const FRAME_MS = 1000 / 60;

/** A scene progress mapped to the part of it that plays the figure, 0 to 1. */
const within = (value: number, from: number, to: number) =>
  Math.min(1, Math.max(0, (value - from) / (to - from || 1)));

/**
 * An isometric "anatomy" figure (scripts/anatomy) whose state is the scroll
 * position: the scene's progress drives its whole timeline (parts appear,
 * pipes are laid, relations draw on, and the fan, the flow and the turbine
 * move with it), so the figure is still whenever the page is. The SVG and its
 * timeline load off the scroll path (./loader): at idle time once the page has
 * loaded, one figure at a time, or right away when the box nears the viewport.
 * Decorative: the scene carries the text. Reduced motion: the final state.
 */
export function ScrubFigure({
  src,
  range = [0, 1],
  progress,
  aspect = 3 / 2,
  align = "center",
  className,
}: ScrubFigureProps) {
  const ref = useRef<HTMLDivElement>(null);
  const scene = useSceneProgress();
  const [player, setPlayer] = useState<Player | null>(null);
  const [from, to] = range;

  // Where the figure is when it arrives: the position the follower seeks first
  const position = useRef<() => number>(() => 1);
  useEffect(() => {
    position.current = () => within(progress ?? (scene ? scene.get() : 1), from, to);
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const figure = queueFigure(src, (svg, timeline) => {
      svg.removeAttribute("role");
      svg.removeAttribute("aria-label");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
      svg.setAttribute(
        "preserveAspectRatio",
        align === "start" ? "xMinYMin meet" : "xMidYMid meet",
      );
      const next = createPlayer(svg, timeline);
      // Seeked before it enters the page, so the parts not shown yet never render
      next.seek(position.current());
      element.replaceChildren(svg);
      setPlayer(next);
    });

    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              if (!entry?.isIntersecting) return;
              observer?.disconnect();
              figure.near();
            },
            { rootMargin: "100%" },
          );
    observer?.observe(element);

    return () => {
      figure.cancel();
      observer?.disconnect();
      element.replaceChildren();
      setPlayer(null);
    };
  }, [src, align]);

  // Follow the scene (or the fixed progress)
  useEffect(() => {
    if (!player) return;
    const toProgress = (value: number) => within(value, from, to);

    if (progress !== undefined || !scene) {
      player.seek(toProgress(progress ?? 1));
      return;
    }

    let current = toProgress(scene.get());
    let target = current;
    let queued = false;
    let active = true;
    const smooth = !prefersReducedMotion();
    player.seek(current);

    // One eased step per frame, in the scenes' own frame (after they measure)
    let last = 0;
    const step = () => {
      queued = false;
      if (!active) return;
      const now = performance.now();
      // The first step of a movement counts as one frame; a long stall as four at most
      const frames = last ? Math.min(4, (now - last) / FRAME_MS) : 1;
      last = now;
      current += (target - current) * (1 - (1 - FOLLOW) ** frames);
      if (Math.abs(target - current) < 0.0005) current = target;
      player.seek(current);
      if (current !== target) {
        queued = true;
        scene.frame(step);
      } else {
        last = 0;
      }
    };
    const unsubscribe = scene.subscribe((value) => {
      target = toProgress(value);
      if (!smooth) {
        current = target;
        player.seek(current);
      } else if (!queued && current !== target) {
        queued = true;
        scene.frame(step);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [player, scene, progress, from, to]);

  return (
    <div
      ref={ref}
      className={cx(styles.frame, className)}
      style={{ "--figure-aspect": aspect } as CSSProperties}
      aria-hidden="true"
    />
  );
}
