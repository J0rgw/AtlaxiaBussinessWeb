"use client";

import { useEffect, useRef, useState } from "react";

const W = 240;
const H = 80;
const POINTS = 60;

function buildSeries(t: number) {
  const out: number[] = [];
  const phase = (t / 4) % 1;
  const inAnomaly = phase > 0.55 && phase < 0.85;
  const anomalyAmp = inAnomaly ? Math.sin(((phase - 0.55) / 0.3) * Math.PI) * 22 : 0;
  const center = H / 2 + 4;
  for (let i = 0; i < POINTS; i++) {
    const x = i + t * 9;
    const wave = Math.sin(x * 0.18) * 5 + Math.sin(x * 0.41 + 1.3) * 2.5;
    const noise = Math.sin(x * 1.7 + t * 0.7) * 1.1;
    let v = center + wave + noise;
    if (inAnomaly && i > POINTS - 16) {
      const k = (i - (POINTS - 16)) / 16;
      v -= anomalyAmp * Math.pow(k, 1.6);
    }
    out.push(v);
  }
  return { values: out, anomaly: inAnomaly };
}

function toPath(values: number[]) {
  const step = W / (values.length - 1);
  return values
    .map((v, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(2)} ${v.toFixed(2)}`)
    .join(" ");
}

export function MiniDetect() {
  const [t, setT] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setT(2.6);
      return;
    }
    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      setT((ts - startRef.current) / 1000);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const { values, anomaly } = buildSeries(t);
  const d = toPath(values);
  const last = values[values.length - 1];
  const stroke = anomaly ? "#f85149" : "#0F100E";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-[80px] block"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="md-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.16" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
        <pattern id="md-grid" width="20" height="16" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 16" fill="none" stroke="#0F100E" strokeOpacity="0.05" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#md-grid)" />
      <path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill="url(#md-fill)" />
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: "stroke 0.2s" }}
      />
      <circle cx={W - 2} cy={last} r="2.5" fill={stroke} />
      {anomaly && (
        <circle cx={W - 2} cy={last} r="9" fill={stroke} fillOpacity="0.2">
          <animate attributeName="r" values="5;12;5" dur="0.7s" repeatCount="indefinite" />
          <animate attributeName="fill-opacity" values="0.32;0;0.32" dur="0.7s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}
