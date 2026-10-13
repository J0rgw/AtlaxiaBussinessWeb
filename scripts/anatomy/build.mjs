import { A, writeFigure } from "./lib.mjs";
import { buildFood, foodProjection } from "./sector-food.mjs";
import { buildMetal, metalProjection } from "./sector-metal.mjs";
import { buildWater, waterProjection } from "./sector-water.mjs";
import { WHERE, buildWhere } from "./vision-where.mjs";

/*
  Builds the anatomy figures (isometric redraws of the Lottie scenes).
  - Site: public/animations/anatomy/<id>.svg and <id>.json (ScrubFigure).
  - Preview: scripts/anatomy/preview/<id>.html, a plate with a progress slider
    for the anatomy skill's capture, drive and line checks.

  Usage (from v2/): node scripts/anatomy/build.mjs [id ...] [--audit]
*/

const figures = [
  {
    id: "sector-water",
    projection: waterProjection,
    build: buildWater,
    preview: {
      fig: "Fig B1",
      title: "Agua",
      hint: "progreso ←→",
      keys: [
        { mark: "lit", label: "Transmisores de nivel, presión y caudal" },
        { mark: "dashed", label: "Relaciones entre sus señales" },
        { mark: "raised", label: "Depósito, bomba en línea y red" },
      ],
      caption:
        "Estación de bombeo en maqueta: el depósito alimenta una bomba en línea; la red sale en cinco tuberías hacia el suelo. Al avanzar, la red se tiende desde el depósito, el agua la recorre, el nivel baja y las señales se relacionan.",
    },
  },
  {
    id: "sector-food",
    projection: foodProjection,
    build: buildFood,
    preview: {
      fig: "Fig B2",
      title: "Agroalimentación",
      hint: "progreso ←→",
      keys: [
        { mark: "lit", label: "Transmisores de velocidad, temperatura y nivel" },
        { mark: "dashed", label: "Relaciones entre sus señales" },
        { mark: "flat", label: "Rango esperado de cada fase" },
      ],
      caption:
        "Tanque por lotes con camisa, abierto por un lado. Se llena y se agita; en el registrador, el rango esperado de temperatura cambia en cada fase y la señal medida lo sigue. El vapor entra en la camisa mientras la segunda fase calienta.",
    },
  },
  {
    id: "sector-metal",
    projection: metalProjection,
    build: buildMetal,
    preview: {
      fig: "Fig B3",
      title: "Metalurgia",
      hint: "progreso ←→",
      keys: [
        { mark: "lit", label: "Transmisores de temperatura, vibración y energía" },
        { mark: "dashed", label: "Relaciones entre sus señales" },
        { mark: "raised", label: "La pieza: sin laminar, tras la caja 1, tras la caja 2" },
      ],
      caption:
        "Horno de recalentar y tren de desbaste de dos cajas. La pieza sale del horno y se adelgaza en cada caja (12, 9 y 7 de espesor, mismo ancho): sale de cada mordida tanto más rápida y más larga como se ha adelgazado. Los rodillos giran con la velocidad del metal en su sitio.",
    },
  },
];

const wanted = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));

// Scene A: four levels, each with its own camera scale and its own audit
if (!wanted.length || wanted.some((id) => "vision-where".includes(id))) {
  const started = Date.now();
  const { levels, built } = buildWhere();
  const size = writeFigure(
    { id: "vision-where", width: WHERE.width, height: WHERE.height },
    built,
    {
      fig: "Fig A",
      title: "Hacia dónde vamos",
      hint: "progreso ←→",
      aspect: "1 / 1",
      keys: [
        { mark: "lit", label: "Lo que ATLAXIA lee hoy: un proceso y sus señales" },
        { mark: "dashed", label: "Relaciones, límite de la planta y red" },
      ],
      caption:
        "La cámara se aleja de un transmisor de presión: el proceso con sus señales relacionadas (hoy), la planta completa rodeada por su límite (siguiente) y una red de plantas sobre su banco (objetivo).",
    },
  );
  const items = levels.reduce((sum, { figure }) => sum + figure.R.items.length, 0);
  console.log(
    `vision-where: ${items} items · svg ${(size.svgBytes / 1024).toFixed(0)} KB · timeline ${(size.jsonBytes / 1024).toFixed(1)} KB · ${((Date.now() - started) / 1000).toFixed(1)} s`,
  );
  // L1: where the spool meets its tee ball (rim on sphere), a sliver of the pipe
  // reads nearer than the ball at the transmitter's 9x drawing scale; looked at
  // at the opening close-up, the joint is clean.
  const allow = { L1: [["spool*", "pt.tee"]] };
  for (const { name, figure } of levels) {
    if (!figure.R.items.length) continue;
    if (process.argv.includes("--audit")) console.log(`-- level ${name}`);
    A.auditOrExit(figure.R, figure.P, { allow: allow[name] ?? [] });
  }
}

for (const figure of figures) {
  if (wanted.length && !wanted.some((id) => figure.id.includes(id))) continue;
  const started = Date.now();
  const P = figure.projection();
  const { f, built } = figure.build(P);
  const size = writeFigure(f, built, figure.preview);
  console.log(
    `${figure.id}: ${f.R.items.length} items · svg ${(size.svgBytes / 1024).toFixed(0)} KB · timeline ${(size.jsonBytes / 1024).toFixed(1)} KB · scale ${f.KS.toFixed(3)} · ${((Date.now() - started) / 1000).toFixed(1)} s`,
  );
  A.auditOrExit(f.R, P, {});
}
