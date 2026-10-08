"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { useSceneProgress } from "./ScrollScene";

export type ScrollTrackProps = {
  /**
   * Where the first item starts, in items before the center: 0.55 means it
   * enters a little more than half a step to the right of the center.
   */
  start?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/**
 * A horizontal track moved by the vertical scroll of its ScrollScene. Items
 * keep their own width and a fixed gap; the track is measured and placed so
 * that item i is centered at progress (start + i) / (start + items - 1).
 * Writes `translate` directly, no re-render. Static (no translate) with
 * reduced motion or without a scene.
 */
export function ScrollTrack({ start = 0.55, className, style, children }: ScrollTrackProps) {
  const ref = useRef<HTMLUListElement>(null);
  const scene = useSceneProgress();

  useEffect(() => {
    const track = ref.current;
    // Reduced motion: the scene lays out statically, the track stays in the flow
    if (!track || !scene || prefersReducedMotion()) return;

    let centers: number[] = [];
    let width = 0;

    const measure = () => {
      centers = Array.from(track.children, (child) => {
        const item = child as HTMLElement;
        return item.offsetLeft + item.offsetWidth / 2;
      });
      width = track.parentElement?.clientWidth ?? window.innerWidth;
    };

    const place = (progress: number) => {
      const count = centers.length;
      if (count === 0) return;
      const first = centers[0]!;
      const step = (centers[1] ?? first + width) - first;
      // Position along the items: -start before the first, count - 1 at the last
      const at = progress * (start + count - 1) - start;
      let x: number;
      if (at <= 0) {
        x = first + at * step;
      } else {
        const i = Math.min(Math.floor(at), count - 2);
        const from = centers[Math.max(i, 0)]!;
        const to = centers[Math.max(i, 0) + 1] ?? from;
        x = from + (at - i) * (to - from);
      }
      track.style.translate = `${(width / 2 - x).toFixed(1)}px 0`;
    };

    measure();
    place(scene.get());
    const unsubscribe = scene.subscribe(place);
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            measure();
            place(scene.get());
          });
    observer?.observe(track);

    return () => {
      unsubscribe();
      observer?.disconnect();
      track.style.translate = "";
    };
  }, [scene, start]);

  return (
    <ul ref={ref} role="list" className={className} style={style}>
      {children}
    </ul>
  );
}
