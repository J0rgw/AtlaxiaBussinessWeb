import { A, G, createFigure, k, r2, shareAlong } from "./lib.mjs";
import {
  basePlate,
  checkValve,
  floorSleeve,
  gateValve,
  instrument,
  pad,
  support,
  teeBall,
} from "./parts.mjs";

/*
  Sector "Agua" (scene B, first panel): what sector-water.json draws as a
  P&ID, built as a bench model of a pumping station.

  A storage tank with a float-and-tape level gauge feeds an inline pump; the
  discharge passes a pressure tap and a check valve into a cross, and the
  network leaves it in five lines (two with a gate valve and a flowmeter)
  that go underground through floor sleeves. As the panel arrives the network
  is laid from the tank outward, water runs through it, the level falls, the
  level, pressure and flow transmitters appear and their relations draw on.

  Same storyboard as the Lottie (frames / 239, with its 30-frame lead):
    0.00  base and equipment          0.12  suction line
    0.19  discharge                   0.29  main and branches, then sub-branches
    0.42  branch valves               0.38 LT, 0.46 PT, 0.54 FT-1, 0.59 FT-2
    0.67  relations LT-PT, PT-FT-1, PT-FT-2 draw on
*/

export const WATER = { width: 600, height: 400, azimuth: 60, elevation: 30 };

const ZP = 14; // pipe centreline
const RP = 3.2; // main pipe
const RB = 2.6; // sub-branches
const TANK = { c: [-104, 0], r: 30, z: 4, h: 80 };
const PUMP = { c: [-26, 0] };
const J = [40, 0, ZP];
const END_X = 158;
const BACK_Y = -60;
const FRONT_Y = 56;
const BACK2_Y = -96;
const FRONT2_Y = 90;
const PLATE = { x: -152, y: -122, w: 330, d: 238, r: 9 };

