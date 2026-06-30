"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/lib/use-in-view";

const W = 760;
const H = 260;
const PAD = { left: 52, right: 24, top: 18, bottom: 30 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

const Y_MIN = 70;
const Y_MAX = 170;
const yTicks = [170, 150, 130, 110, 90, 70];

const xLabels = [
  { label: "00:00", x: 0.05 },
  { label: "01:00", x: 0.32 },
  { label: "02:00", x: 0.58 },
  { label: "03:00", x: 0.84 },
];

function buildTrace() {
  const N = 60;
  const out: { x: number; v: number; expected: number }[] = [];
  for (let i = 0; i <= N; i++) {
    const x = i / N;
    const expected = 110 + Math.sin(i * 0.32) * 14 + Math.sin(i * 0.11) * 8;
    const drift = i > 28 ? Math.pow((i - 28) / 32, 1.7) * 28 : 0;
    const noise = Math.sin(i * 1.7) * 1.6;
    out.push({ x, v: expected + drift + noise, expected });
  }
  return out;
}

const samples = buildTrace();

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
  const top = linePath;
  const lastPx = project(samples[samples.length - 1].x, Y_MIN).px.toFixed(2);
  const firstPx = project(samples[0].x, Y_MIN).px.toFixed(2);
  const bottomY = (PAD.top + PLOT_H).toFixed(2);
  return `${top} L ${lastPx} ${bottomY} L ${firstPx} ${bottomY} Z`;
})();

const THRESHOLD = 150;
const ruleAlertIdx = samples.findIndex((s) => s.v > THRESHOLD);

const tokenAlertIdx = 45;
const tokenActual = samples[tokenAlertIdx];
const tokenActualPos = project(tokenActual.x, tokenActual.v);
const tokenExpectedPos = project(tokenActual.x, tokenActual.expected);

const thresholdY = project(0, THRESHOLD).py;

const EASE_OUT_QUART = "cubic-bezier(0.25, 1, 0.5, 1)";

const panels = [
  {
    label: "SCADA por reglas",
    sub: "Umbral fijo.",
    statusLabel: ruleAlertIdx > 0 ? `t+${ruleAlertIdx}s` : "Sin alerta",
    footnote: "Solo dispara cuando el valor cruza la línea.",
    variant: "rules" as const,
    frameLabel: "atlaxia.local/regla.001",
  },
  {
    label: "AtlaXia",
    sub: "Esperado por contexto.",
    statusLabel: `t+${tokenAlertIdx}s`,
    footnote: "Detecta la divergencia frente al valor esperado.",
    variant: "tokens" as const,
    frameLabel: "atlaxia.local/modelo.gnn",
  },
];

