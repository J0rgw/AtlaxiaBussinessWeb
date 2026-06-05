"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/lib/use-in-view";

const W = 720;
const H = 380;

type NodeKind = "focus" | "neighbor" | "background";

const nodes: { id: string; x: number; y: number; kind: NodeKind }[] = [
  { id: "AIT203", x: 360, y: 200, kind: "focus" },
  { id: "AIT204", x: 510, y: 130, kind: "neighbor" },
  { id: "PIT102", x: 230, y: 250, kind: "neighbor" },
  { id: "LIT202", x: 480, y: 290, kind: "neighbor" },
  { id: "PIT101", x: 170, y: 110, kind: "background" },
  { id: "FIT201", x: 95, y: 220, kind: "background" },
  { id: "FIT204", x: 640, y: 200, kind: "background" },
  { id: "TIT303", x: 350, y: 350, kind: "background" },
  { id: "PIT203", x: 195, y: 340, kind: "background" },
  { id: "AIT405", x: 600, y: 320, kind: "background" },
];

const edges: [string, string][] = [
  ["AIT203", "AIT204"],
  ["AIT203", "PIT102"],
  ["AIT203", "LIT202"],
  ["PIT101", "AIT204"],
  ["PIT101", "FIT201"],
  ["FIT201", "PIT102"],
  ["FIT204", "AIT204"],
  ["LIT202", "TIT303"],
  ["PIT102", "PIT203"],
  ["TIT303", "AIT405"],
  ["PIT203", "TIT303"],
];

const FOCUS = "AIT203";

const nodeById = (id: string) => nodes.find((n) => n.id === id)!;

const EASE_OUT_QUART = "cubic-bezier(0.25, 1, 0.5, 1)";

