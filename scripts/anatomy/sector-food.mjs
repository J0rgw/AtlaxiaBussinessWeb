import { A, G, createFigure, k, r2 } from "./lib.mjs";
import { basePlate, floorSleeve, instrument, pad } from "./parts.mjs";

/*
  Sector "Agroalimentación" (scene B, second panel): what sector-food.json
  draws, built as a bench model.

  A jacketed batch vessel on four legs, cut open on the side that faces you,
  so its liquid can be seen rising and its pitched-blade turbine turning. An
  agitator drive stands on the top head; a fill line comes in over the top
  and a steam line feeds the jacket. Beside it, a batch recorder on a
  pedestal shows the temperature trend: the expected band changes with each
  phase of the batch and the measured trace follows it. Steam runs in the
  jacket only while the trace climbs into the second phase.

  Storyboard (frames / 239 of the Lottie, with its 30-frame lead):
    0.00  vessel and drive             0.125-0.59  the vessel fills (ease out)
    0.21  recorder axes                0.29-0.54  steam service is laid
    0.38  phase guides                 0.50 / 0.65 / 0.79  each phase's band
    0.54-0.98  the measured trace      0.29 ST, 0.36 TT, 0.42 LT
    0.52 TT-recorder, 0.59 ST-TT, 0.65 TT-LT relations draw on
*/

export const FOOD = { width: 600, height: 400, azimuth: 60, elevation: 30 };

const deg = (d) => (d * Math.PI) / 180;
const C = [-64, -10];
const RI = 31;
const RO = 32;
const RJ0 = 33.2;
const RJ1 = 34.4;
const ZT0 = 32; // bottom tangent line
const ZT1 = 92; // top tangent line
const HEAD = 15;
const JZ0 = 42;
const JZ1 = 82;
const WIN = { a0: deg(24), a1: deg(98), z0: 44, z1: 80 };
const HEEL = ZT0; // the dish is full when the batch starts
const LEVEL = ZT0 + 0.68 * (ZT1 - ZT0);
const PANEL = { x0: 26, x1: 128, y0: 26, y1: 36, z0: 40, z1: 104 };
const PLATE = { x: -136, y: -66, w: 284, d: 138, r: 9 };

const upF = (x, y, z = 0) => G.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);

