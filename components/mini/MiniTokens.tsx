"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/lib/use-in-view";

const W = 240;
const H = 80;

const nodes = [
  { x: 22, y: 28 },
  { x: 56, y: 54 },
  { x: 90, y: 18 },
  { x: 120, y: 44 },
  { x: 150, y: 24 },
  { x: 180, y: 56 },
  { x: 215, y: 32 },
  { x: 78, y: 14 },
  { x: 200, y: 14 },
];

const edges: [number, number][] = [
  [0, 1],
  [1, 3],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [4, 6],
  [2, 7],
  [7, 0],
  [6, 8],
  [8, 4],
  [1, 2],
];

export function MiniTokens() {
  const [active, setActive] = useState(0);
  const { ref: svgRef, inView } = useInView<SVGSVGElement>();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    if (!inView) return;
    const id = setInterval(() => setActive((a) => (a + 1) % nodes.length), 700);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-[80px] block"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <pattern id="mt-grid" width="20" height="16" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 16" fill="none" stroke="var(--ink)" strokeOpacity="0.05" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#mt-grid)" />

      {edges.map(([a, b], i) => {
        const isActive = a === active || b === active;
        return (
          <line
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke={isActive ? "var(--accent-ink)" : "var(--ink)"}
            strokeOpacity={isActive ? 0.55 : 0.16}
            strokeWidth="0.9"
            style={{ transition: "stroke 0.35s, stroke-opacity 0.35s" }}
          />
        );
      })}

      {nodes.map((n, i) => {
        const isActive = i === active;
        return (
          <g key={i}>
            {isActive && (
              <circle cx={n.x} cy={n.y} r="6" fill="var(--accent-ink)" fillOpacity="0.16">
                <animate attributeName="r" values="4;13;4" dur="1.1s" repeatCount="indefinite" />
                <animate attributeName="fill-opacity" values="0.32;0;0.32" dur="1.1s" repeatCount="indefinite" />
              </circle>
            )}
            <circle
              cx={n.x}
              cy={n.y}
              r={isActive ? 3 : 2}
              fill={isActive ? "var(--accent-ink)" : "var(--ink)"}
              style={{ transition: "fill 0.35s" }}
            />
          </g>
        );
      })}
    </svg>
  );
}