export function PlantContext() {
  const { ref: sectionRef, inView } = useInView<HTMLElement>();

  const cardRef = useRef<HTMLDivElement | null>(null);
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
    const el = cardRef.current;
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

  const transitionProps = reducedMotion
    ? undefined
    : {
        opacity: revealed ? 1 : 0,
        transform: revealed ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 700ms ${EASE_OUT_QUART}, transform 700ms ${EASE_OUT_QUART}`,
        willChange: revealed ? undefined : "opacity, transform",
      };

  return (
    <section
      ref={sectionRef}
      id="context"
      className="border-t border-cream-line bg-cream-inset"
    >
      <div className="container-x py-24 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5">
          <p className="eyebrow">02 · Contexto</p>
          <h2 className="h-section text-cream-ink mt-4">
            El sensor no se evalúa solo.
            <br />
            <span className="font-normal">
              El modelo lo ve junto a sus vecinos.
            </span>
          </h2>
          <p className="mt-6 text-[16px] text-cream-ink2 leading-relaxed">
            La red neuronal de grafos aprende cómo se relacionan los sensores en
            planta. El valor esperado de cada lectura se condiciona por su
            entorno, no por una norma fija.
          </p>
          <ul className="mt-8 space-y-3.5 text-[14px]">
            <Bullet
              label="Grafo de planta"
              desc="Cada sensor es un nodo. Las aristas son relaciones aprendidas."
            />
            <Bullet
              label="Esperado contextual"
              desc="El esperado de cada sensor depende de sus vecinos directos."
            />
            <Bullet
              label="Anomalía con evidencia"
              desc="La divergencia se lee en el contexto del entorno."
            />
          </ul>
        </div>

        <div ref={cardRef} className="lg:col-span-7" style={transitionProps}>
          <div className="rounded-card ring-1 ring-cream-line bg-cream-elevated overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-cream-line bg-cream-inset">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-cream-line2" aria-hidden />
                <span className="size-2 rounded-full bg-cream-line2" aria-hidden />
                <span className="size-2 rounded-full bg-cream-line2" aria-hidden />
              </div>
              <span className="text-[11px] font-mono text-cream-mute2 tabular">
                atlaxia.local · grafo · {FOCUS}
              </span>
              <span className="w-10" aria-hidden />
            </div>
            <PlantGraph reduceMotion={reducedMotion} active={inView} />
            <p className="px-5 py-3 text-[12px] font-mono text-cream-mute2 border-t border-cream-line">
              El esperado de {FOCUS} se condiciona por sus 3 vecinos directos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Bullet({ label, desc }: { label: string; desc: string }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-2 size-1.5 rounded-full bg-cream-ink2"
        aria-hidden
      />
      <div>
        <div className="text-cream-ink font-medium">{label}</div>
        <div className="text-cream-mute2 text-[11px] font-mono mt-0.5">{desc}</div>
      </div>
    </li>
  );
}

function PlantGraph({
  reduceMotion,
  active,
}: {
  reduceMotion: boolean;
  active: boolean;
}) {
  const focusNode = nodeById(FOCUS);
  const focusEdges = edges.filter(([a, b]) => a === FOCUS || b === FOCUS);
  const otherEdges = edges.filter(([a, b]) => a !== FOCUS && b !== FOCUS);
  const showPulses = active && !reduceMotion;

  return (
    <div
      className="relative bg-cream-elevated"
      role="img"
      aria-label={`Grafo de planta. ${FOCUS} en el centro, conectado a sus vecinos directos AIT204, PIT102 y LIT202. El modelo computa su valor esperado condicionado por estos vecinos.`}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full aspect-[720/380] block"
      >
        <defs>
          <pattern id="pg-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="16" cy="16" r="0.7" fill="var(--mute2)" fillOpacity="0.22" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#pg-grid)" />

        {otherEdges.map(([a, b], i) => {
          const na = nodeById(a);
          const nb = nodeById(b);
          return (
            <line
              key={`be-${i}`}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              stroke="var(--line2)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
          );
        })}

        {focusEdges.map(([a, b], i) => {
          const na = nodeById(a);
          const nb = nodeById(b);
          const from = a === FOCUS ? nb : na;
          const to = a === FOCUS ? na : nb;
          return (
            <g key={`fe-${i}`}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="var(--accent-ink)"
                strokeOpacity="0.5"
                strokeWidth="1.4"
              />
              {showPulses && (
                <circle r="2.6" fill="var(--accent-ink)">
                  <animate
                    attributeName="cx"
                    values={`${from.x};${to.x}`}
                    dur="2.6s"
                    begin={`${i * 0.5}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="cy"
                    values={`${from.y};${to.y}`}
                    dur="2.6s"
                    begin={`${i * 0.5}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="fill-opacity"
                    values="0;0.9;0"
                    dur="2.6s"
                    begin={`${i * 0.5}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}

        {nodes
          .filter((n) => n.kind === "background")
          .map((n) => (
            <g key={`bg-${n.id}`}>
              <circle
                cx={n.x}
                cy={n.y}
                r="9"
                fill="var(--bg-elevated)"
                stroke="var(--line2)"
                strokeWidth="1"
              />
              <text
                x={n.x}
                y={n.y - 16}
                textAnchor="middle"
                fontFamily="var(--font-jetbrains-mono), ui-monospace, monospace"
                fontSize="9"
                fill="var(--mute2)"
              >
                {n.id}
              </text>
            </g>
          ))}

        {nodes
          .filter((n) => n.kind === "neighbor")
          .map((n) => (
            <g key={`nb-${n.id}`}>
              <circle
                cx={n.x}
                cy={n.y}
                r="13"
                fill="var(--bg-elevated)"
                stroke="var(--accent-ink)"
                strokeWidth="1.5"
              />
              <text
                x={n.x}
                y={n.y - 22}
                textAnchor="middle"
                fontFamily="var(--font-jetbrains-mono), ui-monospace, monospace"
                fontSize="10"
                fill="var(--ink)"
                fontWeight="500"
              >
                {n.id}
              </text>
            </g>
          ))}

        <g>
          {showPulses && (
            <circle
              cx={focusNode.x}
              cy={focusNode.y}
              r="32"
              fill="var(--accent-soft)"
              fillOpacity="0.5"
            >
              <animate
                attributeName="r"
                values="28;42;28"
                dur="2.8s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="fill-opacity"
                values="0.35;0;0.35"
                dur="2.8s"
                repeatCount="indefinite"
              />
            </circle>
          )}
          <circle
            cx={focusNode.x}
            cy={focusNode.y}
            r="22"
            fill="var(--accent)"
            stroke="var(--accent-ink)"
            strokeWidth="1.8"
          />
          <text
            x={focusNode.x}
            y={focusNode.y - 32}
            textAnchor="middle"
            fontFamily="var(--font-jetbrains-mono), ui-monospace, monospace"
            fontSize="11"
            fill="var(--accent-ink)"
            fontWeight="600"
          >
            {focusNode.id}
          </text>
        </g>
      </svg>

      <div
        aria-hidden
        className="absolute font-mono text-[10px] leading-tight pointer-events-none"
        style={{ left: "3.5%", top: "6%" }}
      >
        <div className="text-cream-ink font-semibold tracking-wide">
          AIT203 · conductividad
        </div>
        <div className="text-cream-mute2 mt-1">observado · 253.96 uS/cm</div>
        <div className="text-cream-mute2">esperado · 245.20 uS/cm</div>
        <div
          className="font-semibold mt-0.5"
          style={{ color: "var(--status-critical)" }}
        >
          divergencia · +8.76
        </div>
      </div>

      <div
        aria-hidden
        className="absolute font-mono text-[10px] leading-tight pointer-events-none text-right"
        style={{ right: "3.5%", bottom: "6%" }}
      >
        <div className="text-cream-mute2">condicionado por</div>
        <div className="text-cream-ink font-semibold mt-0.5">
          3 vecinos · 1 hop
        </div>
      </div>
    </div>
  );
}
