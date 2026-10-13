import { A, G, createFigure, k, r2 } from "./lib.mjs";
import { basePlate, instrument } from "./parts.mjs";

/*
  Sector "Metalurgia" (scene B, third panel): what sector-metal.json draws,
  built as a bench model of a reheating furnace and a two-stand roughing mill.

  A slab leaves the furnace door, runs out on a roller table and is rolled
  thinner in each stand. The slab is three boxes: the part not yet rolled,
  the part rolled once and the part rolled twice. Their ends move with the
  material: width stays, so a reduction from h to h' makes the metal leave
  the bite h / h' times faster and that part longer by the same factor. The
  table rollers and the work rolls turn with the surface speed of the metal
  at their place. Temperature (furnace roof), vibration (stand 1) and power
  (stand 2) are read and related.

  Storyboard (frames / 239 of the Lottie, with its 30-frame lead):
    0.00  furnace, table, stands       0.17-0.84  the slab travels (ease in-out)
    0.25 TT, 0.33 VT, 0.42 JT          0.59 TT-VT, 0.67 VT-JT relations draw on
*/

export const METAL = { width: 600, height: 400, azimuth: 60, elevation: 30 };

const PASS = 22; // pass line: top of the table rollers, underside of the slab
const H = [12, 9, 7]; // thickness before, after stand 1, after stand 2 (about 25 % a pass)
const L0 = 52; // slab length before rolling
const W2 = 20; // slab half-width
const DOOR_X = -84;
const XS = [-26, 36]; // roll centres of the two stands
const ROLL_R = 8;
const RUN_END = 168;
const FURNACE = { x0: -168, x1: DOOR_X, y0: -36, y1: 34, z1: 66 };
const PLATE = { x: -182, y: -60, w: 362, d: 116, r: 9 };
const TRAVEL = [0.167, 0.837];

/** Position of the material point that sits `x0` along the unrolled bar: stretched past each bite. */
function placed(x0) {
  let x = x0;
  if (x > XS[0]) x = XS[0] + (x - XS[0]) * (H[0] / H[1]);
  if (x > XS[1]) x = XS[1] + (x - XS[1]) * (H[1] / H[2]);
  return x;
}

/** Inverse of `placed`: where a point now at x was on the unrolled bar. */
function unplaced(x) {
  let x0 = x;
  if (x0 > XS[1]) x0 = XS[1] + (x0 - XS[1]) * (H[2] / H[1]);
  if (x0 > XS[0]) x0 = XS[0] + (x0 - XS[0]) * (H[1] / H[0]);
  return x0;
}

// The tail starts L0 behind the door and stops on the run-out table, 14 past stand 2
const T_END = unplaced(XS[1] + 14) - (DOOR_X - L0);

/** The slab's three pieces at advance T: [x0, x1] spans along x, clipped at the furnace door. */
function piecesAt(T) {
  const tail = placed(DOOR_X - L0 + T);
  const head = placed(DOOR_X + T);
  const clip = (a, b) => [Math.max(a, DOOR_X), Math.max(Math.max(a, DOOR_X), b)];
  return [
    clip(tail, Math.min(head, XS[0])),
    clip(Math.max(tail, XS[0]), Math.min(head, XS[1])),
    clip(Math.max(tail, XS[1]), head),
  ];
}

const ease = (u) => (u < 0.5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2);

