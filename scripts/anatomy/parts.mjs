import { A, G, k } from "./lib.mjs";

/*
  Parts shared by the anatomy figures: the bench plate a model stands on,
  pads, tees, valves, supports and the instruments that ATLAXIA reads.
  Every part records its true shape (lib.mjs helpers) and takes `tags`, so
  the timeline can show or pop it.
*/

const up = [0, 0, 1];

/** The base plate on feet, with a groove, corner screws, a ruler strip and a label plate. */
export function basePlate(
  f,
  plan,
  { h = 8, inset = 18, strip = 0.42, label = true, unit = 1, top = 0 } = {},
) {
  const { at: atWorld, S, Ln, Dots, back, record } = f;
  const u = unit;
  // Everything is built with its top at 0 and lifted to `top`
  const P = top ? { ...f.P, origin: [f.P.origin[0], f.P.origin[1] - k.screenRise(top, f.P)] } : f.P;
  const at = top ? (p) => k.iso(p, P) : atWorld;
  const footH = 5 * u;
  back.push(`<path class="iso-halo" d="${k.haloOf(plan, -h - footH, h, P)}"/>`);
  const byDepth = (points) =>
    [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
  for (const [x, y] of byDepth(k.corners(plan, inset * u))) {
    back.push(S(k.cylinder(x, y, 7 * u, -h - footH, 1.6 * u, P, 28), { tone: "lo" }));
    back.push(
      S(k.cylinder(x, y, 5.4 * u, -h - footH + 1.6 * u, footH - 1.6 * u, P, 28), { tone: "mid" }),
    );
  }
  back.push(
    S(k.slabOf(plan, -h, h, P, 8, 1.4 * u), {
      tone: "mid",
      inner: Ln(k.sideSeam(plan, -h / 2, P, 8), { tone: "faint" }),
    }),
  );
  back.push(Ln(k.planOutline(k.insetPlan(plan, 5 * u), 0, P), { tone: "lo" }));
  const screws = k.corners(plan, 10 * u);
  back.push(Ln(screws.map(([x, y]) => k.ring(x, y, 2.2 * u, 0, P, 16)).join(""), { tone: "lo" }));
  back.push(
    Dots(
      screws.map(([x, y]) => at([x, y, 0])),
      { size: 0.5 },
    ),
  );
  record(A.slab(plan, top - h, h, { name: "stand.plate", ground: true }, 8));

  if (strip) {
    const ruler = {
      x: plan.x + 16 * u,
      y: plan.y + plan.d - 13 * u,
      w: plan.w * strip,
      d: 6 * u,
      r: 1 * u,
    };
    back.push(S(k.slabOf(ruler, 0, 0.6 * u, P, 3), { tone: "lo", crease: "none" }));
    const ticks = k.topTicks(
      ruler.x + 4 * u,
      ruler.x + ruler.w - 4 * u,
      4 * u,
      5,
      ruler.y,
      0.6 * u,
      [1.8 * u, 3.4 * u],
      P,
    );
    back.push(Ln(ticks.minor, { tone: "lo" }), Ln(ticks.major, { tone: "mid" }));
    record(A.slab(ruler, 0, 0.6 * u, { name: "stand.ruler", ground: true }, 3));
  }
  if (label) {
    const plate = {
      x: plan.x + plan.w - 52 * u,
      y: plan.y + plan.d - 20 * u,
      w: 30 * u,
      d: 12 * u,
      r: 1.2 * u,
    };
    back.push(S(k.slabOf(plate, 0, 0.8 * u, P, 3), { tone: "lo", crease: "none" }));
    back.push(Ln(k.planOutline(k.insetPlan(plate, 1.4 * u), 0.8 * u, P, 3), { tone: "faint" }));
    back.push(
      Ln(
        [18, 12, 15]
          .map((w, i) =>
            k.lineOnTop(
              [plate.x + 4 * u, plate.y + (3.2 + i * 2.8) * u],
              [plate.x + (4 + w) * u, plate.y + (3.2 + i * 2.8) * u],
              0.8 * u,
              P,
            ),
          )
          .join(""),
        { tone: "lo", free: true },
      ),
    );
    back.push(
      Dots(
        [
          at([plate.x + plate.w - 2.6 * u, plate.y + 2.4 * u, 0.8 * u]),
          at([plate.x + plate.w - 2.6 * u, plate.y + plate.d - 2.4 * u, 0.8 * u]),
        ],
        { size: 0.45 * u },
      ),
    );
    record(A.slab(plate, 0, 0.8 * u, { name: "stand.label", ground: true }, 3));
  }
}

/**
 * A pad: a short cylinder of radius `a` that leaves a curved host along
 * `outward` and ends in a flat face `h` past `point`. Its base follows the
 * host, so a flange can sit on its face. Returns the face centre.
 */
export function pad(f, name, hosts, point, outward, a, h, style = {}, o = {}) {
  const { P, S, Ln, put, record, V } = f;
  const list = [hosts].flat();
  const inside = (p) => list.some((shape) => A.sdf(shape, p) < 0);
  const axis = G.unit3(outward);
  const F = G.frameAlong(point, axis);
  const start = (angle) => {
    // From inside the host (its axis, or a little behind the point) out to the face
    let lo = inside(G.pointOf(F, 0, a, angle)) ? 0 : -3 * a;
    let hi = h;
    if (!inside(G.pointOf(F, lo, a, angle))) return 0;
    for (let step = 0; step < 40; step += 1) {
      const mid = (lo + hi) / 2;
      if (inside(G.pointOf(F, mid, a, angle))) lo = mid;
      else hi = mid;
    }
    return hi;
  };
  const low = Math.min(...Array.from({ length: 48 }, (_, i) => start((i / 48) * Math.PI * 2)));
  const face =
    G.dot3(axis, V) > 0.2 && o.ring !== false
      ? Ln(G.circleOf(F, h, a * 0.62, P, 20), { tone: "faint" })
      : "";
  const shape = record(
    A.disc(F, low - 0.05, h, a, { name, seated: true, cut: list, owner: o.owner }),
  );
  put(
    name,
    G.add3(point, G.mul3(axis, h / 2)),
    S(G.saddleOf(F, a, start, h, P), { tone: "mid", ...style }) + face + (o.extra ?? ""),
    [shape],
    {
      bias: o.bias ?? 0.1,
      tags: o.tags,
      share: o.share,
      owner: o.owner,
    },
  );
  return { face: G.add3(point, G.mul3(axis, h)), shape };
}

/** A cast tee or cross: a ball the run is gapped under; branches end where their rim meets it. */
export function teeBall(f, name, c, r, o = {}) {
  const shape = f.ball(
    name,
    c,
    r,
    { tone: "hi" },
    { tags: o.tags, share: o.share, owner: o.owner, bias: o.bias ?? 0 },
  );
  return {
    shape,
    /** Where a pipe of radius `pipeR` arriving along `direction` (from the ball outward) ends. */
    port: (direction, pipeR) =>
      G.add3(c, G.mul3(G.unit3(direction), Math.sqrt(r * r - pipeR * pipeR))),
    /** Gap half-length on a run passing through the ball. */
    half: (pipeR) => Math.sqrt(r * r - pipeR * pipeR),
  };
}

/** A pipe stanchion: a foot, a post and a cradle whose top follows the pipe's underside, and a U-bolt. */
export function support(f, name, [x, y], pipeZ, pipeR, axis = "x", o = {}) {
  const { box, at, Ln, prism, put, V } = f;
  const w = 1.5;
  const half = pipeR + 1.5;
  const base = pipeZ - pipeR - 2;
  box(
    `${name}.foot`,
    [x - 4, y - 4, 0],
    [x + 4, y + 4, 1.2],
    { tone: "lo" },
    { tags: o.tags, share: o.share, owner: o.owner, r: 0.8 },
  );
  box(
    `${name}.post`,
    [x - w, y - w, 1.2],
    [x + w, y + w, base],
    { tone: "mid" },
    { tags: o.tags, share: o.share, owner: o.owner, r: 0.3 },
  );
  // Cradle: a plate across the pipe with a notch round its lower third
  const rr = pipeR + 0.02;
  const lip = pipeZ - rr * Math.sin(Math.PI / 6);
  const arc = Array.from({ length: 13 }, (_, i) => {
    const t = -Math.PI / 6 - (i / 12) * ((2 * Math.PI) / 3);
    return [rr * Math.cos(t), pipeZ + rr * Math.sin(t)];
  });
  const poly = [[-half, base], [half, base], [half, lip], ...arc, [-half, lip]];
  const F =
    axis === "x"
      ? G.frameOf([x - 1.4, y, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1])
      : G.frameOf([x, y - 1.4, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  prism(
    `${name}.cradle`,
    F,
    poly,
    0,
    2.8,
    { tone: "mid" },
    { tags: o.tags, share: o.share, owner: o.owner },
  );
  // U-bolt over the pipe, its legs on the cradle's lips: the half beyond the pipe and the half before it
  const side = (t) => {
    const c = Math.cos(t) * (pipeR + 0.3);
    const s = pipeZ + Math.sin(t) * (pipeR + 0.3);
    return axis === "x" ? [x, y + c, s] : [x + c, y, s];
  };
  const leg = (t) => {
    const c = Math.cos(t) * (pipeR + 0.3);
    return axis === "x" ? [x, y + c, lip] : [x + c, y, lip];
  };
  const toward = axis === "x" ? Math.sign(V[1]) : Math.sign(V[0]);
  const halves = [
    [
      leg(Math.PI / 6),
      ...Array.from({ length: 7 }, (_, i) => side(Math.PI / 6 + (i / 6) * (Math.PI / 3))),
    ],
    [
      ...Array.from({ length: 7 }, (_, i) => side(Math.PI / 2 + (i / 6) * (Math.PI / 3))),
      leg((5 * Math.PI) / 6),
    ],
  ];
  halves.forEach((points, index) => {
    const near = (index === 0) === toward > 0;
    put(
      `${name}.bolt`,
      points[3],
      Ln(k.pathOf(points.map(at)), { tone: "lo" }),
      [A.tube(points, 0.2, { name: `${name}.bolt` })],
      {
        tags: o.tags,
        share: o.share,
        bias: near ? 0.4 : -0.4,
      },
    );
  });
  return { at: [x, y, pipeZ + pipeR] };
}

/** A flanged floor sleeve: where a line goes underground (into the network). */
export function floorSleeve(f, name, [x, y], r, o = {}) {
  const F = G.frameOf([x, y, 0], up, [1, 0, 0], [0, 1, 0]);
  f.disc(
    `${name}.plate`,
    F,
    0,
    0.8,
    r * 2.4,
    { tone: "lo" },
    { tags: o.tags, share: o.share, owner: o.owner },
  );
  f.disc(
    `${name}.collar`,
    F,
    0.8,
    2.6,
    r * 1.6,
    { tone: "mid" },
    {
      tags: o.tags,
      share: o.share,
      owner: o.owner,
      extra: f.Dots(G.dotsOf(F, 0.8, r * 2, 6, f.P, { all: true }), { size: 0.4, tone: "mid" }),
    },
  );
  return [x, y, 2.6];
}

/**
 * A gate valve on a straight run along `axis`: a bulged body the pipe is
 * gapped under, end flanges, a bonnet, a rising stem and a handwheel.
 * Returns the gap half-length.
 */
export function gateValve(f, name, c, axis, r, o = {}) {
  const { P, S, Ln, Dots, put, record, at } = f;
  const F = G.frameAlong(c, axis);
  const half = r * 2.3;
  const crown = r * 1.75;
  const bulge = (s) =>
    r * 1.3 + (crown - r * 1.3) * Math.sqrt(Math.max(0, 1 - (s / (r * 1.5)) ** 2));
  const slope = (s) => {
    if (Math.abs(s) >= r * 1.5 - 1e-9) return 0;
    const t = Math.max(-0.995, Math.min(0.995, s / (r * 1.5)));
    return (-(crown - r * 1.3) * t) / (r * 1.5 * Math.sqrt(1 - t * t));
  };
  const meridian = [
    [-half, 0],
    [-half, r * 1.55],
    [-half + 1, r * 1.55],
    [-half + 1, r * 1.3],
    ...Array.from({ length: 13 }, (_, i) => {
      const s = r * 1.5 * Math.sin(((i - 6) / 6) * (Math.PI / 2));
      return [s, bulge(s), i && i < 12 ? 1 : 0];
    }),
    [half - 1, r * 1.3],
    [half - 1, r * 1.55],
    [half, r * 1.55],
    [half, 0],
  ];
  const bolts = (s) => G.dotsOf(F, s, r * 1.3, 6, P, { all: true });
  const faceS = G.dot3(F.a, f.V) > 0 ? half : -half;
  put(
    name,
    c,
    S(G.lathe(meridian, F, P, { steps: 24, smooth: { slope, rows: 3 } }), { tone: "hi" }) +
      (Math.abs(G.dot3(F.a, f.V)) > 0.15 ? Dots(bolts(faceS), { size: 0.38, tone: "mid" }) : ""),
    [record(A.body(F, meridian, { name, owner: o.owner }))],
    { tags: o.tags, share: o.share, owner: o.owner },
  );
  // Bonnet and yoke up from the crown
  const NF = G.frameOf(c, up, [1, 0, 0], [0, 1, 0]);
  const s0 = crown - 0.4;
  f.disc(
    `${name}.bonnet`,
    NF,
    s0,
    s0 + r * 0.9,
    r * 0.75,
    { tone: "mid" },
    { tags: o.tags, share: o.share, owner: o.owner },
  );
  const yoke = s0 + r * 0.9;
  f.disc(
    `${name}.stem`,
    NF,
    yoke,
    yoke + r * 1.5,
    Math.max(0.45, r * 0.18),
    { tone: "mid" },
    { tags: o.tags, share: o.share, owner: o.owner },
  );
  const wheelZ = yoke + r * 1.5;
  const WF = G.frameOf(G.add3(c, [0, 0, wheelZ]), up, [1, 0, 0], [0, 1, 0]);
  const rw = r * 1.45;
  const hub = Math.max(0.8, r * 0.28);
  const spokes = [0, 1, 2]
    .map((i) => {
      const t = (i / 3) * Math.PI * 2 + 0.3;
      return k.pathOf([at(G.pointOf(WF, 0.9, hub, t)), at(G.pointOf(WF, 0.9, rw - 0.9, t))]);
    })
    .join("");
  // The wheel is a dished disc: its rim's inner edge, and spokes from the hub to it
  const rim = Ln(G.circleOf(WF, 0.9, rw - 0.9, P, 40), { tone: "lo" });
  f.ring(
    `${name}.wheel`,
    WF,
    0,
    0.9,
    rw - 0.9,
    rw,
    { tone: "hi" },
    { tags: o.tags, share: o.share, extra: rim + Ln(spokes, { tone: "mid" }), owner: o.owner },
  );
  [0, 1, 2].forEach((i) => {
    const t = (i / 3) * Math.PI * 2 + 0.3;
    f.record(
      A.tube([G.pointOf(WF, 0.6, hub, t), G.pointOf(WF, 0.6, rw - 0.9, t)], 0.3, {
        name: `${name}.spoke`,
        owner: o.owner,
      }),
    );
  });
  f.disc(
    `${name}.hub`,
    WF,
    0,
    0.9,
    hub,
    { tone: "mid" },
    { tags: o.tags, share: o.share, owner: o.owner, bias: 0.05 },
  );
  return { half, top: G.add3(c, [0, 0, wheelZ + 0.9]) };
}

/** A wafer check valve: a short disc between flanges, with its hinge boss on top. */
export function checkValve(f, name, c, axis, r, o = {}) {
  const F = G.frameAlong(c, axis);
  const half = r * 0.9;
  f.disc(
    `${name}.flangeA`,
    F,
    -half,
    -half + 0.9,
    r * 1.6,
    { tone: "hi" },
    { tags: o.tags, share: o.share, owner: o.owner },
  );
  f.disc(
    name,
    F,
    -half + 0.9,
    half - 0.9,
    r * 1.4,
    { tone: "mid" },
    {
      tags: o.tags,
      share: o.share,
      owner: o.owner,
      inner: f.Ln(G.arcOf(F, 0, r * 1.4, f.P), { tone: "faint" }),
    },
  );
  f.disc(
    `${name}.flangeB`,
    F,
    half - 0.9,
    half,
    r * 1.6,
    { tone: "hi" },
    { tags: o.tags, share: o.share, owner: o.owner },
  );
  return { half };
}

/**
 * An instrument head: a neck from `base` along `dir` and a dual-compartment
 * housing lying across it (lit: the accent ATLAXIA reads), with end caps and
 * a display window on the cap that faces the viewer. Returns the point on top
 * of the housing where relations land.
 */
export function instrument(
  f,
  name,
  base,
  { dir = up, across = [0, 1, 0], neck = 4, r = 3, len = 8, tags } = {},
) {
  const { P, Ln, V } = f;
  const d = G.unit3(dir);
  const a = 1.1;
  const reach = Math.sqrt(r * r - a * a);
  const NF = G.frameAlong(base, d);
  f.disc(`${name}.neck`, NF, 0, neck, a, { tone: "mid" }, { tags });
  const centre = G.add3(base, G.mul3(d, neck + reach));
  const HF = G.frameAlong(centre, across);
  f.disc(`${name}.head`, HF, -len / 2, len / 2, r, { tone: "hi", lit: true }, { tags, bias: 0.05 });
  const near = G.dot3(HF.a, V) > 0 ? 1 : -1;
  for (const side of [-1, 1]) {
    const s0 = side * (len / 2);
    const window =
      side === near && Math.abs(G.dot3(HF.a, V)) > 0.2
        ? Ln(G.circleOf(HF, s0 + side * 1.1, r * 0.55, P, 20), { tone: "lit" })
        : "";
    f.disc(
      `${name}.cap`,
      HF,
      side > 0 ? s0 : s0 - 1.1,
      side > 0 ? s0 + 1.1 : s0,
      r + 0.3,
      { tone: "mid" },
      {
        tags,
        bias: 0.06,
        extra: window,
      },
    );
  }
  return { top: G.add3(centre, G.mul3(d, r)), centre };
}
