import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileJson,
  Info,
} from "lucide-react";

const taxonomy = [
  { label: "Planta", fields: "plant_name · location · diagram (P&ID)" },
  { label: "Sistema SCADA", fields: "vendor · protocol · historian · export" },
  { label: "Procesos", fields: "process_name · description · sensors[]" },
  { label: "Sensores", fields: "tag · unit · variable_type · causality · range" },
];

export function PlantSurvey() {
  return (
    <section id="onboarding" className="border-t border-cream-line bg-cream-bg">
      <div className="container-x py-24">
        <div className="grid lg:grid-cols-12 gap-10 items-end mb-10">
          <div className="lg:col-span-7">
            <p className="eyebrow">04 · Primeros pasos</p>
            <h2 className="h-section text-cream-ink mt-4">
              De la visita a planta a datos listos para el modelo
              <br />
              <span className="font-normal">
                en un único schema estructurado.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-[16px] leading-relaxed text-cream-ink2">
              Los primeros pasos no empiezan desde cero. Un técnico de AtlaXia recorre la planta con
              tu operario y rellena{" "}
              <code className="font-mono text-[14px] text-cream-ink bg-cream-inset px-1.5 py-0.5 rounded">
                plant_survey.schema.json
              </code>{" "}
              un formulario que captura cada capa de tu planta, desde el fabricante del
              SCADA hasta la causalidad y los problemas de datos conocidos de cada sensor.
            </p>
          </div>
        </div>

        <SurveyMock />
        <p className="mt-3 text-[12px] font-mono text-cream-mute2">
          Captura de la app de campo · datos ficticios · serializa a JSON-Schema 2020-12.
        </p>

        <div className="mt-10 rounded-card ring-1 ring-cream-line bg-cream-elevated overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-cream-line">
            {taxonomy.map((t, i) => (
              <div key={t.label} className="px-5 py-6 flex items-start gap-4">
                <span
                  className="font-display italic font-normal leading-none tabular shrink-0 text-[32px] tracking-[-0.04em] text-accent-ink"
                  aria-hidden
                >
                  0{i + 1}
                </span>
                <div className="min-w-0 pt-1">
                  <div className="text-[11px] font-mono text-cream-ink uppercase tracking-tracked font-semibold">
                    {t.label}
                  </div>
                  <div className="mt-2 text-[11px] font-mono text-cream-ink2 break-words leading-snug">
                    {t.fields}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid sm:grid-cols-3 gap-4 border-t border-cream-line pt-8">
          <Stat value="1 visita" label="Visita a planta, un schema rellenado" />
          <Stat value="JSON Schema 2020-12" label="Compatible con tooling, validable" />
          <Stat value="Por sensor" label="Causalidad, preprocesado y problemas de datos capturados" />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-[20px] tracking-tighter2 text-cream-ink">{value}</div>
      <div className="mt-1 text-[12px] text-cream-mute">{label}</div>
    </div>
  );
}

function SurveyMock() {
  return (
    <div className="rounded-card ring-1 ring-cream-line bg-cream-elevated overflow-hidden text-cream-ink">
      {/* App top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-cream-line bg-cream-inset">
        <span className="font-display font-semibold text-[14px] tracking-tighter2 text-cream-ink">
          AtlaXia Plant Survey
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            tabIndex={-1}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded ring-1 ring-cream-line bg-cream-elevated text-cream-ink2 hover:text-cream-ink transition-colors"
          >
            <FileJson className="size-3" aria-hidden />
            Abrir JSON
          </button>
          <button
            type="button"
            tabIndex={-1}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded bg-cream-ink text-cream-bg hover:bg-cream-ink2 transition-colors"
          >
            <Download className="size-3" aria-hidden />
            Descargar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12">
        {/* Left rail (md+) */}
        <aside className="hidden md:flex md:col-span-3 flex-col border-r border-cream-line bg-cream-bg/60">
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-cream-line">
            <span className="text-[10px] font-mono uppercase tracking-tracked text-cream-mute">
              Documentación
            </span>
            <ChevronLeft className="size-3 text-cream-mute2" aria-hidden />
          </div>
          <div className="flex border-b border-cream-line text-[11px]">
            <button
              type="button"
              tabIndex={-1}
              className="flex-1 px-3 py-2 font-medium border-b-2"
              style={{ borderColor: "var(--accent-ink)", color: "var(--accent-ink)" }}
            >
              Documentación
            </button>
            <button
              type="button"
              tabIndex={-1}
              className="flex-1 px-3 py-2 text-cream-mute hover:text-cream-ink"
            >
              Checklist
            </button>
          </div>

          <div className="px-3.5 py-3.5 text-[11px] leading-[1.55]">
            <div className="font-semibold text-cream-ink mb-2 text-[12px]">Datos del Sensor</div>
            <p className="text-cream-mute mb-2.5">
              Documente cada variable instrumentada con precisión:
            </p>
            <ul className="space-y-1.5 text-cream-ink2">
              <li>
                <strong className="text-cream-ink">Tag SCADA:</strong> Copiar EXACTAMENTE de pantalla
              </li>
              <li>
                <strong className="text-cream-ink">Unidad y descripción:</strong> Contexto del dato
              </li>
              <li>
                <strong className="text-cream-ink">Tipo de variable:</strong> Continua, discreta, cualitativa, binaria
              </li>
              <li>
                <strong className="text-cream-ink">Rango operativo:</strong> Valores normales (no rango del sensor)
              </li>
              <li>
                <strong className="text-cream-ink">Problemas conocidos:</strong> Información del operario
              </li>
            </ul>
            <div
              className="mt-3 px-2.5 py-2 rounded text-[10.5px] leading-[1.5] flex gap-1.5"
              style={{
                background: "var(--accent-soft)",
                color: "var(--accent-ink)",
              }}
            >
              <Info className="size-3 mt-0.5 shrink-0" aria-hidden />
              <span>
                No olvide preguntar por actuadores (bombas, válvulas) y consignas, no solo sensores.
              </span>
            </div>
          </div>
        </aside>

        {/* Main panel */}
        <div className="col-span-12 md:col-span-9 px-5 py-5">
          <Breadcrumb />
          <h3 className="mt-3 mb-5 font-display font-semibold text-cream-ink text-[16px] tracking-tighter2">
            Configuración del Sensor
          </h3>

          <Fieldset label="Identificación">
            <div className="grid sm:grid-cols-2 gap-x-5 gap-y-4">
              <Field
                label="Tag del Sensor"
                required
                value="FIT201_PV"
                helper="Nombre o tag tal como aparece en el SCADA (ej: LIT101_PV, FIT201_PV, P101_STATUS)."
              />
              <Field
                label="Alias del Sensor"
                value="Caudal Entrada Reactor 201"
                helper="Nombre descriptivo si el tag SCADA no es autoexplicativo (ej: Nivel Tanque 1)."
              />
              <Field
                label="Tipo de Instrumento"
                value="FIT"
                helper="ej: LIT=Level, FIT=Flow, AIT=Analyzer, PIT=Pressure, TIT=Temperature."
              />
              <Field
                label="Equipo"
                value="Reactor Biológico R-201"
                helper="Equipo al que pertenece el sensor (ej: Bomba P101, Tanque T-101). Permite agrupar."
              />
            </div>
          </Fieldset>

          <Fieldset label="Medición" className="mt-5">
            <div className="grid sm:grid-cols-2 gap-x-5 gap-y-4">
              <Field
                label="Unidad de medida"
                required
                value="m³/h"
                helper="Unidad física (ej: m³/h, bar, mg/L, pH, NTU). Usar 'bool' o 'cat' si aplica."
              />
              <Field
                label="Descripción"
                value="Caudal de entrada al reactor biológico R-201"
                helper="Qué mide, dónde está instalado, qué magnitud captura."
              />
              <Field
                label="Tipo de Variable"
                required
                value="continuous"
                kind="select"
                helper="continuous · discrete · qualitative · binary"
              />
              <Field
                label="Rol del Instrumento"
                required
                value="sensor"
                kind="select"
                helper="sensor · actuator · setpoint · alarm"
              />
              <Field
                label="Causalidad"
                required
                value="interna"
                kind="select"
                helper="interna (controlable) · externa (no controlable, ej: temperatura ambiente)"
              />
              <Field
                label="Rango operativo (min / max)"
                value="0  /  850"
                helper="Valores normales en operación, no el rango total del sensor."
              />
            </div>
          </Fieldset>

          <div className="mt-5 rounded ring-1 ring-cream-line bg-cream-bg/60 px-3 py-2.5 flex items-center justify-between text-[11px] text-cream-mute font-medium">
            <span className="uppercase tracking-tracked">Notas adicionales</span>
            <ChevronRight className="size-3" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}

function Breadcrumb() {
  const parts = ["Encuesta", "AcmeAguas Pruebas", "Reactor Biológico (R-201)", "FIT201_PV"];
  return (
    <nav
      className="text-[11px] font-mono text-cream-mute2 flex flex-wrap items-center gap-1.5"
      aria-label="Ruta del formulario"
    >
      {parts.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          <span className={i === parts.length - 1 ? "text-cream-ink font-semibold" : ""}>{p}</span>
          {i !== parts.length - 1 && <span className="text-cream-mute">/</span>}
        </span>
      ))}
    </nav>
  );
}

function Fieldset({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded ring-1 ring-cream-line overflow-hidden ${className}`}>
      <div
        className="flex items-center gap-2 px-3.5 py-2 text-[10px] font-semibold tracking-tracked uppercase border-b border-cream-line"
        style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}
      >
        <span
          className="block w-0.5 h-3.5 rounded-sm"
          style={{ background: "var(--accent-ink)" }}
          aria-hidden
        />
        {label}
      </div>
      <div className="px-4 py-4 bg-cream-elevated">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  helper,
  required,
  kind = "text",
}: {
  label: string;
  value: string;
  helper: string;
  required?: boolean;
  kind?: "text" | "select";
}) {
  const id = `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-medium text-cream-ink mb-1">
        {label}
        {required && (
          <span className="ml-1" style={{ color: "var(--accent-ink)" }} aria-hidden>
            *
          </span>
        )}
      </label>
      <div className="relative">
        <input
          id={id}
          readOnly
          value={value}
          tabIndex={-1}
          aria-readonly="true"
          className={`w-full rounded ring-1 ring-cream-line bg-cream-bg px-2.5 py-1.5 text-[12px] text-cream-ink font-mono tabular outline-none ${
            kind === "select" ? "pr-7 cursor-default" : ""
          }`}
        />
        {kind === "select" && (
          <ChevronDown
            className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-cream-mute2"
            aria-hidden
          />
        )}
      </div>
      <p className="mt-1 text-[10px] text-cream-mute2 leading-snug">{helper}</p>
    </div>
  );
}