export function buildMetal(P) {
  const f = createFigure({ id: "sector-metal", width: METAL.width, height: METAL.height, P });
  const { at, Ln, Dots, put, tl, box, disc, record } = f;
  const upF = (x, y, z = 0) => G.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const alongY = (x, y, z) => G.frameOf([x, y, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);

  basePlate(f, PLATE, { strip: 0.3 });
  tl.show("base", 0, 0.05);

  // Progress -> advance of the slab, sampled densely so morphs and turns follow the ease
  const SAMPLES = 32;
  const keys = Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const u = i / SAMPLES;
    return { p: r2(TRAVEL[0] + (TRAVEL[1] - TRAVEL[0]) * u), T: T_END * ease(u) };
  });

  // -------------------------------------------------------------------------
  // Furnace: casing on a plinth, buckstays, roof beams, burners, door, stack
  // -------------------------------------------------------------------------
  const F = FURNACE;
  box(
    "furnace.plinth",
    [F.x0 - 3, F.y0 - 3, 0],
    [F.x1 + 1, F.y1 + 3, 3],
    { tone: "lo" },
    { tags: "furnace", r: 1, steps: 3 },
  );
  box(
    "furnace.casing",
    [F.x0, F.y0, 3],
    [F.x1, F.y1, F.z1],
    { tone: "hi" },
    {
      tags: "furnace",
      r: 1.2,
      steps: 3,
      inner: Ln(
        k.sideSeam({ x: F.x0, y: F.y0, w: F.x1 - F.x0, d: F.y1 - F.y0, r: 1.2 }, 14, P, 3),
        { tone: "faint" },
      ),
    },
  );
  // Buckstays: I-beams up the front wall and the exit end
  for (let x = F.x0 + 10; x < F.x1 - 4; x += 15) {
    box(
      "furnace.buckstay",
      [x - 2, F.y1, 3],
      [x + 2, F.y1 + 2.6, F.z1 + 2],
      { tone: "mid" },
      { tags: "furnace", r: 0.3 },
    );
  }
  for (const y of [F.y0 + 3, F.y1 - 3]) {
    box(
      "furnace.buckstay",
      [F.x1, y - 2, 3],
      [F.x1 + 2.6, y + 2, F.z1 + 2],
      { tone: "mid" },
      { tags: "furnace", r: 0.3 },
    );
  }
  // Roof beams across the top
  for (let x = F.x0 + 6; x < F.x1 - 4; x += 13) {
    box(
      "furnace.roofBeam",
      [x - 1.6, F.y0 - 1, F.z1],
      [x + 1.6, F.y1, F.z1 + 2],
      { tone: "mid" },
      { tags: "furnace", r: 0.3 },
    );
  }
  // Burners on the front wall, fed by a gas header
  const burnerZ = 30;
  const header = [];
  for (let x = F.x0 + 17.5; x < F.x1 - 8; x += 15) {
    const BF = alongY(x, F.y1, burnerZ);
    disc("furnace.burnerPlate", BF, 0, 1.2, 4.4, { tone: "mid" }, { tags: "furnace" });
    disc(
      "furnace.burner",
      BF,
      1.2,
      7,
      2.4,
      { tone: "hi" },
      { tags: "furnace", inner: Ln(G.arcOf(BF, 4, 2.4, P), { tone: "faint" }) },
    );
    header.push(x);
  }
  // Exit door: the opening, its frame and the raised door plate
  const opening = { y0: -W2 - 5, y1: W2 + 5, z0: PASS - 3, z1: PASS + H[0] + 6 };
  const mouth = k.pathOf(
    [
      [DOOR_X + 0.05, opening.y0, opening.z0],
      [DOOR_X + 0.05, opening.y1, opening.z0],
      [DOOR_X + 0.05, opening.y1, opening.z1],
      [DOOR_X + 0.05, opening.y0, opening.z1],
    ].map(at),
    true,
  );
  put(
    "furnace.mouth",
    [DOOR_X + 0.05, 0, (opening.z0 + opening.z1) / 2],
    `<path class="fx-cavity" d="${mouth}"/>` + Ln(mouth, { tone: "hi" }),
    [
      record(
        A.box([DOOR_X, opening.y0, opening.z0], [DOOR_X + 0.05, opening.y1, opening.z1], {
          name: "furnace.mouth",
        }),
      ),
    ],
    { tags: "furnace", bias: 0.1 },
  );
  box(
    "furnace.doorGuide",
    [DOOR_X, opening.y0 - 4, opening.z0],
    [DOOR_X + 3, opening.y0 - 1.4, F.z1 + 12],
    { tone: "mid" },
    { tags: "furnace", r: 0.3 },
  );
  box(
    "furnace.doorGuide",
    [DOOR_X, opening.y1 + 1.4, opening.z0],
    [DOOR_X + 3, opening.y1 + 4, F.z1 + 12],
    { tone: "mid" },
    { tags: "furnace", r: 0.3 },
  );
  box(
    "furnace.door",
    [DOOR_X + 0.4, opening.y0 - 1.4, opening.z1 + 2],
    [DOOR_X + 3.4, opening.y1 + 1.4, opening.z1 + 24],
    { tone: "hi" },
    {
      tags: "furnace",
      r: 0.6,
      bevel: 0.3,
    },
  );
  box(
    "furnace.doorBeam",
    [DOOR_X - 1, opening.y0 - 4, F.z1 + 12],
    [DOOR_X + 4, opening.y1 + 4, F.z1 + 15],
    { tone: "mid" },
    { tags: "furnace", r: 0.3 },
  );
  // Stack with bands, standing on the roof at the back
  const SX = F.x0 + 24;
  const SY = F.y0 + 16;
  const stackF = upF(SX, SY, F.z1 + 2);
  disc("stack.base", stackF, 0, 3, 11, { tone: "mid" }, { tags: "furnace" });
  disc(
    "stack",
    upF(SX, SY, F.z1 + 5),
    0,
    46,
    7.5,
    { tone: "hi" },
    {
      tags: "furnace",
      inner: Ln([12, 26, 40].map((s) => G.arcOf(upF(SX, SY, F.z1 + 5), s, 7.5, P)).join(""), {
        tone: "faint",
      }),
    },
  );
  disc("stack.lip", upF(SX, SY, F.z1 + 51), 0, 2, 8.6, { tone: "mid" }, { tags: "furnace" });
  // Heat rising from the stack: wavy lines that fade out above it
  const stackTop = F.z1 + 53;
  const heat = [-3, 0, 3]
    .map((dx, i) => {
      const points = Array.from({ length: 24 }, (_, j) => {
        const z = stackTop + j * 2.2;
        return [SX + dx + Math.sin(j * 0.55 + i * 1.7) * 1.6, SY, z];
      });
      return `<path class="fx-flow fx-heat" data-g="heat" data-o="${r2(i * 3.1)}" d="${k.pathOf(points.map(at))}"/>`;
    })
    .join("");
  const h0 = at([SX, SY, stackTop]);
  const h1 = at([SX, SY, stackTop + 50]);
  f.defs.push(
    `<linearGradient id="metal-heat-fade" gradientUnits="userSpaceOnUse" x1="${r2(h0[0])}" y1="${r2(h0[1])}" x2="${r2(h1[0])}" y2="${r2(h1[1])}"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.15" stop-color="#fff" stop-opacity="0.9"/><stop offset="0.55" stop-color="#fff" stop-opacity="0.5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
    `<mask id="metal-heat" maskUnits="userSpaceOnUse" x="${r2(h0[0] - 30)}" y="${r2(h1[1] - 10)}" width="60" height="${r2(h0[1] - h1[1] + 20)}"><rect x="${r2(h0[0] - 30)}" y="${r2(h1[1] - 10)}" width="60" height="${r2(h0[1] - h1[1] + 20)}" fill="url(#metal-heat-fade)"/></mask>`,
  );
  f.front.push(`<g mask="url(#metal-heat)">${heat}</g>`);
  tl.opacity("heat", [
    [0.12, 0],
    [0.2, 1],
  ]);
  tl.flow("heat", -6);
  tl.assemble("furnace", 0, 0.11);

  // -------------------------------------------------------------------------
  // Roller table: side beams, rollers on bearing blocks, hubs that turn
  // -------------------------------------------------------------------------
  const segments = [
    [DOOR_X + 4, XS[0] - 19],
    [XS[0] + 19, XS[1] - 19],
    [XS[1] + 19, RUN_END],
  ];
  const ROLLER_R = 3;
  const rollerZ = PASS - ROLLER_R;
  const rollers = [];
  segments.forEach(([x0, x1], si) => {
    for (const y of [-22, 18])
      box(
        "table.beam",
        [x0, y, 0],
        [x1, y + 4, rollerZ - 3],
        { tone: "mid" },
        { tags: "table", r: 0.4 },
      );
    const count = Math.max(1, Math.floor((x1 - x0 - 6) / 11));
    const step = (x1 - x0) / count;
    for (let i = 0; i < count; i += 1) {
      const x = x0 + step * (i + 0.5);
      rollers.push({ x, segment: si });
    }
  });
  const hubs = [];
  rollers.forEach(({ x, segment }, i) => {
    for (const y of [-22, 18])
      box(
        "table.block",
        [x - 2.4, y, rollerZ - 3],
        [x + 2.4, y + 4, rollerZ + 3],
        { tone: "lo" },
        { tags: "table", r: 0.4 },
      );
    const RF = alongY(x, -18, rollerZ);
    disc("table.roller", RF, 0, 36, ROLLER_R, { tone: "hi" }, { tags: "table", steps: 28 });
    const hubF = alongY(x, 22, rollerZ);
    const hubM = f.planeMatrix([x, 23.2, rollerZ], [1, 0, 0], [0, 0, -1]);
    disc(
      "table.hub",
      hubF,
      0,
      1.2,
      1.8,
      { tone: "mid" },
      {
        tags: "table",
        steps: 20,
        extra: `<g transform="${hubM}"><g data-g="hub-${segment}" data-hub="${i}"><path class="iso-line" data-tone="hi" d="M0 0V-1.5"/></g></g>`,
      },
    );
    hubs.push({ x, segment });
  });
  tl.assemble("table", 0.05, 0.13);

  // -------------------------------------------------------------------------
  // Two 2-high stands: housings (front and back), chocks, rolls, screw-down
  // -------------------------------------------------------------------------
  XS.forEach((xs, si) => {
    const exit = H[si + 1];
    const topZ = PASS + exit + ROLL_R;
    const botZ = PASS - ROLL_R;
    const tags = `stand-${si}`;
    for (const [y0, y1] of [
      [-31, -25],
      [25, 31],
    ]) {
      box("stand.post", [xs - 17, y0, 0], [xs - 9, y1, 74], { tone: "mid" }, { tags, r: 0.6 });
      box("stand.post", [xs + 9, y0, 0], [xs + 17, y1, 74], { tone: "mid" }, { tags, r: 0.6 });
      box("stand.crosshead", [xs - 9, y0, 66], [xs + 9, y1, 74], { tone: "mid" }, { tags, r: 0.4 });
      box("stand.sole", [xs - 9, y0, 0], [xs + 9, y1, 4], { tone: "lo" }, { tags, r: 0.4 });
      // Chocks: bottom roll's from the sole, top roll's hung from the crosshead
      box("stand.chock", [xs - 9, y0, 4], [xs + 9, y1, botZ + 5], { tone: "lo" }, { tags, r: 0.4 });
      box(
        "stand.chock",
        [xs - 9, y0, topZ - 5],
        [xs + 9, y1, topZ + 7],
        { tone: "lo" },
        { tags, r: 0.4 },
      );
      box(
        "stand.screw",
        [xs - 2, y0 + 1.5, topZ + 7],
        [xs + 2, y1 - 1.5, 66],
        { tone: "mid" },
        { tags, r: 0.4 },
      );
    }
    // Work rolls between the housings, with bearing caps on the front chocks that turn
    const rolls = [];
    for (const [z, dir] of [
      [botZ, 1],
      [topZ, -1],
    ]) {
      disc(
        "stand.roll",
        alongY(xs, -25, z),
        0,
        50,
        ROLL_R,
        { tone: "hi" },
        {
          tags,
          steps: 56,
          inner: Ln(
            G.arcOf(alongY(xs, -25, z), 2, ROLL_R, P) + G.arcOf(alongY(xs, -25, z), 48, ROLL_R, P),
            { tone: "faint" },
          ),
        },
      );
      const capM = f.planeMatrix([xs, 32.4, z], [1, 0, 0], [0, 0, -1]);
      disc(
        "stand.cap",
        alongY(xs, 31, z),
        0,
        1.4,
        4.6,
        { tone: "mid" },
        {
          tags,
          extra:
            Dots(G.dotsOf(alongY(xs, 31, z), 1.4, 3.6, 6, P, { all: true }), {
              size: 0.35,
              tone: "mid",
            }) +
            `<g transform="${capM}"><g data-g="roll-${si}-${dir > 0 ? "bottom" : "top"}"><path class="iso-line" data-tone="hi" d="M0 0V-3.2M0 0L2.77 1.6M0 0L-2.77 1.6"/></g></g>`,
        },
      );
      rolls.push(z);
    }
    // Screw-down drive: a beam across both crossheads, its gear case and motor
    box("stand.topBeam", [xs - 9, -31, 74], [xs + 9, 31, 77], { tone: "mid" }, { tags, r: 0.4 });
    box(
      "stand.gearcase",
      [xs - 9, -16, 77],
      [xs + 9, 16, 85],
      { tone: "hi" },
      {
        tags,
        r: 1,
        bevel: 0.4,
        inner: Ln(k.sideSeam({ x: xs - 9, y: -16, w: 18, d: 32, r: 1 }, 81, P, 2), {
          tone: "faint",
        }),
      },
    );
    box("stand.motorFoot", [xs - 6, -4, 85], [xs + 6, 4, 85.2], { tone: "lo" }, { tags });
    const MF = G.frameOf([xs - 7, 0, 91.2], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    disc(
      "stand.motor",
      MF,
      0,
      14,
      6,
      { tone: "hi" },
      {
        tags,
        extra: k.fadedSvg(G.ribsOf(MF, 0, 14, 6, 22, P, { fade: [0.1, 0.55], seams: true }), {
          tone: "lo",
        }),
      },
    );
  });
  tl.assemble("stand-0", 0.07, 0.16);
  tl.assemble("stand-1", 0.09, 0.18);

  // -------------------------------------------------------------------------
  // The slab: three pieces whose ends follow the material (morphed through the samples)
  // -------------------------------------------------------------------------
  const piecePaths = (x0, x1, h) => {
    const y0 = -W2;
    const y1 = W2;
    const z0 = PASS;
    const z1 = PASS + h;
    const p = (x, y, z) => at([x, y, z]);
    const top = [p(x0, y0, z1), p(x1, y0, z1), p(x1, y1, z1), p(x0, y1, z1)];
    const front = [p(x0, y1, z1), p(x1, y1, z1), p(x1, y1, z0), p(x0, y1, z0)];
    const end = [p(x1, y0, z1), p(x1, y1, z1), p(x1, y1, z0), p(x1, y0, z0)];
    const outline = [
      p(x0, y0, z1),
      p(x1, y0, z1),
      p(x1, y0, z0),
      p(x1, y1, z0),
      p(x0, y1, z0),
      p(x0, y1, z1),
    ];
    const crease = [p(x0, y1, z1), p(x1, y1, z1), p(x1, y0, z1)];
    const edge = [p(x1, y1, z1), p(x1, y1, z0)];
    return [
      k.pathOf(outline, true),
      k.pathOf(top, true),
      k.pathOf(front, true),
      k.pathOf(end, true),
      k.pathOf(crease) + k.pathOf(edge),
      k.pathOf(outline, true),
    ];
  };
  const frontTone = Math.min(3, G.toneOf([0, 1, 0], P));
  const endTone = Math.min(3, G.toneOf([1, 0, 0], P));
  const shapesOf = (index) =>
    keys.map(({ T }) => {
      const [x0, x1] = piecesAt(T)[index];
      return piecePaths(x0, x1, H[index]);
    });
  const slabGroups = [0, 1, 2].map((index) => {
    const frames = shapesOf(index);
    const first = frames[0];
    const markup =
      `<g data-g="slab-${index}">` +
      `<path class="iso-fill" d="${first[0]}"/><path class="iso-top" d="${first[1]}"/>` +
      `<path class="iso-shade" data-shade="${frontTone}" d="${first[2]}"/><path class="iso-shade" data-shade="${endTone}" d="${first[3]}"/>` +
      `<path class="iso-line" data-tone="faint" d="${first[4]}"/><path class="iso-line" data-tone="hi" d="${first[5]}"/></g>`;
    f.tl.morph(
      `slab-${index}`,
      frames,
      keys.map(({ p }, i) => [p, i]),
      "l",
    );
    return markup;
  });
  // Each piece shows only while it has length; the slab appears as it leaves the door
  [0, 1, 2].forEach((index) => {
    const lengths = keys.map(({ T }) => {
      const [x0, x1] = piecesAt(T)[index];
      return x1 - x0;
    });
    const on = keys.find((_, i) => lengths[i] > 0.05);
    const last = [...keys].reverse().find((_, i) => lengths[lengths.length - 1 - i] > 0.05);
    if (!on || !last) return;
    const offAt = keys.find((key) => key.p > last.p);
    const track = [
      [on.p - 0.001, 0],
      [on.p, 1],
    ];
    if (offAt) track.push([offAt.p - 0.001, 1], [offAt.p, 0]);
    f.tl.opacity(`slab-${index}`, track, "l");
  });
  const slabShape = record(
    A.box([DOOR_X, -W2, PASS], [RUN_END, W2, PASS + H[2] - 0.5], { name: "slab" }),
  );
  put(
    "slab",
    [(DOOR_X + RUN_END) / 2, 0, PASS + 4],
    `<g data-g="slab">${slabGroups.join("")}</g>`,
    [slabShape],
    { bias: 0 },
  );

  // Turning: table hubs and work rolls follow the surface speed of the metal where they are
  const speedAt = (x) => (x < XS[0] ? 1 : x < XS[1] ? H[0] / H[1] : H[0] / H[2]);
  const turns = (x, radius, sign) =>
    keys.map(({ p, T }) => [p, r2(((sign * (T * speedAt(x))) / radius) * (180 / Math.PI))]);
  hubs.forEach(({ x }, i) => tl.rotate(`[data-hub="${i}"]`, turns(x, ROLLER_R, 1)));
  XS.forEach((xs, si) => {
    // A work roll's surface moves at the speed the metal leaves its bite
    const exitSpeed = speedAt(xs + 1);
    tl.rotate(
      `[data-g="roll-${si}-bottom"]`,
      keys.map(({ p, T }) => [p, r2(((T * exitSpeed) / ROLL_R) * (180 / Math.PI))]),
    );
    tl.rotate(
      `[data-g="roll-${si}-top"]`,
      keys.map(({ p, T }) => [p, r2(((-T * exitSpeed) / ROLL_R) * (180 / Math.PI))]),
    );
  });

  // -------------------------------------------------------------------------
  // Instruments: furnace temperature, stand 1 vibration, stand 2 power
  // -------------------------------------------------------------------------
  const ttBase = [F.x1 - 22, 6, F.z1];
  const tt = instrument(f, "tt", ttBase, { neck: 6, tags: "tt" });
  const vtBase = [XS[0] + 3, 12, 85];
  const vt = instrument(f, "vt", vtBase, { neck: 4, tags: "vt" });
  const jtBase = [XS[1] + 3, 12, 85];
  const jt = instrument(f, "jt", jtBase, { neck: 4, tags: "jt" });
  tl.pop("tt", ttBase, 0.25, 0.32);
  tl.pop("vt", vtBase, 0.335, 0.4);
  tl.pop("jt", jtBase, 0.42, 0.49);
  f.relation("rel-tt-vt", tt.top, vt.top, { lift: 26, tags: "rel1" });
  f.relation("rel-vt-jt", vt.top, jt.top, { lift: 18, tags: "rel2" });
  tl.relation("rel1", 0.59, 0.77);
  tl.relation("rel2", 0.67, 0.86);

  tl.say(0, "horno y tren de laminación");
  tl.say(0.17, "la pieza sale del horno");
  tl.say(0.45, "caja 1: 12 → 9");
  tl.say(0.6, "caja 2: 9 → 7");
  tl.say(0.84, "temperatura, vibración y energía relacionadas");

  const built = f.build({
    label:
      "Maqueta de un horno de recalentar y dos cajas de laminación: la pieza sale del horno por la puerta, avanza sobre los rodillos y se adelgaza al pasar por cada caja. Temperatura, vibración y energía se relacionan.",
  });
  return { f, built };
}

export function metalProjection() {
  const corners = [
    ...k.boxCorners(PLATE, -13, 0),
    [FURNACE.x0 + 24, FURNACE.y0 + 16, FURNACE.z1 + 90],
    [XS[1], 0, 110],
  ];
  return k.fitProjection(corners, METAL.width, METAL.height, {
    pad: 18,
    azimuth: METAL.azimuth,
    elevation: METAL.elevation,
  });
}
