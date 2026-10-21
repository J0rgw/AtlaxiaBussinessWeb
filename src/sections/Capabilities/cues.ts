import type { Cue, Range } from "@/lib/choreography/choreography";

/*
  Choreography of "Qué hacemos". The scene is split into equal stretches, one
  per step and one to close. Each step arrives large, its text under its own
  title; at the next boundary the text leaves, the title stays (a little
  dimmer) and the next step arrives in the row below. The chart gains one
  sheet per step. Between boundaries the scene does no work.

  Phones play the same cues in another layout: every step sits in the same
  place, and its frame (`step-*`, without a box of its own on wide screens)
  takes the title away with the text.
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
/** Opacity of the titles already read: 4.7:1 on the page, readable at any size. */
const DIM = 0.6;

/** Progress where step `i` takes over from the previous one. */
const boundary = (i: number): Range => [i / STRETCHES - FADE, i / STRETCHES + FADE];
/**
  The text that leaves fades out in the first half of the boundary and the
  next step arrives during the second, so two texts are never readable at once.
*/
const leaving = (i: number): Range => [i / STRETCHES - FADE, i / STRETCHES];
const arriving = (i: number): Range => [i / STRETCHES, i / STRETCHES + FADE];
/** The text follows its title by half a fade. */
const following = (i: number): Range => [i / STRETCHES + FADE / 2, i / STRETCHES + FADE * 1.5];

/** Progress in the middle of step `i`; `STEPS` gives the middle of the closing stretch. */
export const middleOf = (i: number) => (i + 0.5) / STRETCHES;

const stepCues = stepOrder.flatMap((id, i): Cue[] => {
  const list: Cue[] = [];
  const first = i === 0;
  const last = i === STEPS - 1;
  if (!first) {
    list.push({ target: `title-${id}`, at: arriving(i), opacity: [0, 1], y: [24, 0], ease: "out" });
    list.push({ target: `body-${id}`, at: following(i), opacity: [0, 1], y: [8, 0], ease: "out" });
  }
  if (!last) {
    list.push({ target: `words-${id}`, at: boundary(i + 1), opacity: [1, DIM] });
  }
  // Every text leaves in place (it hangs right under its title); the last gives way to the closing note
  list.push({ target: `body-${id}`, at: leaving(i + 1), opacity: [1, 0] });
  // Phones: the whole step leaves with its text, so the next one can take its place
  list.push({ target: `step-${id}`, at: leaving(i + 1), opacity: [1, 0] });
  // Phones: one more part of the bar fills as the step arrives (the first one is full from the start)
  if (!first) {
    list.push({ target: `tick-${id}`, at: arriving(i), scaleX: [0, 1], ease: "out" });
  }
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
    .map((id): Cue => ({ target: `words-${id}`, at: boundary(STEPS), opacity: [DIM, 1] })),
  { target: "inside", at: arriving(STEPS), opacity: [0, 1], y: [6, 0], ease: "out" },
];
