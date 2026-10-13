"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useSceneProgress } from "@/components/storytelling/ScrollScene";
import { cx } from "@/lib/cx";
import { prefersReducedMotion } from "@/lib/motion";
import { withBasePath } from "@/lib/paths";
import { createPlayer, type Player, type Timeline } from "./player";
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

/** Easing towards the scroll position per frame: 1 follows exactly, lower is smoother. */
const FOLLOW = 0.2;

/**
 * An isometric "anatomy" figure (scripts/anatomy) whose state is the scroll
 * position: the scene's progress drives its whole timeline (parts appear,
 * pipes are laid, relations draw on, and the fan, the flow and the turbine
 * move with it), so the figure is still whenever the page is. The SVG and its
 * timeline load when it gets close to the viewport. Decorative: the scene
 * carries the text. Reduced motion: the final state.
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

  // Load once the box is within a viewport of being seen
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let cancelled = false;

    async function load() {
      const [markup, timeline] = await Promise.all([
        fetch(withBasePath(`${src}.svg`)).then((response) => response.text()),
        fetch(withBasePath(`${src}.json`)).then((response) => response.json() as Promise<Timeline>),
      ]);
      if (cancelled || !element) return;
      // Static file built by scripts/anatomy from our own geometry
      element.innerHTML = markup;
      const svg = element.querySelector("svg");
      if (!svg) return;
      svg.removeAttribute("role");
      svg.removeAttribute("aria-label");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
      svg.setAttribute(
        "preserveAspectRatio",
        align === "start" ? "xMinYMin meet" : "xMidYMid meet",
      );
      setPlayer(createPlayer(svg, timeline));
    }

    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              if (!entry?.isIntersecting) return;
              observer?.disconnect();
              void load();
            },
            { rootMargin: "100% 0px" },
          );
    observer?.observe(element);

    return () => {
      cancelled = true;
      observer?.disconnect();
      element.replaceChildren();
      setPlayer(null);
    };
  }, [src, align]);

  // Follow the scene (or the fixed progress)
  useEffect(() => {
    if (!player) return;
    const toProgress = (value: number) =>
      Math.min(1, Math.max(0, (value - from) / (to - from || 1)));

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
    const step = () => {
      queued = false;
      if (!active) return;
      current += (target - current) * FOLLOW;
      if (Math.abs(target - current) < 0.0005) current = target;
      player.seek(current);
      if (current !== target) {
        queued = true;
        scene.frame(step);
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
