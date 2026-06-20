"use client";

import { useEffect, useRef, useState } from "react";
import { StatusPill } from "./StatusPill";
import { useInView } from "@/lib/use-in-view";

type Status = "normal" | "advisory" | "warning" | "critical";

const W = 520;
const H = 220;
const POINTS = 80;
const BASE = 110;
const AMPLITUDE = 18;

function genSeed(t: number, anomaly: number) {
  const arr: number[] = [];
  for (let i = 0; i < POINTS; i++) {
    const x = (i + t) * 0.18;
    const drift = Math.sin(x) * AMPLITUDE + Math.sin(x * 0.43) * 6;
    const noise = Math.sin(x * 5.2 + t * 0.07) * 2.8;
    let v = BASE + drift + noise;
    if (anomaly > 0 && i > POINTS - 28) {
      const k = (i - (POINTS - 28)) / 28;
      v += anomaly * 36 * Math.pow(k, 1.6);
    }
    arr.push(v);
  }
  return arr;
}

function pathFrom(values: number[]) {
  const step = W / (POINTS - 1);
  return values
    .map((v, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(2)} ${v.toFixed(2)}`)
    .join(" ");
}

const cycleStages: { at: number; status: Status; label: string; anomaly: number }[] = [
  { at: 0, status: "normal", label: "Nominal", anomaly: 0 },
  { at: 2.2, status: "advisory", label: "Deriva detectada", anomaly: 0.35 },
  { at: 3.6, status: "warning", label: "Cruce previsto en 11m", anomaly: 0.7 },
  { at: 5.0, status: "critical", label: "Anomalía pump-3", anomaly: 1 },
];

export function AnomalyLiveDemo() {
  const [t, setT] = useState(0);
  const [stage, setStage] = useState(0);
  const [clock, setClock] = useState<string>("--:--:--");
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const { ref: containerRef, inView } = useInView<HTMLDivElement>();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setT(40);
      setStage(3);
      return;
    }
    if (!inView) return;

    const fmt = () => {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    };
    setClock(fmt());
    const clockId = setInterval(() => setClock(fmt()), 1000);

    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = (ts - startRef.current) / 1000;
      setT(elapsed * 8);
      const cycle = elapsed % 7;
      let s = 0;
      for (let i = 0; i < cycleStages.length; i++) {
        if (cycle >= cycleStages[i].at) s = i;
      }
      setStage(s);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      clearInterval(clockId);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
    };
  }, [inView]);

  const stageData = cycleStages[stage];
  const series = genSeed(t, stageData.anomaly);
  const d = pathFrom(series);
  const last = series[series.length - 1];
  const lastX = W;
  const statusColor = {
    normal: "var(--status-normal)",
    advisory: "var(--status-advisory)",
    warning: "var(--status-warning)",
    critical: "var(--status-critical)",
  }[stageData.status];

  return (
    <div
      ref={containerRef}
      className="relative bg-bg-base text-text-primary overflow-hidden"
      role="img"
      aria-label="Demostración en directo: caudal del pump-3 escalando de nominal a anomalía crítica en un bucle de 7 segundos."
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle text-xs font-mono">
        <div className="flex items-center gap-3 text-text-secondary">
          <span className="text-text-primary">pump-3.flow_rate</span>
          <span className="text-text-muted">L/min</span>
        </div>
        <div className="flex items-center gap-3 text-text-muted">
          <span className="tabular">{clock}</span>
          <span className="size-1.5 rounded-full bg-status-normal animate-pulse" aria-hidden />
          <span>1Hz</span>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full aspect-[520/220] block">
          <defs>
            <linearGradient id="series-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={statusColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={statusColor} stopOpacity="0" />
            </linearGradient>
            <pattern id="grid" width="40" height="32" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 32" fill="none" stroke="var(--chart-grid)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#grid)" />
          <line x1="0" x2={W} y1={BASE - 38} y2={BASE - 38} stroke="var(--chart-baseline)" strokeDasharray="3 4" strokeWidth="1" />
          <path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill="url(#series-fill)" />
          <path d={d} fill="none" stroke={statusColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={lastX} cy={last} r="3.5" fill={statusColor} />
          <circle cx={lastX} cy={last} r="9" fill={statusColor} fillOpacity="0.18">
            <animate attributeName="r" values="6;14;6" dur="1.4s" repeatCount="indefinite" />
            <animate attributeName="fill-opacity" values="0.28;0;0.28" dur="1.4s" repeatCount="indefinite" />
          </circle>
        </svg>

        <span
          aria-hidden
          className="absolute font-mono text-[10px] text-text-secondary pointer-events-none"
          style={{ left: "1.2%", top: `${((BASE - 48) / H) * 100}%` }}
        >
          umbral estático
        </span>

        <div className="absolute top-3 left-3">
          <StatusPill status={stageData.status} label={stageData.label} />
        </div>

        <div className="absolute bottom-3 right-3 text-right font-mono">
          <div className="text-[10px] uppercase tracking-wider text-text-muted">Lectura</div>
          <div className="text-lg tabular text-text-primary">{last.toFixed(1)}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border-subtle border-t border-border-subtle text-xs">
        <Stat label="Sensores" value="2.148" />
        <Stat label="Latencia" value="0.3s" />
        <Stat label="Modelos activos" value="11" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-2.5 flex items-center justify-between">
      <span className="text-text-muted uppercase tracking-wide text-[10px] font-mono">{label}</span>
      <span className="font-mono tabular text-text-primary">{value}</span>
    </div>
  );
}
