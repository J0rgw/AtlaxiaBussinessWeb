import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as A from "./kit/audit.mjs";
import * as k from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import { tubePieces, tubeSvg } from "./kit/tube.mjs";

/*
  Shared builder for the anatomy figures (the anatomy skill's kit, copied in
  ./kit). A figure is a list of solids, pipes and lines, each recorded with its
  true shape so the kit's audit can settle the painter's order and prove the
  geometry, plus a timeline that the page's player (ScrubFigure) runs on
  scroll progress.

  Every item can carry tags (data-g); the timeline addresses parts by tag.
*/

export { A, G, k };

const here = path.dirname(fileURLToPath(import.meta.url));
export const V2 = path.resolve(here, "../..");

export const r2 = (value) => Math.round(value * 100) / 100;

/** Speed of the dashes along a relation, in px per second of motion. */
export const RELATION_FLOW = 16;

/**
 * Rewrites a polyline path (M, L, Z with absolute numbers, as the kit writes
 * them) with relative steps: the same shape in about two thirds of the text.
 * Steps are taken between the rounded absolute points, so nothing drifts.
 */
export function compactPath(d) {
  if (!/^[MLZ0-9.\-\s]+$/.test(d)) return d;
  const fmt = (v) => {
    const text = (Math.round(v * 10) / 10)
      .toFixed(1)
      .replace(/\.0$/, "")
      .replace(/^(-?)0\./, "$1.");
    return text === "-0" ? "0" : text;
  };
  const join = (a, b) => (b.startsWith("-") ? `${a}${b}` : `${a} ${b}`);
  let out = "";
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  for (const [, cmd, args] of d.matchAll(/([MLZ])([^MLZ]*)/g)) {
    if (cmd === "Z") {
      out += "z";
      x = sx;
      y = sy;
      continue;
    }
    const nums = args
      .trim()
      .split(/[\s,]+|(?=-)/)
      .filter(Boolean)
      .map(Number);
    for (let i = 0; i + 1 < nums.length; i += 2) {
      const nx = Math.round(nums[i] * 10) / 10;
      const ny = Math.round(nums[i + 1] * 10) / 10;
      if (cmd === "M" && i === 0) {
        out += `M${join(fmt(nx), fmt(ny))}`;
        sx = nx;
        sy = ny;
      } else {
        const dx = fmt(nx - x);
        const dy = fmt(ny - y);
        out += `l${join(dx, dy)}`;
      }
      x = nx;
      y = ny;
    }
  }
  return out;
}

const compactAll = (markup) => markup.replace(/ d="([^"]*)"/g, (_, d) => ` d="${compactPath(d)}"`);

/** Share (0 to 1) of a polyline's length at the point nearest to `point`. */
export function shareAlong(points, point) {
  return arcAt(points, point) / G.pathLength(points);
}

/** Arc length along a polyline of the point nearest to `point`. */
export function arcAt(line, point) {
  let best = Infinity;
  let bestS = 0;
  let walked = 0;
  for (let i = 1; i < line.length; i += 1) {
    const a = line[i - 1];
    const d = G.sub3(line[i], a);
    const length = G.len3(d);
    const t = length
      ? Math.min(1, Math.max(0, G.dot3(G.sub3(point, a), d) / (length * length)))
      : 0;
    const distance = G.len3(G.sub3(point, G.add3(a, G.mul3(d, t))));
    if (distance < best) {
      best = distance;
      bestS = walked + t * length;
    }
    walked += length;
  }
  return bestS;
}
export const clamp01 = (u) => Math.min(1, Math.max(0, u));
export const lerp = (a, b, u) => a + (b - a) * u;

const signed = (poly) =>
  poly.reduce((sum, [x, y], index) => {
    const [x2, y2] = poly[(index + 1) % poly.length];
    return sum + x * y2 - x2 * y;
  }, 0);
const screenOriented = (points) => (signed(points) < 0 ? [...points].reverse() : points);

