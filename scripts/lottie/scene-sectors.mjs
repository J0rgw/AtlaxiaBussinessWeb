import {
  anim,
  arc,
  bezier,
  color,
  createDocument,
  drawOn,
  ease,
  ellipse,
  fade,
  fill,
  fixed,
  group,
  poly,
  rect,
  smooth,
  stroke,
} from "./lib.mjs";

/*
  Scene B, "Dónde empezamos": one short drawing per focus sector, scrubbed
  while its panel slides into view. Same blueprint language as scene A:
  ink equipment, cobalt sensors and relations, dashed for what is moving.

    water  The network draws on from the tank, flow runs through it, the tank
           level drops; sensors appear and relate.
    food   A stirred tank fills; next to it, the expected range changes with
           each phase of the batch and the measured signal follows it.
    metal  A slab leaves the furnace and gets thinner through two roll stands;
           temperature, vibration and power sensors relate.
*/

const SIZE = 1000;
/* Drawn on a 1000 x 1000 grid, framed 1000 x 800: each scene moves its content up to the top. */
const HEIGHT = 800;
const FRAMES = 240;
const LAST = FRAMES - 1;
/*
  The first frame is empty: nothing shows before the panel starts to play.
  The equipment draws in during the first LEAD frames; every other layer
  (pipes, flow, chart, sensors, relations) is delayed by LEAD with its start time.
*/
const LEAD = 30;
const appear = (from, to) => ({
  o: anim([
    [from, 0],
    [to, 100],
  ]),
});

const ink = (w = 4) => stroke(color.ink, w);
const detail = (w = 2.5) => stroke(color.strong, w);
const dashed = (w = 2.5) => stroke(color.strong, w, { dash: { dash: 10, gap: 10 } });

/** A straight segment as a cubic, for paths that mix lines and curves. */
const line = (p0, p1) => [p0, p1, p1];

function sensor(nm, [x, y], to, appear) {
  return group(
    nm,
    [
      group("leader", [
        poly([
          [0, 0],
          [to[0] - x, to[1] - y],
        ]),
        detail(),
      ]),
      group("bubble", [ellipse(0, 0, 22), stroke(color.ink, 3.5), fill(color.raised)]),
      group("core", [ellipse(0, 0, 7), fill(color.accent)]),
    ],
    {
      p: [x, y],
      s: anim(
        [
          [appear, [0, 0]],
          [appear + 16, [100, 100]],
        ],
        ease.out,
      ),
    },
  );
}

function relation(nm, p0, q, p1, from) {
  return group(nm, [
    arc(p0, q, p1),
    drawOn(from, from + 45),
    stroke(color.accent, 3.5, { dash: { dash: 8, gap: 9 } }),
  ]);
}

/** Flow running along a path: cobalt dashes moving forward once it appears. */
function flow(nm, path, from) {
  return group(nm, [
    path,
    stroke(color.accent, 3, {
      opacity: fade(from, from + 15),
      dash: {
        dash: 10,
        gap: 18,
        offset: anim(
          [
            [from, 0],
            [LAST, -(LAST - from) * 2.4],
          ],
          ease.linear,
        ),
      },
    }),
  ]);
}

function spin(nm, items, center, turns, direction = 1, extra = {}) {
  return group(nm, items, {
    ...extra,
    p: center,
    r: anim(
      [
        [0, 0],
        [LAST, 360 * turns * direction],
      ],
      ease.linear,
    ),
  });
}

/**
 * A scene whose drawing (on the 1000 x 1000 grid) is moved up by `lift`, so
 * its top sits right under the sector name on the page.
 */
function newScene(name, lift) {
  const doc = createDocument({ name, width: SIZE, height: HEIGHT, frames: FRAMES });
  doc.addBackground();
  const framing = doc.addLayer({ nm: "framing", null: true, ks: { p: [0, -lift, 0] } });
  return {
    addLayer: (layer) => doc.addLayer({ ...layer, parent: framing }),
    toJSON: doc.toJSON,
  };
}

// ---------------------------------------------------------------------------
// Water: tank, pump and a distribution network
// ---------------------------------------------------------------------------

