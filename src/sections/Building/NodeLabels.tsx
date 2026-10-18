"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { CueElement } from "@/components/storytelling/ChoreographedScene";
import styles from "./Building.module.css";

/*
  The names of the graph nodes, as flat HTML over the 3D scene. Text inside
  a tilted layer is rasterized by the browser at whatever density its
  heuristics pick (well below the screen's, in Chrome), so small glyphs come
  out blurred. A flat element is always rasterized at screen density.

  Each label is placed where its node projects in the final state of the
  scene, and takes the local deformation of the graph sheet at that point
  (a flat matrix: the foreshortening and skew the perspective gives the
  sheet there), so it lies on the sheet like the node's ring does. The
  projection repeats the CSS transform chain with a DOMMatrix, so it is
  exact for any size, and runs only on resize.
*/

export type NodeLabel = {
  tag: string;
  letters: string;
  number: string;
  /** Position on the sheet, in % of its width and height. */
  x: number;
  y: number;
};

export type Projection = {
  /** Degrees the sheet tilts back, and the graph above it. */
  tiltDeg: number;
  graphDeg: number;
  /** Final scale and vertical shift (% of the sheet's height) of the tilt cue. */
  scale: number;
  shift: number;
  /** Lift of the graph over the sheet, as a fraction of the sheet's width. */
  lift: number;
  /** transform-origin of the sheet, as fractions of its width and height. */
  origin: readonly [number, number];
};

type NodeLabelsProps = {
  labels: readonly NodeLabel[];
  projection: Projection;
  /** Cue name of the tilted sheet; the perspective container is this element's parent. */
  sheet: string;
};

export function NodeLabels({ labels, projection, sheet: sheetCue }: NodeLabelsProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    const space = host?.parentElement;
    const sheet = space?.querySelector<HTMLElement>(`:scope > [data-cue="${sheetCue}"]`);
    if (!host || !space || !sheet || typeof DOMMatrix === "undefined") return;

    const place = () => {
      const sw = space.offsetWidth;
      const sh = space.offsetHeight;
      const w = sheet.offsetWidth;
      const h = sheet.offsetHeight;
      if (!sw || !sh || !w || !h) return;
      const perspective = parseFloat(getComputedStyle(space).perspective) || 0;
      const [ox, oy] = [projection.origin[0] * w, projection.origin[1] * h];
      // The sheet is centered in the space; perspective-origin is the space's center
      const dx = (sw - w) / 2;
      const dy = (sh - h) / 2;
      const chain = [
        `translate(${sw / 2}px, ${sh / 2}px)`,
        perspective ? `perspective(${perspective}px)` : "",
        `translate(${-sw / 2}px, ${-sh / 2}px)`,
        `translate(${dx}px, ${dy}px)`,
        // The tilt cue, as the engine writes it, around the sheet's transform-origin
        `translate(${ox}px, ${oy}px)`,
        `translate(0px, ${(projection.shift / 100) * h}px)`,
        `scale(${projection.scale})`,
        `rotateX(${projection.tiltDeg}deg)`,
        `translate(${-ox}px, ${-oy}px)`,
        // The lifted graph sheet, counter-tilted around its own center
        `translate(${w / 2}px, ${h / 2}px)`,
        `translateZ(${projection.lift * w}px)`,
        `rotateX(${projection.graphDeg - projection.tiltDeg}deg)`,
        `translate(${-w / 2}px, ${-h / 2}px)`,
      ].join(" ");
      const matrix = new DOMMatrix(chain);
      const project = (x: number, y: number) => {
        const p = matrix.transformPoint(new DOMPoint(x, y, 0, 1));
        return [p.x / p.w, p.y / p.w] as const;
      };
      for (const element of Array.from(host.children) as HTMLElement[]) {
        const x = (Number(element.dataset.x) / 100) * w;
        const y = (Number(element.dataset.y) / 100) * h;
        const [px, py] = project(x, y);
        // Local deformation: how a unit step along the sheet's axes lands on screen
        const [ax, ay] = project(x + 1, y);
        const [bx, by] = project(x, y + 1);
        element.style.left = `${px.toFixed(1)}px`;
        element.style.top = `${py.toFixed(1)}px`;
        element.style.transform = `matrix(${(ax - px).toFixed(4)}, ${(ay - py).toFixed(4)}, ${(bx - px).toFixed(4)}, ${(by - py).toFixed(4)}, 0, 0)`;
      }
      host.dataset.placed = "";
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(space);
    return () => observer.disconnect();
  }, [projection, sheetCue]);

  return (
    <div ref={ref} className={styles.labels} aria-hidden="true">
      {labels.map(({ tag, letters, number, x, y }) => (
        <div
          key={tag}
          className={styles.labelAt}
          data-x={x}
          data-y={y}
          style={{ left: `${x}%`, top: `${y}%` } as CSSProperties}
        >
          <CueElement name={`label-${tag}`} className={styles.label}>
            <span>{letters}</span>
            <span>{number}</span>
          </CueElement>
        </div>
      ))}
    </div>
  );
}