export function TokenVsRules() {
  const [tick, setTick] = useState(0);
  const { ref: sectionRef, inView } = useInView<HTMLElement>();

  const rowRef = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setReducedMotion(true);
      setRevealed(true);
      return;
    }
    const el = rowRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    let rafId = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          rafId = requestAnimationFrame(() =>
            requestAnimationFrame(() => setRevealed(true))
          );
          io.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

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
            <p className="eyebrow">01 Detección</p>
            <h2 className="h-section text-cream-ink mt-4">
              El umbral espera al cruce.
              <br />
              <span className="font-normal">El modelo ve la divergencia.</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-[16px] leading-relaxed text-cream-ink2">
              El SCADA dispara cuando un valor cruza una línea fija. AtlaXia compara
              cada lectura con el valor esperado por su contexto en planta.
            </p>
          </div>
        </div>

        <div ref={rowRef} className="grid lg:grid-cols-2 gap-6">
          {panels.map((p, i) => {
            const transitionProps = reducedMotion
              ? undefined
              : {
                  opacity: revealed ? 1 : 0,
                  transform: revealed ? "translateY(0)" : "translateY(24px)",
                  transition: `opacity 700ms ${EASE_OUT_QUART}, transform 700ms ${EASE_OUT_QUART}`,
                  transitionDelay: `${i * 120}ms`,
                  willChange: revealed ? undefined : "opacity, transform",
                };
            return (
              <div key={p.label} style={transitionProps}>
                <Panel
                  label={p.label}
                  sub={p.sub}
                  statusLabel={p.statusLabel}
                  footnote={p.footnote}
                  frameLabel={p.frameLabel}
                >
                  <ChartPanel tick={tick} variant={p.variant} />
                </Panel>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Panel({
  label,
  sub,
  statusLabel,
  footnote,
  frameLabel,
  children,
}: {
  label: string;
  sub: string;
  statusLabel: string;
  footnote: string;
  frameLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-card bg-cream-elevated ring-1 ring-cream-line overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-cream-line">
        <div>
          <div className="font-display text-[18px] font-semibold tracking-tighter2 text-cream-ink">
            {label}
          </div>
          <div className="text-[11px] font-mono text-cream-mute2 mt-1">{sub}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-tracked text-cream-mute font-mono">
            Detectado
          </div>
          <div className="text-[12px] font-mono tabular text-cream-ink mt-1">
            {statusLabel}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-2 border-b border-cream-line bg-cream-inset">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-cream-line2" aria-hidden />
          <span className="size-2 rounded-full bg-cream-line2" aria-hidden />
          <span className="size-2 rounded-full bg-cream-line2" aria-hidden />
        </div>
        <span className="text-[11px] font-mono text-cream-mute2 tabular">{frameLabel}</span>
        <span className="w-10" aria-hidden />
      </div>
      <div className="bg-cream-elevated">{children}</div>
      <p className="px-5 py-4 text-[13px] text-cream-ink2 leading-relaxed border-t border-cream-line">
        {footnote}
      </p>
    </div>
  );
}

function ChartPanel({
  tick,
  variant,
}: {
  tick: number;
  variant: "rules" | "tokens";
}) {
  const probeIdx = Math.min(
    samples.length - 1,
    Math.floor((tick / 60) * samples.length)
  );
  const probe = samples[probeIdx];
  const probePos = project(probe.x, probe.v);

  const ariaLabel =
    variant === "rules"
      ? "Gráfico: la señal evoluciona bajo un umbral fijo a 150. La regla solo dispararía al cruzarlo."
      : "Gráfico: la misma señal, con el valor esperado por el modelo en cada instante. El marcador rojo señala el valor esperado en el momento de la divergencia.";

  return (
    <div className="relative bg-cream-elevated" role="img" aria-label={ariaLabel}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full aspect-[760/260] block"
      >
        {yTicks.map((y) => {
          const py = project(0, y).py;
          return (
            <line
              key={`grid-${y}`}
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

        {variant === "rules" && (
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={thresholdY}
            y2={thresholdY}
            stroke="var(--status-critical)"
            strokeOpacity="0.65"
            strokeDasharray="3 4"
            strokeWidth="1.2"
          />
        )}

        <path d={areaPath} fill="var(--accent-soft)" fillOpacity="0.7" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {samples
          .filter((_, i) => i % 3 === 0 || i === samples.length - 1)
          .map((s, i) => {
            const { px, py } = project(s.x, s.v);
            const isLast = i === Math.floor(samples.length / 3);
            return (
              <circle
                key={`dot-${i}`}
                cx={px}
                cy={py}
                r={isLast ? 3 : 2.4}
                fill="var(--bg-elevated)"
                stroke="var(--accent)"
                strokeWidth="1.5"
              />
            );
          })}

        {variant === "tokens" && (
          <>
            <line
              x1={tokenActualPos.px}
              x2={tokenExpectedPos.px}
              y1={tokenActualPos.py}
              y2={tokenExpectedPos.py}
              stroke="var(--status-critical)"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.75"
            />
            <circle
              cx={tokenExpectedPos.px}
              cy={tokenExpectedPos.py}
              r="9"
              fill="var(--status-critical)"
              fillOpacity="0.18"
            >
              <animate
                attributeName="r"
                values="8;14;8"
                dur="1.8s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="fill-opacity"
                values="0.22;0;0.22"
                dur="1.8s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx={tokenExpectedPos.px}
              cy={tokenExpectedPos.py}
              r="3.6"
              fill="var(--status-critical)"
              stroke="var(--bg-elevated)"
              strokeWidth="1.4"
            />
          </>
        )}

        <circle
          cx={probePos.px}
          cy={probePos.py}
          r="3.2"
          fill="var(--accent-ink)"
          stroke="var(--bg-elevated)"
          strokeWidth="1.2"
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
            key={`xl-${l.label}`}
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

      {variant === "rules" && (
        <span
          aria-hidden
          className="absolute font-mono text-[10px] pointer-events-none"
          style={{
            left: `${((PAD.left + 8) / W) * 100}%`,
            top: `${((thresholdY - 14) / H) * 100}%`,
            color: "var(--status-critical)",
          }}
        >
          umbral 150
        </span>
      )}

      {variant === "tokens" && (
        <div
          aria-hidden
          className="absolute font-mono text-[10px] leading-tight pointer-events-none"
          style={{
            left: `${((tokenExpectedPos.px + 10) / W) * 100}%`,
            top: `${((tokenExpectedPos.py + 8) / H) * 100}%`,
          }}
        >
          <div style={{ color: "var(--status-critical)" }} className="font-semibold">
            modelo {tokenActual.expected.toFixed(1)}
          </div>
          <div className="text-cream-mute2">esperado en ese instante</div>
        </div>
      )}
    </div>
  );
}
