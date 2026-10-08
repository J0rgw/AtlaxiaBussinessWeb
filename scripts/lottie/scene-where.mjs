import {
  anim,
  arc,
  clamp01,
  color,
  createDocument,
  drawOn,
  ease,
  easeInOut,
  ellipse,
  fade,
  fill,
  fixed,
  group,
  lerp,
  poly,
  rect,
  round,
  stroke,
  trim,
} from "./lib.mjs";

/*
  Scene A, "Hacia dónde vamos": a Powers of Ten zoom out over a blueprint
  world, scrubbed by scroll. The camera stays on one sensor while the world
  grows around it: signal, equipment, process (today), plant (next), systems
  (goal). What exists today is ink and cobalt; what is still to come, dashed.

  Storyboard (frames at 60 fps, 600 in total):
    0    Signal: a sensor on a pipe, its signal pulsing, flow in the pipe.
    150  Equipment: tank, pump and valve appear around it.
    270  Process: the line is complete and its sensors relate (cobalt links).
    440  Plant: the process becomes one block of a plant drawn in dashes.
    580  Systems: several plants joined by a network; signals travel along it.
*/

const W = 1000;
const H = 1000;
const FRAMES = 600;
const LAST = FRAMES - 1;

// Camera: scale over time, interpolated in log space so the zoom speed feels constant.
const CAMERA = [
  [0, 8],
  [40, 8],
  [150, 2.4],
  [270, 1.15],
  [330, 1.15],
  [440, 0.3],
  [475, 0.3],
  [580, 0.095],
  [LAST, 0.095],
];

export function cameraScale(frame) {
  const f = Math.min(LAST, Math.max(0, frame));
  for (let k = 0; k < CAMERA.length - 1; k += 1) {
    const [t0, s0] = CAMERA[k];
    const [t1, s1] = CAMERA[k + 1];
    if (f <= t1) {
      const u = easeInOut(clamp01((f - t0) / (t1 - t0)));
      return Math.exp(lerp(Math.log(s0), Math.log(s1), u));
    }
  }
  return CAMERA[CAMERA.length - 1][1];
}

const STEP = 6;

/** Samples f(frame) every STEP frames over [from, to], dropping points a straight line already covers. */
function sampled(fn, from = 0, to = LAST) {
  const keys = [];
  for (let t = Math.max(0, from); t < Math.min(LAST, to); t += STEP) keys.push([t, fn(t)]);
  keys.push([Math.min(LAST, to), fn(Math.min(LAST, to))]);
  const simple = keys.filter((key, k) => {
    const prev = keys[k - 1];
    const next = keys[k + 1];
    if (!prev || !next) return true;
    const u = (key[0] - prev[0]) / (next[0] - prev[0]);
    const expected = lerp(prev[1], next[1], u);
    return Math.abs(expected - key[1]) > Math.abs(key[1]) * 0.004;
  });
  return anim(
    simple.map(([t, v]) => [t, round(v, 3)]),
    ease.linear,
  );
}

/*
  The scene shows at about 600 px, not at its 1000 px canvas: widths given in
  "screen pixels" below are scaled up so they read at that size.
*/
const DISPLAY = 1.5;

/** A width in screen pixels, constant while the camera zooms. */
const px = (value, from, to) => sampled((t) => (value * DISPLAY) / cameraScale(t), from, to);

/** Dash pattern in screen pixels, constant while zooming; optional flow speed in px per frame. */
function dashPx(dash, gap, from, to, speed = 0) {
  return {
    dash: px(dash, from, to),
    gap: px(gap, from, to),
    offset: speed ? sampled((t) => (-speed * DISPLAY * t) / cameraScale(t), from, to) : 0,
  };
}

// Visibility windows of each level, in frames
const L012 = [0, 440];
const L3 = [330, LAST];
const L4 = [470, LAST];

