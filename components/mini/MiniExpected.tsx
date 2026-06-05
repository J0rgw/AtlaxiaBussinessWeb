"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/lib/use-in-view";

const W = 240;
const H = 80;
const POINTS = 60;

function buildSeries(t: number) {
  const out: number[] = [];
  const phase = (t / 4) % 1;
  const inAnomaly = phase > 0.45 && phase < 0.95;
  const center = H / 2 + 4;
  for (let i = 0; i < POINTS; i++) {
    const x = i + t * 9;
    const wave = Math.sin(x * 0.18) * 5 + Math.sin(x * 0.41 + 1.3) * 2.5;
    const noise = Math.sin(x * 1.7 + t * 0.7) * 1.0;
    let v = center + wave + noise;
    if (inAnomaly && i > POINTS - 18) {
      const k = (i - (POINTS - 18)) / 18;
      const amp = Math.sin(((phase - 0.45) / 0.5) * Math.PI) * 20;
      v -= amp * Math.pow(k, 1.5);
    }
    out.push(v);
  }
  const last = out[out.length - 1];
  const baseline = center + Math.sin((POINTS + t * 9) * 0.18) * 5
    + Math.sin((POINTS + t * 9) * 0.41 + 1.3) * 2.5;
  return { values: out, expected: baseline, last, anomaly: inAnomaly };
}

function toPath(values: number[]) {
  const step = W / (values.length - 1);
  return values
    .map((v, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(2)} ${v.toFixed(2)}`)
    .join(" ");
}

export function MiniExpected() {
  const [t, setT] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const { ref: svgRef, inView } = useInView<SVGSVGElement>();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setT(2.4);
      return;
    }
    if (!inView) return;
    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      setT((ts - startRef.current) / 1000);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
    };
  }, [inView]);

  const { values, expected, last, anomaly } = buildSeries(t);
  const d = toPath(values);
  const lastX = W - 2;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full aspect-[3/1] block"
      aria-hidden
    >
      <defs>
        <pattern id="me-grid" width="20" height="16" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 16" fill="none" stroke="var(--ink)" strokeOpacity="0.05" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#me-grid)" />

      <path
        d={d}
        fill="none"
        stroke="var(--ink)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <line
        x1={lastX}
        x2={lastX}
        y1={last}
        y2={expected}
        stroke="var(--status-critical)"
        strokeWidth="1"
        strokeDasharray="2 2"
        opacity={anomaly ? 0.85 : 0.35}
        style={{ transition: "opacity 0.25s" }}
      />

      <circle cx={lastX} cy={last} r="2.5" fill="var(--ink)" />

      {anomaly && (
        <circle cx={lastX} cy={expected} r="6" fill="var(--status-critical)" fillOpacity="0.2">
          <animate attributeName="r" values="5;11;5" dur="1.4s" repeatCount="indefinite" />
          <animate attributeName="fill-opacity" values="0.28;0;0.28" dur="1.4s" repeatCount="indefinite" />
        </circle>
      )}
      <circle
        cx={lastX}
        cy={expected}
        r="2.6"
        fill="var(--status-critical)"
        stroke="var(--bg-elevated)"
        strokeWidth="1"
      />
    </svg>
  );
}