/** Runs of consecutive indices (cyclic) whose flag equals `want`. */
function runsWhere(flags, want) {
  const count = flags.length;
  const runs = [];
  const start = flags.findIndex((flag, index) => flag !== flags[(index + count - 1) % count]);
  if (start < 0)
    return flags[0] === want ? [Array.from({ length: count + 1 }, (_, i) => i % count)] : [];
  let run = null;
  for (let step = 0; step < count; step += 1) {
    const index = (start + step) % count;
    if (flags[index] === want) {
      if (!run) run = [index];
      run.push((index + 1) % count);
    } else if (run) {
      runs.push(run);
      run = null;
    }
  }
  if (run) runs.push(run);
  return runs;
}

/**
 * A figure in the making.
 * @param {{ id: string, width: number, height: number, P: object }} options
 */
export function createFigure({ id, width, height, P }) {
  const R = A.recorder(P);
  const record = R.solid;
  const V = G.viewOf(P);
  const KS = G.scaleOf(P);
  const at = (point) => k.iso(point, P);
  const S = (paths, style) => k.solidSvg(paths, style);
  const Ln = (d, style) => k.lineSvg(d, style);
  const Dots = (points, style) => k.dotsSvg(points, style);
  const path3 = (points, closed = false) => k.pathOf(points.map(at), closed);
  const depth = (point) => G.dot3(point, V);

  const back = [];
  const front = [];
  const defs = [];
  const tracks = [];
  const loops = [];
  const morphs = [];
  const say = [];
  const routes = new Map();
  const assembles = [];

  const tagsOf = (tags) => [tags].flat().filter(Boolean);

  /** Puts a drawn item into the sorted list. */
  function put(name, ref, svg, shapes = [], { bias = 0, tags, attrs = "", key, share } = {}) {
    if (share !== undefined) attrs += ` data-at="${r2(share)}"`;
    return R.put({
      name: R.nameFor(name),
      at: ref,
      bias,
      ...(key !== undefined ? { key } : {}),
      svg,
      shapes,
      piece: "fig",
      tags: tagsOf(tags),
      attrs,
    });
  }

  // -------------------------------------------------------------------------
  // Solids
  // -------------------------------------------------------------------------

  function slab(name, plan, z, h, style = {}, o = {}) {
    const { steps = 3, bevel = 0, extra = "", inner = "", bias = 0, tags, owner, ground } = o;
    const shape = record(A.slab(plan, z, h, { name, owner, ...(ground ? { ground } : {}) }, steps));
    const centre = [plan.x + plan.w / 2, plan.y + plan.d / 2, z + h / 2];
    put(
      name,
      o.ref ?? centre,
      S(k.slabOf(plan, z, h, P, steps, bevel), { tone: "mid", ...style, inner }) + extra,
      [shape],
      {
        bias,
        tags,
        share: o.share,
      },
    );
    return shape;
  }

  function box(name, [x0, y0, z0], [x1, y1, z1], style = {}, o = {}) {
    const plan = { x: x0, y: y0, w: x1 - x0, d: y1 - y0, r: o.r ?? 0.4 };
    return slab(name, plan, z0, z1 - z0, style, { steps: 2, ...o });
  }

  function cyl(name, cx, cy, r, z, h, style = {}, o = {}) {
    const { steps = 32, bevel = 0, extra = "", inner = "", bias = 0, tags, owner } = o;
    const shape = record(A.cylinder(cx, cy, r, z, h, { name, owner }));
    put(
      name,
      o.ref ?? [cx, cy, z + h / 2],
      S(k.cylinder(cx, cy, r, z, h, P, steps, bevel), { tone: "mid", ...style, inner }) + extra,
      [shape],
      {
        bias,
        tags,
        share: o.share,
      },
    );
    return shape;
  }

  function turned(name, F, profile, style = {}, o = {}) {
    const {
      extra = "",
      inner = "",
      bias = 0,
      tags,
      owner,
      steps,
      rims,
      bevel = 0,
      smooth,
      fill,
    } = o;
    const options = {
      bevel,
      ...(smooth !== undefined ? { smooth } : {}),
      ...(steps ? { steps } : {}),
      ...(rims ? { rims } : {}),
      ...(fill ? { fill } : {}),
    };
    const paths = G.solidOf(profile, F, P, options);
    const mid = (profile[0][0] + profile[profile.length - 1][0]) / 2;
    const radius = smooth && smooth.radius ? smooth.radius : undefined;
    const curve =
      profile.some((point) => point[2]) && !(smooth && smooth.slope) ? profile : undefined;
    const shape = record(A.solid(F, profile, { name, owner, radius, curve }));
    put(
      name,
      o.ref ?? G.add3(F.o, G.mul3(F.a, mid)),
      S(paths, { tone: "mid", ...style, inner }) + extra,
      [shape],
      {
        bias,
        tags,
        share: o.share,
      },
    );
    return shape;
  }

  const disc = (name, F, s0, s1, r, style = {}, o = {}) =>
    turned(
      name,
      F,
      [
        [s0, r],
        [s1, r],
      ],
      style,
      o,
    );

  /** An annulus with thickness: a handwheel rim, a collar, a flange round something. */
  function ring(name, F, s0, s1, rIn, rOut, style = {}, o = {}) {
    const { extra = "", inner = "", bias = 0, tags, owner, steps } = o;
    const shape = record(A.ring(F, s0, s1, rIn, rOut, { name, owner }));
    const paths = G.ringBand(s0, s1, rIn, rOut, F, P, steps ? { steps } : {});
    put(
      name,
      o.ref ?? G.add3(F.o, G.mul3(F.a, (s0 + s1) / 2)),
      S(paths, { tone: "mid", ...style, inner }) + extra,
      [shape],
      {
        bias,
        tags,
        share: o.share,
      },
    );
    return shape;
  }

  function ball(name, c, r, style = {}, o = {}) {
    const { bias = 0, extra = "", tags, owner } = o;
    const shape = record(A.ball(c, r, { name, owner }));
    put(
      name,
      c,
      S(G.sphereOf(c, r, P, { steps: o.steps ?? 32 }), { tone: "mid", ...style }) + extra,
      [shape],
      {
        bias,
        tags,
        share: o.share,
      },
    );
    return shape;
  }

  /** Paths of a prism of any (also concave) polygon in the frame's u, v plane, extruded along F.a. */
  function prismPaths(F, poly, s0, s1) {
    const ring = signed(poly) > 0 ? poly : [...poly].reverse();
    const n = ring.length;
    const W3 = (s, [x, y]) =>
      G.add3(G.add3(G.add3(F.o, G.mul3(F.a, s)), G.mul3(F.u, x)), G.mul3(F.v, y));
    const capNear = G.dot3(F.a, V) > 0;
    const [nearS, farS] = capNear ? [s1, s0] : [s0, s1];
    const near = ring.map((p) => at(W3(nearS, p)));
    const far = ring.map((p) => at(W3(farS, p)));
    const normals = ring.map(([x0, y0], i) => {
      const [x1, y1] = ring[(i + 1) % n];
      return G.unit3(G.add3(G.mul3(F.u, y1 - y0), G.mul3(F.v, -(x1 - x0))));
    });
    const facing = normals.map((m) => G.dot3(m, V) > 1e-9);
    const outline = [];
    const crease = [];
    for (const run of runsWhere(facing, false)) outline.push(k.pathOf(run.map((i) => near[i])));
    for (const run of runsWhere(facing, true)) {
      crease.push(k.pathOf(run.map((i) => near[i])));
      outline.push(k.pathOf(run.map((i) => far[i])));
    }
    for (let i = 0; i < n; i += 1)
      if (facing[(i + n - 1) % n] !== facing[i]) outline.push(k.pathOf([near[i], far[i]]));
    const parts = [k.pathOf(screenOriented(near), true), k.pathOf(screenOriented(far), true)];
    const buckets = [[], [], [], [], []];
    for (let i = 0; i < n; i += 1) {
      if (!facing[i]) continue;
      const quad = screenOriented([near[i], near[(i + 1) % n], far[(i + 1) % n], far[i]]);
      parts.push(k.pathOf(quad, true));
      buckets[G.toneOf(normals[i], P)].push(k.pathOf(quad, true));
    }
    const capTone = G.toneOf(capNear ? F.a : G.mul3(F.a, -1), P);
    buckets[capTone].push(k.pathOf(screenOriented(near), true));
    return {
      fill: parts.join(""),
      outline: outline.join(""),
      crease: crease.join(""),
      top: buckets[4].join(""),
      shades: buckets.slice(0, 4).map((bucket) => bucket.join("")),
    };
  }

  function prism(name, F, poly, s0, s1, style = {}, o = {}) {
    const { extra = "", inner = "", bias = 0, tags, owner } = o;
    const shape = record(A.prism(F, poly, s0, s1, { name, owner }));
    const cu = poly.reduce((sum, p) => sum + p[0], 0) / poly.length;
    const cv = poly.reduce((sum, p) => sum + p[1], 0) / poly.length;
    const centre = G.add3(
      G.add3(G.add3(F.o, G.mul3(F.a, (s0 + s1) / 2)), G.mul3(F.u, cu)),
      G.mul3(F.v, cv),
    );
    put(
      name,
      o.ref ?? centre,
      S(prismPaths(F, poly, s0, s1), { tone: "mid", ...style, inner }) + extra,
      [shape],
      {
        bias,
        tags,
        share: o.share,
      },
    );
    return shape;
  }

  /** A transform that maps local (u, v) onto the plane through o spanned by world vectors ex, ey. */
  function planeMatrix(o, ex, ey) {
    const p0 = at(o);
    const px = at(G.add3(o, ex));
    const py = at(G.add3(o, ey));
    const v = (x) => Number(x.toFixed(4));
    return `matrix(${v(px[0] - p0[0])} ${v(px[1] - p0[1])} ${v(py[0] - p0[0])} ${v(py[1] - p0[1])} ${v(p0[0])} ${v(p0[1])})`;
  }

  // -------------------------------------------------------------------------
  // Pipes
  // -------------------------------------------------------------------------

  /**
   * A pipe from a few straight legs: filleted, gapped under its own end flanges
   * and under anything that wraps it (`gaps`, arc-length spans), split into
   * depth-sortable chunks. With `reveal`, each chunk carries its position along
   * the route (data-at) so a reveal track lays it in order. With `flow`, every
   * chunk gets its piece of a dashed centreline phased from the route's start.
   */
  function pipe(name, control, r, o = {}) {
    const {
      bend = 2.6,
      tone = "hi",
      flanges = [true, true],
      flangeR = 1.6,
      gaps: extra = [],
      tags,
      reveal = false,
      flow = null,
      maxLength = 14,
      bias = 0,
      touch,
      caps = true,
      breaks = [],
      closed = false,
      spacing = Math.max(0.8, Math.min(2.4, r * 0.7)),
    } = o;
    const line = closed ? control : G.fillet(control, Math.max(r * bend, 2.4), 10, { P, tube: r });
    const total = G.pathLength(line);
    const gapsAt = (o.gapsAt ?? []).map(({ at: point, half, from, to }) => {
      const s = arcAt(line, point);
      return [s - (from ?? half), s + (to ?? half)];
    });
    const collars = [];
    [
      [0, -1],
      [total, 1],
    ].forEach(([along, sign], index) => {
      if (!flanges[index]) return;
      const thick = Math.max(0.9, r * 0.5);
      const tangent = G.tangentAlong(line, along);
      collars.push({
        centre: G.add3(G.pointAlong(line, along), G.mul3(tangent, (-sign * thick) / 2)),
        tangent,
        radius: r * flangeR,
        thick,
        gap: sign < 0 ? [0, thick] : [total - thick, total],
      });
    });
    const gaps = [...collars.map(({ gap }) => gap), ...extra, ...gapsAt];
    R.route(name, line, r, {
      owner: name,
      touch,
      gaps,
      closed,
      rims: flanges.map((flanged) => (flanged ? r * flangeR : r)),
      piece: "fig",
    });
    const pieces = tubePieces(line, r, P, { maxLength, spacing, gaps, breaks, caps, closed });
    // Screen length of the route up to each arc length, to phase the flow dashes
    const dense = G.resample(line, 0.5);
    const screenAt = (s) => {
      let length = 0;
      let walked = 0;
      for (let i = 1; i < dense.length; i += 1) {
        const step = G.len3(G.sub3(dense[i], dense[i - 1]));
        const a = at(dense[i - 1]);
        const b = at(dense[i]);
        const flat = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (walked + step >= s) return length + flat * ((s - walked) / (step || 1));
        walked += step;
        length += flat;
      }
      return length;
    };
    pieces.forEach((piece, index) => {
      let svg = tubeSvg(piece, { tone });
      if (flow) {
        const points = G.cut(line, piece.from, piece.to);
        const d = k.pathOf(points.map(at));
        svg += `<path class="fx-flow" data-g="${tagsOf(flow.tags).join(" ")}" data-o="${r2(screenAt(piece.from))}" d="${d}"/>`;
      }
      const atAttr = reveal ? ` data-at="${r2((piece.from + piece.to) / 2 / total)}"` : "";
      put(`${name}:${index}`, piece.mid, svg, [A.tube(piece.points, piece.radii)], {
        bias,
        tags,
        attrs: atAttr,
      });
    });
    for (const { centre, tangent, radius, thick, gap } of collars) {
      const F = G.frameAlong(centre, tangent);
      const facing = Math.abs(G.dot3(F.a, V)) > 0.15;
      const face = G.dot3(F.a, V) > 0 ? thick / 2 : -thick / 2;
      const bolts =
        facing && radius > 2.6
          ? Dots(G.dotsOf(F, face, radius * 0.72, 6, P, { all: true }), { size: 0.35, tone: "mid" })
          : "";
      disc(
        `${name}.flange`,
        F,
        -thick / 2,
        thick / 2,
        radius,
        { tone },
        {
          owner: name,
          tags,
          extra: bolts,
          bias: bias + 0.05,
          ...(reveal ? { share: gap[0] > 0 ? 1 : 0 } : {}),
        },
      );
    }
    routes.set(name, { line, total, r });
    return { line, total, name };
  }

  /** A thin cable (signal line) with terminal dots on both ends. */
  function cable(name, points, r = 0.45, o = {}) {
    const { tone = "mid", bend = 2, tags, maxLength = 12, bias = 0.02, ends = [true, true] } = o;
    const line = G.fillet(points, Math.max(bend, r * 2.6), 8, { P, tube: r });
    R.route(name, line, r, { owner: name, limp: true, piece: "fig" });
    tubePieces(line, r, P, { maxLength, spacing: 0.6 }).forEach((piece, index) =>
      put(
        `${name}:${index}`,
        piece.mid,
        tubeSvg(piece, { tone }),
        [A.tube(piece.points, piece.radii)],
        { bias, tags },
      ),
    );
    [0, 1].forEach((index) => {
      if (!ends[index]) return;
      const end = index ? line[line.length - 1] : line[0];
      const size = Math.max(0.5, r * KS * 0.9);
      put(
        `${name}.end`,
        end,
        Dots([at(end)], { size, tone: "hi" }),
        [A.ball(end, size / KS, { name: `${name}.end`, owner: name })],
        {
          bias: bias + 0.1,
          tags,
        },
      );
    });
    return line;
  }

  // -------------------------------------------------------------------------
  // Overlay: relations between instruments
  // -------------------------------------------------------------------------

  /**
   * A relation between two instrument heads: a cobalt arc in the air above
   * the plant, landing on both heads with a ring, drawn on by a mask.
   */
  function relation(name, a, b, { lift = 30, tags, bow = 0 } = {}) {
    const pa = at(a);
    const pb = at(b);
    const top = Math.max(lift, 0);
    const mid3 = G.add3(G.lerp3 ? G.lerp3(a, b, 0.5) : G.mul3(G.add3(a, b), 0.5), [0, 0, top]);
    const pm = at(mid3);
    // Sideways bow on screen, so two relations from one head part
    const dx = pb[0] - pa[0];
    const dy = pb[1] - pa[1];
    const len = Math.hypot(dx, dy) || 1;
    const c = [pm[0] - (dy / len) * bow, pm[1] + (dx / len) * bow];
    // Quadratic through the lifted midpoint: control = 2 m - (a + b) / 2
    const q = [2 * c[0] - (pa[0] + pb[0]) / 2, 2 * c[1] - (pa[1] + pb[1]) / 2];
    const d = `M${r2(pa[0])} ${r2(pa[1])}Q${r2(q[0])} ${r2(q[1])} ${r2(pb[0])} ${r2(pb[1])}`;
    const maskId = `${id}-${name}`;
    const tag = tagsOf(tags).join(" ");
    defs.push(
      `<mask id="${maskId}" maskUnits="userSpaceOnUse" x="-${width}" y="-${height}" width="${3 * width}" height="${3 * height}"><path class="fx-draw" data-g="${tag}" pathLength="1" stroke-width="8" d="${d}"/></mask>`,
    );
    const ring = (p, end) =>
      `<circle class="fx-relation-end" data-g="${tagsOf(tags)
        .map((t) => `${t}-${end}`)
        .join(" ")}" cx="${r2(p[0])}" cy="${r2(p[1])}" r="1.7"/>`;
    front.push(
      `<path class="fx-relation" mask="url(#${maskId})" d="${d}"/>${ring(pa, "a")}${ring(pb, "b")}`,
    );
    if (!loops.some((loop) => loop.s === ".fx-relation"))
      loops.push({ s: ".fx-relation", flow: RELATION_FLOW });
    return { d, from: pa, to: pb };
  }

  // -------------------------------------------------------------------------
  // Timeline
  // -------------------------------------------------------------------------

  const sel = (tag) => `[data-g~="${tag}"]`;
  const offsetOf = (d) => {
    const o = at([0, 0, 0]);
    const p = at(d);
    return [r2(p[0] - o[0]), r2(p[1] - o[1])];
  };
  const tl = {
    opacity: (tag, keys, e) => tracks.push({ s: sel(tag), o: keys, ...(e ? { e } : {}) }),
    show: (tag, from, to = from + 0.04) =>
      tracks.push({
        s: sel(tag),
        o: [
          [from, 0],
          [to, 1],
        ],
      }),
    pop: (tag, anchor, from, to = from + 0.06) => {
      const [x, y] = at(anchor);
      tracks.push({
        s: sel(tag),
        pop: [r2(x), r2(y)],
        k: [
          [from, 0],
          [to, 1],
        ],
        e: "o",
      });
    },
    translate: (tag, keys, e) =>
      tracks.push({ s: sel(tag), tr: keys.map(([p, d]) => [p, offsetOf(d)]), ...(e ? { e } : {}) }),
    /** Translation in the element's own coordinates (a group inside a face plane). */
    shift: (tag, keys, e) => tracks.push({ s: sel(tag), tr: keys, ...(e ? { e } : {}) }),
    /**
     * Builds a tagged assembly in painter's order, back to front: each item
     * fades in quickly in its turn, so parts never show through each other.
     */
    assemble: (tag, from, to, soft = 0.012) => {
      assembles.push(tag);
      tracks.push({ s: sel(tag), rv: [from, to, soft] });
    },
    reveal: (tag, from, to, soft = 0.03) => tracks.push({ s: sel(tag), rv: [from, to, soft] }),
    draw: (tag, from, to) =>
      tracks.push({
        s: `.fx-draw${sel(tag)}`,
        dr: [
          [from, 0],
          [to, 1],
        ],
      }),
    /** A relation drawn on between two progress values: ring at the start, arc, ring at the end. */
    relation: (tag, from, to) => {
      tracks.push({
        s: sel(`${tag}-a`),
        o: [
          [from, 0],
          [from + 0.02, 1],
        ],
      });
      tracks.push({
        s: `.fx-draw${sel(tag)}`,
        dr: [
          [from, 0],
          [to, 1],
        ],
      });
      tracks.push({
        s: sel(`${tag}-b`),
        o: [
          [to - 0.02, 0],
          [to, 1],
        ],
      });
    },
    rotate: (selector, keys, e = "l") => tracks.push({ s: selector, rot: keys, e }),
    /** Morphs a tagged group's paths through `shapes` (each a list of path data); keys give a fractional shape index. */
    morph: (tag, shapes, keys, e) => {
      morphs.push(shapes);
      tracks.push({ s: sel(tag), mo: morphs.length - 1, k: keys, ...(e ? { e } : {}) });
    },
    camera: (selector, focus, base, keys) =>
      tracks.push({ s: selector, cam: { f: focus.map(r2), base, k: keys } }),
    spin: (selector, seconds) => loops.push({ s: selector, spin: seconds }),
    frames: (selector, frames, period) => loops.push({ s: selector, frames, period }),
    slide: (selector, distance, period) => loops.push({ s: selector, slide: [distance, period] }),
    flow: (tag, speed = 9) => loops.push({ s: `.fx-flow${sel(tag)}`, flow: speed }),
    say: (from, text) => say.push([from, text]),
  };

  // -------------------------------------------------------------------------
  // Output
  // -------------------------------------------------------------------------

  /** Settles and sorts the items and returns the drawn markup without the <svg>, for nested levels. */
  function buildBody() {
    A.settle(R, P);
    R.items.sort((a, b) => a.key - b.key);
    for (const tag of assembles) {
      const members = R.items.filter((item) => item.tags?.includes(tag));
      members.forEach((item, index) => {
        const share = members.length > 1 ? index / (members.length - 1) : 0;
        item.attrs = `${(item.attrs ?? "").replace(/ data-at="[^"]*"/, "")} data-at="${r2(share)}"`;
      });
    }
    const items = R.items.map((item) => {
      const tags = item.tags?.length ? ` data-g="${item.tags.join(" ")}"` : "";
      return tags || item.attrs ? `<g${tags}${item.attrs ?? ""}>${item.svg}</g>` : item.svg;
    });
    return {
      body: compactAll(
        (back.length ? `<g data-g="base">${back.join("")}</g>` : "") +
          items.join("") +
          front.join(""),
      ),
      defs: compactAll(defs.join("")),
      timeline: { tracks, loops, morphs, say },
    };
  }

  /** `span`: seconds of repeating motion (fan, flow, turbine) over the whole progress. */
  function build({ label, span = 8 }) {
    A.settle(R, P);
    R.items.sort((a, b) => a.key - b.key);
    for (const tag of assembles) {
      const members = R.items.filter((item) => item.tags?.includes(tag));
      members.forEach((item, index) => {
        const share = members.length > 1 ? index / (members.length - 1) : 0;
        item.attrs = `${(item.attrs ?? "").replace(/ data-at="[^"]*"/, "")} data-at="${r2(share)}"`;
      });
    }
    const items = R.items.map((item) => {
      const tags = item.tags?.length ? ` data-g="${item.tags.join(" ")}"` : "";
      return tags || item.attrs ? `<g${tags}${item.attrs ?? ""}>${item.svg}</g>` : item.svg;
    });
    const svg = compactAll(
      `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg" data-figure="${id}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${label.replace(/"/g, "&quot;")}">` +
        (defs.length ? `<defs>${defs.join("")}</defs>` : "") +
        (back.length ? `<g data-g="base">${back.join("")}</g>` : "") +
        items.join("") +
        front.join("") +
        `</svg>`,
    );
    return {
      svg,
      timeline: { v: 1, span, tracks, loops, morphs, say: say.sort((a, b) => a[0] - b[0]) },
    };
  }

  return {
    id,
    width,
    height,
    P,
    V,
    KS,
    R,
    record,
    at,
    S,
    Ln,
    Dots,
    path3,
    depth,
    put,
    back,
    front,
    defs,
    slab,
    box,
    cyl,
    turned,
    disc,
    ring,
    ball,
    prism,
    prismPaths,
    planeMatrix,
    pipe,
    cable,
    relation,
    routes,
    tl,
    build,
    buildBody,
  };
}

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