export function buildWhereScene() {
  const doc = createDocument({
    name: "ATLAXIA, hacia dónde vamos",
    width: W,
    height: H,
    frames: FRAMES,
  });
  doc.addBackground();

  // Uniform scale: the sampled scalar becomes [s, s, 100] on every key.
  const scale = sampled((t) => cameraScale(t) * 100);
  const camera = doc.addLayer({
    nm: "camera",
    null: true,
    ks: {
      p: [W / 2, H / 2, 0],
      s: { a: 1, k: scale.k.map((key) => ({ ...key, s: [key.s[0], key.s[0], 100] })) },
    },
  });

  const world = (nm, shapes, o = 100) => doc.addLayer({ nm, parent: camera, shapes, ks: { o } });

  // -------------------------------------------------------------------------
  // L4 Systems: other plants and the network that joins them (goal)
  // -------------------------------------------------------------------------

  const site = { x: -1400, y: -820, w: 2940, h: 1620 };
  const siteCenter = [site.x + site.w / 2, site.y + site.h / 2];
  const plants = [200, 255, 315, 15, 75, 135].map((deg, k) => {
    const rad = (deg * Math.PI) / 180;
    const w = [2300, 1900, 2500, 2100, 2400, 1800][k];
    const h = [1300, 1500, 1200, 1400, 1250, 1450][k];
    const cx = siteCenter[0] + Math.cos(rad) * 3700;
    const cy = siteCenter[1] + Math.sin(rad) * 3300;
    return { x: cx - w / 2, y: cy - h / 2, w, h, cx, cy };
  });

  /** Point where the ray from a rectangle's center towards (tx, ty) leaves the rectangle. */
  function edge(r, tx, ty) {
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const dx = tx - cx;
    const dy = ty - cy;
    const t = Math.min(r.w / 2 / Math.abs(dx || 1e-6), r.h / 2 / Math.abs(dy || 1e-6));
    return [cx + dx * t, cy + dy * t];
  }

  const ours = { ...site, cx: siteCenter[0], cy: siteCenter[1] };
  const links = [
    ...plants.map((p) => [ours, p]),
    ...plants.map((p, k) => [p, plants[(k + 1) % plants.length]]),
  ];
  const linkPaths = links.map(([a, b], k) => {
    const p0 = edge(a, b.cx, b.cy);
    const p1 = edge(b, a.cx, a.cy);
    const mid = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
    const bend = k % 2 === 0 ? 0.12 : -0.12;
    const q = [mid[0] - (p1[1] - p0[1]) * bend, mid[1] + (p1[0] - p0[0]) * bend];
    return arc(p0, q, p1);
  });

  world(
    "L4 network",
    linkPaths.map((path, k) =>
      group(`link-${k}`, [
        path,
        drawOn(510 + k * 3, 560 + k * 3),
        stroke(color.strong, px(1.5, ...L4), { dash: dashPx(5, 6, ...L4) }),
      ]),
    ),
    fade(500, 515),
  );

  // Signals travelling the network from our plant: what we start with, reaching further
  world(
    "L4 signals",
    linkPaths.slice(0, plants.length).map((path, k) => {
      const start = 545 + k * 4;
      return group(`signal-${k}`, [
        path,
        trim(
          anim([
            [start, 0],
            [start + 46, 92],
          ]),
          anim([
            [start, 6],
            [start + 46, 100],
          ]),
        ),
        stroke(color.accent, px(3, ...L4)),
      ]);
    }),
    fade(545, 555),
  );

  world(
    "L4 plants",
    plants.map((p, k) => {
      const inner = [];
      const cols = 2;
      const rows = 2;
      const pad = 160;
      const bw = (p.w - pad * (cols + 1)) / cols;
      const bh = (p.h - pad * (rows + 1)) / rows;
      for (let c = 0; c < cols; c += 1) {
        for (let r = 0; r < rows; r += 1) {
          inner.push(rect(p.x + pad + c * (bw + pad), p.y + pad + r * (bh + pad), bw, bh, 20));
        }
      }
      const start = 495 + k * 8;
      return group(`plant-${k}`, [
        group("outline", [
          rect(p.x, p.y, p.w, p.h, 40),
          drawOn(start, start + 50),
          stroke(color.strong, px(1.5, ...L4), { dash: dashPx(6, 6, ...L4) }),
        ]),
        group("blocks", [
          ...inner,
          drawOn(start + 20, start + 70),
          stroke(color.strong, px(1, ...L4), { opacity: 60 }),
        ]),
      ]);
    }),
    fade(490, 505),
  );

  // -------------------------------------------------------------------------
  // L3 Plant: our process becomes one block among others (next)
  // -------------------------------------------------------------------------

  const blocks = [
    [-1250, -700, 760, 380],
    [-300, -700, 740, 380],
    [640, -700, 760, 380],
    [-1250, -190, 760, 360],
    [640, -190, 760, 360],
    [-1250, 330, 760, 360],
    [-300, 330, 740, 360],
    [640, 330, 760, 360],
  ];

  world(
    "L3 racks",
    [
      group("racks", [
        poly([
          [site.x, -255],
          [site.x + site.w, -255],
        ]),
        poly([
          [site.x, 250],
          [site.x + site.w, 250],
        ]),
        poly([
          [-395, site.y],
          [-395, site.y + site.h],
        ]),
        poly([
          [540, site.y],
          [540, site.y + site.h],
        ]),
        drawOn(395, 450),
        stroke(color.line, px(1.25, ...L3), { dash: dashPx(3, 5, ...L3) }),
      ]),
    ],
    fade(390, 400, 500, 530),
  );

  world(
    "L3 blocks",
    blocks.map(([x, y, w, h], k) => {
      const start = 380 + k * 6;
      const glyphs =
        k % 3 === 0
          ? [ellipse(x + w * 0.3, y + h / 2, h * 0.28), ellipse(x + w * 0.7, y + h / 2, h * 0.28)]
          : k % 3 === 1
            ? [
                rect(x + w * 0.15, y + h * 0.25, w * 0.3, h * 0.5, 8),
                poly([
                  [x + w * 0.45, y + h / 2],
                  [x + w * 0.85, y + h / 2],
                ]),
              ]
            : [
                poly([
                  [x + w * 0.12, y + h * 0.35],
                  [x + w * 0.88, y + h * 0.35],
                ]),
                poly([
                  [x + w * 0.12, y + h * 0.65],
                  [x + w * 0.88, y + h * 0.65],
                ]),
              ];
      return group(`block-${k}`, [
        group("outline", [
          rect(x, y, w, h, 14),
          drawOn(start, start + 45),
          stroke(color.strong, px(1.5, ...L3), { dash: dashPx(6, 6, ...L3) }),
        ]),
        group("glyphs", [
          ...glyphs,
          drawOn(start + 15, start + 60),
          stroke(color.strong, px(1, ...L3), { opacity: 60 }),
        ]),
      ]);
    }),
    fade(380, 392, 500, 535),
  );

  // The next scope: the whole plant, dashed in cobalt
  world(
    "L3 site",
    [
      group("site", [
        rect(site.x, site.y, site.w, site.h, 30),
        drawOn(400, 460),
        stroke(color.accent, px(2, 400, LAST), { dash: dashPx(8, 7, 400, LAST) }),
      ]),
    ],
    fade(398, 410),
  );

  // Today: our process as one solid cobalt block
  world(
    "L3 our process",
    [
      group("block", [
        rect(-300, -190, 740, 360, 14),
        stroke(color.accent, px(2, 330, LAST)),
        fill(color.accentSoft, 90),
      ]),
    ],
    fade(360, 405),
  );

  // -------------------------------------------------------------------------
  // L1 and L2: the process line (today), drawn on as the camera pulls back
  // -------------------------------------------------------------------------

  const ink = (w = 2) => stroke(color.ink, px(w, ...L012));
  const detail = () => stroke(color.strong, px(1.25, ...L012));
  const processFade = fade(0, 0, 385, 430);

  // Secondary piping: feed, recirculation, outlet
  world(
    "L2 piping",
    [
      group("feed", [
        poly([
          [-360, -150],
          [-225, -150],
          [-225, -95],
        ]),
        drawOn(165, 215),
        ink(1.5),
      ]),
      group("recirculation", [
        poly([
          [230, 22],
          [230, 110],
          [-40, 110],
          [-40, 5],
        ]),
        drawOn(190, 250),
        ink(1.5),
      ]),
      group(
        "recirculation valve",
        [
          poly(
            [
              [88, 101],
              [88, 119],
              [100, 110],
            ],
            true,
          ),
          poly(
            [
              [112, 101],
              [112, 119],
              [100, 110],
            ],
            true,
          ),
          ink(1.5),
          fill(color.raised),
        ],
        {
          o: anim([
            [235, 0],
            [250, 100],
          ]),
        },
      ),
      group("outlet", [
        poly([
          [395, 5],
          [470, 5],
        ]),
        drawOn(225, 255),
        ink(1.5),
      ]),
    ],
    processFade,
  );

  // Main line: tanks, pipe, pump, valve, heat exchanger
  const pipeSegments = [
    [-175, -106],
    [-74, 68],
    [92, 208],
    [252, 325],
  ];
  world(
    "L1 L2 equipment",
    [
      group("tank 1 liquid", [rect(-245, -50, 70, 65), fill(color.inset)]),
      group("tank 1", [rect(-245, -95, 70, 110, 4), drawOn(45, 120), ink()]),
      group("tank 1 level", [
        poly([
          [-245, -50],
          [-175, -50],
        ]),
        poly(
          [
            [-216, -60],
            [-204, -60],
            [-210, -53],
          ],
          true,
        ),
        detail(),
      ]),
      ...pipeSegments.map(([x0, x1], k) =>
        group(`pipe-${k}`, [
          poly([
            [x0, -5],
            [x1, -5],
          ]),
          poly([
            [x0, 5],
            [x1, 5],
          ]),
          // The segment around the sensor opens from the middle in the first frames
          k === 1
            ? trim(
                anim([
                  [0, 50],
                  [26, 0],
                ]),
                anim([
                  [0, 50],
                  [26, 100],
                ]),
              )
            : drawOn(k === 0 ? 40 : 150, k === 0 ? 110 : 230),
          ink(),
        ]),
      ),
      group("pump", [ellipse(-90, 0, 16), ink(), fill(color.raised)]),
      group("pump base", [
        poly([
          [-104, 22],
          [-76, 22],
        ]),
        detail(),
      ]),
      group(
        "impeller",
        [
          poly([
            [0, 0],
            [0, -10],
          ]),
          poly([
            [0, 0],
            [8.7, 5],
          ]),
          poly([
            [0, 0],
            [-8.7, 5],
          ]),
          ink(1.5),
        ],
        {
          p: [-90, 0],
          r: anim(
            [
              [0, 0],
              [LAST, 1440],
            ],
            ease.linear,
          ),
        },
      ),
      group("valve", [
        poly(
          [
            [68, -9],
            [68, 9],
            [80, 0],
          ],
          true,
        ),
        poly(
          [
            [92, -9],
            [92, 9],
            [80, 0],
          ],
          true,
        ),
        ink(),
        fill(color.raised),
      ]),
      group("heat exchanger fill", [ellipse(230, 0, 22), fill(color.raised)]),
      group("heat exchanger", [ellipse(230, 0, 22), drawOn(150, 200), ink()]),
      group("heat exchanger coil", [
        poly([
          [212, 0],
          [218, -9],
          [224, 9],
          [230, -9],
          [236, 9],
          [242, -9],
          [248, 0],
        ]),
        drawOn(170, 215),
        ink(1.5),
      ]),
      group("tank 2 liquid", [rect(325, -20, 70, 35), fill(color.inset)]),
      group("tank 2", [rect(325, -95, 70, 110, 4), drawOn(185, 250), ink()]),
    ],
    processFade,
  );

  // Flow along the main line
  world(
    "flow",
    [
      group("flow", [
        poly([
          [-175, 0],
          [325, 0],
        ]),
        // Visible around the sensor from the first frame, then grows with the pipe
        trim(
          anim([
            [0, 22.6],
            [110, 0],
          ]),
          anim([
            [0, 47.4],
            [230, 100],
          ]),
        ),
        stroke(color.accent, px(1.5, ...L012), { dash: dashPx(4, 10, ...L012, 1.6) }),
      ]),
    ],
    fade(14, 30, 330, 380),
  );

  // Relations between sensors: the graph appears over the process
  const sensors = {
    pt: [0, -32],
    ft: [130, -32],
    lt: [-262, -60],
    tt: [230, -58],
    lt2: [360, -125],
    ft2: [60, 140],
  };
  const relations = [
    ["pt", "ft", [65, -78]],
    ["pt", "lt", [-120, -100]],
    ["ft", "tt", [180, -92]],
    ["tt", "lt2", [300, -130]],
    ["pt", "ft2", [-10, 60]],
    ["lt", "lt2", [50, -250]],
  ];
  world(
    "relations",
    relations.map(([a, b, q], k) =>
      group(`relation-${k}`, [
        arc(sensors[a], q, sensors[b]),
        drawOn(235 + k * 9, 285 + k * 9),
        stroke(color.accent, px(2, ...L012), { dash: dashPx(4, 5, ...L012) }),
      ]),
    ),
    fade(230, 240, 375, 415),
  );

  // Sensors: leader to the measured point and a bubble with a cobalt core
  const sensorSpec = [
    ["pt", [0, -5], 6],
    ["ft", [130, -5], 120],
    ["lt", [-245, -60], 110],
    ["tt", [230, -22], 210],
    ["lt2", [360, -95], 225],
    ["ft2", [60, 110], 235],
  ];
  world(
    "sensors",
    sensorSpec.map(([id, to, appear]) => {
      const [x, y] = sensors[id];
      const pop = anim(
        [
          [appear, [0, 0]],
          [appear + 18, [100, 100]],
        ],
        ease.out,
      );
      return group(
        id,
        [
          group("leader", [
            poly([
              [0, 0],
              [to[0] - x, to[1] - y],
            ]),
            detail(),
          ]),
          group("bubble", [
            ellipse(0, 0, 10),
            stroke(id === "pt" ? color.accentInk : color.ink, px(1.75, ...L012)),
            fill(color.raised),
          ]),
          group("core", [ellipse(0, 0, 3), fill(color.accent)]),
        ],
        { p: [x, y], s: pop },
      );
    }),
    fade(0, 0, 385, 430),
  );

  // Signal ripples around the first sensor
  // The ring grows by its size, not by a group scale, so the stroke keeps its width.
  const ripples = [0, 1, 2].map((k) => {
    const period = 54;
    const sizeKeys = [];
    const opacityKeys = [];
    // Starts once the sensor is in place
    for (let t0 = 26 + k * 18; t0 + period <= 330; t0 += period) {
      sizeKeys.push([t0, [20, 20]], [t0 + period - 1, [64, 64]]);
      opacityKeys.push([t0, 0], [t0 + 4, 70], [t0 + period - 1, 0]);
    }
    const ring = {
      ty: "el",
      p: fixed([0, 0]),
      s: anim(sizeKeys, (i) => (i % 2 === 0 ? ease.out : ease.linear)),
    };
    return group(
      `ripple-${k}`,
      [ring, stroke(color.accent, px(1.5, 0, 340), { opacity: anim(opacityKeys, ease.out) })],
      { p: sensors.pt },
    );
  });
  world("ripples", ripples, fade(0, 0, 300, 330));

  return doc.toJSON();
}