export function buildWaterScene() {
  const doc = newScene("ATLAXIA, agua", 178);

  const network = [
    // [points, draw from, draw to]
    [
      [
        [260, 600],
        [306, 600],
      ],
      0,
      20,
    ],
    [
      [
        [374, 600],
        [520, 600],
      ],
      15,
      45,
    ],
    [
      [
        [520, 600],
        [940, 600],
      ],
      40,
      100,
    ],
    [
      [
        [520, 600],
        [520, 380],
        [940, 380],
      ],
      45,
      110,
    ],
    [
      [
        [520, 600],
        [520, 800],
        [940, 800],
      ],
      50,
      115,
    ],
    [
      [
        [700, 380],
        [700, 250],
        [940, 250],
      ],
      90,
      135,
    ],
    [
      [
        [760, 800],
        [760, 900],
        [940, 900],
      ],
      95,
      140,
    ],
  ];
  const ends = [
    [940, 600, 100],
    [940, 380, 110],
    [940, 800, 115],
    [940, 250, 135],
    [940, 900, 140],
  ];

  doc.addLayer({
    nm: "network",
    st: LEAD,
    shapes: [
      ...network.map(([points, from, to], k) =>
        group(`pipe-${k}`, [poly(points), drawOn(from, to), ink(k < 3 ? 5 : 4)]),
      ),
      ...ends.map(([x, y, t], k) =>
        group(`end-${k}`, [rect(x - 2, y - 14, 28, 28, 4), ink(3.5), fill(color.raised)], {
          o: anim([
            [t - 5, 0],
            [t + 5, 100],
          ]),
        }),
      ),
      ...[
        [620, 380],
        [620, 800],
      ].map(([x, y], k) =>
        group(
          `valve-${k}`,
          [
            poly(
              [
                [-18, -14],
                [-18, 14],
                [0, 0],
              ],
              true,
            ),
            poly(
              [
                [18, -14],
                [18, 14],
                [0, 0],
              ],
              true,
            ),
            ink(3.5),
            fill(color.raised),
          ],
          {
            p: [x, y],
            o: anim([
              [70, 0],
              [85, 100],
            ]),
          },
        ),
      ),
    ],
  });

  doc.addLayer({
    nm: "flow",
    st: LEAD,
    shapes: network.map(([points, from], k) => flow(`flow-${k}`, poly(points), 40 + from * 0.6)),
  });

  // Tank whose level drops as water leaves it
  doc.addLayer({
    nm: "tank",
    shapes: [
      group(
        "liquid",
        [
          {
            ty: "rc",
            p: anim(
              [
                [0, [175, 530]],
                [LAST, [175, 570]],
              ],
              ease.inOut,
            ),
            s: anim(
              [
                [0, [170, 220]],
                [LAST, [170, 140]],
              ],
              ease.inOut,
            ),
            r: fixed(0),
          },
          fill(color.inset),
        ],
        appear(14, 30),
      ),
      group(
        "level",
        [
          poly([
            [90, 0],
            [260, 0],
          ]),
          poly(
            [
              [163, -22],
              [187, -22],
              [175, -8],
            ],
            true,
          ),
          detail(),
        ],
        {
          ...appear(18, 30),
          p: anim(
            [
              [0, [0, 420]],
              [LAST, [0, 500]],
            ],
            ease.inOut,
          ),
        },
      ),
      group("tank", [rect(90, 330, 170, 310, 8), drawOn(0, 26), ink(5)]),
      group("pump", [ellipse(340, 600, 34), ink(5), fill(color.raised)], appear(16, 30)),
      spin(
        "impeller",
        [
          poly([
            [0, 0],
            [0, -22],
          ]),
          poly([
            [0, 0],
            [19, 11],
          ]),
          poly([
            [0, 0],
            [-19, 11],
          ]),
          ink(3.5),
        ],
        [340, 600],
        3,
        1,
        appear(22, 32),
      ),
    ],
  });

  doc.addLayer({
    nm: "relations",
    st: LEAD,
    shapes: [
      relation("lt-pt", [175, 260], [300, 380], [430, 500], 130),
      relation("pt-ft-up", [430, 500], [560, 300], [820, 300], 145),
      relation("pt-ft-down", [430, 500], [560, 720], [820, 700], 155),
    ],
  });

  doc.addLayer({
    nm: "sensors",
    st: LEAD,
    shapes: [
      sensor("lt", [175, 260], [175, 330], 60),
      sensor("pt", [430, 500], [430, 600], 80),
      sensor("ft-up", [820, 300], [820, 380], 100),
      sensor("ft-down", [820, 700], [820, 800], 110),
    ],
  });

  return doc.toJSON();
}

// ---------------------------------------------------------------------------
// Food: stirred batch tank and its phases
// ---------------------------------------------------------------------------