/** The figure CSS module, made plain for a standalone page: :global() unwrapped, .frame renamed. */
export function figureCss() {
  const source = readFileSync(
    path.join(V2, "src/components/data-display/ScrubFigure/ScrubFigure.module.css"),
    "utf8",
  );
  return source
    .replace(/:global\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g, "$1")
    .replace(/\.frame\b/g, ".anatomy-frame");
}

export function playerScript() {
  const source = readFileSync(
    path.join(V2, "src/components/data-display/ScrubFigure/player.ts"),
    "utf8",
  );
  return stripTypeScriptTypes(source).replace(/^export /gm, "");
}

/**
 * Writes the site files (public/animations/anatomy/<id>.svg and .json) and a
 * standalone preview page (scripts/anatomy/preview/<id>.html) for the skill's
 * capture, drive and line checks. The preview shows the figure in a plate with
 * a progress slider; ?p=0.4 opens it at that progress, ?play runs the progress
 * on its own (12 s a cycle) to watch the motion.
 */
export function writeFigure(figure, built, { title, fig, hint, keys = [], caption = "", aspect }) {
  const site = path.join(V2, "public/animations/anatomy");
  mkdirSync(site, { recursive: true });
  writeFileSync(path.join(site, `${figure.id}.svg`), built.svg);
  writeFileSync(path.join(site, `${figure.id}.json`), JSON.stringify(built.timeline));

  const tokens = readFileSync(path.join(V2, "src/styles/tokens.css"), "utf8");
  const plate = k.plateHtml({
    fig,
    title,
    hint,
    readout: "",
    keys,
    caption,
    body: `<div class="anatomy-frame" style="aspect-ratio:${aspect ?? `${figure.width} / ${figure.height}`}">${built.svg}</div>`,
  });
  const page = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><style>${tokens}${k.ISO_CSS}${figureCss()}
body{margin:0;background:var(--color-bg);color:var(--color-text);font-family:system-ui,sans-serif}
.preview{max-width:760px;margin:0 auto;padding:24px 16px 48px}
.iso{--anatomy-card:var(--color-bg);--anatomy-mid:var(--color-border-strong);--anatomy-text:var(--color-text-muted);--anatomy-muted:var(--color-text-subtle)}
.iso-plate{--anatomy-paper:var(--color-bg)}
.scrub{display:flex;gap:12px;align-items:center;margin-top:12px;font:12px ui-monospace,monospace;color:var(--color-text-muted)}
.scrub input{flex:1}
</style></head><body class="iso" data-theme="light"><main class="preview">${plate}<label class="scrub">progress<input type="range" min="0" max="1000" value="1000" aria-label="progress"><output>1.000</output></label></main><script type="module">${playerScript()}
const timeline = ${JSON.stringify(built.timeline)};
const svg = document.querySelector(".anatomy-frame svg");
const player = createPlayer(svg, timeline);
const slider = document.querySelector(".scrub input");
const output = document.querySelector(".scrub output");
const readout = document.querySelector("[data-readout]");
const params = new URLSearchParams(location.search);
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
function seek(p) {
  player.seek(p);
  slider.value = String(Math.round(p * 1000));
  output.textContent = p.toFixed(3);
  if (readout) readout.textContent = player.readout(p);
}
window.__seek = seek;
seek(Number(params.get("p") ?? 1));
slider.addEventListener("input", () => seek(Number(slider.value) / 1000));
// Everything follows progress: with ?play the slider runs on its own, to watch the motion
if (params.has("play") && !still) {
  const start = performance.now();
  const run = (now) => { seek(((now - start) / 12000) % 1); requestAnimationFrame(run); };
  requestAnimationFrame(run);
}
</script></body></html>`;
  const previews = path.join(here, "preview");
  mkdirSync(previews, { recursive: true });
  writeFileSync(path.join(previews, `${figure.id}.html`), page);
  return { svgBytes: built.svg.length, jsonBytes: JSON.stringify(built.timeline).length };
}
