"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/lib/use-in-view";

const W = 760;
const H = 280;
const PAD = { left: 56, right: 24, top: 18, bottom: 30 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

const Y_MIN = 234;
const Y_MAX = 270;

const yTicks = [270, 263, 256, 249, 241, 234];

const xLabels = [
  { label: "12:00", x: 0.16 },
  { label: "13:00", x: 0.42 },
  { label: "14:00", x: 0.68 },
  { label: "15:00", x: 0.94 },
];

const samples: { x: number; v: number }[] = [
  { x: 0.04, v: 241.2 },
  { x: 0.08, v: 240.6 },
  { x: 0.12, v: 239.8 },
  { x: 0.15, v: 235.4 },
  { x: 0.18, v: 240.9 },
  { x: 0.21, v: 252.7 },
  { x: 0.24, v: 261.4 },
  { x: 0.27, v: 266.8 },
  { x: 0.30, v: 267.1 },
  { x: 0.33, v: 261.5 },
  { x: 0.37, v: 257.0 },
  { x: 0.42, v: 255.4 },
  { x: 0.47, v: 253.8 },
  { x: 0.52, v: 254.6 },
  { x: 0.57, v: 253.1 },
  { x: 0.62, v: 254.9 },
  { x: 0.67, v: 253.5 },
  { x: 0.72, v: 252.6 },
  { x: 0.77, v: 254.0 },
  { x: 0.82, v: 253.4 },
  { x: 0.87, v: 254.1 },
  { x: 0.92, v: 253.7 },
  { x: 0.96, v: 253.96 },
];

const ANOMALY_INDEX = 7;
const EXPECTED_AT_PEAK = 245.2;

const TIME_PILLS = ["1m", "5m", "15m", "1h", "5h", "24h", "7d", "30d"];

function project(x: number, v: number) {
  const px = PAD.left + x * PLOT_W;
  const py = PAD.top + ((Y_MAX - v) / (Y_MAX - Y_MIN)) * PLOT_H;
  return { px, py };
}

const linePath = samples
  .map((s, i) => {
    const { px, py } = project(s.x, s.v);
    return `${i === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`;
  })
  .join(" ");

const areaPath = (() => {
  const top = samples
    .map((s, i) => {
      const { px, py } = project(s.x, s.v);
      return `${i === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`;
    })
    .join(" ");
  const lastPx = project(samples[samples.length - 1].x, Y_MIN).px.toFixed(2);
  const firstPx = project(samples[0].x, Y_MIN).px.toFixed(2);
  const bottomY = (PAD.top + PLOT_H).toFixed(2);
  return `${top} L ${lastPx} ${bottomY} L ${firstPx} ${bottomY} Z`;
})();

const anomalyActual = project(samples[ANOMALY_INDEX].x, samples[ANOMALY_INDEX].v);
const anomalyExpected = project(samples[ANOMALY_INDEX].x, EXPECTED_AT_PEAK);

export function LiveSensorChart() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [reading, setReading] = useState(253.96);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!inView) return;
    const id = setInterval(() => {
      setReading((r) => {
        const next = r + (Math.random() - 0.5) * 0.35;
        return Math.max(253.1, Math.min(254.9, next));
      });
    }, 1100);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <div ref={ref} className="bg-cream-elevated text-cream-ink">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 sm:px-5 py-3 border-b border-cream-line">
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[12px] px-2 py-1 rounded-sm border border-cream-line bg-cream-inset text-cream-ink tabular">
            AIT203
          </span>
          <span className="font-mono text-[11px] text-cream-mute2">(uS/cm)</span>
          <span
            className="ml-1 font-display text-[20px] text-cream-ink tracking-tighter2 tabular-nums inline-block text-right"
            style={{ minWidth: "5.6ch", fontVariantNumeric: "tabular-nums" }}
          >
            {reading.toFixed(2)}
          </span>
          <span className="font-mono text-[11px] text-cream-mute2">uS/cm</span>
        </div>

        <div
          className="hidden md:flex shrink-0 items-center rounded-sm border border-cream-line bg-cream-inset overflow-hidden"
          role="group"
          aria-label="Rango temporal"
        >
          {TIME_PILLS.map((p) => {
            const selected = p === "5h";
            return (
              <span
                key={p}
                aria-pressed={selected}
                className={[
                  "px-2 py-1 font-mono text-[11px] tabular border-r border-cream-line last:border-r-0 select-none",
                  selected
                    ? "bg-cream-elevated text-cream-ink"
                    : "text-cream-mute2",
                ].join(" ")}
              >
                {p}
              </span>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-3 text-cream-mute2">
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden>
              <path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12h10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            CSV
          </span>
          <span aria-hidden>
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
              <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10.4 10.4l3.1 3.1M7 5v4M5 7h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            </svg>
          </span>
        </div>
      </div>

      <div
        className="relative"
        role="img"
        aria-label="Conductividad AIT203 a 5 horas. La señal real sube hasta el pico; el marcador rojo señala el valor que el modelo esperaba en ese mismo instante."
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full aspect-[760/280] block">
          {yTicks.map((y) => {
            const py = project(0, y).py;
            return (
              <line
                key={y}
                x1={PAD.left}
                x2={W - PAD.right}
                y1={py}
                y2={py}
                stroke="var(--line2)"
                strokeWidth="1"
                strokeDasharray="4 5"
              />
            );
          })}

          <path d={areaPath} fill="var(--accent-soft)" fillOpacity="0.75" />
          <path
            d={linePath}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {samples.map((s, i) => {
            const { px, py } = project(s.x, s.v);
            const isLast = i === samples.length - 1;
            return (
              <circle
                key={i}
                cx={px}
                cy={py}
                r={isLast ? 3 : 2.5}
                fill="var(--bg-elevated)"
                stroke="var(--accent)"
                strokeWidth="1.6"
              />
            );
          })}

          <line
            x1={anomalyActual.px}
            x2={anomalyExpected.px}
            y1={anomalyActual.py}
            y2={anomalyExpected.py}
            stroke="var(--status-critical)"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.75"
          />
          <circle
            cx={anomalyExpected.px}
            cy={anomalyExpected.py}
            r="9"
            fill="var(--status-critical)"
            fillOpacity="0.18"
          >
            <animate attributeName="r" values="8;14;8" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="fill-opacity" values="0.22;0;0.22" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle
            cx={anomalyExpected.px}
            cy={anomalyExpected.py}
            r="3.6"
            fill="var(--status-critical)"
            stroke="var(--bg-elevated)"
            strokeWidth="1.4"
          />

          {yTicks.map((y) => {
            const py = project(0, y).py;
            return (
              <text
                key={`yl-${y}`}
                x={PAD.left - 10}
                y={py + 3.5}
                textAnchor="end"
                fontFamily="var(--font-jetbrains-mono), ui-monospace, monospace"
                fontSize="10"
                fill="var(--mute2)"
              >
                {y}
              </text>
            );
          })}

          {xLabels.map((l) => (
            <text
              key={l.label}
              x={PAD.left + l.x * PLOT_W}
              y={H - 10}
              textAnchor="middle"
              fontFamily="var(--font-jetbrains-mono), ui-monospace, monospace"
              fontSize="10"
              fill="var(--mute2)"
            >
              {l.label}
            </text>
          ))}
        </svg>

        <div
          aria-hidden
          className="absolute font-mono text-[10px] leading-tight pointer-events-none"
          style={{
            left: `${((anomalyExpected.px + 10) / W) * 100}%`,
            top: `${((anomalyExpected.py + 8) / H) * 100}%`,
          }}
        >
          <div style={{ color: "var(--status-critical)" }} className="font-semibold">
            modelo {EXPECTED_AT_PEAK.toFixed(1)}
          </div>
          <div className="text-cream-mute2">esperado en el pico</div>
        </div>
      </div>
    </div>
  );
}
