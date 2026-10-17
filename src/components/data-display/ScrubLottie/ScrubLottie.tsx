"use client";

import { useEffect, useRef, useState } from "react";
import type { AnimationItem } from "lottie-web";
import { useSceneProgress } from "@/components/storytelling/ScrollScene";
import { cx } from "@/lib/cx";
import { createFrameClock, followShare, prefersReducedMotion } from "@/lib/motion";
import { withBasePath } from "@/lib/paths";
import styles from "./ScrubLottie.module.css";

export type ScrubLottieProps = {
  /** Lottie JSON under public/, as an absolute app path ("/animations/x.json"). */
  src: string;
  /**
   * Part of the scene progress that plays the whole animation (0 to 1).
   * Before it the first frame shows, after it the last one.
   */
  range?: readonly [number, number];
  /** Fixed position (0 to 1) instead of following a scene: stills, storyboards. */
  progress?: number;
  /**
   * Where the drawing sits when its box is not the same shape: centered, or
   * at the top left (to line up with a heading above it).
   */
  align?: "center" | "start";
  className?: string;
};

type LottieData = { layers: Array<{ nm?: string }> } & Record<string, unknown>;

/** Easing towards the scroll position per 60 Hz frame (applied per time): 1 follows exactly, lower is smoother. */
const FOLLOW = 0.2;

/**
 * A Lottie animation whose frame is the scroll position: scrubbed, never
 * played on its own. lottie-web (light build, SVG renderer) and the data load
 * only when it gets close to the viewport. The "background" layer that the
 * authoring player needs is dropped, so the page shows through.
 * Decorative: the scene around it carries the text.
 */
export function ScrubLottie({
  src,
  range = [0, 1],
  progress,
  align = "center",
  className,
}: ScrubLottieProps) {
  const ref = useRef<HTMLDivElement>(null);
  const scene = useSceneProgress();
  const [animation, setAnimation] = useState<AnimationItem | null>(null);
  const [from, to] = range;

  // Load once the container is within a viewport of being seen
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let cancelled = false;
    let item: AnimationItem | null = null;

    async function load() {
      const [{ default: lottie }, data] = await Promise.all([
        import("lottie-web/build/player/lottie_light"),
        fetch(withBasePath(src)).then((response) => response.json() as Promise<LottieData>),
      ]);
      if (cancelled || !element) return;
      data.layers = data.layers.filter((layer) => layer.nm !== "background");
      item = lottie.loadAnimation({
        container: element,
        renderer: "svg",
        loop: false,
        autoplay: false,
        animationData: data,
        rendererSettings: {
          preserveAspectRatio: align === "start" ? "xMinYMin meet" : "xMidYMid meet",
        },
      });
      setAnimation(item);
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
      item?.destroy();
      setAnimation(null);
    };
  }, [src, align]);

  // Follow the scene (or the fixed progress)
  useEffect(() => {
    if (!animation) return;
    const last = Math.max(0, animation.totalFrames - 1);
    const toFrame = (value: number) =>
      Math.min(1, Math.max(0, (value - from) / (to - from || 1))) * last;

    if (progress !== undefined || !scene) {
      animation.goToAndStop(toFrame(progress ?? 1), true);
      return;
    }

    let current = toFrame(scene.get());
    let target = current;
    let queued = false;
    let active = true;
    const smooth = !prefersReducedMotion();
    animation.goToAndStop(current, true);

    // One eased step per frame, in the scenes' own frame (after they measure, like ScrubFigure)
    const clock = createFrameClock();
    const step = (time: number) => {
      queued = false;
      if (!active) return;
      current += (target - current) * followShare(FOLLOW, clock.elapsed(time));
      if (Math.abs(target - current) < 0.05) current = target;
      animation.goToAndStop(current, true);
      if (current !== target) {
        queued = true;
        scene.frame(step);
      } else {
        clock.rest();
      }
    };
    const unsubscribe = scene.subscribe((value) => {
      target = toFrame(value);
      if (!smooth) {
        current = target;
        animation.goToAndStop(current, true);
      } else if (!queued && current !== target) {
        queued = true;
        scene.frame(step);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [animation, scene, progress, from, to]);

  return <div ref={ref} className={cx(styles.frame, className)} aria-hidden="true" />;
}
