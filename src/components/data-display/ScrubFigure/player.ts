/*
  Player for the anatomy figures (scripts/anatomy): a static isometric SVG
  whose parts carry `data-g` tags, moved by a timeline of tracks keyed on
  progress (0 to 1). Everything follows progress, the repeating motions too
  (a fan, water in a pipe, a turbine): they run through `span` seconds of
  motion over the whole progress, so in a scroll scene nothing moves unless
  the page does.

  Framework-free on purpose: the build strips the types and inlines this file
  into its preview pages, so the page and the previews run the same code.
*/

/** [progress, value] */
export type Key<T> = [number, T];

/** io: cubic in-out (the site's --ease-in-out), o: out, i: in, l: linear. */
export type Ease = "io" | "o" | "i" | "l";

export type Track =
  /** Opacity. Hidden (display: none) at 0, so idle parts cost nothing. */
  | { s: string; o: Key<number>[]; e?: Ease }
  /** Uniform scale about a fixed point of the viewBox: an instrument popping in. */
  | { s: string; pop: [number, number]; k: Key<number>[]; e?: Ease }
  /** Translation in viewBox units: a part travelling along a world axis. */
  | { s: string; tr: Key<[number, number]>[]; e?: Ease }
  /** Reveal in order of each element's `data-at` (0 to 1) between two progress values. */
  | { s: string; rv: [from: number, to: number, soft: number] }
  /**
   * Draws a path on: its stroke has pathLength 1 and dasharray "1 1". When the
   * path is a mask's (a relation drawn through a wide stroke of its own line),
   * the masked element is hidden until the draw starts and the mask is lifted
   * once it is complete: a mask is drawn offscreen on every repaint, and the
   * relations repaint on every frame of the scroll (their dashes run).
   */
  | { s: string; dr: Key<number>[]; e?: Ease }
  /** Rotation in degrees of a group drawn in its own (face) plane. */
  | { s: string; rot: Key<number>[]; e?: Ease }
  /**
   * Interpolates every path of the element through a set of shapes
   * (morphs[mo]); the keyed value is a fractional index into the set.
   */
  | { s: string; mo: number; k: Key<number>[]; e?: Ease }
  /** Camera zoom about the focus point f: scale from `base` (the scale it is drawn at) to each key. */
  | { s: string; cam: { f: [number, number]; base: number; k: Key<number>[] } };

export type Loop =
  /** Turns a face-plane group once every `spin` seconds (negative: the other way). */
  | { s: string; spin: number }
  /** Steps through the element's [data-f] children, `frames` of them every `period` seconds. */
  | { s: string; frames: number; period: number }
  /** Slides a group left by `slide[0]` viewBox units every `slide[1]` seconds, then wraps: a trace on a display. */
  | { s: string; slide: [number, number] }
  /** Moves dashes along a path: dashoffset = data-o - flow * seconds (viewBox units). */
  | { s: string; flow: number };

export type Timeline = {
  v: 1;
  tracks: Track[];
  loops?: Loop[];
  /** Sets of shapes for `mo` tracks: each shape lists one path data per path, same commands throughout. */
  morphs?: string[][][];
  /** Readout text from each progress on (stepwise), for the preview plates. */
  say?: Key<string>[];
  /** Seconds of repeating motion (loops) from progress 0 to 1. */
  span?: number;
};