export function buildFoodScene() {
  const doc = newScene("ATLAXIA, agroalimentación", 48);

  const tankPath = (inset = 0) =>
    bezier(
      [120 + inset, 240],
      [
        line([120 + inset, 240], [120 + inset, 600]),
        [
          [120 + inset, 655],
          [165, 700 - inset],
          [220, 700 - inset],
        ],
        line([220, 700 - inset], [300, 700 - inset]),
        [
          [355, 700 - inset],
          [400 - inset, 655],
          [400 - inset, 600],
        ],
        line([400 - inset, 600], [400 - inset, 240]),
      ],
      false,
    );

  // Expected range per phase and the measured signal following it
  const x0 = 540;
  const x1 = 940;
  const phase = (x1 - x0) / 3;
  const bands = [
    [560, 620],
    [380, 440],
    [500, 560],
  ];

  doc.addLayer({
    nm: "chart",
    st: LEAD,
    shapes: [
      group("axes", [
        poly([
          [x0, 300],
          [x0, 700],
          [x1, 700],
        ]),
        drawOn(20, 70),
        detail(),
      ]),
      group("phase guides", [
        poly([
          [x0 + phase, 300],
          [x0 + phase, 700],
        ]),
        poly([
          [x0 + phase * 2, 300],
          [x0 + phase * 2, 700],
        ]),
        drawOn(60, 100),
        dashed(),
      ]),
      ...bands.map(([top, bottom], k) =>
        group(
          `band-${k}`,
          [rect(x0 + phase * k, top, phase, bottom - top), fill(color.accentSoft, 100)],
          {
            o: anim([
              [90 + k * 35, 0],
              [110 + k * 35, 100],
            ]),
          },
        ),
      ),
      group("observed", [
        smooth([
          [x0, 596],
          [x0 + 40, 588],
          [x0 + 80, 594],
          [x0 + phase - 12, 590],
          [x0 + phase + 14, 420],
          [x0 + phase + 60, 408],
          [x0 + phase + 100, 414],
          [x0 + phase * 2 - 10, 410],
          [x0 + phase * 2 + 14, 528],
          [x0 + phase * 2 + 60, 534],
          [x0 + phase * 2 + 100, 526],
          [x1, 531],
        ]),
        drawOn(100, 205, ease.linear),
        ink(4),
      ]),
    ],
  });

  const liquidScale = anim(
    [
      [LEAD, [100, 0]],
      [LEAD + 110, [100, 68]],
    ],
    ease.out,
  );
  doc.addLayer({
    nm: "tank",
    shapes: [
      group("liquid", [tankPath(4), fill(color.inset)], {
        a: [260, 700],
        p: [260, 700],
        s: liquidScale,
      }),
      group("jacket", [
        bezier(
          [100, 420],
          [
            line([100, 420], [100, 600]),
            [
              [100, 670],
              [155, 720],
              [220, 720],
            ],
            line([220, 720], [300, 720]),
            [
              [365, 720],
              [420, 670],
              [420, 600],
            ],
            line([420, 600], [420, 420]),
          ],
        ),
        drawOn(LEAD + 40, LEAD + 100),
        dashed(),
      ]),
      group("tank", [tankPath(), drawOn(0, 28), ink(5)]),
      group("lid", [
        poly([
          [110, 240],
          [410, 240],
        ]),
        drawOn(4, 22),
        ink(5),
      ]),
      group("motor", [rect(215, 150, 90, 50, 6), ink(4), fill(color.raised)], appear(16, 28)),
      group("shaft", [
        poly([
          [260, 200],
          [260, 560],
        ]),
        drawOn(20, 32),
        ink(3.5),
      ]),
      group(
        "impeller",
        [
          poly([
            [-70, 0],
            [70, 0],
          ]),
          poly([
            [-70, -14],
            [-70, 14],
          ]),
          poly([
            [70, -14],
            [70, 14],
          ]),
          ink(4),
        ],
        {
          ...appear(26, 34),
          p: [260, 560],
          s: anim(
            Array.from({ length: 13 }, (_, k) => [k * 20, [k % 2 === 0 ? 100 : -100, 100]]),
            ease.inOut,
          ),
        },
      ),
    ],
  });

  doc.addLayer({
    nm: "relations",
    st: LEAD,
    shapes: [
      relation("st-tt", [470, 130], [540, 300], [470, 470], 110),
      relation("tt-lt", [470, 470], [520, 560], [470, 640], 125),
      relation("tt-chart", [470, 470], [505, 540], [x0, 596], 95),
    ],
  });

  doc.addLayer({
    nm: "sensors",
    st: LEAD,
    shapes: [
      sensor("st", [470, 130], [305, 175], 40),
      sensor("tt", [470, 470], [400, 470], 55),
      sensor("lt", [470, 640], [400, 640], 70),
    ],
  });

  return doc.toJSON();
}

