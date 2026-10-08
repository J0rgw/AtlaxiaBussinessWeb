/*
  Minimal Lottie (Bodymovin 5.7) builder for the ATLAXIA scroll scenes.
  Output renders the same in Skottie (text-to-lottie player, used to preview)
  and in lottie-web light (the site). Only features both support: shape
  layers, null layers, groups, paths, rects, ellipses, strokes with dashes,
  fills, trim paths and keyframed transforms. No text, no expressions.
*/

// ---------------------------------------------------------------------------
// Colors: the site tokens (src/styles/tokens.css), as RGB 0 to 1
// ---------------------------------------------------------------------------

function hex(value) {
  const n = Number.parseInt(value.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => round(c / 255, 4));
}

/** OKLCH to sRGB, for the cobalt tokens defined in oklch(). */
function oklch(L, C, h) {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return linear.map((c) => {
    const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
    return round(Math.min(1, Math.max(0, v)), 4);
  });
}

export const color = {
  bg: hex("#f2f4f8"),
  raised: hex("#ffffff"),
  inset: hex("#eaedf2"),
  line: hex("#cdd3dc"),
  strong: hex("#7a8089"),
  muted: hex("#5b6169"),
  ink: hex("#0e1116"),
  accent: oklch(0.58, 0.14, 255),
  accentInk: oklch(0.46, 0.15, 255),
  accentSoft: oklch(0.94, 0.04, 255),
};

// ---------------------------------------------------------------------------
// Numbers and easing
// ---------------------------------------------------------------------------

export function round(n, digits = 2) {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

export const lerp = (a, b, u) => a + (b - a) * u;
export const clamp01 = (u) => Math.min(1, Math.max(0, u));

/** Bezier handles, same curves as the site tokens (--ease-out, --ease-in-out). */
export const ease = {
  linear: { o: { x: [0], y: [0] }, i: { x: [1], y: [1] } },
  out: { o: { x: [0.25], y: [1] }, i: { x: [0.5], y: [1] } },
  inOut: { o: { x: [0.65], y: [0] }, i: { x: [0.35], y: [1] } },
  in: { o: { x: [0.5], y: [0] }, i: { x: [0.75], y: [0] } },
};

/** Cubic in-out as a function, for sampled curves (camera). */
export function easeInOut(u) {
  return u < 0.5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2;
}

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

const asArray = (v) => (Array.isArray(v) ? v : [v]);

/** A static property. */
export const fixed = (k) => ({ a: 0, k });

/**
 * An animated property from [frame, value] pairs. `curve` is one easing for
 * every segment, or a function (index) => easing.
 */
export function anim(keys, curve = ease.inOut) {
  const sorted = [...keys].sort((x, y) => x[0] - y[0]);
  if (sorted.length === 1) return fixed(sorted[0][1]);
  return {
    a: 1,
    k: sorted.map(([t, v], index) => {
      const key = { t: round(t, 3), s: asArray(v) };
      if (index === sorted.length - 1) return key;
      const c = typeof curve === "function" ? curve(index) : curve;
      return { ...key, o: c.o, i: c.i };
    }),
  };
}

/** Fade in over [from, to], optionally fade out over [outFrom, outTo]. */
export function fade(inFrom, inTo, outFrom, outTo, max = 100) {
  const keys = [
    [inFrom, 0],
    [inTo, max],
  ];
  if (outFrom !== undefined) keys.push([outFrom, max], [outTo, 0]);
  if (inFrom <= 0 && inTo <= 0) keys.shift();
  return anim(keys, ease.inOut);
}

/** Trim end from 0 to 100 between two frames: the path draws on. */
export function drawOn(from, to, curve = ease.inOut) {
  return trim(
    fixed(0),
    anim(
      [
        [from, 0],
        [to, 100],
      ],
      curve,
    ),
  );
}

// ---------------------------------------------------------------------------
// Shapes
// ---------------------------------------------------------------------------

export function transform({ p = [0, 0], a = [0, 0], s = [100, 100], r = 0, o = 100 } = {}) {
  const prop = (v) => (v && typeof v === "object" && "a" in v ? v : fixed(v));
  return {
    ty: "tr",
    p: prop(p),
    a: prop(a),
    s: prop(s),
    r: prop(r),
    o: prop(o),
    sk: fixed(0),
    sa: fixed(0),
  };
}

/**
 * Lottie paints the first item of a list in front. Lists made only of groups
 * are written back to front in this builder (like layers) and reversed here.
 * Lists with paths keep their order: paths, then modifiers (trim), then
 * styles, with the stroke before the fill so it stays on top.
 */
export function backToFront(items) {
  return items.every((item) => item.ty === "gr") ? [...items].reverse() : items;
}

export function group(nm, items, t) {
  return { ty: "gr", nm, it: [...backToFront(items), transform(t)] };
}

/** Polyline through points. */
export function poly(points, closed = false) {
  return {
    ty: "sh",
    ks: fixed({
      i: points.map(() => [0, 0]),
      o: points.map(() => [0, 0]),
      v: points.map(([x, y]) => [round(x), round(y)]),
      c: closed,
    }),
  };
}

/**
 * Path from a start point and cubic segments [c1, c2, end] (absolute points).
 * Lottie stores tangents relative to their vertex.
 */
export function bezier(start, segments, closed = false) {
  const v = [start, ...segments.map((seg) => seg[2])];
  const o = v.map(() => [0, 0]);
  const i = v.map(() => [0, 0]);
  segments.forEach(([c1, c2, end], k) => {
    o[k] = [round(c1[0] - v[k][0]), round(c1[1] - v[k][1])];
    i[k + 1] = [round(c2[0] - end[0]), round(c2[1] - end[1])];
  });
  return {
    ty: "sh",
    ks: fixed({ i, o, v: v.map(([x, y]) => [round(x), round(y)]), c: closed }),
  };
}

/** Quadratic arc from p0 to p1 through a control point, as one cubic. */
export function arc(p0, q, p1) {
  const c1 = [p0[0] + (2 / 3) * (q[0] - p0[0]), p0[1] + (2 / 3) * (q[1] - p0[1])];
  const c2 = [p1[0] + (2 / 3) * (q[0] - p1[0]), p1[1] + (2 / 3) * (q[1] - p1[1])];
  return bezier(p0, [[c1, c2, p1]]);
}

/** Smooth curve through points (Catmull-Rom converted to cubic segments). */
export function smooth(points, tension = 1) {
  const segs = [];
  for (let k = 0; k < points.length - 1; k += 1) {
    const p0 = points[k - 1] ?? points[k];
    const p1 = points[k];
    const p2 = points[k + 1];
    const p3 = points[k + 2] ?? p2;
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * tension, p1[1] + ((p2[1] - p0[1]) / 6) * tension];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * tension, p2[1] - ((p3[1] - p1[1]) / 6) * tension];
    segs.push([c1, c2, p2]);
  }
  return bezier(points[0], segs);
}

