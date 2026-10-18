import type { Cue, Range } from "@/lib/choreography/choreography";

/*
  Choreography of "Qué hacemos". The scene is split into five equal stretches,
  one per step. At each boundary the step text crossfades and one more sheet
  of the chart is laid down; nothing else moves, so between boundaries the
  scene does no work.
*/

export const stepOrder = ["observe", "system", "normal", "mismatch", "where"] as const;

export type StepId = (typeof stepOrder)[number];

/** Chart sheets laid down from a given step on. */
export const chartLayers = [
  "system",
  "normal",
  "mismatch",
  "where",
] as const satisfies readonly StepId[];

export type ChartLayer = (typeof chartLayers)[number];

/** Scroll length of the pinned scene, in viewport heights. */
export const SCENE_LENGTH = 5;

const STEPS = stepOrder.length;
const FADE = 0.03;
/** Opacity of the step titles that are not being read. */
const DIM = 0.38;

/** Progress where step `i` takes over from the previous one. */
const boundary = (i: number): Range => [i / STEPS - FADE, i / STEPS + FADE];

export const cues: Cue[] = stepOrder.flatMap((id, i): Cue[] => {
  const list: Cue[] = [];
  const first = i === 0;
  const last = i === STEPS - 1;
  if (!first) {
    list.push({ target: `title-${id}`, at: boundary(i), opacity: [DIM, 1] });
    list.push({ target: `panel-${id}`, at: boundary(i), opacity: [0, 1], y: [6, 0], ease: "out" });
  }
  if (!last) {
    list.push({ target: `title-${id}`, at: boundary(i + 1), opacity: [1, DIM] });
    list.push({ target: `panel-${id}`, at: boundary(i + 1), opacity: [1, 0], y: [0, -6] });
  }
  if ((chartLayers as readonly string[]).includes(id)) {
    list.push({ target: `layer-${id}`, at: boundary(i), opacity: [0, 1] });
  }
  if (last) {
    list.push({ target: "levels", at: boundary(i), opacity: [0, 1], y: [30, 0], ease: "out" });
  }
  return list;
});