// ---------------------------------------------------------------------------
// Metal: reheating furnace and a rolling mill
// ---------------------------------------------------------------------------

export function buildMetalScene() {
  const doc = newScene("ATLAXIA, metalurgia", 35);

  const stands = [560, 760];

  doc.addLayer({
    nm: "mill",
    shapes: [
      group("roll table", [
        poly([
          [380, 660],
          [970, 660],
        ]),
        drawOn(14, 32),
        detail(),
      ]),
      ...stands.map((x, k) =>
        group(`stand-${k}`, [
          rect(x - 62, 470, 124, 280, 8),
          drawOn(18 + k * 4, 40 + k * 4),
          dashed(),
        ]),
      ),
    ],
  });

  // The slab: leaves the furnace and gets thinner after each stand
  doc.addLayer({
    nm: "slab",
    shapes: [
      group("slab", [rect(-90, -20, 180, 40, 3), ink(4), fill(color.inset)], {
        ...appear(24, 34),
        p: anim(
          [
            [0, [240, 610]],
            [40, [240, 610]],
            [200, [860, 610]],
            [LAST, [860, 610]],
          ],
          ease.inOut,
        ),
        s: anim(
          [
            [0, [100, 100]],
            [105, [100, 100]],
            [125, [112, 70]],
            [135, [112, 70]],
            [150, [124, 45]],
            [LAST, [124, 45]],
          ],
          ease.inOut,
        ),
      }),
    ],
  });

  doc.addLayer({
    nm: "rolls",
    shapes: stands.flatMap((x) =>
      [
        [x, 548, 1],
        [x, 672, -1],
      ].map(([cx, cy, dir], k) =>
        group(
          `roll-${x}-${k}`,
          [
            group("roll", [ellipse(cx, cy, 40), ink(4), fill(color.raised)]),
            spin(
              "spokes",
              [
                poly([
                  [-28, 0],
                  [28, 0],
                ]),
                poly([
                  [0, -28],
                  [0, 28],
                ]),
                detail(3),
              ],
              [cx, cy],
              4,
              dir,
            ),
          ],
          appear(24 + k * 3, 36 + k * 3),
        ),
      ),
    ),
  });

  // Furnace in section: refractory wall, lining and stack with heat rising
  doc.addLayer({
    nm: "furnace",
    shapes: [
      group(
        "wall",
        [rect(80, 380, 300, 320, 10), rect(104, 404, 252, 272, 6), fill(color.inset, 100, 2)],
        appear(10, 26),
      ),
      group("shell", [rect(80, 380, 300, 320, 10), drawOn(0, 26), ink(5)]),
      group("lining", [rect(104, 404, 252, 272, 6), drawOn(8, 28), detail()]),
      group(
        "door",
        [
          poly([
            [380, 580],
            [380, 640],
          ]),
          stroke(color.bg, 8),
        ],
        appear(20, 26),
      ),
      group("stack", [
        poly([
          [150, 380],
          [150, 250],
          [200, 250],
          [200, 380],
        ]),
        drawOn(14, 30),
        ink(5),
      ]),
      ...[0, 1, 2].map((k) =>
        group(
          `heat-${k}`,
          [
            smooth([
              [160 + k * 15, 235],
              [150 + k * 15, 200],
              [170 + k * 15, 165],
              [155 + k * 15, 130],
              [172 + k * 15, 95],
            ]),
            stroke(color.strong, 3, {
              opacity: 70,
              dash: {
                dash: 14,
                gap: 16,
                offset: anim(
                  [
                    [0, k * 10],
                    [LAST, k * 10 + 300],
                  ],
                  ease.linear,
                ),
              },
            }),
          ],
          appear(28 + k * 3, 40 + k * 3),
        ),
      ),
    ],
  });

  doc.addLayer({
    nm: "relations",
    st: LEAD,
    shapes: [
      relation("tt-vt", [290, 300], [420, 300], [560, 400], 110),
      relation("vt-jt", [560, 400], [660, 330], [760, 400], 130),
    ],
  });

  doc.addLayer({
    nm: "sensors",
    st: LEAD,
    shapes: [
      sensor("tt", [290, 300], [290, 380], 30),
      sensor("vt", [560, 400], [560, 470], 50),
      sensor("jt", [760, 400], [760, 470], 70),
    ],
  });

  return doc.toJSON();
}
