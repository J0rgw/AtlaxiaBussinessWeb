/*
  Illustrative data for the water case: a pumping station whose pump starts to
  wear. Deterministic and generic: no real plant, values or units behind it.

  What an expert should read in it: pressure and flow drop, energy per cubic
  metre and vibration rise, the tank level does not move (so the cause is not
  on the suction side). The drift stays above the fixed SCADA threshold for a
  long time, but leaves the expected range early.
*/

export type CaseSignal = "level" | "pressure" | "flow" | "vibration" | "energy";

/** Drift starts here (share of the time axis) and "now" is where the measured line ends. */
export const ONSET = 0.42;
export const NOW = 0.78;
export const THRESHOLD = 0.3;
const BAND = 0.035;
const STEPS = 140;

const noise = (i: number) => Math.sin(i * 1.73 + 0.4) * 0.6 + Math.sin(i * 0.61 + 2.1) * 0.9;
const expectedAt = (t: number) => 0.64 + 0.07 * Math.sin(2 * Math.PI * 3.4 * t + 0.5);
const driftAt = (t: number) => (t > ONSET ? 0.32 * ((t - ONSET) / (1 - ONSET)) ** 1.6 : 0);

type Point = { t: number; v: number };

export type PressureCase = {
  expected: Point[];
  measured: Point[];
  /** Where the drift would go on its own, until it crosses the threshold. */
  projection: Point[];
  /** First moment out of the expected range. */
  detection: Point;
  /** Where the projection crosses the SCADA threshold. */
  crossing: Point;
  band: number;
};

export function pressureCase(): PressureCase {
  const expected: Point[] = [];
  const measured: Point[] = [];
  for (let i = 0; i <= STEPS; i += 1) {
    const t = i / STEPS;
    expected.push({ t, v: expectedAt(t) });
    if (t <= NOW) measured.push({ t, v: expectedAt(t) + noise(i) * 0.008 - driftAt(t) });
  }

  const detection =
    measured.find((p) => expectedAt(p.t) - p.v > BAND + 0.01 && p.t > ONSET) ?? measured[0]!;

  const projection: Point[] = [];
  let crossing: Point = { t: 1, v: THRESHOLD };
  for (let i = Math.round(NOW * STEPS); i <= STEPS; i += 1) {
    const t = i / STEPS;
    const v = expectedAt(t) - driftAt(t);
    projection.push({ t, v: Math.max(v, THRESHOLD) });
    if (v <= THRESHOLD) {
      crossing = { t, v: THRESHOLD };
      break;
    }
  }

  return { expected, measured, projection, detection, crossing, band: BAND };
}

/** Direction of each signal in the case, for the related-signals list. */
export const caseTrend: Record<CaseSignal, "down" | "up" | "stable"> = {
  level: "stable",
  pressure: "down",
  flow: "down",
  vibration: "up",
  energy: "up",
};

/** Small series for the related-signals list: same onset, each in its direction. */
export function sparkline(signal: CaseSignal): { expected: Point[]; measured: Point[] } {
  const direction = caseTrend[signal] === "up" ? 1 : caseTrend[signal] === "down" ? -1 : 0;
  const phase = { level: 0.2, pressure: 0.5, flow: 1.1, vibration: 2.3, energy: 3.1 }[signal];
  const expected: Point[] = [];
  const measured: Point[] = [];
  for (let i = 0; i <= 60; i += 1) {
    const t = (i / 60) * NOW;
    const e = 0.5 + 0.12 * Math.sin(2 * Math.PI * 3.4 * t + phase);
    expected.push({ t: t / NOW, v: e });
    measured.push({ t: t / NOW, v: e + noise(i + phase * 10) * 0.012 + direction * driftAt(t) });
  }
  return { expected, measured };
}

/** SVG path through points mapped to a box. Values grow upwards. */
export function linePath(points: Point[], x0: number, x1: number, y0: number, y1: number) {
  return points
    .map((p, k) => {
      const x = x0 + p.t * (x1 - x0);
      const y = y1 - p.v * (y1 - y0);
      return `${k === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

/** Closed band (expected ± spread) as an SVG path. */
export function bandPath(
  points: Point[],
  spread: number,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
) {
  const upper = points.map((p) => ({ t: p.t, v: p.v + spread }));
  const lower = [...points].reverse().map((p) => ({ t: p.t, v: p.v - spread }));
  return `${linePath(upper, x0, x1, y0, y1)} ${linePath(lower, x0, x1, y0, y1).replace("M", "L")} Z`;
}
