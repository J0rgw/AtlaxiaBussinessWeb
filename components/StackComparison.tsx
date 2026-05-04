import { Check, X } from "lucide-react";

const rows: { feature: string; legacy: string; atlaxia: string; legacyOk?: boolean }[] = [
  { feature: "Ingesta de telemetría", legacy: "Puentes ThingsBoard / OPC-UA", atlaxia: "OPC-UA + MQTT + historian nativos, 1 Hz", legacyOk: true },
  { feature: "Método de detección", legacy: "Umbrales estáticos, reglas afinadas a mano", atlaxia: "Red neuronal de grafos sobre tokens aprendidos" },
  { feature: "Predicción", legacy: "No incluida", atlaxia: "STGNN, horizonte 30 min, por sensor" },
  { feature: "Contexto entre sensores", legacy: "Reglas por tag, aisladas", atlaxia: "Grafo de planta completa, condicionado por vecinos" },
  { feature: "Seguridad de red", legacy: "Fortinet OT, basada en firmas", atlaxia: "Anomalía + firmas, panel unificado" },
  { feature: "UX para operario", legacy: "Cuadros de mando del fabricante", atlaxia: "Sala de control ISA-101, dark-first" },
  { feature: "Despliegue", legacy: "Stack de 4–6 herramientas a integrar", atlaxia: "Un contenedor, on-prem / airgap" },
  { feature: "Tiempo hasta primera alerta", legacy: "Cruce de umbral (tras el evento)", atlaxia: "Deriva del token (a menudo minutos antes)" },
];

export function StackComparison() {
  return (
    <section id="compare" className="border-t border-cream-line">
      <div className="container-x py-24">
        <div className="max-w-3xl mb-12">
          <p className="eyebrow">03 · Plataforma unificada</p>
          <h2 className="h-section text-cream-ink mt-4">
            Una plataforma AI-native sustituye
            <br />
            <span className="italic font-normal" style={{ color: "var(--accent-ink)" }}>
              al stack OT remendado.
            </span>
          </h2>
          <p className="mt-6 text-[16px] leading-relaxed text-cream-ink2">
            La mayoría de plantas usan ThingsBoard para la telemetría, Fortinet OT para la red, un
            SCADA del fabricante para la visualización, y reglas a medida pegadas entre los tres.
            AtlaXia entrega cada capa en un único contenedor, con el GNN como primitiva de detección.
          </p>
        </div>

        <div className="rounded-card ring-1 ring-cream-line bg-cream-elevated overflow-hidden">
          {/* Header — only on lg+ */}
          <div className="hidden lg:grid grid-cols-12 px-6 py-3.5 border-b border-cream-line text-[11px] font-mono uppercase tracking-tracked text-cream-mute">
            <div className="col-span-4">Capacidad</div>
            <div className="col-span-4">SCADA típica + Fortinet OT</div>
            <div className="col-span-4 text-cream-ink">AtlaXia</div>
          </div>

          <ul>
            {rows.map((r, i) => (
              <li
                key={r.feature}
                className={`px-5 sm:px-6 py-5 text-[14px] flex flex-col gap-3 lg:grid lg:grid-cols-12 lg:gap-3 ${
                  i !== rows.length - 1 ? "border-b border-cream-line" : ""
                }`}
              >
                <div className="lg:col-span-4 text-cream-ink font-semibold lg:font-medium">
                  {r.feature}
                </div>

                <div className="lg:col-span-4">
                  <div className="lg:hidden text-[10px] font-mono uppercase tracking-tracked text-cream-mute mb-1.5">
                    SCADA típica + Fortinet OT
                  </div>
                  <div className="text-cream-ink2 flex items-start gap-2">
                    {r.legacyOk ? (
                      <Check className="size-4 mt-0.5 shrink-0 text-cream-mute2" aria-hidden />
                    ) : (
                      <X className="size-4 mt-0.5 shrink-0 text-[#c44]" aria-hidden />
                    )}
                    <span>{r.legacy}</span>
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <div
                    className="lg:hidden text-[10px] font-mono uppercase tracking-tracked mb-1.5"
                    style={{ color: "var(--accent-ink)" }}
                  >
                    AtlaXia
                  </div>
                  <div className="flex items-start gap-2 text-cream-ink">
                    <Check
                      className="size-4 mt-0.5 shrink-0"
                      style={{ color: "var(--accent-ink)" }}
                      aria-hidden
                    />
                    <span>{r.atlaxia}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
