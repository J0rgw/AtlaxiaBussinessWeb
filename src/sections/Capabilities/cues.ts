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

/** Scroll length of the pinned scene, in viewport heights: one per step, and one to close. */
export const SCENE_LENGTH = 6;

const STEPS = stepOrder.length;
/** The five steps, then the closing stretch: "Por dentro", with the five titles lit as a summary. */
const STRETCHES = STEPS + 1;
const FADE = 0.03;
/** Opacity of the step titles that are not being read. */
const DIM = 0.38;

/** Progress where step `i` takes over from the previous one. */
const boundary = (i: number): Range => [i / STRETCHES - FADE, i / STRETCHES + FADE];
/**
  The step texts share one cell: the text that leaves fades out in the first
  half of the boundary and the next one fades in during the second, so two
  texts are never readable on top of each other.
*/
const leaving = (i: number): Range => [i / STRETCHES - FADE, i / STRETCHES];
const arriving = (i: number): Range => [i / STRETCHES, i / STRETCHES + FADE];

/** Progress in the middle of step `i`; `STEPS` gives the middle of the closing stretch. */
export const middleOf = (i: number) => (i + 0.5) / STRETCHES;

const stepCues = stepOrder.flatMap((id, i): Cue[] => {
  const list: Cue[] = [];
  const first = i === 0;
  const last = i === STEPS - 1;
  if (!first) {
    list.push({ target: `title-${id}`, at: boundary(i), opacity: [DIM, 1] });
    list.push({ target: `panel-${id}`, at: arriving(i), opacity: [0, 1], y: [6, 0], ease: "out" });
  }
  if (!last) {
    list.push({ target: `title-${id}`, at: boundary(i + 1), opacity: [1, DIM] });
  }
  // Every step leaves; the last one gives way to the closing note
  list.push({ target: `panel-${id}`, at: leaving(i + 1), opacity: [1, 0], y: [0, -6] });
  if ((chartLayers as readonly string[]).includes(id)) {
    list.push({ target: `layer-${id}`, at: boundary(i), opacity: [0, 1] });
  }
  if (last) {
    list.push({ target: "levels", at: boundary(i), opacity: [0, 1], y: [30, 0], ease: "out" });
  }
  return list;
});

export const cues: Cue[] = [
  ...stepCues,
  // Closing: how it works inside, with the five steps lit as a summary
  ...stepOrder
    .slice(0, -1)
    .map((id): Cue => ({ target: `title-${id}`, at: boundary(STEPS), opacity: [DIM, 1] })),
  { target: "inside", at: arriving(STEPS), opacity: [0, 1], y: [6, 0], ease: "out" },
];