export function rect(x, y, w, h, r = 0) {
  return {
    ty: "rc",
    p: fixed([round(x + w / 2), round(y + h / 2)]),
    s: fixed([w, h]),
    r: fixed(r),
  };
}

export function ellipse(cx, cy, rx, ry = rx) {
  return { ty: "el", p: fixed([round(cx), round(cy)]), s: fixed([rx * 2, ry * 2]) };
}

const asProp = (v) => (typeof v === "number" || Array.isArray(v) ? fixed(v) : v);

/** Stroke. `width` and the dash values can be numbers or animated properties. */
export function stroke(rgb, width, { opacity = 100, dash } = {}) {
  const st = {
    ty: "st",
    c: fixed([...rgb, 1]),
    o: asProp(opacity),
    w: asProp(width),
    lc: 2,
    lj: 2,
    ml: 4,
  };
  if (dash) {
    st.d = [
      { n: "d", nm: "dash", v: asProp(dash.dash) },
      { n: "g", nm: "gap", v: asProp(dash.gap) },
      { n: "o", nm: "offset", v: asProp(dash.offset ?? 0) },
    ];
  }
  return st;
}

/** Fill. `rule` 2 is even-odd: a path inside another leaves a hole. */
export function fill(rgb, opacity = 100, rule = 1) {
  return { ty: "fl", c: fixed([...rgb, 1]), o: asProp(opacity), r: rule };
}

export function trim(start, end, offset = fixed(0)) {
  return { ty: "tm", s: start, e: end, o: offset, m: 1 };
}

// ---------------------------------------------------------------------------
// Layers and document
// ---------------------------------------------------------------------------

export function createDocument({ name, width, height, frames, fps = 60 }) {
  let index = 0;
  const layers = [];

  /**
   * Adds a layer. Lottie draws the first layer on top, so layers are kept in
   * the order they are added and reversed on output: add the back first.
   */
  /**
   * `st` delays every animation of the layer by that many frames (Lottie start
   * time): a whole layer can wait for an intro without retiming its keys.
   */
  function addLayer({
    nm,
    shapes,
    parent,
    null: isNull = false,
    ks = {},
    ip = 0,
    op = frames,
    st = 0,
  }) {
    index += 1;
    const layer = {
      ddd: 0,
      ind: index,
      ty: isNull ? 3 : 4,
      nm,
      sr: 1,
      ks: {
        o: asProp(ks.o ?? 100),
        r: asProp(ks.r ?? 0),
        p: asProp(ks.p ?? [0, 0, 0]),
        a: asProp(ks.a ?? [0, 0, 0]),
        s: asProp(ks.s ?? [100, 100, 100]),
      },
      ao: 0,
      ip,
      op,
      st,
      bm: 0,
    };
    if (parent) layer.parent = parent;
    if (!isNull) layer.shapes = backToFront(shapes ?? []);
    layers.push(layer);
    return index;
  }

  /** Full-frame background in the page color, exposed as the bgColor slot. */
  function addBackground() {
    addLayer({
      nm: "background",
      ks: { p: [width / 2, height / 2, 0] },
      shapes: [
        group("background", [
          rect(-width / 2, -height / 2, width, height),
          { ty: "fl", c: { a: 0, k: [...color.bg, 1], sid: "bgColor" }, o: fixed(100), r: 1 },
        ]),
      ],
    });
  }

  function toJSON() {
    return {
      v: "5.7.0",
      fr: fps,
      ip: 0,
      op: frames,
      w: width,
      h: height,
      nm: name,
      ddd: 0,
      assets: [],
      slots: { bgColor: { p: { a: 0, k: [...color.bg, 1] } } },
      layers: [...layers].reverse(),
    };
  }

  return { addLayer, addBackground, toJSON };
}
