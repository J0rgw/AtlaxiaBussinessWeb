/*
  Example series for "Qué hacemos". An illustration, not plant data: one day
  of a pumping station, drawn so the copy holds. While the pump runs, the
  outflow rises and the tank level falls. Late in the day the pump and the
  outflow keep their pattern but the level stops falling: it leaves the
  expected range while staying under the operator limit. The tests check
  each of those statements against these numbers.
*/

export const SAMPLES = 160;

/** Half width of the expected range, in level units (0 to 1). */
export const EXPECTED_SPREAD = 0.06;

/** Operator limit on the level. */
export const OPERATOR_LIMIT = 0.9;

/** Where the "here" marker sits, as a fraction of the day. */
export const MARKER_AT = 0.93;

export type Series = {
  t: number[];
  expected: number[];
  measured: number[];
  /** 1 while the pump runs, 0 while it is stopped. */
  pump: number[];
  outflow: number[];
};

export type Illustration = Series & {
  /** Pump starts and stops, as fractions of the day. */
  transitions: number[];
  /** First sample outside the expected range, to the end of the day. */
  anomaly: readonly [number, number];
};

const CYCLES = Math.PI * 4.2;

/** Deterministic noise in [-1, 1). */
function noise(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

/** The level stops following the pump from 0.6 of the day on. */
function drift(x: number): number {
  if (x < 0.6) return 0;
  if (x < 0.86) return ((x - 0.6) / 0.26) ** 1.6 * 0.24;
  return 0.24 - (x - 0.86) * 0.4;
}

export function illustration(): Illustration {
  const t = Array.from({ length: SAMPLES }, (_, i) => i / (SAMPLES - 1));
  const expected = t.map((x) => 0.5 + 0.18 * Math.sin(x * CYCLES) + 0.05 * Math.sin(x * 23));
  const measured = expected.map((v, i) => v + 0.018 * noise(i) + drift(t[i]!));
  // The pump runs while the level is meant to fall.
  const pump: number[] = t.map((x) => (Math.cos(x * CYCLES) < 0 ? 1 : 0));
  const outflow = pump.map((_, i) => {
    const recent = pump.slice(Math.max(0, i - 4), i + 1);
    const running = recent.reduce((sum, p) => sum + p, 0) / recent.length;
    return 0.2 + 0.5 * running + 0.02 * noise(i + 7);
  });
  const transitions = t.filter((_, i) => i > 0 && pump[i] !== pump[i - 1]);
  const first = measured.findIndex((v, i) => Math.abs(v - expected[i]!) > EXPECTED_SPREAD);
  return {
    t,
    expected,
    measured,
    pump,
    outflow,
    transitions,
    anomaly: [t[Math.max(0, first)]!, 1],
  };
}

export type Box = { x: number; y: number; w: number; h: number };

type Scale = { box: Box; lo: number; hi: number };

function point(scale: Scale, x: number, v: number): [number, number] {
  const { box, lo, hi } = scale;
  return [box.x + x * box.w, box.y + box.h - ((v - lo) / (hi - lo)) * box.h];
}

const fmt = (n: number) => n.toFixed(1);

/** Polyline path; `step` draws a step line (actuator states). */
export function linePath(t: number[], values: number[], scale: Scale, step = false): string {
  return values
    .map((v, i) => {
      const [x, y] = point(scale, t[i]!, v);
      if (i === 0) return `M${fmt(x)} ${fmt(y)}`;
      if (!step) return `L${fmt(x)} ${fmt(y)}`;
      const [, py] = point(scale, t[i]!, values[i - 1]!);
      return `L${fmt(x)} ${fmt(py)}L${fmt(x)} ${fmt(y)}`;
    })
    .join("");
}

/** Closed area between `values + spread` and `values - spread`. */
export function bandPath(t: number[], values: number[], spread: number, scale: Scale): string {
  const upper = values.map((v, i) => point(scale, t[i]!, v + spread));
  const lower = values.map((v, i) => point(scale, t[i]!, v - spread)).reverse();
  return `M${[...upper, ...lower].map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join("L")}Z`;
}

export type Layout = {
  width: number;
  height: number;
  narrow: boolean;
  main: Scale;
  pump: Scale;
  outflow: Scale;
};

/**
 * Two drawings of the same chart, so labels stay at 11px: one for the
 * column beside the steps and one for phones.
 */
export function layout(kind: "wide" | "narrow"): Layout {
  const narrow = kind === "narrow";
  const width = narrow ? 340 : 720;
  const pad = narrow ? 4 : 8;
  const main: Box = { x: pad, y: 24, w: width - pad * 2, h: narrow ? 150 : 220 };
  const pump: Box = { x: pad, y: main.y + main.h + 52, w: main.w, h: narrow ? 24 : 32 };
  const outflow: Box = { x: pad, y: pump.y + pump.h + 24, w: main.w, h: 18 };
  return {
    width,
    narrow,
    height: outflow.y + outflow.h + (narrow ? 34 : 18),
    main: { box: main, lo: 0.15, hi: 1 },
    pump: { box: pump, lo: -0.1, hi: 1.1 },
    outflow: { box: outflow, lo: 0.1, hi: 0.8 },
  };
}

/** Pixel position of a value on a scale, for marks and labels. */
export function at(scale: Scale, x: number, v: number): { x: number; y: number } {
  const [px, py] = point(scale, x, v);
  return { x: px, y: py };
}

/** Instrument tags of the example (not translated). */
export const TAGS = { level: "LT-101", pump: "P-101", outflow: "FT-102" } as const;
