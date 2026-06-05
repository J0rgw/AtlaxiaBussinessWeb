import { LiveSensorChart } from "./LiveSensorChart";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 cream-grid opacity-70 pointer-events-none [mask-image:radial-gradient(80%_60%_at_50%_0%,#000_30%,transparent_85%)]" aria-hidden />
      <div
        className="absolute -top-40 right-[-10%] w-[680px] h-[680px] rounded-full pointer-events-none blur-3xl opacity-50"
        style={{ background: "radial-gradient(closest-side, var(--accent-soft), transparent 70%)" }}
        aria-hidden
      />

      <div className="container-x relative pt-10 pb-14 lg:pt-14 lg:pb-16">
        <p className="eyebrow mb-8 flex items-baseline gap-x-3">
          <span className="size-1.5 rounded-full bg-status-normal shrink-0 translate-y-[-1px]" aria-hidden />
          <span className="min-w-0 flex-1 break-words">
            ICS · SCADA<wbr /> · Infraestructura<wbr /> hidráulica
          </span>
        </p>

        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <h1 className="font-display font-semibold text-display-hero text-cream-ink">
              Software
              <br />
              <span className="italic font-normal" style={{ color: "var(--accent-ink)" }}>
                de vigilancia
              </span>
              <br />
              en sensores OT.
            </h1>

            <p className="mt-6 text-[16px] leading-[1.55] tesxt-cream-ink2 max-w-md">
              Cada anomalía al instante en que ocurre. Sin tocar tu SCADA.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-5 py-3 sm:py-2.5 min-h-[44px] sm:min-h-0 rounded text-[14px] font-medium bg-accent text-white hover:bg-accent-ink transition-colors"
              >
                Solicitar demo
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                  <path d="M2 7h9M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href="#detection"
                className="inline-flex items-center gap-2 px-5 py-3 sm:py-2.5 min-h-[44px] sm:min-h-0 rounded text-[14px] font-medium bg-transparent text-cream-ink border border-cream-line hover:border-accent hover:text-accent-ink transition-colors"
              >
                Ver detección en directo
              </a>
            </div>

            <dl className="mt-8 grid grid-cols-3 items-start gap-6 max-w-md border-t border-cream-line pt-5">
              <Metric value="1s" label="Latencia" />
              <Metric value="GNN" label="Modelo de anomalías" />
              <Metric value="OT" label="on-premise"  />
            </dl>
          </div>

          <div className="lg:col-span-6">
            <div className="relative">
              <div
                className="absolute -inset-4 rounded-[18px] -z-10 opacity-40 blur-2xl"
                style={{ background: "radial-gradient(closest-side, var(--accent-soft), transparent 70%)" }}
                aria-hidden
              />
              <ProductFrame label="atlaxia.local · AIT203">
                <LiveSensorChart />
              </ProductFrame>
              <p className="mt-3 text-[12px] font-mono text-cream-mute2">
                AIT203 · el rojo es el valor esperado que el modelo predice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="mt-1.5 text-[10px] font-mono uppercase tracking-tracked text-cream-mute">
        {label}
      </dt>
      <dd className="font-display tabular text-[28px] leading-none text-cream-ink tracking-tighter2">
        {value}
      </dd>
    </div>
  );
}

export function ProductFrame({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-card overflow-hidden ring-1 ring-cream-line shadow-float bg-cream-elevated">
      <div className="flex items-center justify-between px-3 py-2 border-b border-cream-line bg-cream-inset">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-cream-line2" aria-hidden />
          <span className="size-2.5 rounded-full bg-cream-line2" aria-hidden />
          <span className="size-2.5 rounded-full bg-cream-line2" aria-hidden />
        </div>
        <span className="text-[11px] font-mono text-cream-mute2 tabular">{label}</span>
        <span className="w-12" aria-hidden />
      </div>
      <div>{children}</div>
    </div>
  );
}
