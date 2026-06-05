"use client";

import { useEffect, useRef, useState } from "react";
import { MiniDetect } from "./mini/MiniDetect";
import { MiniExpected } from "./mini/MiniExpected";
import { MiniTokens } from "./mini/MiniTokens";

const items = [
  {
    Visual: MiniDetect,
    eyebrow: "Detección",
    title: "Anomalías al segundo.",
    body: "Telemetría a 1 Hz, inferencia en línea.",
  },
  {
    Visual: MiniTokens,
    eyebrow: "Modelo",
    title: "GNN sobre el grafo de planta.",
    body: "Cada sensor aprende junto a sus vecinos.",
  },
  {
    Visual: MiniExpected,
    eyebrow: "Anomalía",
    title: "Observado vs. esperado.",
    body: "La alerta es la divergencia, no un umbral.",
  },
];

const EASE_OUT_QUART = "cubic-bezier(0.25, 1, 0.5, 1)";

export function Differentiators() {
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

  return (
    <section id="platform" className="border-t border-cream-line">
      <div className="container-x py-24">
        <div className="flex items-baseline justify-between mb-12">
          <p className="eyebrow">Lo que importa</p>
          <p className="text-[13px] text-cream-mute font-mono tabular">
            tres cosas que no trae el stack OT habitual
          </p>
        </div>
        <div
          ref={rowRef}
          className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-cream-line border-y border-cream-line"
        >
          {items.map((it, i) => {
            const Visual = it.Visual;
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
              <div
                key={it.title}
                className="px-7 pt-6 pb-10 md:first:pl-0 md:last:pr-0"
                style={transitionProps}
              >
                <div className="rounded ring-1 ring-cream-line bg-cream-elevated overflow-hidden">
                  <Visual />
                </div>

                <div className="mt-6">
                  <span className="eyebrow">{it.eyebrow}</span>
                </div>
                <div className="mt-4 font-display text-[24px] leading-[1.1] tracking-tighter2 text-cream-ink">
                  {it.title}
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-cream-ink2">{it.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
