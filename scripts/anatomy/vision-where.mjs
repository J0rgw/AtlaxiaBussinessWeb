import { A, G, createFigure, k, r2 } from "./lib.mjs";
import { basePlate, floorSleeve, gateValve, instrument, pad, support, teeBall } from "./parts.mjs";

/*
  Scene A, "Hacia dónde vamos": the Powers of Ten zoom of vision-where.json,
  rebuilt as one isometric world. The camera stays on a pressure transmitter
  and pulls back: the transmitter on its pipe spool (signal), the process
  skid around it (today: a process, its signals related), the whole plant
  (next: a cobalt boundary round the site) and a network of plants on a
  bench plate (goal), with signals running out from ours.

  Four levels share world coordinates but are each drawn at their own scale,
  so a part keeps its precision however far the camera is from it:
    L1  the transmitter and its spool           drawn at scale 20
    L2  the process skid                        drawn at scale 3
    L3  the plant site (and our skid in small)  drawn at scale 0.42
    L4  the network on its bench plate          drawn at scale 0.1
  The camera scale is interpolated in log space (constant zoom speed), with
  the Lottie's key frames: hold, signal to equipment, process, plant, systems.
*/

export const WHERE = { width: 1000, height: 1000, azimuth: 60, elevation: 30 };

const ZP = 14;
const RP = 3.2;
const RB = 2.6;
const FOCUS = [-48, 0, 34.4];
const CAMERA = [
  [0, 20],
  [0.0668, 20],
  [0.25, 4.5],
  [0.45, 1.6],
  [0.551, 1.6],
  [0.735, 0.42],
  [0.793, 0.42],
  [0.968, 0.1],
  [1, 0.1],
];

/**
 * A projection at scale `scale` that puts the focus at the centre of the
 * sheet. A level may be built in larger units (`unit` world units each): its
 * coordinates are then divided by `unit` and its scale multiplied, so the
 * picture is the same but the audit works at about one unit per pixel.
 */
function projectionAt(scale, unit = 1) {
  const base = {
    origin: [0, 0],
    scale: scale * unit,
    azimuth: WHERE.azimuth,
    elevation: WHERE.elevation,
  };
  const [fx, fy] = k.iso(
    FOCUS.map((v) => v / unit),
    base,
  );
  return { ...base, origin: [WHERE.width / 2 - fx, WHERE.height / 2 - fy] };
}