export function buildFood(P) {
  const f = createFigure({ id: "sector-food", width: FOOD.width, height: FOOD.height, P });
  const { at, Ln, Dots, put, tl, box, disc, turned, cyl, prism, V, S, record } = f;
  const VF = upF(C[0], C[1], 0);
  const radial = (t) => [Math.cos(t), Math.sin(t), 0];
  const onAxis = (z) => [C[0], C[1], z];
  const around = (r, t, z) => [C[0] + r * Math.cos(t), C[1] + r * Math.sin(t), z];

  basePlate(f, PLATE, { strip: 0.4 });
  tl.show("base", 0, 0.05);

  // -------------------------------------------------------------------------
  // Legs on load cells, with lugs welded under the jacket
  // -------------------------------------------------------------------------
  const LEG_R = RJ1 + 4;
  for (const t of [deg(12), deg(102), deg(192), deg(282)]) {
    const [x, y] = around(LEG_R, t, 0);
    cyl("leg.cell", x, y, 4, 0, 3, { tone: "lo" }, { tags: "vessel", steps: 28, bevel: 0.4 });
    cyl("leg.cellTop", x, y, 2.8, 3, 1.6, { tone: "mid" }, { tags: "vessel", steps: 24 });
    cyl("leg", x, y, 2.2, 4.6, ZT0 + 4 - 4.6, { tone: "mid" }, { tags: "vessel", steps: 24 });
    const LF = G.frameOf([C[0], C[1], 0], [0, 0, 1], radial(t), [-Math.sin(t), Math.cos(t), 0]);
    prism(
      "leg.lug",
      LF,
      [
        [RO - 0.3, -1.4],
        [LEG_R - 2.2, -1.4],
        [LEG_R - 2.2, 1.4],
        [RO - 0.3, 1.4],
      ],
      ZT0,
      ZT0 + 4,
      { tone: "lo" },
      { tags: "vessel" },
    );
  }

  // -------------------------------------------------------------------------
  // The vessel: heads, shell and jacket as one drawn body, cut open by a window
  // -------------------------------------------------------------------------
  const ell = (s) => Math.sqrt(Math.max(0, 1 - s * s));
  const ellSlope = (s) => (s >= 0.999 ? -40 : -s / Math.sqrt(1 - s * s));
  const bottomR = (s) => RO * ell((ZT0 - s) / HEAD);
  const bottomSlope = (s) => (RO / HEAD) * -ellSlope((ZT0 - s) / HEAD);
  const topR = (s) => RO * ell((s - ZT1) / HEAD);
  const topSlope = (s) => (RO / HEAD) * ellSlope((s - ZT1) / HEAD);
  const sample = (s0, s1, rOf, n = 22) =>
    Array.from({ length: n + 1 }, (_, i) => {
      const u = i / n;
      const s = s0 + (s1 - s0) * (1 - Math.cos((u * Math.PI) / 2));
      return [r2(s), r2(rOf(s)), i > 0 && i < n ? 1 : 0];
    });
  const bottomProfile = sample(ZT0, ZT0 - HEAD * 0.998, bottomR)
    .reverse()
    .concat([]);
  bottomProfile.unshift([ZT0 - HEAD, 0]);
  const topProfile = sample(ZT1, ZT1 + HEAD * 0.998, topR);
  topProfile.push([ZT1 + HEAD, 0]);

  const paths = [];
  const shapes = [];
  const bottomPaths = G.solidOf(bottomProfile, VF, P, {
    smooth: { slope: bottomSlope, radius: bottomR },
  });
  shapes.push(record(A.solid(VF, bottomProfile, { name: "vessel.bottom", radius: bottomR })));
  // The shell in two pieces: the one inside the jacket, and the one above it
  // drawn after the jacket, so it covers the collar's hole
  const shellLower = G.solidOf(
    [
      [ZT0, RO],
      [JZ1, RO],
    ],
    VF,
    P,
    { steps: 120 },
  );
  const shellUpper = G.solidOf(
    [
      [JZ1, RO],
      [ZT1, RO],
    ],
    VF,
    P,
    { steps: 120 },
  );
  shapes.push(
    record(
      A.solid(
        VF,
        [
          [ZT0, RO],
          [ZT1, RO],
        ],
        { name: "vessel.shell" },
      ),
    ),
  );
  const topPaths = G.solidOf(topProfile, VF, P, { smooth: { slope: topSlope, radius: topR } });
  const topShape = record(A.solid(VF, topProfile, { name: "vessel.top", radius: topR }));
  shapes.push(topShape);
  // The jacket: a collar round the shell, with its own weld seams
  const jacketPaths = G.ringBand(JZ0, JZ1, RO, RJ1, VF, P, { steps: 120 });
  const jacketShape = record(A.ring(VF, JZ0, JZ1, RO, RJ1, { name: "vessel.jacket" }));
  shapes.push(jacketShape);
  const seam = (z, r = RO) => Ln(G.arcOf(VF, z, r, P), { tone: "faint" });
  paths.push(S(bottomPaths, { tone: "hi" }));
  paths.push(S(shellLower, { tone: "hi", inner: seam(ZT0 + 0.2) }));
  paths.push(S(jacketPaths, { tone: "hi", inner: seam(62, RJ1) }));
  paths.push(S(shellUpper, { tone: "hi", inner: seam(ZT1 - 0.2) }));
  paths.push(S(topPaths, { tone: "hi" }));

  // Window: everything inside is drawn over the body, clipped to the opening
  const winOuter = (z0, z1, r) => {
    const n = 24;
    const arc = (z, a0, a1) =>
      Array.from({ length: n + 1 }, (_, i) => around(r, a0 + ((a1 - a0) * i) / n, z));
    return [...arc(z0, WIN.a0, WIN.a1), ...arc(z1, WIN.a1, WIN.a0)];
  };
  const opening = k.pathOf(winOuter(WIN.z0, WIN.z1, RJ1).map(at), true);
  defs(`<clipPath id="food-window"><path d="${opening}"/></clipPath>`);

  // Interior: the inner wall and dish seen from inside, far facets first
  const innerR = (s) => (s < ZT0 ? Math.max(0, bottomR(s) - 1) : RI);
  const innerSlope = (s) => (s < ZT0 ? bottomSlope(s) : 0);
  const quads = [];
  // Rows only where the dish curves; the straight wall is one quad per column
  const rows = [];
  for (let i = 0; i <= 6; i += 1)
    rows.push(ZT0 - HEAD + 1 + (HEAD - 1) * (1 - Math.cos((i / 6) * (Math.PI / 2))));
  rows.push(ZT1);
  const cols = 48;
  for (let i = 1; i < rows.length; i += 1) {
    const s0 = rows[i - 1];
    const s1 = rows[i];
    const sm = (s0 + s1) / 2;
    for (let j = 0; j < cols; j += 1) {
      const t0 = (j / cols) * Math.PI * 2;
      const t1 = ((j + 1) / cols) * Math.PI * 2;
      const tm = (t0 + t1) / 2;
      const outward = G.unit3(G.sub3(radial(tm), G.mul3([0, 0, 1], innerSlope(sm))));
      const inward = G.mul3(outward, -1);
      if (G.dot3(inward, V) <= 0.01) continue;
      const pts = [
        around(innerR(s0), t0, s0),
        around(innerR(s0), t1, s0),
        around(innerR(s1), t1, s1),
        around(innerR(s1), t0, s1),
      ];
      const centre = around(innerR(sm), tm, sm);
      quads.push({
        d: G.dot3(centre, V),
        tone: G.toneOf(inward, P),
        path: k.pathOf(pts.map(at), true),
      });
    }
  }
  quads.sort((a, b) => a.d - b.d);
  const interior = quads
    .map((q) => `<path class="iso-shade" data-shade="${Math.min(3, q.tone)}" d="${q.path}"/>`)
    .join("");

  // Shaft and the pitched-blade turbine, in frames of a quarter turn
  const HUB_Z = 46;
  const shaft = (cls = "") =>
    S(k.cylinder(C[0], C[1], 1.6, HUB_Z, ZT1 + HEAD - HUB_Z, P, 20), {
      tone: "mid",
      className: cls,
    });
  const FRAMES = 8;
  const turbine = Array.from({ length: FRAMES }, (_, frame) => {
    const turn = (frame / FRAMES) * (Math.PI / 2);
    const parts = [];
    parts.push({
      d: G.dot3(onAxis(HUB_Z), V),
      svg: S(k.cylinder(C[0], C[1], 3.2, HUB_Z - 2.4, 4.8, P, 24), { tone: "mid" }),
    });
    for (let b = 0; b < 4; b += 1) {
      const t = turn + (b * Math.PI) / 2;
      const F = G.frameOf(onAxis(HUB_Z), radial(t), [-Math.sin(t), Math.cos(t), 0], [0, 0, 1]);
      const w = 3.4;
      const poly = [
        [-w * 0.71 - 0.25, -w * 0.71 + 0.25],
        [w * 0.71 - 0.25, w * 0.71 + 0.25],
        [w * 0.71 + 0.25, w * 0.71 - 0.25],
        [-w * 0.71 + 0.25, -w * 0.71 - 0.25],
      ];
      const centre = around(10, t, HUB_Z);
      parts.push({ d: G.dot3(centre, V), svg: S(f.prismPaths(F, poly, 3, 17), { tone: "hi" }) });
    }
    parts.sort((a, b) => a.d - b.d);
    return `<g data-f="${frame}">${parts.map((part) => part.svg).join("")}</g>`;
  }).join("");
  tl.frames('[data-g~="turbine"]', FRAMES, 0.6);

  // Liquid: a cylinder from the dish to the level (morphed as it rises) and its surface
  const cylinderRegion = (z0, z1, r) => {
    const n = 48;
    const phiV = Math.atan2(V[1], V[0]);
    const front = Array.from({ length: n + 1 }, (_, i) =>
      around(r, phiV - Math.PI / 2 + (Math.PI * i) / n, z0),
    );
    const back = Array.from({ length: n + 1 }, (_, i) =>
      around(r, phiV + Math.PI / 2 + (Math.PI * i) / n, z1),
    );
    return k.pathOf([...front, ...back].map(at), true);
  };
  const surface = (z, r) =>
    k.pathOf(
      Array.from({ length: 64 }, (_, i) => around(r, (i / 64) * Math.PI * 2, z)).map(at),
      true,
    );
  const liquidAt = (z) => [cylinderRegion(ZT0 - HEAD + 1, z, RI - 0.2), surface(z, RI - 0.2)];
  const [bodyA, topA] = liquidAt(HEEL);
  const [bodyB, topB] = liquidAt(LEVEL);
  const liquid = `<g data-g="liquid"><path class="fx-liquid" d="${bodyA}"/><path class="fx-liquid-top" d="${topA}"/><path class="iso-line" data-tone="lo" d="${topA}"/></g>`;
  tl.morph(
    "liquid",
    [
      [bodyA, topA, topA],
      [bodyB, topB, topB],
    ],
    [
      [0.125, 0],
      [0.59, 1],
    ],
    "o",
  );
  // The shaft above the surface is drawn again over the liquid
  const surfaceY = at(onAxis(HEEL))[1];
  defs(
    `<clipPath id="food-above"><rect data-g="above" x="-1000" y="-1000" width="3000" height="${r2(1000 + surfaceY)}"/></clipPath>`,
  );
  tl.translate(
    "above",
    [
      [0.125, [0, 0, 0]],
      [0.59, [0, 0, LEVEL - HEEL]],
    ],
    "o",
  );

  // Thermowell through the wall into the liquid, seen through the window
  const TT_T = deg(-16);
  const well = S(
    G.disc(RI - 13, RI, 0.9, G.frameAlong(onAxis(62), radial(TT_T)), P, { steps: 16 }),
    { tone: "mid" },
  );

  const inside =
    `<g clip-path="url(#food-window)"><path class="fx-cavity" d="${opening}"/>${interior}${well}${shaft()}` +
    `<g data-g="turbine">${turbine}</g>${liquid}<g clip-path="url(#food-above)">${shaft()}</g></g>`;

  // Cut faces: shell wall, jacket gap and jacket wall, on both sides and at the sill
  const cuts = [];
  const sideFace = (t, sign) => {
    const normal = G.mul3([-Math.sin(t), Math.cos(t), 0], sign);
    const tone = Math.min(3, G.toneOf(normal, P));
    const quad = (r0, r1) =>
      k.pathOf(
        [
          around(r0, t, WIN.z0),
          around(r1, t, WIN.z0),
          around(r1, t, WIN.z1),
          around(r0, t, WIN.z1),
        ].map(at),
        true,
      );
    cuts.push(`<path class="iso-shade" data-shade="${tone}" d="${quad(RI, RO)}"/>`);
    cuts.push(`<path class="fx-cavity" d="${quad(RO, RJ0)}"/>`);
    cuts.push(`<path class="iso-shade" data-shade="${tone}" d="${quad(RJ0, RJ1)}"/>`);
    cuts.push(Ln(quad(RI, RO) + quad(RJ0, RJ1), { tone: "mid" }));
  };
  sideFace(WIN.a0, 1);
  sideFace(WIN.a1, -1);
  const sill = (r0, r1) => {
    const n = 24;
    const a = Array.from({ length: n + 1 }, (_, i) =>
      around(r1, WIN.a0 + ((WIN.a1 - WIN.a0) * i) / n, WIN.z0),
    );
    const b = Array.from({ length: n + 1 }, (_, i) =>
      around(r0, WIN.a1 - ((WIN.a1 - WIN.a0) * i) / n, WIN.z0),
    );
    return k.pathOf([...a, ...b].map(at), true);
  };
  cuts.push(
    `<path class="iso-top" d="${sill(RI, RO)}"/>`,
    `<path class="fx-cavity" d="${sill(RO, RJ0)}"/>`,
    `<path class="iso-top" d="${sill(RJ0, RJ1)}"/>`,
  );
  cuts.push(Ln(sill(RI, RO) + sill(RJ0, RJ1), { tone: "mid" }));
  cuts.push(Ln(opening, { tone: "hi" }));

  put("vessel", onAxis((ZT0 + ZT1) / 2), paths.join("") + inside + cuts.join(""), shapes, {
    tags: "vessel",
  });
  tl.assemble("vessel", 0, 0.11);

  // -------------------------------------------------------------------------
  // Top head: drive nozzle, agitator drive, manway
  // -------------------------------------------------------------------------
  const topZ = ZT1 + HEAD;
  const driveFace = pad(
    f,
    "drive.nozzle",
    topShape,
    onAxis(topZ - 6),
    [0, 0, 1],
    8,
    8,
    { tone: "mid" },
    { tags: "drive" },
  ).face;
  disc(
    "drive.flange",
    upF(C[0], C[1], driveFace[2]),
    0,
    1.4,
    10,
    { tone: "hi" },
    {
      tags: "drive",
      extra: Dots(G.dotsOf(upF(C[0], C[1], driveFace[2]), 1.4, 8.6, 8, P, { all: true }), {
        size: 0.4,
        tone: "mid",
      }),
    },
  );
  const lz = driveFace[2] + 1.4;
  disc(
    "drive.lantern",
    upF(C[0], C[1], lz),
    0,
    7,
    5.4,
    { tone: "mid" },
    {
      tags: "drive",
      inner: Ln(G.arcOf(upF(C[0], C[1], lz), 3.5, 5.4, P), { tone: "faint" }),
    },
  );
  const gz = lz + 7;
  box(
    "drive.gearbox",
    [C[0] - 10, C[1] - 7, gz],
    [C[0] + 10, C[1] + 7, gz + 11],
    { tone: "hi" },
    {
      tags: "drive",
      r: 1.4,
      steps: 3,
      bevel: 0.5,
      inner: Ln(k.sideSeam({ x: C[0] - 10, y: C[1] - 7, w: 20, d: 14, r: 1.4 }, gz + 5.5, P, 3), {
        tone: "faint",
      }),
    },
  );
  const mz = gz + 11;
  disc("drive.motorFlange", upF(C[0], C[1], mz), 0, 1.2, 7.6, { tone: "mid" }, { tags: "drive" });
  const MF = upF(C[0], C[1], mz + 1.2);
  disc(
    "drive.motor",
    MF,
    0,
    15,
    7,
    { tone: "hi" },
    {
      tags: "drive",
      extra: k.fadedSvg(G.ribsOf(MF, 0, 15, 7, 30, P, { fade: [0.1, 0.55], seams: true }), {
        tone: "lo",
      }),
    },
  );
  const fanZ = mz + 1.2 + 15;
  const fanM = f.planeMatrix([C[0], C[1], fanZ + 4], [1, 0, 0], [0, 1, 0]);
  const grille = [6.3, 4.4, 2.6]
    .map((rr) => `M${rr} 0A${rr} ${rr} 0 1 1 ${-rr} 0A${rr} ${rr} 0 1 1 ${rr} 0Z`)
    .join("");
  disc(
    "drive.fanCover",
    upF(C[0], C[1], fanZ),
    0,
    4,
    7.4,
    { tone: "hi" },
    {
      tags: "drive",
      bevel: 0.4,
      extra: `<g transform="${fanM}"><circle class="fx-cavity" r="6.6"/><path class="iso-line" data-tone="lo" d="${grille}"/><circle class="iso-line" data-tone="lo" style="fill:var(--anatomy-top)" r="1.6"/></g>`,
    },
  );
  tl.assemble("drive", 0.07, 0.13);

  // Manway on the top head, toward the back
  const MW_T = deg(150);
  const manway = pad(
    f,
    "manway",
    topShape,
    around(17, MW_T, topZ - 8),
    [0, 0, 1],
    7,
    7.6,
    { tone: "mid" },
    { tags: "vessel", ring: false },
  ).face;
  disc(
    "manway.cover",
    upF(manway[0], manway[1], manway[2]),
    0,
    1.8,
    8,
    { tone: "hi" },
    {
      tags: "vessel",
      extra: Dots(G.dotsOf(upF(manway[0], manway[1], manway[2]), 1.8, 6.6, 8, P, { all: true }), {
        size: 0.4,
        tone: "mid",
      }),
    },
  );

  // -------------------------------------------------------------------------
  // Fill line over the top, down the left side: runs only while the vessel fills
  // -------------------------------------------------------------------------
  const body = [shapes[1], jacketShape];
  const FILL_T = deg(195);
  const fillPad = pad(
    f,
    "fill.nozzle",
    topShape,
    around(18, FILL_T, topZ - 8),
    [0, 0, 1],
    4.4,
    7,
    { tone: "mid" },
    { tags: "vessel", ring: false },
  ).face;
  const fillTop = fillPad[2] + 12;
  const FX = fillPad[0] - 32;
  const fillControl = [
    fillPad,
    [fillPad[0], fillPad[1], fillTop],
    [FX, fillPad[1], fillTop],
    [FX, fillPad[1], 2.6],
  ];
  floorSleeve(f, "fill.sleeve", [FX, fillPad[1]], 2.4, { tags: "vessel" });
  const FV = [FX, fillPad[1], 44];
  const fvHalf = 4.6;
  // An on/off ball valve with its actuator, on the down leg
  const FVF = G.frameAlong(FV, [0, 0, 1]);
  disc(
    "fill.valve",
    FVF,
    -fvHalf,
    fvHalf,
    3.8,
    { tone: "hi" },
    { tags: "vessel", owner: "fill", inner: Ln(G.arcOf(FVF, 0, 3.8, P), { tone: "faint" }) },
  );
  disc("fill.stem", G.frameAlong(FV, [0, 1, 0]), 3.6, 6, 1, { tone: "mid" }, { tags: "vessel" });
  box(
    "fill.actuator",
    [FV[0] - 4.5, FV[1] + 6, FV[2] - 3.5],
    [FV[0] + 4.5, FV[1] + 12, FV[2] + 3.5],
    { tone: "mid" },
    {
      tags: "vessel",
      r: 0.8,
      bevel: 0.3,
      extra: Dots(
        [at([FV[0] - 3, FV[1] + 12, FV[2] + 2]), at([FV[0] + 3, FV[1] + 12, FV[2] + 2])],
        { size: 0.4 },
      ),
    },
  );
  f.pipe("fill", fillControl, 2.4, {
    tags: "vessel",
    flanges: [true, true],
    gapsAt: [{ at: FV, half: fvHalf }],
    flow: { tags: "flow-fill" },
    bend: 3,
  });
  tl.opacity("flow-fill", [
    [0.12, 0],
    [0.15, 1],
    [0.55, 1],
    [0.6, 0],
  ]);
  tl.flow("flow-fill", 9);

  // -------------------------------------------------------------------------
  // Steam to the jacket through a control valve; runs while phase 2 heats
  // -------------------------------------------------------------------------
  const ST_T = deg(148);
  const dir = radial(ST_T);
  const steamPad = pad(
    f,
    "steam.nozzle",
    body,
    onAxis(74),
    dir,
    4.1,
    RJ1 + 4,
    { tone: "mid" },
    { tags: "steam", share: 0, ring: false },
  ).face;
  const steamOut = G.add3(steamPad, G.mul3(dir, 12));
  const steamEnd = [steamOut[0], steamOut[1], 2.6];
  const steamControl = [steamPad, steamOut, steamEnd];
  const CV = [steamOut[0], steamOut[1], 36];
  const CVF = G.frameAlong(CV, [0, 0, 1]);
  const bulgeR = (s) => 2.6 + 2.2 * Math.sqrt(Math.max(0, 1 - (s / 4.2) ** 2));
  const bulgeSlope = (s) => {
    const t = Math.max(-0.99, Math.min(0.99, s / 4.2));
    return (-2.2 * t) / (4.2 * Math.sqrt(1 - t * t));
  };
  const valveProfile = [
    [-5.6, 0],
    [-5.6, 3.6],
    [-4.6, 3.6],
    [-4.6, 2.6],
    ...Array.from({ length: 11 }, (_, i) => {
      const s = 4.2 * Math.sin(((i - 5) / 5) * (Math.PI / 2));
      return [r2(s), r2(bulgeR(s)), i && i < 10 ? 1 : 0];
    }),
    [4.6, 2.6],
    [4.6, 3.6],
    [5.6, 3.6],
    [5.6, 0],
  ];
  put(
    "steam.valve",
    CV,
    S(G.lathe(valveProfile, CVF, P, { steps: 32, smooth: { slope: bulgeSlope, rows: 3 } }), {
      tone: "hi",
    }),
    [record(A.body(CVF, valveProfile, { name: "steam.valve", owner: "steam" }))],
    { tags: "steam", share: 0.7 },
  );
  // Diaphragm actuator: a yoke out of the valve's side and a dome on it
  const YF = G.frameAlong(CV, dir);
  disc("steam.bonnet", YF, 4.4, 8.4, 1.6, { tone: "mid" }, { tags: "steam", share: 0.7 });
  const domeR = (s) => 5.2 * Math.sqrt(Math.max(0, 1 - ((s - 9.4) / 3.2) ** 2));
  const domeSlope = (s) => {
    const t = Math.max(0, Math.min(0.99, (s - 9.4) / 3.2));
    return (-5.2 * t) / (3.2 * Math.sqrt(1 - t * t));
  };
  const domeProfile = [
    [8.4, 0],
    [8.4, 5.6],
    [9.4, 5.6],
    ...Array.from({ length: 12 }, (_, i) => {
      const s = 9.4 + 3.2 * Math.sin(((i / 12) * Math.PI) / 2) * 0.995;
      return [r2(s), r2(domeR(s)), i ? 1 : 0];
    }),
    [12.6, 0],
  ];
  turned(
    "steam.actuator",
    YF,
    domeProfile,
    { tone: "hi" },
    { tags: "steam", share: 0.7, smooth: { slope: domeSlope, radius: domeR } },
  );
  f.pipe("steam", steamControl, 2.4, {
    tags: "steam",
    reveal: true,
    flanges: [true, true],
    gapsAt: [{ at: CV, half: 5.6 }],
    flow: { tags: "flow-steam" },
    bend: 3,
  });
  floorSleeve(f, "steam.sleeve", [steamEnd[0], steamEnd[1]], 2.4, { tags: "steam", share: 1 });
  tl.reveal("steam", 0.29, 0.54);
  tl.opacity("flow-steam", [
    [0.68, 0],
    [0.7, 1],
    [0.82, 1],
    [0.84, 0],
  ]);
  tl.flow("flow-steam", 12);

  // -------------------------------------------------------------------------
  // Batch recorder: pedestal, post, housing, and the trend on its screen
  // -------------------------------------------------------------------------
  const px = (PANEL.x0 + PANEL.x1) / 2;
  const py = (PANEL.y0 + PANEL.y1) / 2;
  box(
    "recorder.base",
    [px - 16, py - 12, 0],
    [px + 16, py + 12, 2.4],
    { tone: "lo" },
    { tags: "recorder", r: 2, steps: 4, bevel: 0.5 },
  );
  box(
    "recorder.post",
    [px - 3.5, py - 3.5, 2.4],
    [px + 3.5, py + 3.5, PANEL.z0],
    { tone: "mid" },
    { tags: "recorder", r: 0.6 },
  );
  box(
    "recorder.housing",
    [PANEL.x0, PANEL.y0, PANEL.z0],
    [PANEL.x1, PANEL.y1, PANEL.z1],
    { tone: "hi" },
    {
      tags: "recorder",
      r: 1.6,
      steps: 3,
      bevel: 0.6,
    },
  );
  const faceY = PANEL.y1;
  const FM = f.planeMatrix([PANEL.x0, faceY + 0.02, PANEL.z1], [1, 0, 0], [0, 0, -1]);
  const W = PANEL.x1 - PANEL.x0;
  const H = PANEL.z1 - PANEL.z0;
  const screen = { x: 7, y: 6, w: W - 14, h: H - 20 };
  const plot = { x: screen.x + 7, y: screen.y + 5, w: screen.w - 12, h: screen.h - 11 };
  const vOf = (v) => r2(plot.y + plot.h * (1 - v));
  const uOf = (u) => r2(plot.x + plot.w * u);
  const BANDS = [
    [0.2, 0.35],
    [0.65, 0.8],
    [0.35, 0.5],
  ];
  const trace = [
    [0, 0.26],
    [0.04, 0.28],
    [0.09, 0.25],
    [0.15, 0.27],
    [0.22, 0.26],
    [0.3, 0.27],
    [0.335, 0.3],
    [0.36, 0.5],
    [0.385, 0.66],
    [0.42, 0.72],
    [0.48, 0.735],
    [0.55, 0.72],
    [0.62, 0.73],
    [0.665, 0.71],
    [0.69, 0.55],
    [0.72, 0.45],
    [0.76, 0.43],
    [0.83, 0.425],
    [0.9, 0.43],
    [1, 0.425],
  ];
  const tracePath = trace.map(([u, v], i) => `${i ? "L" : "M"}${uOf(u)} ${vOf(v)}`).join("");
  const bands = BANDS.map(
    ([lo, hi], i) =>
      `<rect class="fx-band" data-g="band-${i}" x="${uOf(i / 3)}" y="${vOf(hi)}" width="${r2(plot.w / 3)}" height="${r2(vOf(lo) - vOf(hi))}"/>`,
  ).join("");
  const guides = [1, 2].map((i) => `M${uOf(i / 3)} ${plot.y}V${plot.y + plot.h}`).join("");
  const gridLines = [0.25, 0.5, 0.75]
    .map((v) => `M${plot.x} ${vOf(v)}H${plot.x + plot.w}`)
    .join("");
  defs(
    `<clipPath id="food-pen"><rect data-g="pen" x="${plot.x - 400}" y="${plot.y - 2}" width="400" height="${plot.h + 4}"/></clipPath>`,
  );
  const buttons = [0, 1, 2, 3]
    .map(
      (i) =>
        `<circle class="iso-line" data-tone="mid" style="fill:var(--anatomy-top)" cx="${r2(screen.x + 4 + i * 7)}" cy="${r2(H - 7)}" r="2"/>`,
    )
    .join("");
  const lamp = `<circle class="iso-line" data-tone="lit" style="fill:var(--color-accent-soft)" cx="${r2(W - 11)}" cy="${r2(H - 7)}" r="1.6"/>`;
  const display =
    `<g transform="${FM}">` +
    `<rect class="iso-line" data-tone="mid" style="fill:var(--anatomy-shade-1)" x="${screen.x - 2}" y="${screen.y - 2}" width="${screen.w + 4}" height="${screen.h + 4}" rx="2"/>` +
    `<rect class="fx-screen" x="${screen.x}" y="${screen.y}" width="${screen.w}" height="${screen.h}" rx="1"/>` +
    `<rect class="iso-line" data-tone="faint" x="${plot.x}" y="${plot.y}" width="${r2(plot.w)}" height="${r2(plot.h)}"/>` +
    `<g data-g="chart-grid"><path class="iso-line" data-tone="faint" d="${gridLines}"/></g>` +
    bands +
    `<g data-g="chart-guides"><path class="iso-line" data-tone="mid" data-dashed="" d="${guides}"/></g>` +
    `<g data-g="chart-axes"><path class="iso-line" data-tone="hi" d="M${plot.x} ${plot.y}V${plot.y + plot.h}H${plot.x + plot.w}"/></g>` +
    `<g clip-path="url(#food-pen)"><path class="fx-trace" d="${tracePath}"/></g>` +
    `<g data-g="pen"><path class="iso-line" data-tone="lit" d="M${plot.x} ${plot.y}V${plot.y + plot.h}"/></g>` +
    buttons +
    lamp +
    `</g>`;
  put(
    "recorder.screen",
    [px, faceY + 0.05, (PANEL.z0 + PANEL.z1) / 2],
    display,
    [
      record(
        A.box([PANEL.x0, faceY, PANEL.z0], [PANEL.x1, faceY + 0.05, PANEL.z1], {
          name: "recorder.screen",
        }),
      ),
    ],
    {
      tags: "recorder",
      bias: 0.2,
    },
  );
  // Cable gland on top, where the temperature signal comes in
  const gland = [PANEL.x0 + 12, py, PANEL.z1];
  disc(
    "recorder.gland",
    upF(gland[0], gland[1], gland[2]),
    0,
    2.4,
    1.8,
    { tone: "mid" },
    { tags: "recorder" },
  );
  tl.assemble("recorder", 0.12, 0.21);
  tl.opacity("chart-axes", [
    [0.21, 0],
    [0.3, 1],
  ]);
  tl.opacity("chart-grid", [
    [0.3, 0],
    [0.42, 1],
  ]);
  tl.opacity("chart-guides", [
    [0.38, 0],
    [0.54, 1],
  ]);
  BANDS.forEach((_, i) =>
    tl.opacity(`band-${i}`, [
      [0.5 + i * 0.146, 0],
      [0.59 + i * 0.146, 1],
    ]),
  );
  // The pen advances from 0.54 to 0.98: the clip uncovers the trace, the cursor rides with it
  tl.shift(
    "pen",
    [
      [0.54, [0, 0]],
      [0.98, [plot.w, 0]],
    ],
    "l",
  );

  // -------------------------------------------------------------------------
  // Instruments: speed on the drive, temperature and level on the shell
  // -------------------------------------------------------------------------
  const stBase = [C[0] + 10, C[1], gz + 5.5];
  const st = instrument(f, "st", stBase, {
    dir: [1, 0, 0],
    across: [0, 1, 0],
    neck: 4,
    tags: "st",
  });
  const ttPad = pad(
    f,
    "tt.boss",
    body,
    onAxis(62),
    radial(TT_T),
    2.4,
    RJ1 + 2.6,
    { tone: "mid" },
    { tags: "tt", ring: false },
  ).face;
  const tt = instrument(f, "tt", ttPad, {
    dir: radial(TT_T),
    across: [0, 0, 1],
    neck: 4,
    tags: "tt",
  });
  const ltPad = pad(
    f,
    "lt.boss",
    body,
    onAxis(ZT0 + 3),
    radial(TT_T),
    1.9,
    RO + 4.4,
    { tone: "mid" },
    { tags: "lt", ring: false },
  ).face;
  const lt = instrument(f, "lt", ltPad, {
    dir: radial(TT_T),
    across: [0, 0, 1],
    neck: 3,
    tags: "lt",
  });
  tl.pop("st", stBase, 0.29, 0.36);
  tl.pop("tt", ttPad, 0.36, 0.43);
  tl.pop("lt", ltPad, 0.42, 0.49);

  f.relation("rel-tt-rec", tt.top, G.add3(gland, [0, 0, 2.4]), { lift: 22, tags: "rel1" });
  f.relation("rel-st-tt", st.top, tt.top, { lift: 10, tags: "rel2", bow: -10 });
  f.relation("rel-tt-lt", tt.top, lt.top, { lift: 6, tags: "rel3", bow: -8 });
  tl.relation("rel1", 0.52, 0.71);
  tl.relation("rel2", 0.59, 0.78);
  tl.relation("rel3", 0.65, 0.85);

  tl.say(0, "tanque por lotes");
  tl.say(0.125, "se llena y se agita");
  tl.say(0.5, "fase 1: lo esperado");
  tl.say(0.65, "fase 2: calienta la camisa");
  tl.say(0.79, "fase 3");

  const built = f.build({
    label:
      "Maqueta de un tanque por lotes con camisa, abierto por un lado: el líquido sube y la turbina gira. Al lado, un registrador muestra la temperatura: el rango esperado cambia en cada fase del lote y la señal medida lo sigue.",
  });
  return { f, built };

  function defs(markup) {
    f.defs.push(markup);
  }
}

export function foodProjection() {
  const corners = [
    ...k.boxCorners(PLATE, -13, 0),
    [C[0], C[1], ZT1 + HEAD + 52],
    [PANEL.x1, PANEL.y1, PANEL.z1 + 10],
  ];
  return k.fitProjection(corners, FOOD.width, FOOD.height, {
    pad: 22,
    azimuth: FOOD.azimuth,
    elevation: FOOD.elevation,
  });
}
