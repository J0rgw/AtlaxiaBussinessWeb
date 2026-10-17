import type { GraphEdge, GraphNode } from "@/components/data-display/NodeGraph";
import type { SignalSeries } from "@/components/data-display/SignalChart";

/*
  Illustrative data for the Capabilities panels. Deterministic (same output on the
  server and the client) and generic: no real plant, sensor or dataset behind it.
*/

const LENGTH = 80;
const range = (n: number) => Array.from({ length: n }, (_, i) => i);
// Cheap deterministic "noise": sum of incommensurate sines.
const wobble = (i: number, seed: number) =>
  Math.sin(i * 1.73 + seed) * 0.6 + Math.sin(i * 0.61 + seed * 2.1) * 0.9;

/** Several unrelated-looking signals, one per lane: numbers without context. */
export function contextSignals(): SignalSeries[] {
  const specs = [
    { base: 85, amp: 4, period: 7, seed: 0.4 },
    { base: 60, amp: 5, period: 11, seed: 1.9 },
    { base: 35, amp: 3, period: 5, seed: 3.1 },
    { base: 10, amp: 5, period: 13, seed: 4.6 },
  ];
  return specs.map((spec, k) => ({
    id: `signal-${k}`,
    role: "context" as const,
    values: range(LENGTH).map(
      (i) =>
        spec.base + spec.amp * Math.sin(i / spec.period + spec.seed) + wobble(i, spec.seed) * 1.2,
    ),
  }));
}

/** An observed signal against its expected behavior, leaving the band at the end. */
export function expectedBehavior() {
  const expected = range(LENGTH).map((i) => 50 + 12 * Math.sin(i / 9) + 4 * Math.sin(i / 3.7));
  const spread = 6;
  const observed = expected.map((e, i) => {
    const drift = i > 60 ? (i - 60) * 0.85 : 0;
    return e + wobble(i, 2.2) * 1.6 + drift;
  });
  const deviationIndex = observed.reduce(
    (best, value, i) =>
      value - (expected[i] ?? 0) > (observed[best] ?? 0) - (expected[best] ?? 0) ? i : best,
    0,
  );
  return {
    series: [
      { id: "expected", role: "expected" as const, values: expected },
      { id: "observed", role: "observed" as const, values: observed },
    ],
    band: { upper: expected.map((e) => e + spread), lower: expected.map((e) => e - spread) },
    deviation: { seriesId: "observed", index: deviationIndex },
  };
}

export type SignalId =
  "pressure" | "flow" | "temperature" | "level" | "vibration" | "energy" | "humidity" | "speed";

export const graphSize = { width: 640, height: 400 };

export const graphSignals: Array<{ id: SignalId; x: number; y: number; role: GraphNode["role"] }> =
  [
    { id: "pressure", x: 320, y: 185, role: "focus" },
    { id: "flow", x: 165, y: 105, role: "related" },
    { id: "temperature", x: 480, y: 95, role: "related" },
    { id: "level", x: 465, y: 285, role: "related" },
    { id: "vibration", x: 70, y: 215, role: "context" },
    { id: "energy", x: 585, y: 195, role: "context" },
    { id: "humidity", x: 195, y: 305, role: "context" },
    { id: "speed", x: 325, y: 345, role: "context" },
  ];

export const graphRelations: GraphEdge[] = [
  { from: "pressure", to: "flow", strength: "strong" },
  { from: "pressure", to: "temperature", strength: "strong" },
  { from: "pressure", to: "level", strength: "strong" },
  { from: "flow", to: "vibration" },
  { from: "vibration", to: "humidity" },
  { from: "humidity", to: "speed" },
  { from: "speed", to: "level" },
  { from: "level", to: "energy" },
  { from: "energy", to: "temperature" },
  { from: "temperature", to: "flow" },
];
