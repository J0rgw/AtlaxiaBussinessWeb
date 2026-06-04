import { RequestDemoForm } from "./RequestDemoForm";

export function CTA() {
  return (
    <section id="contact" className="relative overflow-hidden border-t border-cream-line">
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{ background: "radial-gradient(60% 60% at 50% 100%, var(--accent-soft), transparent 70%)" }}
        aria-hidden
      />
      <div className="container-x relative py-28">
        <div className="text-center max-w-3xl mx-auto">
          <p className="eyebrow">Empezar</p>
          <h2 className="mt-5 mx-auto max-w-[18ch] font-display font-semibold text-display-cta text-cream-ink">
            Conecta tu historian.
            <br />
            <span className="italic font-normal" style={{ color: "var(--accent-ink)" }}>
              Te mostramos la deriva.
            </span>
          </h2>
          <p className="mt-6 text-[16px] text-cream-ink2 max-w-2xl mx-auto leading-relaxed">
            Envíanos 30 días de export OPC-UA o historian. Entrenamos un GNN específico para tu planta,
            lo replayamos contra tu ventana operativa, y te enseñamos cada deriva que ha encontrado el
            modelo, incluida la que tu SCADA actual nunca marcó.
          </p>
        </div>

        <div className="mt-12 max-w-2xl mx-auto">
          <RequestDemoForm />
        </div>

        <div className="mt-10 text-center text-[12px] font-mono text-cream-mute2 tabular">
          on-prem &middot; compatible airgap &middot; ISA-101 &middot; respuesta en 24 h
        </div>
      </div>
    </section>
  );
}
