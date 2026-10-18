/*
  Scroll choreography as data. A scene lists cues: which element (by its
  `data-cue` name) changes what, and in which stretch of the scene progress
  (0 when the scene pins, 1 when it releases). Only opacity and transform, so
  every frame stays on the compositor.

  The cues are compiled once into one keyframe track per element. Every engine
  (in-house, Motion, GSAP) plays the same tracks, and `stateAt` gives the
  static styles for any progress: the first paint, and the snapshots shown
  with reduced motion.
*/

export type Range = readonly [number, number];

export type Ease = "linear" | "out" | "inOut";

export type Cue = {
  /** `data-cue` value of the element it moves. */
  target: string;
  /** Stretch of the scene progress where the change happens. */
  at: Range;
  opacity?: Range;
  /** Translation in % of the element's own box. */
  x?: Range;
  y?: Range;
  scale?: Range;
  scaleX?: Range;
  scaleY?: Range;
  /** Tilt around the horizontal axis, in degrees (the parent sets the perspective). */
  rotateX?: Range;
  ease?: Ease;
};

export type CueState = {
  opacity: number;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotateX: number;
};

export type Keyframe = CueState & { offset: number };

export type Track = { target: string; keyframes: Keyframe[] };

type Property = keyof CueState;

const defaults: CueState = { opacity: 1, x: 0, y: 0, scaleX: 1, scaleY: 1, rotateX: 0 };

const eases: Record<Ease, (t: number) => number> = {
  linear: (t) => t,
  out: (t) => 1 - (1 - t) ** 3,
  inOut: (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
};

// Eased stretches are sampled so engines can play every track linearly.
const EASE_SAMPLES = 6;

type Segment = { at: Range; values: Range; ease: Ease };

function segmentsOf(cue: Cue): Array<[Property, Segment]> {
  const ease = cue.ease ?? "inOut";
  const out: Array<[Property, Segment]> = [];
  const push = (property: Property, values: Range | undefined) => {
    if (values) out.push([property, { at: cue.at, values, ease }]);
  };
  push("opacity", cue.opacity);
  push("x", cue.x);
  push("y", cue.y);
  push("scaleX", cue.scale && cue.scaleX ? mul(cue.scale, cue.scaleX) : (cue.scaleX ?? cue.scale));
  push("scaleY", cue.scale && cue.scaleY ? mul(cue.scale, cue.scaleY) : (cue.scaleY ?? cue.scale));
  push("rotateX", cue.rotateX);
  return out;
}

function mul(a: Range, b: Range): Range {
  return [a[0] * b[0], a[1] * b[1]];
}

/** Value of one property at `progress`: hold before, interpolate inside, hold after. */
function valueAt(segments: Segment[], progress: number, fallback: number): number {
  if (segments.length === 0) return fallback;
  let value = segments[0]!.values[0];
  for (const { at, values, ease } of segments) {
    if (progress <= at[0]) return value;
    if (progress >= at[1]) {
      value = values[1];
      continue;
    }
    const t = eases[ease]((progress - at[0]) / (at[1] - at[0]));
    return values[0] + (values[1] - values[0]) * t;
  }
  return value;
}

type Compiled = Map<string, Map<Property, Segment[]>>;

function group(cues: readonly Cue[]): Compiled {
  const byTarget: Compiled = new Map();
  for (const cue of cues) {
    const properties = byTarget.get(cue.target) ?? new Map<Property, Segment[]>();
    byTarget.set(cue.target, properties);
    for (const [property, segment] of segmentsOf(cue)) {
      const list = properties.get(property) ?? [];
      list.push(segment);
      properties.set(property, list);
    }
  }
  for (const properties of byTarget.values()) {
    for (const list of properties.values()) list.sort((a, b) => a.at[0] - b.at[0]);
  }
  return byTarget;
}

function stateOf(properties: Map<Property, Segment[]>, progress: number): CueState {
  const state = { ...defaults };
  for (const key of Object.keys(defaults) as Property[]) {
    state[key] = valueAt(properties.get(key) ?? [], progress, defaults[key]);
  }
  return state;
}

/** One keyframe track per element, linear between keyframes, from 0 to 1. */
export function compile(cues: readonly Cue[]): Track[] {
  return Array.from(group(cues), ([target, properties]) => {
    const offsets = new Set<number>([0, 1]);
    for (const list of properties.values()) {
      for (const { at, ease } of list) {
        offsets.add(at[0]);
        offsets.add(at[1]);
        if (ease === "linear") continue;
        for (let i = 1; i < EASE_SAMPLES; i += 1) {
          offsets.add(at[0] + ((at[1] - at[0]) * i) / EASE_SAMPLES);
        }
      }
    }
    const keyframes = Array.from(offsets)
      .filter((offset) => offset >= 0 && offset <= 1)
      .sort((a, b) => a - b)
      .map((offset) => ({ offset: round(offset), ...stateOf(properties, offset) }));
    return { target, keyframes };
  });
}

/** Static state of every cued element at `progress`. */
export function stateAt(cues: readonly Cue[], progress: number): Map<string, CueState> {
  return new Map(
    Array.from(group(cues), ([target, properties]) => [target, stateOf(properties, progress)]),
  );
}

/** Interpolated state of a compiled track (what the in-house engine writes). */
export function sample(keyframes: readonly Keyframe[], progress: number): CueState {
  const last = keyframes[keyframes.length - 1]!;
  if (progress >= last.offset) return last;
  let i = 1;
  while (i < keyframes.length - 1 && keyframes[i]!.offset < progress) i += 1;
  const a = keyframes[i - 1]!;
  const b = keyframes[i]!;
  const t = b.offset > a.offset ? Math.max(0, (progress - a.offset) / (b.offset - a.offset)) : 1;
  return {
    opacity: a.opacity + (b.opacity - a.opacity) * t,
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    scaleX: a.scaleX + (b.scaleX - a.scaleX) * t,
    scaleY: a.scaleY + (b.scaleY - a.scaleY) * t,
    rotateX: a.rotateX + (b.rotateX - a.rotateX) * t,
  };
}

/** Same string in every engine and in the static render. */
export function toTransform({ x, y, scaleX, scaleY, rotateX }: CueState): string {
  const flat = `translate(${round(x)}%, ${round(y)}%) scale(${round(scaleX)}, ${round(scaleY)})`;
  return rotateX ? `${flat} rotateX(${round(rotateX)}deg)` : flat;
}

export function round(value: number): number {
  return Math.round(value * 10000) / 10000;
}