const upF = (x, y, z = 0) => G.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const alongX = (x, y, z) => G.frameOf([x, y, z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);

// ---------------------------------------------------------------------------
// L1: the pressure transmitter on its spool
// ---------------------------------------------------------------------------

const SPOOL = [-66, -30];
const PT_X = -48;

function buildL1() {
  const f = createFigure({
    id: "where-l1",
    width: WHERE.width,
    height: WHERE.height,
    P: projectionAt(9),
  });
  const { P, Ln, tl, box, disc, record } = f;
  const tags = "l1";
  record(A.slab(SKID, -3, 3, { name: "stand.skid", ground: true }, 4));
  // The mating flanges of the skid's lines (drawn in L2): the spool bolts between them
  record(
    A.disc(alongX(0, 0, ZP), SPOOL[0] - 1.6, SPOOL[0], RP * 1.6, {
      name: "stand.flangeA",
      ground: true,
    }),
  );
  record(
    A.disc(alongX(0, 0, ZP), SPOOL[1], SPOOL[1] + 1.6, RP * 1.6, {
      name: "stand.flangeB",
      ground: true,
    }),
  );
  const tee = teeBall(f, "pt.tee", [PT_X, 0, ZP], 4.8, { tags, owner: "spool" });
  f.pipe(
    "spool",
    [
      [SPOOL[0], 0, ZP],
      [SPOOL[1], 0, ZP],
    ],
    RP,
    {
      tags: "spool",
      reveal: true,
      flanges: [true, true],
      gapsAt: [{ at: [PT_X, 0, ZP], half: tee.half(RP) }],
      flow: { tags: "flow-l1" },
    },
  );
  // The spool opens from the middle in the first frames
  f.R.items.forEach((item) => {
    if (!item.tags?.includes("spool")) return;
    const share = Number((item.attrs ?? "").match(/data-at="([^"]*)"/)?.[1] ?? 0.5);
    item.attrs = ` data-at="${r2(Math.abs(share - 0.5) * 2)}"`;
  });
  tl.reveal("spool", 0, 0.045, 0.012);
  tl.opacity("flow-l1", [
    [0.02, 0],
    [0.045, 1],
    [0.55, 1],
    [0.63, 0],
  ]);
  tl.flow("flow-l1", 4);

  // Tap, needle valve with its T-handle, sensor module
  const tap = ZP + Math.sqrt(4.8 * 4.8 - 1.1 * 1.1);
  disc("pt.tap", upF(PT_X, 0, tap), 0, 2.4, 1.1, { tone: "mid" }, { tags: "pt" });
  const vz = tap + 2.4;
  box(
    "pt.valve",
    [PT_X - 2.2, -1.6, vz],
    [PT_X + 2.2, 1.6, vz + 3],
    { tone: "hi" },
    { tags: "pt", r: 0.3, bevel: 0.15 },
  );
  disc(
    "pt.valveStem",
    G.frameAlong([PT_X, 1.6, vz + 1.5], [0, 1, 0]),
    0,
    2.2,
    0.45,
    { tone: "mid" },
    { tags: "pt" },
  );
  box(
    "pt.valveHandle",
    [PT_X - 2.4, 3.8, vz + 1.1],
    [PT_X + 2.4, 4.6, vz + 1.9],
    { tone: "hi" },
    { tags: "pt", r: 0.3 },
  );
  const mz = vz + 3;
  disc("pt.impulse", upF(PT_X, 0, mz), 0, 1.6, 0.9, { tone: "mid" }, { tags: "pt" });
  const MF = upF(PT_X, 0, mz + 1.6);
  disc(
    "pt.module",
    MF,
    0,
    4.4,
    2.3,
    { tone: "hi" },
    {
      tags: "pt",
      inner: Ln(G.arcOf(MF, 1.2, 2.3, P) + G.arcOf(MF, 3.4, 2.3, P), { tone: "faint" }),
    },
  );
  // Electronics housing: lit, across the view, with threaded covers and a display
  const neckZ = mz + 1.6 + 4.4;
  const hr = 3.4;
  const reach = Math.sqrt(hr * hr - 1.1 * 1.1);
  disc(
    "pt.neck",
    upF(PT_X, 0, neckZ),
    0,
    FOCUS[2] - reach - neckZ,
    1.1,
    { tone: "mid" },
    { tags: "pt" },
  );
  const HF = G.frameAlong(FOCUS, [0, 1, 0]);
  disc(
    "pt.housing",
    HF,
    -4.5,
    4.5,
    hr,
    { tone: "hi", lit: true },
    {
      tags: "pt",
      inner: Ln(G.arcOf(HF, -1.6, hr, P) + G.arcOf(HF, 1.6, hr, P), { tone: "faint" }),
    },
  );
  const coverRibs = (s0, s1) =>
    k.fadedSvg(G.ribsOf(HF, s0, s1, hr + 0.35, 36, P, { fade: [0.1, 0.55], seams: true }), {
      tone: "lo",
    });
  disc(
    "pt.coverBack",
    HF,
    -6,
    -4.5,
    hr + 0.35,
    { tone: "mid" },
    { tags: "pt", extra: coverRibs(-6, -4.5) },
  );
  // Front cover with the display window; the trend slides across it
  const faceY = 6;
  const DM = f.planeMatrix([PT_X, faceY + 0.02, FOCUS[2]], [1, 0, 0], [0, 0, -1]);
  const trend = Array.from({ length: 41 }, (_, i) => {
    const x = -4 + i * 0.4;
    const y = Math.sin(i * 0.9) * 0.35 + Math.sin(i * 0.37) * 0.5 - 0.2;
    return `${i ? "L" : "M"}${r2(x)} ${r2(y)}`;
  }).join("");
  const display =
    `<g transform="${DM}"><clipPath id="where-display"><circle r="2.2"/></clipPath>` +
    `<circle class="fx-screen" r="2.2"/><g clip-path="url(#where-display)"><g data-g="trend"><path class="iso-line" data-tone="lit" data-free="" d="${trend}"/></g>` +
    `<path class="iso-line" data-tone="faint" d="M-2.2 1.2H2.2"/></g><circle class="iso-line" data-tone="mid" r="2.2"/></g>`;
  disc(
    "pt.coverFront",
    HF,
    4.5,
    6,
    hr + 0.35,
    { tone: "mid" },
    { tags: "pt", extra: coverRibs(4.5, 6) + display },
  );
  tl.slide('[data-g~="trend"]', 8, 2.4);
  // Nameplate on the module and the cable gland under the housing
  disc(
    "pt.gland",
    G.frameAlong(G.add3(FOCUS, [-hr + 0.3, 0, -1.4]), [-1, 0, 0]),
    0,
    1.6,
    0.9,
    { tone: "mid" },
    { tags: "pt" },
  );
  // Signal cable out of the back of the housing, down behind the transmitter to the skid
  const back = [PT_X, -6 - 0.9, FOCUS[2] - 1.2];
  disc(
    "pt.gland",
    G.frameAlong([PT_X, -6, FOCUS[2] - 1.2], [0, -1, 0]),
    0,
    0.9,
    0.9,
    { tone: "mid" },
    { tags: "pt" },
  );
  f.cable("pt.cable", [back, [PT_X, -10, FOCUS[2] - 1.2], [PT_X, -10, 0.1]], 0.45, {
    tags: "pt",
    tone: "mid",
    bend: 3,
  });
  tl.pop("pt", [PT_X, 0, tap], 0.01, 0.04);
  return f;
}

// ---------------------------------------------------------------------------
// L2: the process skid
// ---------------------------------------------------------------------------

const SKID = { x: -224, y: -60, w: 474, d: 128, r: 4 };
const T1 = { c: [-158, -8], r: 28, h: 64 };
const T2 = { c: [176, 6], r: 24, h: 52 };
const PUMP = [-90, 0];
const HX = { x0: 20, x1: 90, r: 12 };

function buildL2() {
  const f = createFigure({
    id: "where-l2",
    width: WHERE.width,
    height: WHERE.height,
    P: projectionAt(1.6),
  });
  const { P, at, Ln, Dots, tl, box, disc, turned, cyl, prism, record } = f;
  // The skid's concrete pad, with anchor bolts round its edge
  f.back.push(
    f.S(k.slabOf(SKID, -3, 3, P, 4, 0.6), {
      tone: "mid",
      inner: Ln(k.sideSeam(SKID, -1.5, P, 4), { tone: "faint" }),
    }),
  );
  f.back.push(Ln(k.planOutline(k.insetPlan(SKID, 4), 0, P, 4), { tone: "faint" }));
  f.back.push(
    Dots(
      k.corners(SKID, 7).map(([x, y]) => at([x, y, 0])),
      { size: 0.5 },
    ),
  );
  record(A.slab(SKID, -3, 3, { name: "stand.skid", ground: true }, 4));

  // Feed tank
  const tank = (name, { c: [tx, ty], r, h }, tags) => {
    cyl(`${name}.footing`, tx, ty, r + 3, 0, 3, { tone: "lo" }, { tags, steps: 72, bevel: 0.5 });
    const SF = upF(tx, ty, 3);
    const shell = turned(
      `${name}.shell`,
      SF,
      [
        [0, r],
        [h, r],
      ],
      { tone: "hi" },
      {
        tags,
        steps: 64,
        inner: Ln([0.3, 0.62].map((u) => G.arcOf(SF, h * u, r, P)).join(""), { tone: "faint" }),
      },
    );
    turned(
      `${name}.roof`,
      upF(tx, ty, 3 + h),
      [
        [0, r + 0.6],
        [1.2, r + 0.6],
        [1.2, r],
        [8, 6],
        [8, 0],
      ],
      { tone: "mid" },
      { tags, steps: 64 },
    );
    disc(`${name}.nozzle`, upF(tx, ty, 11 + h), 0, 2, 4, { tone: "mid" }, { tags });
    return { shell, top: [tx, ty, 13 + h] };
  };
  const t1 = tank("t1", T1, "t1");
  const t2 = tank("t2", T2, "t2");
  tl.assemble("t1", 0.075, 0.2);
  tl.assemble("t2", 0.31, 0.42);

  // Inline pump (as in the water model)
  const [px, py] = PUMP;
  box(
    "pump.pedestal",
    [px - 9, py - 9, 0],
    [px + 9, py + 9, 4],
    { tone: "lo" },
    { tags: "pump", r: 1.2, steps: 3, bevel: 0.4 },
  );
  const casingR = (s) => 7.5 + 4.5 * Math.sqrt(Math.max(0, 1 - ((s - 10) / 10.2) ** 2));
  const casingSlope = (s) => {
    const t = Math.max(-0.99, Math.min(0.99, (s - 10) / 10.2));
    return (-4.5 * t) / (10.2 * Math.sqrt(1 - t * t));
  };
  const profile = Array.from({ length: 21 }, (_, i) => {
    const s = 0.5 + i * 0.95;
    return [r2(s), r2(casingR(s)), i > 0 && i < 20 ? 1 : 0];
  });
  const casing = turned(
    "pump.casing",
    upF(px, py, 4),
    [[0, 7.5], ...profile, [20, 7.5]],
    { tone: "hi" },
    {
      tags: "pump",
      smooth: { slope: casingSlope, radius: casingR },
    },
  );
  const suction = pad(
    f,
    "pump.suction",
    casing,
    [px, py, ZP],
    [-1, 0, 0],
    5.4,
    14,
    { tone: "mid" },
    { tags: "pump" },
  ).face;
  const discharge = pad(
    f,
    "pump.discharge",
    casing,
    [px, py, ZP],
    [1, 0, 0],
    5.4,
    14,
    { tone: "mid" },
    { tags: "pump" },
  ).face;
  disc("pump.cover", upF(px, py, 24), 0, 1.6, 9, { tone: "mid" }, { tags: "pump" });
  disc("pump.lantern", upF(px, py, 25.6), 0, 6, 5.6, { tone: "mid" }, { tags: "pump" });
  disc("pump.motorFlange", upF(px, py, 31.6), 0, 1.4, 9.4, { tone: "hi" }, { tags: "pump" });
  const MF = upF(px, py, 33);
  disc(
    "pump.motor",
    MF,
    0,
    22,
    9,
    { tone: "hi" },
    {
      tags: "pump",
      extra: k.fadedSvg(G.ribsOf(MF, 0, 22, 9, 40, P, { fade: [0.1, 0.55], seams: true }), {
        tone: "lo",
      }),
    },
  );
  disc(
    "pump.fanCover",
    upF(px, py, 55),
    0,
    6,
    9.6,
    { tone: "hi" },
    {
      tags: "pump",
      bevel: 0.4,
      extra: Ln(
        G.circleOf(upF(px, py, 55), 6, 6, P, 40) + G.circleOf(upF(px, py, 55), 6, 3, P, 24),
        { tone: "lo" },
      ),
    },
  );

  // Heat exchanger: shell on two saddles, domed channel heads, two capped shell nozzles
  const head = (s) => HX.r * Math.sqrt(Math.max(0, 1 - (s / 8) ** 2));
  const headSlope = (s) => {
    const t = Math.max(0, Math.min(0.995, s / 8));
    return (-HX.r * t) / (8 * Math.sqrt(1 - t * t));
  };
  const headProfile = (dir) =>
    Array.from({ length: 14 }, (_, i) => {
      const s = 8 * Math.sin(((i / 14) * Math.PI) / 2) * 0.995;
      return [r2(s), r2(head(s)), i ? 1 : 0];
    })
      .concat([[8, 0]])
      .map(([s, r, smooth]) => [s * dir, r, smooth]);
  const HXF = alongX(0, 0, ZP);
  const inHead = turned(
    "hx.headIn",
    G.frameAlong([HX.x0 + 8, 0, ZP], [-1, 0, 0]),
    headProfile(1),
    { tone: "hi" },
    {
      tags: "hx",
      smooth: { slope: headSlope, radius: head },
    },
  );
  disc(
    "hx.flangeIn",
    HXF,
    HX.x0 + 8,
    HX.x0 + 9.6,
    HX.r + 1.6,
    { tone: "mid" },
    {
      tags: "hx",
      extra: Dots(
        G.dotsOf(alongX(HX.x0 + 8, 0, ZP), 0, HX.r + 0.8, 12, P, { fade: [0.04, 0.42] }),
        { size: 0.4, tone: "mid" },
      ),
    },
  );
  const shellX0 = HX.x0 + 9.6;
  const shellX1 = HX.x1 - 9.6;
  const hxShell = disc(
    "hx.shell",
    HXF,
    shellX0,
    shellX1,
    HX.r,
    { tone: "hi" },
    {
      tags: "hx",
      inner: Ln(G.arcOf(HXF, (shellX0 + shellX1) / 2, HX.r, P), { tone: "faint" }),
    },
  );
  disc("hx.flangeOut", HXF, shellX1, shellX1 + 1.6, HX.r + 1.6, { tone: "mid" }, { tags: "hx" });
  const outHead = turned(
    "hx.headOut",
    G.frameAlong([HX.x1 - 8, 0, ZP], [1, 0, 0]),
    headProfile(1),
    { tone: "hi" },
    {
      tags: "hx",
      smooth: { slope: headSlope, radius: head },
    },
  );
  for (const x of [shellX0 + 10, shellX1 - 10]) {
    const face = pad(
      f,
      "hx.nozzle",
      hxShell,
      [x, 0, ZP],
      [0, 0, 1],
      3.2,
      HX.r + 3,
      { tone: "mid" },
      { tags: "hx", ring: false },
    ).face;
    disc(
      "hx.blind",
      upF(face[0], face[1], face[2]),
      0,
      1,
      4.4,
      { tone: "hi" },
      {
        tags: "hx",
        extra: Dots(G.dotsOf(upF(face[0], face[1], face[2]), 1, 3.4, 6, P, { all: true }), {
          size: 0.35,
          tone: "mid",
        }),
      },
    );
  }
  // Saddles: cradles that follow the shell, each in a near and a far half so
  // the shell can sit between them in the painter's order
  for (const x of [shellX0 + 8, shellX1 - 8]) {
    const rr = HX.r + 0.02;
    const lip = ZP - rr * Math.sin(Math.PI / 6);
    const arcOf = (t0, t1) =>
      Array.from({ length: 7 }, (_, i) => {
        const t = t0 + ((t1 - t0) * i) / 6;
        return [rr * Math.cos(t), ZP + rr * Math.sin(t)];
      });
    const SF = G.frameOf([x - 1.6, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    // Split where the shell's underside turns away from the viewer: the outer
    // pieces lie in front of the shell or behind it, the middle one under it
    const turn = (56 * Math.PI) / 180;
    const ys = rr * Math.cos(turn);
    prism(
      "hx.saddle",
      SF,
      [[ys, 0], [HX.r + 2, 0], [HX.r + 2, lip], ...arcOf(-Math.PI / 6, -turn)],
      0,
      3.2,
      { tone: "mid" },
      { tags: "hx" },
    );
    prism(
      "hx.saddle",
      SF,
      [[-ys, 0], [ys, 0], ...arcOf(-turn, -Math.PI + turn)],
      0,
      3.2,
      { tone: "mid" },
      { tags: "hx" },
    );
    prism(
      "hx.saddle",
      SF,
      [[-HX.r - 2, 0], [-ys, 0], ...arcOf(-Math.PI + turn, (-5 * Math.PI) / 6), [-HX.r - 2, lip]],
      0,
      3.2,
      { tone: "mid" },
      { tags: "hx" },
    );
  }
  const hxIn = pad(
    f,
    "hx.inlet",
    inHead,
    [HX.x0 + 4, 0, ZP],
    [-1, 0, 0],
    5.4,
    10,
    { tone: "mid" },
    { tags: "hx" },
  ).face;
  const hxOut = pad(
    f,
    "hx.outlet",
    outHead,
    [HX.x1 - 4, 0, ZP],
    [1, 0, 0],
    5.4,
    14,
    { tone: "mid" },
    { tags: "hx" },
  ).face;
  tl.assemble("hx", 0.25, 0.34);

  // Lines and their fittings
  const t1Out = pad(
    f,
    "t1.outlet",
    t1.shell,
    [T1.c[0], 0, ZP],
    [1, 0, 0],
    5.6,
    32,
    { tone: "mid" },
    { tags: "t1" },
  ).face;
  const t2In = pad(
    f,
    "t2.inlet",
    t2.shell,
    [T2.c[0], 0, ZP],
    [-1, 0, 0],
    5.6,
    28,
    { tone: "mid" },
    { tags: "t2" },
  ).face;
  const t2Out = pad(
    f,
    "t2.outlet",
    t2.shell,
    [T2.c[0], T2.c[1], 10],
    [1, 0, 0],
    4.6,
    28,
    { tone: "mid" },
    { tags: "t2" },
  ).face;
  const t1In = pad(
    f,
    "t1.inlet",
    t1.shell,
    [T1.c[0], T1.c[1], 52],
    [-1, 0, 0],
    4.6,
    32,
    { tone: "mid" },
    { tags: "t1" },
  ).face;

  // The spool's own flanges (drawn in L1), where these lines bolt on
  record(A.disc(alongX(0, 0, ZP), SPOOL[0], SPOOL[0] + 1.6, RP * 1.6, { name: "spool.flangeA" }));
  record(A.disc(alongX(0, 0, ZP), SPOOL[1] - 1.6, SPOOL[1], RP * 1.6, { name: "spool.flangeB" }));
  const RT = [-115, 0, ZP];
  const recircTee = teeBall(f, "recirc.tee", RT, 4.4, { tags: "suction", owner: "suction" });
  f.pipe("suction", [t1Out, suction], RP, {
    tags: "suction",
    gapsAt: [{ at: RT, half: recircTee.half(RP) }],
    flow: { tags: "flow" },
  });
  f.pipe("discharge1", [discharge, [SPOOL[0], 0, ZP]], RP, {
    tags: "pump",
    flow: { tags: "flow" },
  });

  const VX = -14;
  const FTX = 6;
  const valve = gateValve(f, "valve", [VX, 0, ZP], [1, 0, 0], RP, {
    tags: "line2",
    owner: "discharge2",
  });
  const meter = (name, c, tags, owner) => {
    const F = G.frameAlong(c, [1, 0, 0]);
    disc(`${name}.flangeA`, F, -6, -5, RP * 1.7, { tone: "hi" }, { tags, owner });
    disc(`${name}.spool`, F, -5, 5, RP * 1.5, { tone: "hi" }, { tags, owner });
    disc(`${name}.flangeB`, F, 5, 6, RP * 1.7, { tone: "hi" }, { tags, owner });
    return { half: 6, base: [c[0], c[1], c[2] + Math.sqrt((RP * 1.5) ** 2 - 1.1 ** 2)] };
  };
  const ft = meter("ft.meter", [FTX, 0, ZP], "line2", "discharge2");
  f.pipe("discharge2", [[SPOOL[1], 0, ZP], hxIn], RP, {
    tags: "line2",
    gapsAt: [
      { at: [VX, 0, ZP], half: valve.half },
      { at: [FTX, 0, ZP], half: ft.half },
    ],
    flow: { tags: "flow" },
  });
  tl.assemble("line2", 0.067, 0.18);
  tl.assemble("pump", 0.03, 0.12);
  tl.assemble("suction", 0.1, 0.2);

  const TTX = 114;
  const RX = 128;
  const ttTee = teeBall(f, "tt.tee", [TTX, 0, ZP], 4.4, { tags: "line3", owner: "outlet" });
  const rTee = teeBall(f, "recirc.tee2", [RX, 0, ZP], 4.4, { tags: "line3", owner: "outlet" });
  f.pipe("outlet", [hxOut, t2In], RP, {
    tags: "line3",
    gapsAt: [
      { at: [TTX, 0, ZP], half: ttTee.half(RP) },
      { at: [RX, 0, ZP], half: rTee.half(RP) },
    ],
    flow: { tags: "flow" },
  });
  tl.assemble("line3", 0.25, 0.36);

  // Recirculation, in front of the line: a gate valve and a second flowmeter
  const RY = 40;
  const RV = [-60, RY, ZP];
  const FT2 = [30, RY, ZP];
  const rv = gateValve(f, "recirc.valve", RV, [1, 0, 0], RB, { tags: "recirc", owner: "recirc" });
  const ft2 = (() => {
    const F = G.frameAlong(FT2, [1, 0, 0]);
    disc(
      "ft2.meter.flangeA",
      F,
      -5,
      -4.2,
      RB * 1.7,
      { tone: "hi" },
      { tags: "recirc", owner: "recirc" },
    );
    disc(
      "ft2.meter.spool",
      F,
      -4.2,
      4.2,
      RB * 1.5,
      { tone: "hi" },
      { tags: "recirc", owner: "recirc" },
    );
    disc(
      "ft2.meter.flangeB",
      F,
      4.2,
      5,
      RB * 1.7,
      { tone: "hi" },
      { tags: "recirc", owner: "recirc" },
    );
    return { half: 5, base: [FT2[0], FT2[1], FT2[2] + Math.sqrt((RB * 1.5) ** 2 - 1.1 ** 2)] };
  })();
  const recircControl = [
    rTee.port([0, 1, 0], RB),
    [RX, RY, ZP],
    [RT[0], RY, ZP],
    recircTee.port([0, 1, 0], RB),
  ];
  f.pipe("recirc", recircControl, RB, {
    tags: "recirc",
    flanges: [false, false],
    caps: [false, false],
    bend: 3,
    gapsAt: [
      { at: RV, half: rv.half },
      { at: FT2, half: ft2.half },
    ],
    touch: ["sup.*"],
    flow: { tags: "flow" },
  });
  for (const x of [-30, 80]) support(f, "sup.recirc", [x, RY], ZP, RB, "x", { tags: "recirc" });
  tl.assemble("recirc", 0.32, 0.42);

  // Feed into the first tank and product out of the second, both through the pad
  floorSleeve(f, "feed.sleeve", [-210, T1.c[1]], RB, { tags: "service" });
  f.pipe("feed", [[-210, T1.c[1], 2.6], [-210, T1.c[1], 52], t1In], RB, {
    tags: "service",
    bend: 3,
    flow: { tags: "flow" },
  });
  floorSleeve(f, "product.sleeve", [234, T2.c[1]], RB, { tags: "service" });
  f.pipe("product", [t2Out, [234, T2.c[1], 10], [234, T2.c[1], 2.6]], RB, {
    tags: "service",
    bend: 3,
    flow: { tags: "flow" },
  });
  tl.assemble("service", 0.275, 0.425);

  tl.opacity("flow", [
    [0.04, 0],
    [0.12, 1],
    [0.55, 1],
    [0.63, 0],
  ]);
  tl.flow("flow", 6);

  // Instruments (the PT is drawn in L1)
  const lt = instrument(f, "lt", t1.top, { neck: 3, tags: "lt" });
  const lt2 = instrument(f, "lt2", t2.top, { neck: 3, tags: "lt2" });
  const ftHead = instrument(f, "ft", ft.base, { neck: 4, tags: "ft" });
  const ttBase = [TTX, 0, ZP + Math.sqrt(4.4 * 4.4 - 1.1 * 1.1)];
  const tt = instrument(f, "tt", ttBase, { neck: 5, tags: "tt" });
  const ft2Head = instrument(f, "ft2", ft2.base, { neck: 4, tags: "ft2" });
  tl.pop("ft", ft.base, 0.2, 0.23);
  tl.pop("lt", t1.top, 0.184, 0.214);
  tl.pop("tt", ttBase, 0.35, 0.38);
  tl.pop("lt2", t2.top, 0.376, 0.406);
  tl.pop("ft2", ft2.base, 0.392, 0.422);

  return { f, heads: { lt: lt.top, lt2: lt2.top, ft: ftHead.top, tt: tt.top, ft2: ft2Head.top } };
}

// ---------------------------------------------------------------------------
// L3: the plant site
// ---------------------------------------------------------------------------

const SITE = { x: -780, y: -470, w: 1560, d: 940, r: 16 };

function buildL3() {
  const f = createFigure({
    id: "where-l3",
    width: WHERE.width,
    height: WHERE.height,
    P: projectionAt(0.42),
  });
  const { P, at, Ln, tl, box, cyl, turned, disc, prism, record } = f;
  // The site slab: our skid's pad (L2) stands on it, so its top is the skid's floor
  const base = 0;
  f.back.push(
    f.S(k.slabOf(SITE, base - 8, 8, P, 6, 2), {
      tone: "mid",
      inner: Ln(k.sideSeam(SITE, base - 4, P, 6), { tone: "faint" }),
    }),
  );
  f.back.push(Ln(k.planOutline(k.insetPlan(SITE, 16), base, P, 6), { tone: "faint" }));
  record(A.slab(SITE, base - 8, 8, { name: "stand.site", ground: true }, 6));

  // Our skid, in small: the same layout, lit (what ATLAXIA reads today)
  const ours = "ours";
  box(
    "ours.pad",
    [SKID.x, SKID.y, 0],
    [SKID.x + SKID.w, SKID.y + SKID.d, 3],
    { tone: "lit", lit: true },
    { tags: ours, r: 4, steps: 4 },
  );
  const smallTank = (name, { c: [tx, ty], r, h }) => {
    cyl(`${name}`, tx, ty, r, 3, h, { tone: "hi", lit: true }, { tags: ours, steps: 48 });
    turned(
      `${name}.roof`,
      upF(tx, ty, h + 3),
      [
        [0, r],
        [8, 6],
        [8, 0],
      ],
      { tone: "hi", lit: true },
      { tags: ours, steps: 48 },
    );
  };
  smallTank("ours.t1", T1);
  smallTank("ours.t2", T2);
  cyl(
    "ours.pump",
    PUMP[0],
    PUMP[1],
    10,
    3,
    58,
    { tone: "hi", lit: true },
    { tags: ours, steps: 32 },
  );
  disc(
    "ours.hx",
    alongX(0, 0, ZP + 3),
    HX.x0,
    HX.x1,
    HX.r,
    { tone: "hi", lit: true },
    { tags: ours },
  );
  box(
    "ours.hxFoot",
    [HX.x0 + 12, -10, 3],
    [HX.x1 - 12, 10, 5],
    { tone: "lit", lit: true },
    { tags: ours },
  );
  tl.opacity(ours, [
    [0.6, 0],
    [0.665, 1],
  ]);

  // The rest of the plant: units that are there, but not yet read
  const unit = "units";
  // Tank farm in a bund
  box(
    "farm.bund",
    [-700, -430, 0],
    [-300, -110, 6],
    { tone: "lo" },
    { tags: unit, r: 4, steps: 3 },
  );
  for (const [x, y, r, h] of [
    [-600, -340, 62, 96],
    [-410, -350, 56, 84],
    [-600, -190, 50, 70],
    [-420, -200, 44, 64],
  ]) {
    cyl(
      "farm.tank",
      x,
      y,
      r,
      6,
      h,
      { tone: "mid" },
      { tags: unit, steps: 64, inner: Ln(G.arcOf(upF(x, y, 6), h * 0.5, r, P), { tone: "faint" }) },
    );
    turned(
      "farm.roof",
      upF(x, y, 6 + h),
      [
        [0, r + 1],
        [2, r + 1],
        [2, r],
        [10, 8],
        [10, 0],
      ],
      { tone: "mid" },
      { tags: unit, steps: 48 },
    );
  }
  // Process hall with a pitched roof and roof vents
  const hall = { x0: -200, x1: 220, y0: -430, y1: -250, h: 96 };
  box(
    "hall",
    [hall.x0, hall.y0, 0],
    [hall.x1, hall.y1, hall.h],
    { tone: "mid" },
    {
      tags: unit,
      r: 2,
      inner: Ln(
        k.sideSeam(
          { x: hall.x0, y: hall.y0, w: hall.x1 - hall.x0, d: hall.y1 - hall.y0, r: 2 },
          hall.h * 0.45,
          P,
          2,
        ),
        { tone: "faint" },
      ),
    },
  );
  prism(
    "hall.roof",
    alongX(hall.x0, 0, 0),
    [
      [hall.y0 - 4, hall.h],
      [hall.y1 + 4, hall.h],
      [(hall.y0 + hall.y1) / 2, hall.h + 34],
    ],
    0,
    hall.x1 - hall.x0,
    { tone: "mid" },
    { tags: unit },
  );
  // Column and reactor with platforms
  cyl(
    "column",
    430,
    -330,
    24,
    0,
    300,
    { tone: "mid" },
    {
      tags: unit,
      steps: 40,
      inner: Ln([80, 160, 240].map((z) => G.arcOf(upF(430, -330, 0), z, 24, P)).join(""), {
        tone: "faint",
      }),
    },
  );
  // Platforms on the side of the column that faces the yard, on brackets
  for (const z of [120, 220]) {
    box(
      "column.platform",
      [430 + 24, -346, z],
      [430 + 52, -314, z + 3],
      { tone: "lo" },
      { tags: unit, r: 1 },
    );
    box(
      "column.bracket",
      [430 + 23.6, -334, z - 10],
      [430 + 30, -326, z],
      { tone: "lo" },
      { tags: unit, r: 0.5 },
    );
  }
  cyl("reactor", 580, -300, 46, 0, 130, { tone: "mid" }, { tags: unit, steps: 56 });
  const headR = (s) => 46 * Math.sqrt(Math.max(0, 1 - (s / 22) ** 2));
  const headS = (s) => {
    const t = Math.max(0, Math.min(0.995, s / 22));
    return (-46 * t) / (22 * Math.sqrt(1 - t * t));
  };
  const headProfileR = Array.from({ length: 16 }, (_, i) => {
    const s = 22 * Math.sin(((i / 16) * Math.PI) / 2) * 0.995;
    return [r2(s), r2(headR(s)), i ? 1 : 0];
  }).concat([[22, 0]]);
  turned(
    "reactor.head",
    upF(580, -300, 130),
    headProfileR,
    { tone: "mid" },
    { tags: unit, smooth: { slope: headS, radius: headR } },
  );
  // Cooling tower
  const towerR = (s) => 64 + 30 * ((s - 120) / 120) ** 2;
  const towerSlope = (s) => (60 * (s - 120)) / (120 * 120);
  const towerProfile = Array.from({ length: 21 }, (_, i) => {
    const s = i * 10;
    return [s, r2(towerR(s)), i > 0 && i < 20 ? 1 : 0];
  });
  turned(
    "tower",
    upF(600, 120, 0),
    towerProfile,
    { tone: "mid" },
    {
      tags: unit,
      smooth: { slope: towerSlope, radius: towerR },
    },
  );
  // Warehouse, control room, substation
  box(
    "warehouse",
    [-640, 200, 0],
    [-320, 400, 72],
    { tone: "mid" },
    {
      tags: unit,
      r: 2,
      extra: Ln(
        [-600, -540, -480, -420]
          .map((x) =>
            k.pathOf([
              at([x, 400, 0]),
              at([x, 400, 40]),
              at([x + 40, 400, 40]),
              at([x + 40, 400, 0]),
            ]),
          )
          .join(""),
        { tone: "lo" },
      ),
    },
  );
  box(
    "control",
    [-680, -40, 0],
    [-500, 120, 52],
    { tone: "mid" },
    {
      tags: unit,
      r: 2,
      inner: Ln(
        k.sideSeam({ x: -680, y: -40, w: 180, d: 160, r: 2 }, 34, P, 2) +
          k.sideSeam({ x: -680, y: -40, w: 180, d: 160, r: 2 }, 22, P, 2),
        { tone: "lo" },
      ),
    },
  );
  box("substation.pad", [360, 230, 0], [660, 420, 4], { tone: "lo" }, { tags: unit, r: 2 });
  for (const [x, y] of [
    [420, 290],
    [520, 290],
    [420, 370],
    [520, 370],
  ]) {
    box(
      "transformer",
      [x - 26, y - 20, 4],
      [x + 26, y + 20, 44],
      { tone: "mid" },
      {
        tags: unit,
        r: 2,
        extra: Ln(
          [-16, -8, 0, 8, 16]
            .map((dx) => k.pathOf([at([x + dx, y + 20, 4]), at([x + dx, y + 20, 44])]))
            .join(""),
          { tone: "faint" },
        ),
      },
    );
  }
  // Pipe rack behind our skid, carrying four lines across the site
  const rackY = -190;
  const RACK = [-250, 470];
  for (let x = RACK[0] + 10; x <= RACK[1] - 10; x += 90) {
    for (const y of [rackY - 14, rackY + 14])
      cyl("rack.post", x, y, 2.6, 0, 52, { tone: "mid" }, { tags: unit, steps: 12 });
    box(
      "rack.beam",
      [x - 2.6, rackY - 17, 52],
      [x + 2.6, rackY + 17, 56],
      { tone: "mid" },
      { tags: unit, r: 0.6 },
    );
  }
  // Each line comes up from a floor sleeve at one end and goes back down at the other
  [-10, -3.5, 3.5, 10].forEach((dy, i) => {
    const y = rackY + dy;
    const x0 = RACK[0] - 14 - i * 8;
    const x1 = RACK[1] + 14 + i * 8;
    floorSleeve(f, `rack.sleeve${i}`, [x0, y], 2.4, { tags: unit });
    floorSleeve(f, `rack.sleeve${i}`, [x1, y], 2.4, { tags: unit });
    f.pipe(
      `rack.line${i}`,
      [
        [x0, y, 2.6],
        [x0, y, 58.4],
        [x1, y, 58.4],
        [x1, y, 2.6],
      ],
      2.4,
      {
        tags: unit,
        tone: "mid",
        maxLength: 120,
        spacing: 6,
        bend: 4,
        touch: ["rack.*"],
      },
    );
  });
  tl.assemble(unit, 0.634, 0.72);

  // The next scope: a boundary round the whole site, drawn on in cobalt
  const inset = k.insetPlan(SITE, 30);
  const ring = k.roundedPlan(inset, 6).map(([x, y]) => [x, y, base]);
  const d = k.pathOf([...ring, ring[0]].map(at));
  f.defs.push(
    `<mask id="where-boundary" maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="5000" height="5000"><path class="fx-draw" data-g="boundary" pathLength="1" stroke-width="30" d="${d}"/></mask>`,
  );
  f.front.push(`<path class="fx-relation" mask="url(#where-boundary)" d="${d}"/>`);
  tl.draw("boundary", 0.668, 0.768);
  return f;
}

// ---------------------------------------------------------------------------
// L4: the network of plants on a bench plate
// ---------------------------------------------------------------------------

const BENCH = { x: -3300, y: -2300, w: 6600, d: 4600, r: 90 };
const PLANTS = [
  { c: [-2400, -900], w: 980, d: 640 },
  { c: [-700, -1750], w: 900, d: 600 },
  { c: [1500, -1550], w: 1000, d: 680 },
  { c: [2450, 250], w: 880, d: 700 },
  { c: [300, 1500], w: 1000, d: 600 },
  { c: [-1900, 1250], w: 940, d: 640 },
];

function buildL4() {
  // Built in tens of world units: the bench is 6600 wide
  const U = 10;
  const f = createFigure({
    id: "where-l4",
    width: WHERE.width,
    height: WHERE.height,
    P: projectionAt(0.1, U),
  });
  const { at, tl, box, cyl } = f;
  const plan = (p) => ({ x: p.x / U, y: p.y / U, w: p.w / U, d: p.d / U, r: p.r / U });
  const top = -8 / U;
  basePlate(f, plan(BENCH), { h: 12, inset: 18, unit: 4, strip: 0, top });
  // Other plants: their pads and buildings, outlined and unshaded (not yet read)
  PLANTS.forEach(({ c: [cx0, cy0], w: w0, d: d0 }, index) => {
    const tags = `plant-${index}`;
    const [cx, cy, w, d] = [cx0 / U, cy0 / U, w0 / U, d0 / U];
    const pad = { x: cx - w / 2, y: cy - d / 2, w, d, r: 1.4 };
    box(
      `plant${index}.pad`,
      [pad.x, pad.y, top],
      [pad.x + w, pad.y + d, top + 0.8],
      { tone: "lo" },
      { tags, r: 1.4, steps: 4 },
    );
    // A 3 x 2 grid of slots, each holding a tank or a building that fits it
    const rand = (i) => (Math.sin(index * 12.9 + i * 78.2) + 1) / 2;
    const cols = 3;
    const rows = 2;
    const sw = (w - 8) / cols;
    const sd = (d - 8) / rows;
    for (let i = 0; i < cols * rows; i += 1) {
      if (rand(i + 20) < 0.18) continue;
      const sx = pad.x + 4 + (i % cols) * sw;
      const sy = pad.y + 4 + Math.floor(i / cols) * sd;
      if ((i + index) % 3 === 0) {
        const r = Math.min(sw, sd) * (0.28 + rand(i + 3) * 0.1);
        cyl(
          `plant${index}.tank`,
          sx + sw / 2,
          sy + sd / 2,
          r,
          top + 0.8,
          5 + rand(i + 5) * 7,
          { tone: "lo" },
          { tags, steps: 32 },
        );
      } else {
        const bw = sw * (0.55 + rand(i + 2) * 0.3);
        const bd = sd * (0.5 + rand(i + 4) * 0.3);
        const bx = sx + (sw - bw) / 2;
        const by = sy + (sd - bd) / 2;
        box(
          `plant${index}.building`,
          [bx, by, top + 0.8],
          [bx + bw, by + bd, top + 0.8 + 4 + rand(i + 6) * 6],
          { tone: "lo" },
          { tags, r: 0.4 },
        );
      }
    }
    tl.assemble(tags, 0.826 + index * 0.013, 0.87 + index * 0.013, 0.01);
  });

  // Network: our site to each plant, and each plant to the next; drawn on, then signals run out
  const site = {
    cx: (SITE.x + SITE.w / 2) / U,
    cy: (SITE.y + SITE.d / 2) / U,
    w: SITE.w / U,
    d: SITE.d / U,
  };
  const edge = ({ cx, cy, w, d }, tx, ty) => {
    const dx = tx - cx;
    const dy = ty - cy;
    const t = Math.min(w / 2 / Math.abs(dx || 1e-6), d / 2 / Math.abs(dy || 1e-6));
    return [cx + dx * t, cy + dy * t];
  };
  const plants = PLANTS.map(({ c: [cx, cy], w, d }) => ({
    cx: cx / U,
    cy: cy / U,
    w: w / U,
    d: d / U,
  }));
  const links = [
    ...plants.map((p) => [site, p]),
    ...plants.map((p, i) => [p, plants[(i + 1) % plants.length]]),
  ];
  links.forEach(([a, b], i) => {
    const p0 = edge(a, b.cx, b.cy);
    const p1 = edge(b, a.cx, a.cy);
    const mid = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
    const bend = i % 2 === 0 ? 0.12 : -0.12;
    const q = [mid[0] - (p1[1] - p0[1]) * bend, mid[1] + (p1[0] - p0[0]) * bend];
    const points = Array.from({ length: 33 }, (_, j) => {
      const t = j / 32;
      const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * q[0] + t * t * p1[0];
      const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * q[1] + t * t * p1[1];
      return at([x, y, top + 0.05]);
    });
    const d = k.pathOf(points);
    const tag = `link-${i}`;
    f.defs.push(
      `<mask id="where-${tag}" maskUnits="userSpaceOnUse" x="-3000" y="-3000" width="7000" height="7000"><path class="fx-draw" data-g="${tag}" pathLength="1" stroke-width="40" d="${d}"/></mask>`,
    );
    f.front.push(`<path class="fx-relation" mask="url(#where-${tag})" d="${d}"/>`);
    tl.draw(tag, 0.85 + i * 0.005, 0.93 + i * 0.005);
    if (i < plants.length) {
      f.front.push(`<path class="fx-signal" data-g="signal-${i}" pathLength="1" d="${d}"/>`);
      tl.opacity(`signal-${i}`, [
        [0.905 + i * 0.007, 0],
        [0.915 + i * 0.007, 1],
      ]);
    }
  });
  return f;
}

// ---------------------------------------------------------------------------
// The figure
// ---------------------------------------------------------------------------

export function buildWhere() {
  const l4 = buildL4();
  const l3 = buildL3();
  const { f: l2, heads } = buildL2();
  const l1 = buildL1();

  // Relations between the process signals, drawn at the process level, over the transmitter
  const rel = createFigure({
    id: "where-rel",
    width: WHERE.width,
    height: WHERE.height,
    P: projectionAt(1.6),
  });
  const pt = [PT_X, 0, FOCUS[2] + 3.4];
  rel.relation("rel-pt-ft", pt, heads.ft, { lift: 14, tags: "rel0" });
  rel.relation("rel-pt-lt", pt, heads.lt, { lift: 30, tags: "rel1" });
  rel.relation("rel-ft-tt", heads.ft, heads.tt, { lift: 26, tags: "rel2" });
  rel.relation("rel-tt-lt2", heads.tt, heads.lt2, { lift: 18, tags: "rel3" });
  rel.relation("rel-pt-ft2", pt, heads.ft2, { lift: 12, tags: "rel4", bow: 8 });
  rel.relation("rel-lt-lt2", heads.lt, heads.lt2, { lift: 90, tags: "rel5" });
  [0, 1, 2, 3, 4, 5].forEach((i) =>
    rel.tl.relation(`rel${i}`, 0.392 + i * 0.015, 0.476 + i * 0.015),
  );

  const levels = [
    ["L4", l4, 0.1],
    ["L3", l3, 0.42],
    ["L2", l2, 1.6],
    ["L1", l1, 9],
    ["REL", rel, 1.6],
  ];
  const tracks = [];
  const loops = [];
  const morphs = [];
  const defs = [];
  const groups = [];
  const centre = [WHERE.width / 2, WHERE.height / 2];
  for (const [name, figure, base] of levels) {
    const { body, defs: levelDefs, timeline } = figure.buildBody();
    defs.push(levelDefs);
    groups.push(`<g data-cam="${name}" data-g="level-${name}">${body}</g>`);
    const offset = morphs.length;
    morphs.push(...timeline.morphs);
    tracks.push(
      ...timeline.tracks.map((track) =>
        "mo" in track ? { ...track, mo: track.mo + offset } : track,
      ),
    );
    loops.push(...timeline.loops);
    tracks.push({ s: `[data-cam="${name}"]`, cam: { f: centre, base, k: CAMERA } });
  }
  // The skid's pad comes into view as the camera leaves the transmitter
  tracks.push({
    s: '[data-cam="L2"] > [data-g~="base"]',
    o: [
      [0.07, 0],
      [0.16, 1],
    ],
  });
  // Level of detail: the skid and transmitter hand over to the small lit skid of the plant
  tracks.push({
    s: '[data-g~="level-L2"]',
    o: [
      [0.6, 1],
      [0.68, 0],
    ],
  });
  tracks.push({
    s: '[data-g~="level-L1"]',
    o: [
      [0.6, 1],
      [0.68, 0],
    ],
  });
  tracks.push({
    s: '[data-g~="level-REL"]',
    o: [
      [0.6, 1],
      [0.66, 0],
    ],
  });
  // Levels not in view are not drawn at all: the plant from just before it shows, the bench after
  tracks.push({
    s: '[data-g~="level-L3"]',
    o: [
      [0.57, 0],
      [0.58, 1],
    ],
  });
  tracks.push({
    s: '[data-g~="level-L4"]',
    o: [
      [0.79, 0],
      [0.83, 1],
    ],
  });
  // Signals out of our plant: a pulse along each of its links
  for (let i = 0; i < PLANTS.length; i += 1) {
    tracks.push({
      s: `.fx-signal[data-g~="signal-${i}"]`,
      dr: [
        [0.905 + i * 0.007, 0.92],
        [0.985, 2.2],
      ],
    });
  }
  const say = [
    [0, "una señal"],
    [0.12, "el equipo alrededor"],
    [0.28, "hoy: un proceso, sus señales relacionadas"],
    [0.62, "siguiente: la planta completa"],
    [0.84, "objetivo: sistemas conectados"],
  ];
  const label =
    "La cámara se aleja de un transmisor de presión en una tubería: aparece el proceso con sus señales relacionadas, después la planta completa, rodeada por su límite, y al final varias plantas unidas en red.";
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg" data-figure="vision-where" viewBox="0 0 ${WHERE.width} ${WHERE.height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${label}">` +
    `<defs>${defs.join("")}</defs>${groups.join("")}</svg>`;
  // Over 4.5 screens of scroll, about 30 seconds of the fan, the flow and the dashes
  const unique = loops.filter(
    (loop, index) => loops.findIndex((other) => other.s === loop.s) === index,
  );
  const built = { svg, timeline: { v: 1, span: 30, tracks, loops: unique, morphs, say } };
  return { levels: levels.map(([name, figure]) => ({ name, figure })), built };
}
