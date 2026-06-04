"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/lib/use-in-view";

const W = 360;
const H = 200;

function trace() {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= 60; i++) {
    const x = (i / 60) * W;
    const base = 110 + Math.sin(i * 0.32) * 14 + Math.sin(i * 0.11) * 8;
    const drift = i > 28 ? Math.pow((i - 28) / 32, 1.7) * 28 : 0;
    const noise = Math.sin(i * 1.7) * 1.6;
    pts.push({ x, y: base + drift + noise });
  }
  return pts;
}

const data = trace();
const linePath = data.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`;

const THRESHOLD = 150;
const ruleAlertIdx = data.findIndex((p) => p.y > THRESHOLD);
const tokenAlertIdx = 30;

export function TokenVsRules() {
  const [tick, setTick] = useState(0);
  const { ref: sectionRef, inView } = useInView<HTMLElement>();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    if (!inView) return;
    const id = setInterval(() => setTick((t) => (t + 1) % 60), 80);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <section ref={sectionRef} id="detection" className="border-t border-cream-line bg-cream-bg">
      <div className="container-x py-24">
        <div className="grid lg:grid-cols-12 gap-10 items-end mb-12">
          <div className="lg:col-span-7">
            <p className="eyebrow">01 · Diseño de tokens</p>
            <h2 className="h-section text-cream-ink mt-4">
              Los umbrales atrapan incidentes.
              <br />
              <span className="font-normal">
                Los tokens detectan la deriva antes del incidente.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-[16px] leading-relaxed text-cream-ink2">
              SCADA típica + Fortinet OT alerta en cuanto un valor cruza una línea afinada a mano.
              Para entonces el evento ya ha ocurrido. La red neuronal de grafos de AtlaXia aprende
              un <em className="not-italic font-semibold">token</em>, un embedding de alta
              dimensión, de la variedad normal de cada sensor, condicionado por el resto de
              la planta. La deriva aparece en cuanto el token se desvía.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Panel
            label="SCADA por reglas"
            sub="Umbral estático · una señal a la vez"
            tone="muted"
            alertLabel={ruleAlertIdx > 0 ? `Alerta en t+${ruleAlertIdx}s` : "—"}
            footnote="Se pierde los 30 segundos de deriva previos al cruce."
          >
            <ChartPanel tick={tick} alertIdx={ruleAlertIdx} alertColor="var(--status-critical)" showThreshold variant="rules" />
          </Panel>

          <Panel
            label="AtlaXia · tokens GNN"
            sub="Variedad aprendida · contexto entre sensores"
            tone="accent"
            alertLabel={`Deriva detectada en t+${tokenAlertIdx}s`}
            footnote={`${ruleAlertIdx - tokenAlertIdx}s antes que el enfoque por umbral.`}
          >
            <ChartPanel tick={tick} alertIdx={tokenAlertIdx} alertColor="var(--status-advisory)" variant="tokens" />
          </Panel>
        </div>
      </div>
    </section>
  );
}

function Panel({
  label,
  sub,
  tone,
  alertLabel,
  footnote,
  children,
}: {
  label: string;
  sub: string;
  tone: "muted" | "accent";
  alertLabel: string;
  footnote: string;
  children: React.ReactNode;
}) {
  const accentStyle = tone === "accent" ? { color: "var(--accent-ink)" } : undefined;
  return (
    <div className="rounded-card bg-cream-elevated ring-1 ring-cream-line overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-cream-line">
        <div>
          <div className="font-display text-[18px] font-semibold tracking-tighter2 text-cream-ink" style={accentStyle}>
            {label}
          </div>
          <div className="text-[11px] font-mono text-cream-mute2 mt-1">{sub}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-tracked text-cream-mute font-mono">Detectado</div>
          <div className="text-[12px] font-mono tabular text-cream-ink mt-1" style={accentStyle}>
            {alertLabel}
          </div>
        </div>
      </div>
      <div className="bg-bg-base">{children}</div>
      <p className="px-5 py-4 text-[13px] text-cream-ink2 leading-relaxed">{footnote}</p>
    </div>
  );
}

function ChartPanel({
  tick,
  alertIdx,
  alertColor,
  showThreshold = false,
  variant,
}: {
  tick: number;
  alertIdx: number;
  alertColor: string;
  showThreshold?: boolean;
  variant: "rules" | "tokens";
}) {
  const probeIdx = Math.min(data.length - 1, Math.floor((tick / 60) * data.length));
  const probe = data[probeIdx];
  const passedAlert = probeIdx >= alertIdx && alertIdx > 0;
  const ariaLabel =
    variant === "rules"
      ? "Gráfico: una línea cruza un umbral estático y dispara la alerta tarde, treinta segundos después de iniciarse la deriva."
      : "Gráfico: la misma línea entra en una banda aprendida y se marca como deriva treinta segundos antes del cruce del umbral.";

  return (
    <div className="relative overflow-hidden" role="img" aria-label={ariaLabel}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[220px] block" preserveAspectRatio="none" aria-hidden>
        <defs>
          <pattern id={`grid-${variant}`} width="36" height="28" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 28" fill="none" stroke="var(--chart-grid)" strokeWidth="1" />
          </pattern>
          <linearGradient id={`fill-${variant}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={alertColor} stopOpacity={passedAlert ? 0.22 : 0.08} />
            <stop offset="100%" stopColor={alertColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill={`url(#grid-${variant})`} />

        {variant === "tokens" && (
          <path
            d={`M 0 ${data[0].y - 14} ${data
              .map((p) => `L ${p.x} ${p.y - 14}`)
              .join(" ")} ${[...data].reverse().map((p) => `L ${p.x} ${p.y + 14}`).join(" ")} Z`}
            fill="var(--status-advisory)"
            fillOpacity="0.08"
            stroke="var(--status-advisory)"
            strokeOpacity="0.3"
            strokeDasharray="2 3"
            strokeWidth="1"
          />
        )}

        {showThreshold && (
          <line x1="0" x2={W} y1={150} y2={150} stroke="var(--status-critical)" strokeOpacity="0.55" strokeDasharray="3 4" strokeWidth="1" />
        )}

        <path d={areaPath} fill={`url(#fill-${variant})`} />
        <path d={linePath} fill="none" stroke={passedAlert ? alertColor : "var(--chart-stroke-mute)"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

        {alertIdx > 0 && (
          <g>
            <line x1={data[alertIdx].x} x2={data[alertIdx].x} y1={0} y2={H} stroke={alertColor} strokeOpacity="0.35" strokeDasharray="2 3" />
            <circle cx={data[alertIdx].x} cy={data[alertIdx].y} r="4" fill={alertColor} />
          </g>
        )}

        <circle cx={probe.x} cy={probe.y} r="3" fill="var(--chart-probe)" />
      </svg>

      {showThreshold && (
        <span
          aria-hidden
          className="absolute font-mono text-[10px] pointer-events-none opacity-70"
          style={{ left: "1.7%", top: `${((150 - 14) / H) * 100}%`, color: "var(--status-critical)" }}
        >
          umbral = 150
        </span>
      )}

      {alertIdx > 0 && (
        <span
          aria-hidden
          className="absolute font-mono text-[10px] pointer-events-none whitespace-nowrap"
          style={{
            left: `${((data[alertIdx].x + 6) / W) * 100}%`,
            top: `${((data[alertIdx].y - 18) / H) * 100}%`,
            color: alertColor,
          }}
        >
          {variant === "tokens" ? "deriva" : "alerta"}
        </span>
      )}
    </div>
  );
}
