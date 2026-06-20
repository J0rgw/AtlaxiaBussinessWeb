"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/lib/use-in-view";

const EASE_OUT_QUART = "cubic-bezier(0.25, 1, 0.5, 1)";

export function Deployment() {
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
      id="deployment"
      className="border-t border-cream-line"
    >
      <div className="container-x py-24 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5">
          <p className="eyebrow">03 Despliegue</p>
          <h2 className="h-section text-cream-ink mt-4">
            AtlaXia se conecta.
            <br />
            <span className="font-normal">Tu SCADA sigue al mando.</span>
          </h2>
          <p className="mt-6 text-[16px] leading-relaxed text-cream-ink2">
            Un contenedor on-premise. Lectura pasiva del historian.
          </p>
          <p className="mt-3 text-[16px] leading-relaxed text-cream-ink2">
            Sin cambios en el sistema de control. Sin reglas nuevas que
            mantener.
          </p>
        </div>

        <div ref={cardRef} className="lg:col-span-7" style={transitionProps}>
          <ArchitectureFrame active={inView && !reducedMotion} />
        </div>
      </div>
    </section>
  );
}

function ArchitectureFrame({ active }: { active: boolean }) {
  return (
    <div className="rounded-card ring-1 ring-cream-line bg-cream-elevated overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-cream-line bg-cream-inset">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-cream-line2" aria-hidden />
          <span className="size-2 rounded-full bg-cream-line2" aria-hidden />
          <span className="size-2 rounded-full bg-cream-line2" aria-hidden />
        </div>
        <span className="text-[11px] font-mono text-cream-mute2 tabular">
          atlaxia.local/arquitectura
        </span>
        <span className="w-10" aria-hidden />
      </div>
      <ArchitectureDiagram active={active} />
      <p className="px-5 py-3 text-[12px] font-mono text-cream-mute2 border-t border-cream-line">
        Tap pasivo, sin write-back, el SCADA sigue al mando.
      </p>
    </div>
  );
}

function ArchitectureDiagram({ active }: { active: boolean }) {
  return (
    <div
      className="relative bg-cream-elevated"
      role="img"
      aria-label="Diagrama de arquitectura. Los sensores envían telemetría al SCADA. El SCADA escribe en el historian. AtlaXia lee del historian de forma pasiva. El SCADA sigue siendo el sistema de control."
    >
      <svg viewBox="0 0 720 380" className="w-full aspect-[720/380] block">
        <defs>
          <pattern id="dep-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="16" cy="16" r="0.7" fill="var(--mute2)" fillOpacity="0.22" />
          </pattern>
          <marker
            id="dep-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--mute2)" fillOpacity="0.85" />
          </marker>
          <marker
            id="dep-arrow-accent"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-ink)" />
          </marker>
        </defs>
        <rect width="720" height="380" fill="url(#dep-grid)" />

        <line
          x1={213}
          y1={135}
          x2={296}
          y2={135}
          stroke="var(--mute2)"
          strokeOpacity="0.8"
          strokeWidth="1.2"
          markerEnd="url(#dep-arrow)"
        />
        <line
          x1={433}
          y1={135}
          x2={516}
          y2={135}
          stroke="var(--mute2)"
          strokeOpacity="0.8"
          strokeWidth="1.2"
          markerEnd="url(#dep-arrow)"
        />

        <line
          x1={590}
          y1={173}
          x2={590}
          y2={236}
          stroke="var(--accent-ink)"
          strokeWidth="1.6"
          markerEnd="url(#dep-arrow-accent)"
        />

        {active && (
          <circle r="3" cx={590} fill="var(--accent-ink)">
            <animate
              attributeName="cy"
              values="173;234"
              dur="2.4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.9;0"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>
        )}

        <Box x={80} y={100} w={130} h={70} title="SENSORES" sub="OPC-UA, MQTT" />
        <Box x={300} y={100} w={130} h={70} title="SCADA" sub="control" />
        <Box x={520} y={100} w={140} h={70} title="HISTORIAN" sub="1 Hz" />

        {active && (
          <rect
            x={478}
            y={228}
            width={224}
            height={114}
            rx="12"
            fill="var(--accent-soft)"
            fillOpacity="0.4"
          >
            <animate
              attributeName="fill-opacity"
              values="0.32;0.04;0.32"
              dur="2.8s"
              repeatCount="indefinite"
            />
          </rect>
        )}
        <Box
          x={490}
          y={240}
          w={200}
          h={90}
          title="ATLAXIA"
          sub="GNN, anomalía + contexto"
          focus
        />

        <text
          x={602}
          y={208}
          fontFamily="var(--font-jetbrains-mono), ui-monospace, monospace"
          fontSize="10"
          fill="var(--accent-ink)"
          fontWeight="600"
        >
          lectura 1 Hz
        </text>
      </svg>
    </div>
  );
}

function Box({
  x,
  y,
  w,
  h,
  title,
  sub,
  focus = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub: string;
  focus?: boolean;
}) {
  const cx = x + w / 2;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="6"
        fill="var(--bg-elevated)"
        stroke={focus ? "var(--accent-ink)" : "var(--line2)"}
        strokeWidth={focus ? "1.6" : "1"}
      />
      <text
        x={cx}
        y={y + h / 2 - 2}
        textAnchor="middle"
        fontFamily="var(--font-jetbrains-mono), ui-monospace, monospace"
        fontSize="12"
        fontWeight="600"
        letterSpacing="1.4"
        fill={focus ? "var(--accent-ink)" : "var(--ink)"}
      >
        {title}
      </text>
      <text
        x={cx}
        y={y + h / 2 + 16}
        textAnchor="middle"
        fontFamily="var(--font-jetbrains-mono), ui-monospace, monospace"
        fontSize="10"
        fill="var(--mute2)"
      >
        {sub}
      </text>
    </g>
  );
}