export type Player = {
  seek: (progress: number) => void;
  readout: (progress: number) => string;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function eased(u: number, ease: Ease = "io"): number {
  if (ease === "l") return u;
  if (ease === "o") return 1 - (1 - u) ** 3;
  if (ease === "i") return u ** 3;
  return u < 0.5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2;
}

function lerp<T extends number | number[]>(a: T, b: T, u: number): T {
  if (typeof a === "number") return (a + ((b as number) - a) * u) as T;
  return (a as number[]).map(
    (value, index) => value + (((b as number[])[index] ?? value) - value) * u,
  ) as T;
}

/** The value of a keyed track at `progress`, holding the first and last keys outside them. */
function valueAt<T extends number | number[]>(keys: Key<T>[], progress: number, ease?: Ease): T {
  let previous = keys[0] as Key<T>;
  if (progress <= previous[0]) return previous[1];
  for (const key of keys) {
    const [p1, v1] = key;
    if (progress <= p1) {
      const [p0, v0] = previous;
      const u = p1 > p0 ? (progress - p0) / (p1 - p0) : 1;
      return lerp(v0, v1, eased(u, ease));
    }
    previous = key;
  }
  return previous[1];
}

/** Number tokens of a path, with the text around them, for morphing. */
function tokensOf(d: string): { parts: string[]; numbers: number[] } {
  const parts: string[] = [];
  const numbers: number[] = [];
  let last = 0;
  for (const match of d.matchAll(/-?\d*\.?\d+(?:e-?\d+)?/g)) {
    parts.push(d.slice(last, match.index));
    numbers.push(Number(match[0]));
    last = (match.index ?? 0) + match[0].length;
  }
  parts.push(d.slice(last));
  return { parts, numbers };
}

const round = (value: number) => Math.round(value * 100) / 100;

export function createPlayer(root: Element, timeline: Timeline): Player {
  const all = (selector: string) => Array.from(root.querySelectorAll<SVGElement>(selector));
  const cache = new WeakMap<Element, Map<string, string>>();

  /** Writes a style or attribute only when it changes (scrubbing calls this every frame). */
  function write(element: SVGElement, name: string, value: string) {
    let seen = cache.get(element);
    if (!seen) {
      seen = new Map();
      cache.set(element, seen);
    }
    if (seen.get(name) === value) return;
    seen.set(name, value);
    if (name === "opacity") {
      element.style.opacity = value;
      element.style.display = Number(value) <= 0.001 ? "none" : "";
    } else if (name === "dashoffset") {
      element.style.strokeDashoffset = value;
    } else if (name === "display") {
      element.style.display = value;
    } else {
      element.setAttribute(name, value);
    }
  }

  // Per set: for each path, its text parts and the numbers of every shape
  const morphs = (timeline.morphs ?? []).map((shapes) => {
    const first = shapes[0] ?? [];
    return first.map((_, path) => {
      const tokens = shapes.map((shape) => tokensOf(shape[path] ?? ""));
      return { parts: tokens[0]?.parts ?? [], numbers: tokens.map((token) => token.numbers) };
    });
  });

  const tracks = timeline.tracks.map((track) => ({ track, elements: all(track.s) }));
  // For draw-on paths inside a <mask>: what the mask applies to, and how it refers to it
  const masked = new Map<Element, { targets: SVGElement[]; ref: string }>();
  for (const { track, elements } of tracks) {
    if (!("dr" in track)) continue;
    for (const element of elements) {
      const mask = element.parentElement;
      if (mask?.tagName !== "mask" || !mask.id) continue;
      const ref = `url(#${mask.id})`;
      masked.set(element, { targets: all(`[mask="${ref}"]`), ref });
    }
  }
  const logKeys = new Map<Track, Key<number>[]>();
  for (const track of timeline.tracks) {
    if ("cam" in track)
      logKeys.set(
        track,
        track.cam.k.map(([at, scale]) => [at, Math.log(scale)]),
      );
  }
  const loops = (timeline.loops ?? []).map((loop) => ({ loop, elements: all(loop.s) }));
  const say = timeline.say ?? [];
  const span = timeline.span ?? 8;

  let last = NaN;

  function seek(progress: number) {
    const p = clamp01(progress);
    if (p === last) return;
    last = p;
    for (const { track, elements } of tracks) {
      if ("o" in track) {
        const value = String(round(valueAt(track.o, p, track.e)));
        elements.forEach((element) => write(element, "opacity", value));
      } else if ("pop" in track) {
        const s = valueAt(track.k, p, track.e);
        const [x, y] = track.pop;
        const transform = `translate(${x} ${y}) scale(${round(Math.max(s, 0.001))}) translate(${-x} ${-y})`;
        elements.forEach((element) => {
          write(element, "transform", transform);
          write(element, "opacity", s <= 0.001 ? "0" : "1");
        });
      } else if ("tr" in track) {
        const [x, y] = valueAt(track.tr, p, track.e);
        const transform = `translate(${round(x)} ${round(y)})`;
        elements.forEach((element) => write(element, "transform", transform));
      } else if ("rv" in track) {
        const [from, to, soft] = track.rv;
        elements.forEach((element) => {
          const at = Number(element.dataset.at ?? 0);
          const start = from + at * (to - from - soft);
          write(element, "opacity", String(round(eased(clamp01((p - start) / soft), "io"))));
        });
      } else if ("dr" in track) {
        const offset = round(1 - valueAt(track.dr, p, track.e));
        elements.forEach((element) => {
          write(element, "dashoffset", String(offset));
          const mask = masked.get(element);
          mask?.targets.forEach((target) => {
            write(target, "display", offset >= 1 ? "none" : "");
            write(target, "mask", offset <= 0 ? "none" : mask.ref);
          });
        });
      } else if ("rot" in track) {
        const transform = `rotate(${round(valueAt(track.rot, p, track.e))})`;
        elements.forEach((element) => write(element, "transform", transform));
      } else if ("mo" in track) {
        const paths = morphs[track.mo] ?? [];
        const count = paths[0]?.numbers.length ?? 0;
        const v = Math.min(Math.max(valueAt(track.k, p, track.e), 0), Math.max(0, count - 1));
        const i0 = Math.min(Math.floor(v), Math.max(0, count - 2));
        const u = v - i0;
        elements.forEach((element) => {
          element.querySelectorAll("path").forEach((path, index) => {
            const morph = paths[index];
            const a = morph?.numbers[i0];
            if (!morph || !a) return;
            const b = morph.numbers[i0 + 1] ?? a;
            const d = morph.parts
              .map((text, i) => {
                const from = a[i];
                if (from === undefined) return text;
                return text + round(from + ((b[i] ?? from) - from) * u);
              })
              .join("");
            write(path, "d", d);
          });
        });
      } else if ("cam" in track) {
        const { f, base } = track.cam;
        // Interpolated in log space, so the zoom speed feels constant
        const s = Math.exp(valueAt(logKeys.get(track) ?? [], p)) / base;
        const transform = `matrix(${s} 0 0 ${s} ${round(f[0] - s * f[0])} ${round(f[1] - s * f[1])})`;
        elements.forEach((element) => write(element, "transform", transform));
      }
    }
    loopsAt(p * span);
  }

  /** The repeating motions after `seconds` of motion. */
  function loopsAt(seconds: number) {
    for (const { loop, elements } of loops) {
      if ("spin" in loop) {
        const turn = `rotate(${round(((seconds / loop.spin) * 360) % 360)})`;
        elements.forEach((element) => write(element, "transform", turn));
      } else if ("slide" in loop) {
        const [distance, period] = loop.slide;
        const shift = `translate(${round(-distance * ((seconds / period) % 1))} 0)`;
        elements.forEach((element) => write(element, "transform", shift));
      } else if ("frames" in loop) {
        const shown = String(Math.floor((seconds / loop.period) * loop.frames) % loop.frames);
        elements.forEach((element) => {
          element.querySelectorAll<SVGElement>(":scope > [data-f]").forEach((child) => {
            write(child, "opacity", child.dataset.f === shown ? "1" : "0");
          });
        });
      } else {
        elements.forEach((element) => {
          const base = Number(element.dataset.o ?? 0);
          write(element, "dashoffset", String(round(base - loop.flow * seconds)));
        });
      }
    }
  }

  function readout(progress: number) {
    let text = say[0]?.[1] ?? "";
    for (const [at, value] of say) if (progress >= at) text = value;
    return text;
  }

  return { seek, readout };
}
