"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/lib/use-in-view";

const W = 240;
const H = 80;
const N = 50;
const NOW = 30;

function build(seed: number) {
  const actual: number[] = [];
  const forecast: number[] = [];
  for (let i = 0; i < N; i++) {
    const x = (i / N) * 5 + seed * 0.04;
    const base = H / 2 + Math.sin(x) * 14 + Math.sin(x * 0.42 + 1.1) * 5;
    if (i <= NOW) actual.push(base + Math.sin(i * 1.3) * 1.0);
    if (i >= NOW) {
      const after = i - NOW;
      const drift = Math.pow(after / 22, 1.4) * 9;
      forecast.push(base - drift + Math.sin(i * 0.8) * 0.7);
    }
  }
  return { actual, forecast };
}

const STEP = W / (N - 1);

function pathAt(values: number[], offsetIdx: number) {
  return values
    .map((v, i) => `${i === 0 ? "M" : "L"} ${((i + offsetIdx) * STEP).toFixed(2)} ${v.toFixed(2)}`)
    .join(" ");
}

export function MiniForecast() {
  const [seed, setSeed] = useState(0);
  const { ref: svgRef, inView } = useInView<SVGSVGElement>();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    if (!inView) return;
    const id = setInterval(() => setSeed((s) => s + 1), 1100);
    return () => clearInterval(id);
  }, [inView]);

  const { actual, forecast } = build(seed);
  const upper = forecast.map((v) => v - 6);
  const lower = forecast.map((v) => v + 6);

  const actualPath = pathAt(actual, 0);
  const forecastPath = pathAt(forecast, NOW);
  const bandPath = `${pathAt(upper, NOW)} ${[...lower]
    .reverse()
    .map((v, i) => {
      const idx = forecast.length - 1 - i;
      return `L ${((idx + NOW) * STEP).toFixed(2)} ${v.toFixed(2)}`;
    })
    .join(" ")} Z`;

  const nowX = NOW * STEP;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-[80px] block"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <pattern id="mf-grid" width="20" height="16" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 16" fill="none" stroke="var(--ink)" strokeOpacity="0.05" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#mf-grid)" />
      <rect x={nowX} y={0} width={W - nowX} height={H} fill="var(--accent-ink)" fillOpacity="0.04" />
      <path d={bandPath} fill="var(--accent-ink)" fillOpacity="0.16" />
      <path d={forecastPath} fill="none" stroke="var(--accent-ink)" strokeWidth="1.5" strokeDasharray="3 3" />
      <path
        d={actualPath}
        fill="none"
        stroke="var(--ink)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1={nowX} x2={nowX} y1={6} y2={H - 6} stroke="var(--ink)" strokeOpacity="0.3" strokeDasharray="1 3" />
      <text
        x={nowX + 4}
        y={12}
        fontFamily="ui-monospace, monospace"
        fontSize="7"
        fill="var(--ink)"
        fillOpacity="0.5"
      >
        ahora
      </text>
    </svg>
  );
}
