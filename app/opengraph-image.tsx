import { ImageResponse } from "next/og";
import fs from "node:fs/promises";
import path from "node:path";
import { SITE_HOST } from "@/lib/site";

export const dynamic = "force-static";
export const alt = "AtlaXia. Software Edge de supervisión inteligente en activos OT";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* --- Paleta espejo de app/globals.css :root (acento cobalto, papel frío) --- */
const INK = "#0E1116";
const INK2 = "#1B2026";
const MUTE = "#5B6169";
const MUTE2 = "#6B7178";
const BG = "#F2F4F8";
const BG_INSET = "#EAEDF2";
const ELEV = "#FFFFFF";
const LINE = "#DFE3EA";
const LINE2 = "#D6DBE3";
const BLUE = "#2563EB"; // headline + línea/puntos del chart (acento)
const BLUE_SOFT = "#DCE7FB"; // relleno del área
const RED = "#E5484D"; // valor esperado por el modelo (anomalía)

/* --- Geometría del chart, portada de components/LiveSensorChart.tsx --- */
const W = 760;
const H = 280;
const PAD = { left: 56, right: 24, top: 18, bottom: 30 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const Y_MIN = 234;
const Y_MAX = 270;
const yTicks = [270, 263, 256, 249, 241, 234];
const xLabels = [
  { label: "12:00", x: 0.16 },
  { label: "13:00", x: 0.42 },
  { label: "14:00", x: 0.68 },
  { label: "15:00", x: 0.94 },
];
const samples: { x: number; v: number }[] = [
  { x: 0.04, v: 241.2 }, { x: 0.08, v: 240.6 }, { x: 0.12, v: 239.8 },
  { x: 0.15, v: 235.4 }, { x: 0.18, v: 240.9 }, { x: 0.21, v: 252.7 },
  { x: 0.24, v: 261.4 }, { x: 0.27, v: 266.8 }, { x: 0.30, v: 267.1 },
  { x: 0.33, v: 261.5 }, { x: 0.37, v: 257.0 }, { x: 0.42, v: 255.4 },
  { x: 0.47, v: 253.8 }, { x: 0.52, v: 254.6 }, { x: 0.57, v: 253.1 },
  { x: 0.62, v: 254.9 }, { x: 0.67, v: 253.5 }, { x: 0.72, v: 252.6 },
  { x: 0.77, v: 254.0 }, { x: 0.82, v: 253.4 }, { x: 0.87, v: 254.1 },
  { x: 0.92, v: 253.7 }, { x: 0.96, v: 253.96 },
];
const ANOMALY_INDEX = 7;
const EXPECTED_AT_PEAK = 245.2;
const TIME_PILLS = ["1m", "5m", "15m", "1h", "5h", "24h", "7d", "30d"];

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
  const top = samples
    .map((s, i) => {
      const { px, py } = project(s.x, s.v);
      return `${i === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`;
    })
    .join(" ");
  const lastPx = project(samples[samples.length - 1].x, Y_MIN).px.toFixed(2);
  const firstPx = project(samples[0].x, Y_MIN).px.toFixed(2);
  const bottomY = (PAD.top + PLOT_H).toFixed(2);
  return `${top} L ${lastPx} ${bottomY} L ${firstPx} ${bottomY} Z`;
})();

const anomalyActual = project(samples[ANOMALY_INDEX].x, samples[ANOMALY_INDEX].v);
const anomalyExpected = project(samples[ANOMALY_INDEX].x, EXPECTED_AT_PEAK);

// Tamaño renderizado del SVG y escala viewBox -> px. Satori no soporta <text>
// dentro de SVG, así que las etiquetas de ejes y la anotación van como divs
// posicionados sobre el chart, escalando las coordenadas del viewBox.
const CHART_W = 500;
const CHART_H = 184;
const SX = CHART_W / W;
const SY = CHART_H / H;

async function loadFont(weight: 400 | 600 | 700 | 800) {
  const file = path.join(
    process.cwd(),
    "node_modules/@fontsource/nunito/files",
    `nunito-latin-${weight}-normal.woff`
  );
  return fs.readFile(file);
}

