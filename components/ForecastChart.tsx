"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/lib/use-in-view";

const W = 720;
const H = 280;
const N = 72;

function build(seed: number) {
  const actual: number[] = [];
  const forecast: number[] = [];
  for (let i = 0; i < N; i++) {
    const x = (i / N) * 6;
    const base = 130 + Math.sin(x + seed * 0.05) * 22 + Math.sin(x * 0.3) * 10;
    actual.push(base + Math.sin(i * 1.3) * 1.6);
    const div = i > 40 ? Math.pow((i - 40) / 32, 1.6) * 32 : 0;
    forecast.push(base + div + Math.sin(i * 0.7) * 1.2);
  }
  return { actual, forecast };
}

function toPath(values: number[]) {
  return values
    .map((v, i) => `${i === 0 ? "M" : "L"} ${((i / (N - 1)) * W).toFixed(1)} ${v.toFixed(1)}`)
    .join(" ");
}

export function ForecastChart() {
  const [seed, setSeed] = useState(0);
  const { ref: sectionRef, inView } = useInView<HTMLElement>();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    if (!inView) return;
    const id = setInterval(() => setSeed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [inView]);

  const { actual, forecast } = build(seed);
  const upper = forecast.map((v) => v - 14);
  const lower = forecast.map((v) => v + 14);

  const actualPath = toPath(actual);
  const forecastPath = toPath(forecast);
  const bandPath = `${toPath(upper)} ${[...lower].reverse().map((v, i) => {
    const idx = N - 1 - i;
    return `L ${((idx / (N - 1)) * W).toFixed(1)} ${v.toFixed(1)}`;
  }).join(" ")} Z`;

  const divergeX = ((40 / (N - 1)) * W).toFixed(1);

  return (
    <section ref={sectionRef} id="forecasting" className="border-t border-cream-line bg-cream-inset">
      <div className="container-x py-24 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5">
          <p className="eyebrow">02 · Predicción</p>
          <h2 className="h-section text-cream-ink mt-4">
            Vemos la incidencia
            <br />
            <span className="font-normal">
              once minutos antes
            </span>
            <br />
            que el umbral.
          </h2>
          <p className="mt-6 text-[16px] text-cream-ink2 leading-relaxed">
            AtlaXia predice los próximos 30 minutos de cada sensor desde el contexto
            espacio-temporal del GNN. Cuando la banda prevista se separa de la traza real, tienes
            ventaja, mucho antes de que cualquier sistema basado en reglas alertara.
          </p>
          <ul className="mt-8 space-y-3.5 text-[14px]">
            <Bullet color="var(--status-advisory)" label="Banda prevista" desc="Predicción STGNN con banda de confianza" />
            <Bullet color="var(--ink)" label="Real en directo" desc="Flujo del historian a 1 Hz" />
            <Bullet color="var(--status-critical)" label="Divergencia" desc="La predicción se separa del real en t+11m" />
          </ul>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-card ring-1 ring-cream-line bg-cream-elevated overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-cream-line text-[11px] font-mono">
              <div className="flex items-center gap-3 text-cream-ink2">
                <span className="text-cream-ink font-semibold">tank-2.pressure</span>
                <span className="text-cream-mute2">bar · horizonte 30m</span>
              </div>
              <div className="flex items-center gap-3 text-cream-mute2">
                <span className="size-1.5 rounded-full" style={{ background: "var(--accent)" }} aria-hidden />
                <span className="tabular">anticipación 11 min</span>
              </div>
            </div>
            <div
              className="bg-bg-base relative"
              role="img"
              aria-label="Predicción frente a curva real del sensor. La banda prevista diverge de la línea real once minutos antes de que el umbral estático alertara."
            >
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[280px] block" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid-fc" width="48" height="32" patternUnits="userSpaceOnUse">
                    <path d="M 48 0 L 0 0 0 32" fill="none" stroke="var(--chart-grid)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width={W} height={H} fill="url(#grid-fc)" />
                <rect x={divergeX} y={0} width={W - Number(divergeX)} height={H} fill="var(--status-critical)" fillOpacity="0.05" />
                <path d={bandPath} fill="var(--status-advisory)" fillOpacity="0.12" stroke="none" />
                <path d={forecastPath} fill="none" stroke="var(--status-advisory)" strokeWidth="1.6" strokeDasharray="4 4" />
                <path d={actualPath} fill="none" stroke="var(--chart-probe)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <line x1={divergeX} x2={divergeX} y1={20} y2={H - 8} stroke="var(--status-critical)" strokeOpacity="0.55" strokeDasharray="2 3" />
              </svg>

              <span
                aria-hidden
                className="absolute font-mono text-[11px] pointer-events-none whitespace-nowrap text-status-critical"
                style={{ left: `${((Number(divergeX) + 8) / W) * 100}%`, top: `${((32 - 12) / H) * 100}%` }}
              >
                t+11m · la predicción diverge
              </span>
              <span
                aria-hidden
                className="absolute bottom-1.5 left-1.5 font-mono text-[10px] pointer-events-none"
                style={{ color: "var(--chart-baseline)" }}
              >
                ahora
              </span>
              <span
                aria-hidden
                className="absolute bottom-1.5 right-2 font-mono text-[10px] pointer-events-none"
                style={{ color: "var(--chart-baseline)" }}
              >
                +30m
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Bullet({ color, label, desc }: { color: string; label: string; desc: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1.5 size-2 rounded-full" style={{ background: color }} aria-hidden />
      <div>
        <div className="text-cream-ink font-medium">{label}</div>
        <div className="text-cream-mute2 text-[11px] font-mono">{desc}</div>
      </div>
    </li>
  );
}