export function buildWater(P) {
  const f = createFigure({ id: "sector-water", width: WATER.width, height: WATER.height, P });
  const { at, Ln, Dots, put, tl, box, disc, turned, cyl, prism } = f;
  const upF = (x, y, z = 0) => G.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);

  basePlate(f, PLATE, { strip: 0.36 });
  tl.show("base", 0, 0.05);

  // -------------------------------------------------------------------------
  // Tank: footing ring, shell with weld seams, conical roof, ladder, gauge
  // -------------------------------------------------------------------------
  const [tx, ty] = TANK.c;
  const R = TANK.r;
  const shellTop = TANK.z + TANK.h;
  cyl(
    "tank.footing",
    tx,
    ty,
    R + 3,
    0,
    TANK.z,
    { tone: "lo" },
    { tags: "tank", steps: 72, bevel: 0.6 },
  );
  const SF = upF(tx, ty, TANK.z);
  const seams = [0.25, 0.5, 0.75].map((u) => G.arcOf(SF, TANK.h * u, R, P)).join("");
  const shell = turned(
    "tank.shell",
    SF,
    [
      [0, R],
      [TANK.h, R],
    ],
    { tone: "hi" },
    {
      tags: "tank",
      inner: Ln(seams, { tone: "faint" }),
      steps: 72,
    },
  );
  const roofTop = shellTop + 9;
  const RF = upF(tx, ty, shellTop);
  turned(
    "tank.roof",
    RF,
    [
      [0, R + 0.8],
      [1.4, R + 0.8],
      [1.4, R],
      [9, 7],
      [9, 0],
    ],
    { tone: "mid" },
    { tags: "tank", steps: 72 },
  );
  // Roof nozzle for the radar
  disc("tank.nozzle", upF(tx, ty, roofTop), 0, 2.2, 4.2, { tone: "mid" }, { tags: "tank" });
  disc(
    "tank.nozzle.flange",
    upF(tx, ty, roofTop + 2.2),
    0,
    1,
    5,
    { tone: "hi" },
    {
      tags: "tank",
      extra: Dots(G.dotsOf(upF(tx, ty, roofTop + 2.2), 1, 4.2, 6, P, { all: true }), {
        size: 0.35,
        tone: "mid",
      }),
    },
  );
  // Handrail: posts on the roof ledge and a ring rail
  const railR = R + 0.4;
  const posts = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2 + 0.2);
  for (const t of posts) {
    const x = tx + Math.cos(t) * railR;
    const y = ty + Math.sin(t) * railR;
    cyl("tank.post", x, y, 0.4, shellTop + 1.4, 7, { tone: "mid" }, { tags: "tank", steps: 10 });
  }
  const ring = Array.from({ length: 48 }, (_, i) => {
    const t = (i / 48) * Math.PI * 2;
    return [tx + Math.cos(t) * railR, ty + Math.sin(t) * railR, shellTop + 1.4 + 7 + 0.45];
  });
  f.pipe("tank.rail", ring, 0.45, {
    flanges: [false, false],
    tone: "mid",
    tags: "tank",
    maxLength: 10,
    closed: true,
    touch: ["tank.post*"],
  });

  // Ladder on the side toward the viewer's left, standing off the shell
  const ladderT = (110 * Math.PI) / 180;
  const radial = [Math.cos(ladderT), Math.sin(ladderT), 0];
  const tangent = [-Math.sin(ladderT), Math.cos(ladderT), 0];
  const railAt = (side, rr) => [
    tx + radial[0] * rr + tangent[0] * side * 3.6,
    ty + radial[1] * rr + tangent[1] * side * 3.6,
  ];
  const LR = R + 5;
  for (const side of [-1, 1]) {
    const [x, y] = railAt(side, LR);
    cyl(
      "tank.ladder.rail",
      x,
      y,
      0.6,
      0,
      shellTop + 1.4 + 8,
      { tone: "mid" },
      { tags: "tank", steps: 10 },
    );
  }
  const rungs = [];
  for (let z = 6; z < shellTop + 8; z += 4.5) {
    const a = railAt(-1, LR);
    const b = railAt(1, LR);
    rungs.push(k.pathOf([at([a[0], a[1], z]), at([b[0], b[1], z])]));
  }
  put(
    "tank.ladder.rungs",
    [...railAt(0, LR), shellTop / 2],
    Ln(rungs.join(""), { tone: "mid" }),
    [
      A.box(
        [
          Math.min(...[-1, 1].map((s) => railAt(s, LR)[0])),
          Math.min(...[-1, 1].map((s) => railAt(s, LR)[1])),
          6,
        ],
        [
          Math.max(...[-1, 1].map((s) => railAt(s, LR)[0])),
          Math.max(...[-1, 1].map((s) => railAt(s, LR)[1])),
          shellTop + 6,
        ],
        { name: "tank.ladder.rungs" },
      ),
    ],
    { tags: "tank", bias: 0.05 },
  );
  // Stand-off brackets from the shell to the rails
  const LF = G.frameOf([tx, ty, 0], [0, 0, 1], radial, tangent);
  for (const z of [20, 48, 76]) {
    for (const side of [-1, 1]) {
      prism(
        "tank.ladder.bracket",
        LF,
        [
          [R - 0.2, side * 3.6 - 0.5],
          [LR - 0.6, side * 3.6 - 0.5],
          [LR - 0.6, side * 3.6 + 0.5],
          [R - 0.2, side * 3.6 + 0.5],
        ],
        z - 0.6,
        z + 0.6,
        { tone: "lo" },
        { tags: "tank" },
      );
    }
  }

  // Float-and-tape level gauge: a board on brackets, a tape, a target that rides the level
  const gaugeT = (38 * Math.PI) / 180;
  const gr = [Math.cos(gaugeT), Math.sin(gaugeT), 0];
  const gt = [-Math.sin(gaugeT), Math.cos(gaugeT), 0];
  const GF = G.frameOf([tx, ty, 0], [0, 0, 1], gr, gt);
  const B0 = R + 3.2;
  const B1 = R + 4.4;
  const gz0 = TANK.z + 6;
  const gz1 = shellTop - 4;
  for (const z of [gz0 + 4, (gz0 + gz1) / 2, gz1 - 4]) {
    prism(
      "gauge.bracket",
      GF,
      [
        [R - 0.2, -0.8],
        [B0, -0.8],
        [B0, 0.8],
        [R - 0.2, 0.8],
      ],
      z - 0.7,
      z + 0.7,
      { tone: "lo" },
      { tags: "tank" },
    );
  }
  const gp = (u, v, z) => G.add3([tx, ty, z], G.add3(G.mul3(gr, u), G.mul3(gt, v)));
  const ticks = [];
  const majors = [];
  for (let i = 0, z = gz0 + 3; z <= gz1 - 3; i += 1, z += 3.5) {
    const len = i % 5 === 0 ? 2.2 : 1.2;
    (i % 5 === 0 ? majors : ticks).push(k.pathOf([at(gp(B1, -2.8, z)), at(gp(B1, -2.8 + len, z))]));
  }
  prism(
    "gauge.board",
    GF,
    [
      [B0, -2.8],
      [B1, -2.8],
      [B1, 2.8],
      [B0, 2.8],
    ],
    gz0,
    gz1,
    { tone: "hi" },
    {
      tags: "tank",
      extra:
        Ln(ticks.join(""), { tone: "lo" }) +
        Ln(majors.join(""), { tone: "mid" }) +
        Ln(k.pathOf([at(gp(B1, 1.2, gz0)), at(gp(B1, 1.2, gz1))]), { tone: "mid" }),
    },
  );
  // Sheave housing on top of the board, where the tape comes out of the tank
  prism(
    "gauge.head",
    GF,
    [
      [R - 0.2, -2],
      [B1, -2],
      [B1, 2],
      [R - 0.2, 2],
    ],
    gz1,
    gz1 + 3,
    { tone: "mid" },
    { tags: "tank" },
  );
  // The target rides the tape: built at the top level, moved down by the timeline
  const LEVEL = (u) => gz0 + 3 + (gz1 - gz0 - 6) * u;
  const level0 = 0.88;
  const level1 = 0.52;
  const zt = LEVEL(level0);
  prism(
    "gauge.target",
    GF,
    [
      [B1, -0.2],
      [B1 + 1.6, -0.2],
      [B1 + 1.6, 2.6],
      [B1, 2.6],
    ],
    zt - 1.4,
    zt + 1.4,
    { tone: "hi", lit: false },
    {
      tags: ["tank", "level"],
      bias: 0.2,
      extra: Ln(k.pathOf([at(gp(B1 + 1.6, -0.2, zt)), at(gp(B1 + 1.6, 2.6, zt))]), { tone: "hi" }),
    },
  );
  tl.translate(
    "level",
    [
      [0.1, [0, 0, 0]],
      [1, [0, 0, LEVEL(level1) - zt]],
    ],
    "io",
  );

  // Outlet nozzle on a pad toward the pump
  const outlet = pad(
    f,
    "tank.outlet",
    shell,
    [tx, ty, ZP],
    [1, 0, 0],
    5.6,
    R + 4,
    { tone: "mid" },
    { tags: "tank" },
  );
  tl.assemble("tank", 0, 0.1);

  // -------------------------------------------------------------------------
  // Inline pump: pedestal, volute casing, inline necks, lantern, motor, fan
  // -------------------------------------------------------------------------
  const [px, py] = PUMP.c;
  box(
    "pump.pedestal",
    [px - 9, py - 9, 0],
    [px + 9, py + 9, 4],
    { tone: "lo" },
    { tags: "pump", r: 1.2, steps: 3, bevel: 0.4 },
  );
  const CF = upF(px, py, 4);
  const casingR = (s) => 7.5 + 4.5 * Math.sqrt(Math.max(0, 1 - ((s - 10) / 10.2) ** 2));
  const casingSlope = (s) => {
    const t = Math.max(-0.99, Math.min(0.99, (s - 10) / 10.2));
    return (-4.5 * t) / (10.2 * Math.sqrt(1 - t * t));
  };
  const casingProfile = Array.from({ length: 21 }, (_, i) => {
    const s = 0.5 + i * 0.95;
    return [r2(s), r2(casingR(s)), 1];
  });
  casingProfile[0][2] = 0;
  casingProfile[casingProfile.length - 1][2] = 0;
  const casing = turned(
    "pump.casing",
    CF,
    [[0, 7.5], ...casingProfile, [20, 7.5]],
    { tone: "hi" },
    {
      tags: "pump",
      smooth: { slope: casingSlope, radius: casingR },
    },
  );
  // Inline necks on pads: suction from the tank side, discharge toward the network
  const suctionFace = pad(
    f,
    "pump.suction",
    casing,
    [px, py, ZP],
    [-1, 0, 0],
    5.4,
    14,
    { tone: "mid" },
    { tags: "pump" },
  );
  const dischargeFace = pad(
    f,
    "pump.discharge",
    casing,
    [px, py, ZP],
    [1, 0, 0],
    5.4,
    14,
    { tone: "mid" },
    { tags: "pump" },
  );
  // Cover, lantern with its windows, motor flange
  disc(
    "pump.cover",
    upF(px, py, 24),
    0,
    1.6,
    9,
    { tone: "mid" },
    {
      tags: "pump",
      extra: Dots(G.dotsOf(upF(px, py, 24), 1.6, 8, 8, P, { all: true }), {
        size: 0.4,
        tone: "mid",
      }),
    },
  );
  disc(
    "pump.lantern",
    upF(px, py, 25.6),
    0,
    6,
    5.6,
    { tone: "mid" },
    {
      tags: "pump",
      inner: Ln(G.arcOf(upF(px, py, 25.6), 3, 5.6, P), { tone: "faint" }),
    },
  );
  disc("pump.motorFlange", upF(px, py, 31.6), 0, 1.4, 9.4, { tone: "hi" }, { tags: "pump" });
  const MF = upF(px, py, 33);
  const motor = disc(
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
  // Terminal box on a pad toward the viewer
  const tb = pad(
    f,
    "pump.terminalPad",
    motor,
    [px, py, 46],
    [0, 1, 0],
    3,
    9.8,
    { tone: "mid" },
    {
      tags: "pump",
      ring: false,
    },
  );
  box(
    "pump.terminal",
    [px - 4, tb.face[1], 42],
    [px + 4, tb.face[1] + 5, 50],
    { tone: "mid" },
    {
      tags: "pump",
      r: 0.6,
      bevel: 0.3,
      extra: Dots([at([px - 2.6, tb.face[1] + 5, 48.6]), at([px + 2.6, tb.face[1] + 5, 48.6])], {
        size: 0.4,
      }),
    },
  );
  // Fan cover with the fan turning under its grille
  const FC = upF(px, py, 55);
  const fanTop = 61;
  const fanM = f.planeMatrix([px, py, fanTop], [1, 0, 0], [0, 1, 0]);
  const blades = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2;
    const pt = (rr, da) =>
      [rr * Math.cos(a + da), rr * Math.sin(a + da)].map((v) => r2(v)).join(" ");
    return `M${pt(2.2, 0)}Q${pt(5.4, 0.3)} ${pt(7.6, 0.16)}L${pt(7.6, 0.62)}Q${pt(5.2, 0.74)} ${pt(2.2, 0.66)}Z`;
  }).join("");
  const grille = [7.9, 5.6, 3.3]
    .map((rr) => `M${rr} 0A${rr} ${rr} 0 1 1 ${-rr} 0A${rr} ${rr} 0 1 1 ${rr} 0Z`)
    .join("");
  const fan =
    `<g transform="${fanM}"><circle class="fx-cavity" r="8.2"/><g data-g="fan"><path class="iso-line" data-tone="mid" style="fill:var(--anatomy-shade-1)" d="${blades}"/></g>` +
    `<circle class="iso-line" data-tone="lo" style="fill:var(--anatomy-top)" r="2"/><path class="iso-line" data-tone="lo" d="${grille}"/></g>`;
  disc("pump.fanCover", FC, 0, 6, 9.6, { tone: "hi" }, { tags: "pump", extra: fan, bevel: 0.4 });
  tl.spin('[data-g="fan"]', 0.9);
  tl.assemble("pump", 0.04, 0.12);

  // -------------------------------------------------------------------------
  // Lines: each laid from its start; its fittings appear as the pipe reaches them
  // -------------------------------------------------------------------------
  const PT_X = 3;
  const CV_X = 19;
  const cross = teeBall(f, "cross", J, 4.9, { tags: "discharge", share: 1 });
  const TB = [100, BACK_Y, ZP];
  const TF = [110, FRONT_Y, ZP];
  const sleeveTop = 2.6;
  const LINES = [
    {
      id: "suction",
      r: RP,
      control: [outlet.face, suctionFace.face],
      at: [0.12, 0.21],
      flanges: [true, true],
    },
    {
      id: "discharge",
      r: RP,
      control: [dischargeFace.face, cross.port([-1, 0, 0], RP)],
      at: [0.19, 0.31],
      flanges: [true, false],
    },
    {
      id: "main",
      r: RP,
      control: [cross.port([1, 0, 0], RP), [END_X, 0, ZP], [END_X, 0, sleeveTop]],
      at: [0.29, 0.54],
    },
    {
      id: "back",
      r: RP,
      control: [
        cross.port([0, -1, 0], RP),
        [J[0], BACK_Y, ZP],
        [END_X, BACK_Y, ZP],
        [END_X, BACK_Y, sleeveTop],
      ],
      at: [0.31, 0.59],
    },
    {
      id: "front",
      r: RP,
      control: [
        cross.port([0, 1, 0], RP),
        [J[0], FRONT_Y, ZP],
        [END_X, FRONT_Y, ZP],
        [END_X, FRONT_Y, sleeveTop],
      ],
      at: [0.33, 0.61],
    },
  ];
  const byId = Object.fromEntries(LINES.map((line) => [line.id, line]));
  const shareOn = (id, point) => shareAlong(byId[id].control, point);
  const gaps = Object.fromEntries(LINES.map((line) => [line.id, []]));

  // Pressure tap tee and check valve on the discharge
  const pt = teeBall(f, "pt.tee", [PT_X, 0, ZP], 4.4, {
    tags: "discharge",
    owner: "discharge",
    share: shareOn("discharge", [PT_X, 0, ZP]),
  });
  const cv = checkValve(f, "check", [CV_X, 0, ZP], [1, 0, 0], RP, {
    tags: "discharge",
    owner: "discharge",
    share: shareOn("discharge", [CV_X, 0, ZP]),
  });
  gaps.discharge.push(
    { at: [PT_X, 0, ZP], half: pt.half(RP) },
    { at: [CV_X, 0, ZP], half: cv.half },
  );

  // Tees for the sub-branches, gate valves and electromagnetic flowmeters on the branches
  const teeB = teeBall(f, "tee.back", TB, 4.4, {
    tags: "back",
    owner: "back",
    share: shareOn("back", TB),
  });
  const teeF = teeBall(f, "tee.front", TF, 4.4, {
    tags: "front",
    owner: "front",
    share: shareOn("front", TF),
  });
  const VB = [72, BACK_Y, ZP];
  const VF = [72, FRONT_Y, ZP];
  const vb = gateValve(f, "valve.back", VB, [1, 0, 0], RP, {
    tags: "back",
    owner: "back",
    share: shareOn("back", VB),
  });
  const vf = gateValve(f, "valve.front", VF, [1, 0, 0], RP, {
    tags: "front",
    owner: "front",
    share: shareOn("front", VF),
  });
  const meter = (name, c, tags, share) => {
    const F = G.frameAlong(c, [1, 0, 0]);
    const owner = tags;
    disc(`${name}.flangeA`, F, -6, -5, RP * 1.7, { tone: "hi" }, { tags, share, owner });
    disc(
      `${name}.spool`,
      F,
      -5,
      5,
      RP * 1.5,
      { tone: "hi" },
      {
        tags,
        share,
        owner,
        inner: Ln(G.arcOf(F, -2.5, RP * 1.5, P) + G.arcOf(F, 2.5, RP * 1.5, P), { tone: "faint" }),
      },
    );
    disc(`${name}.flangeB`, F, 5, 6, RP * 1.7, { tone: "hi" }, { tags, share, owner });
    return { half: 6, base: [c[0], c[1], c[2] + Math.sqrt((RP * 1.5) ** 2 - 1.1 ** 2)] };
  };
  const FTB = [132, BACK_Y, ZP];
  const FTF = [134, FRONT_Y, ZP];
  const mb = meter("ft1.meter", FTB, "back", shareOn("back", FTB));
  const mf = meter("ft2.meter", FTF, "front", shareOn("front", FTF));
  gaps.back.push(
    { at: VB, half: vb.half },
    { at: TB, half: teeB.half(RP) },
    { at: FTB, half: mb.half },
  );
  gaps.front.push(
    { at: VF, half: vf.half },
    { at: TF, half: teeF.half(RP) },
    { at: FTF, half: mf.half },
  );

  LINES.push(
    {
      id: "back2",
      r: RB,
      control: [
        teeB.port([0, -1, 0], RB),
        [TB[0], BACK2_Y, ZP],
        [END_X, BACK2_Y, ZP],
        [END_X, BACK2_Y, sleeveTop],
      ],
      at: [0.5, 0.69],
    },
    {
      id: "front2",
      r: RB,
      control: [
        teeF.port([0, 1, 0], RB),
        [TF[0], FRONT2_Y, ZP],
        [END_X, FRONT2_Y, ZP],
        [END_X, FRONT2_Y, sleeveTop],
      ],
      at: [0.52, 0.71],
    },
  );
  byId.back2 = LINES.at(-2);
  byId.front2 = LINES.at(-1);
  gaps.back2 = [];
  gaps.front2 = [];

  // Stanchions under the runs
  for (const [name, x, y, rr, id] of [
    ["sup.suction", -53, 0, RP, "suction"],
    ["sup.discharge", 28, 0, RP, "discharge"],
    ["sup.main", 104, 0, RP, "main"],
    ["sup.back", 116, BACK_Y, RP, "back"],
    ["sup.front", 92, FRONT_Y, RP, "front"],
    ["sup.back2", 132, BACK2_Y, RB, "back2"],
    ["sup.front2", 136, FRONT2_Y, RB, "front2"],
  ]) {
    support(f, name, [x, y], ZP, rr, "x", { tags: id, share: shareOn(id, [x, y, ZP]) });
  }

  for (const line of LINES) {
    const end = line.control.at(-1);
    const sleeve = !line.flanges;
    if (sleeve)
      floorSleeve(f, `sleeve.${line.id}`, [end[0], end[1]], line.r, { tags: line.id, share: 1 });
    f.pipe(line.id, line.control, line.r, {
      tags: line.id,
      reveal: true,
      flanges: line.flanges ?? [false, true],
      caps: line.flanges ? line.flanges.map((on) => on) : [false, true],
      gapsAt: gaps[line.id],
      touch: ["sup.*"],
      bend: 3,
      flow: { tags: `flow-${line.id}` },
    });
    tl.reveal(line.id, line.at[0], line.at[1]);
  }

  // Flow: each line's dashes fade in once it is laid, then keep running
  const flows = [
    ["suction", 0.2],
    ["discharge", 0.3],
    ["main", 0.5],
    ["back", 0.55],
    ["front", 0.57],
    ["back2", 0.66],
    ["front2", 0.68],
  ];
  for (const [id, from] of flows) {
    tl.opacity(`flow-${id}`, [
      [from, 0],
      [from + 0.05, 1],
    ]);
    tl.flow(`flow-${id}`, 9);
  }

  // -------------------------------------------------------------------------
  // Instruments: level (radar on the roof), pressure, two flowmeters
  // -------------------------------------------------------------------------
  const lt = instrument(f, "lt", [tx, ty, roofTop + 3.2], { neck: 3, tags: "lt" });
  const ptBase = [PT_X, 0, ZP + Math.sqrt(4.4 * 4.4 - 1.1 * 1.1)];
  const ptHead = instrument(f, "pt", ptBase, { neck: 9, tags: "pt" });
  const ft1 = instrument(f, "ft1", mb.base, { neck: 4, tags: "ft1" });
  const ft2 = instrument(f, "ft2", mf.base, { neck: 4, tags: "ft2" });
  tl.pop("lt", [tx, ty, roofTop + 3.2], 0.38, 0.45);
  tl.pop("pt", ptBase, 0.46, 0.53);
  tl.pop("ft1", mb.base, 0.54, 0.61);
  tl.pop("ft2", mf.base, 0.59, 0.66);

  // Relations between their signals
  f.relation("rel-lt-pt", lt.top, ptHead.top, { lift: 26, tags: "rel1", bow: 0 });
  f.relation("rel-pt-ft1", ptHead.top, ft1.top, { lift: 34, tags: "rel2", bow: -6 });
  f.relation("rel-pt-ft2", ptHead.top, ft2.top, { lift: 18, tags: "rel3", bow: 6 });
  tl.relation("rel1", 0.67, 0.86);
  tl.relation("rel2", 0.73, 0.92);
  tl.relation("rel3", 0.77, 0.96);

  tl.say(0, "depósito y bomba");
  tl.say(0.12, "la red se tiende desde el depósito");
  tl.say(0.38, "nivel, presión y caudal: 4 señales");
  tl.say(0.67, "señales relacionadas");

  const built = f.build({
    label:
      "Maqueta de una estación de bombeo: un depósito con su indicador de nivel alimenta una bomba en línea; la red sale por cinco tuberías con válvulas y caudalímetros. Los transmisores de nivel, presión y caudal se relacionan entre sí.",
  });
  return { f, built };
}

export function waterProjection() {
  const corners = [
    ...k.boxCorners(PLATE, -13, 0),
    [TANK.c[0], TANK.c[1], TANK.z + TANK.h + 30],
    [TANK.c[0] - TANK.r, TANK.c[1], TANK.z + TANK.h + 12],
  ];
  return k.fitProjection(corners, WATER.width, WATER.height, {
    pad: 22,
    azimuth: WATER.azimuth,
    elevation: WATER.elevation,
  });
}