export default async function OpenGraphImage() {
  const [n400, n600, n700, n800] = await Promise.all([
    loadFont(400),
    loadFont(600),
    loadFont(700),
    loadFont(800),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: BG,
          color: INK,
          padding: "56px 64px",
          fontFamily: "Nunito",
          position: "relative",
        }}
      >
        {/* Resplandor de acento (cobalto) y rejilla, igual que el hero */}
        <div
          style={{
            position: "absolute",
            top: -260,
            right: -180,
            width: 720,
            height: 720,
            borderRadius: 9999,
            background:
              "radial-gradient(closest-side, rgba(37,99,235,0.16), rgba(37,99,235,0))",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(15,16,14,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,16,14,0.04) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            opacity: 0.65,
            display: "flex",
          }}
        />

        {/* Cabecera: logo + marca */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: INK,
              color: ELEV,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 20,
              letterSpacing: "-0.06em",
            }}
          >
            AX
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 15,
              color: MUTE,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            <span>ATLAXIA</span>
            <span style={{ width: 1, height: 18, background: LINE, display: "flex" }} />
            <span>ICS · SCADA · OT</span>
          </div>
        </div>

        {/* Cuerpo: dos columnas como el hero real */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            gap: 36,
            position: "relative",
          }}
        >
          {/* Columna texto */}
          <div style={{ display: "flex", flexDirection: "column", width: 540 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: MUTE,
              }}
            >
              <span style={{ color: MUTE2 }}>00</span>
              <span>Detección de anomalías · ICS / SCADA</span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 22,
                fontSize: 56,
                letterSpacing: "-0.035em",
                lineHeight: 1.0,
              }}
            >
              <span style={{ fontWeight: 800 }}>Software Edge</span>
              <span style={{ fontWeight: 400, color: BLUE }}>de supervisión</span>
              <span style={{ fontWeight: 400, color: BLUE }}>inteligente</span>
              <span style={{ fontWeight: 800 }}>en activos OT.</span>
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 22,
                fontSize: 21,
                lineHeight: 1.4,
                color: INK2,
                maxWidth: 430,
              }}
            >
              Cada anomalía al instante en que ocurre. Sin tocar tu SCADA.
            </div>
          </div>

          {/* Columna producto: mockup del dashboard AIT203 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 500,
              borderRadius: 14,
              border: `1px solid ${LINE}`,
              background: ELEV,
              boxShadow: "0 24px 60px -32px rgba(14,17,22,0.30)",
              overflow: "hidden",
            }}
          >
            {/* Barra de ventana */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 14px",
                borderBottom: `1px solid ${LINE}`,
                background: BG_INSET,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: 9999, background: LINE2, display: "flex" }} />
                <span style={{ width: 9, height: 9, borderRadius: 9999, background: LINE2, display: "flex" }} />
                <span style={{ width: 9, height: 9, borderRadius: 9999, background: LINE2, display: "flex" }} />
              </div>
              <span style={{ fontSize: 12, color: MUTE2, letterSpacing: "0.01em" }}>
                atlaxia.local/AIT203
              </span>
              <span style={{ width: 27, display: "flex" }} />
            </div>

            {/* Barra de lectura + rangos */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderBottom: `1px solid ${LINE}`,
                background: ELEV,
              }}
            >
              <span
                style={{
                  display: "flex",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "4px 7px",
                  borderRadius: 4,
                  border: `1px solid ${LINE}`,
                  background: BG_INSET,
                  color: INK,
                }}
              >
                AIT203
              </span>
              <span style={{ display: "flex", fontSize: 19, fontWeight: 700, color: INK, marginLeft: 2 }}>
                254.42
              </span>
              <span style={{ display: "flex", fontSize: 12, color: MUTE2 }}>uS/cm</span>

              <div
                style={{
                  display: "flex",
                  marginLeft: "auto",
                  borderRadius: 4,
                  border: `1px solid ${LINE}`,
                  background: BG_INSET,
                  overflow: "hidden",
                }}
              >
                {TIME_PILLS.map((p) => {
                  const selected = p === "5h";
                  return (
                    <span
                      key={p}
                      style={{
                        display: "flex",
                        padding: "3px 6px",
                        fontSize: 11,
                        borderRight: `1px solid ${LINE}`,
                        background: selected ? ELEV : "transparent",
                        color: selected ? INK : MUTE2,
                        fontWeight: selected ? 700 : 400,
                      }}
                    >
                      {p}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Chart: SVG para trazos + divs para etiquetas (satori sin <text>) */}
            <div style={{ display: "flex", position: "relative", width: CHART_W, height: CHART_H }}>
              <svg width={CHART_W} height={CHART_H} viewBox={`0 0 ${W} ${H}`}>
                {yTicks.map((y) => {
                  const py = project(0, y).py;
                  return (
                    <line
                      key={`g-${y}`}
                      x1={PAD.left}
                      x2={W - PAD.right}
                      y1={py}
                      y2={py}
                      stroke={LINE2}
                      strokeWidth="1"
                      strokeDasharray="4 5"
                    />
                  );
                })}

                <path d={areaPath} fill={BLUE_SOFT} fillOpacity="0.85" />
                <path
                  d={linePath}
                  fill="none"
                  stroke={BLUE}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {samples.map((s, i) => {
                  const { px, py } = project(s.x, s.v);
                  const isLast = i === samples.length - 1;
                  return (
                    <circle
                      key={`d-${i}`}
                      cx={px}
                      cy={py}
                      r={isLast ? 3.4 : 2.6}
                      fill={ELEV}
                      stroke={BLUE}
                      strokeWidth="1.8"
                    />
                  );
                })}

                {/* Anomalía: valor esperado por el modelo */}
                <line
                  x1={anomalyActual.px}
                  x2={anomalyExpected.px}
                  y1={anomalyActual.py}
                  y2={anomalyExpected.py}
                  stroke={RED}
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  opacity="0.8"
                />
                <circle cx={anomalyExpected.px} cy={anomalyExpected.py} r="11" fill={RED} fillOpacity="0.16" />
                <circle
                  cx={anomalyExpected.px}
                  cy={anomalyExpected.py}
                  r="4"
                  fill={RED}
                  stroke={ELEV}
                  strokeWidth="1.6"
                />
              </svg>

              {/* Etiquetas eje Y */}
              {yTicks.map((y) => {
                const py = project(0, y).py;
                return (
                  <div
                    key={`yl-${y}`}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: py * SY - 8,
                      width: (PAD.left - 12) * SX,
                      display: "flex",
                      justifyContent: "flex-end",
                      fontSize: 11,
                      color: MUTE2,
                    }}
                  >
                    {y}
                  </div>
                );
              })}

              {/* Etiquetas eje X */}
              {xLabels.map((l) => {
                const cx = (PAD.left + l.x * PLOT_W) * SX;
                return (
                  <div
                    key={`xl-${l.label}`}
                    style={{
                      position: "absolute",
                      left: cx - 22,
                      top: CHART_H - 16,
                      width: 44,
                      display: "flex",
                      justifyContent: "center",
                      fontSize: 11,
                      color: MUTE2,
                    }}
                  >
                    {l.label}
                  </div>
                );
              })}

              {/* Anotación del modelo en el pico */}
              <div
                style={{
                  position: "absolute",
                  left: (anomalyExpected.px + 12) * SX,
                  top: anomalyExpected.py * SY - 4,
                  display: "flex",
                  flexDirection: "column",
                  lineHeight: 1.25,
                }}
              >
                <span style={{ display: "flex", fontSize: 13, fontWeight: 700, color: RED }}>
                  modelo {EXPECTED_AT_PEAK.toFixed(1)}
                </span>
                <span style={{ display: "flex", fontSize: 12, color: MUTE2 }}>esperado en el pico</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pie: métricas + host */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 22,
            borderTop: `1px solid ${LINE}`,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", gap: 32 }}>
            <Metric value="1s" label="Latencia" />
            <Metric value="GNN" label="Modelo de anomalías" />
            <Metric value="OT" label="On-premise" />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: MUTE,
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 9999, background: BLUE, display: "flex" }} />
            <span>{SITE_HOST}</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Nunito", data: n400, weight: 400, style: "normal" },
        { name: "Nunito", data: n600, weight: 600, style: "normal" },
        { name: "Nunito", data: n700, weight: 700, style: "normal" },
        { name: "Nunito", data: n800, weight: 800, style: "normal" },
      ],
    }
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span style={{ display: "flex", fontSize: 26, fontWeight: 800, color: INK, letterSpacing: "-0.02em" }}>
        {value}
      </span>
      <span style={{ display: "flex", fontSize: 13, color: MUTE, marginTop: 2 }}>{label}</span>
    </div>
  );
}
