import { MiniDetect } from "./mini/MiniDetect";
import { MiniForecast } from "./mini/MiniForecast";
import { MiniTokens } from "./mini/MiniTokens";

const items = [
  {
    Visual: MiniDetect,
    dot: "#3fb950",
    eyebrow: "Detección",
    title: "Bucle de 1 segundo, en tiempo real.",
    body: "Telemetría WebSocket a 1 Hz, inferencia en línea. Sin polling, sin retraso de batch, sin esperar a pipelines nocturnos.",
  },
  {
    Visual: MiniTokens,
    dot: "var(--accent-ink)",
    eyebrow: "Diseño de tokens",
    title: "GNN sobre grafos de planta.",
    body: "CoGNN y STGNN aprenden la variedad normal de cada sensor condicionada por sus vecinos — no una línea estática afinada a mano.",
  },
  {
    Visual: MiniForecast,
    dot: "#d29922",
    eyebrow: "Predicción",
    title: "Anticípate al fallo.",
    body: "Banda de predicción de 30 minutos por sensor. La alerta es la divergencia, no el cruce del umbral.",
  },
];

export function Differentiators() {
  return (
    <section id="platform" className="border-t border-cream-line">
      <div className="container-x py-24">
        <div className="flex items-baseline justify-between mb-12">
          <p className="eyebrow">Lo que importa</p>
          <p className="text-[13px] text-cream-mute font-mono tabular">
            tres cosas que no trae el stack OT habitual
          </p>
        </div>
        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-cream-line border-y border-cream-line">
          {items.map((it) => {
            const Visual = it.Visual;
            return (
              <div
                key={it.title}
                className="px-7 pt-6 pb-10 first:pl-0 last:pr-0 md:first:pl-7 md:last:pr-7"
              >
                <div className="rounded ring-1 ring-cream-line bg-cream-elevated overflow-hidden">
                  <Visual />
                </div>

                <div className="mt-6 flex items-center gap-2.5">
                  <span
                    className="size-1.5 rounded-full"
                    style={{ background: it.dot }}
                    aria-hidden
                  />
                  <span className="eyebrow">{it.eyebrow}</span>
                </div>
                <div className="mt-4 font-display text-[28px] leading-[1.05] tracking-tighter2 text-cream-ink">
                  {it.title}
                </div>
                <p className="mt-4 text-[15px] leading-relaxed text-cream-ink2">{it.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
