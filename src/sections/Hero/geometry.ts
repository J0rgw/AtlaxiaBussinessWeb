import { SYMBOL_PATH } from "@/shell/Brand/Brand";

/*
  Geometry of the hero drawing: the ATLAXIA mark constructed like a technical
  drawing, from its real circles. Computed once on the server; deterministic.

  Drawing space: a square centered on the circumcenter of the mark, so every
  construction circle, axis and the dial share the same center.
*/

export const VIEW = 1120;
export const HALF = VIEW / 2;

/** The mark is drawn at half its source size (1298 x 1113). */
const SCALE = 0.5;

type Point = { x: number; y: number };

// Outer vertices of the mark in its source coordinates (see SYMBOL_PATH).
const apexSrc: Point = { x: 651, y: 24 };
const leftSrc: Point = { x: 24, y: 1061 };
const rightSrc: Point = { x: 1273, y: 1063 };
// Top of the inner arch.
const archSrc: Point = { x: 648, y: 378 };

function circumcenter(a: Point, b: Point, c: Point): Point {
  const d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
  const a2 = a.x ** 2 + a.y ** 2;
  const b2 = b.x ** 2 + b.y ** 2;
  const c2 = c.x ** 2 + c.y ** 2;
  return {
    x: (a2 * (b.y - c.y) + b2 * (c.y - a.y) + c2 * (a.y - b.y)) / d,
    y: (a2 * (c.x - b.x) + b2 * (a.x - c.x) + c2 * (b.x - a.x)) / d,
  };
}

const distance = (p: Point, q: Point) => Math.hypot(p.x - q.x, p.y - q.y);

function incenter(a: Point, b: Point, c: Point) {
  const la = distance(b, c);
  const lb = distance(a, c);
  const lc = distance(a, b);
  const perimeter = la + lb + lc;
  const center = {
    x: (la * a.x + lb * b.x + lc * c.x) / perimeter,
    y: (la * a.y + lb * b.y + lc * c.y) / perimeter,
  };
  const s = perimeter / 2;
  const area = Math.sqrt(s * (s - la) * (s - lb) * (s - lc));
  return { center, radius: area / s };
}

const origin = circumcenter(apexSrc, leftSrc, rightSrc);

/** Source coordinates of the mark to drawing coordinates. */
const toDrawing = (p: Point): Point => ({
  x: (p.x - origin.x) * SCALE,
  y: (p.y - origin.y) * SCALE,
});

const round = (n: number) => Math.round(n * 10) / 10;

export const symbolTransform = `translate(${round(-origin.x * SCALE)} ${round(-origin.y * SCALE)}) scale(${SCALE})`;
export const symbolPath = SYMBOL_PATH;

export const apex = toDrawing(apexSrc);
export const left = toDrawing(leftSrc);
export const right = toDrawing(rightSrc);
export const arch = toDrawing(archSrc);

/** Circle through the three vertices. */
export const circumradius = round(distance(apexSrc, origin) * SCALE);

const inscribed = incenter(apexSrc, leftSrc, rightSrc);
/** Circle tangent to the three sides. */
export const incircle = {
  ...toDrawing(inscribed.center),
  r: round(inscribed.radius * SCALE),
};

/** Each outer side, extended past its vertices like a construction line. */
export function extendedSides(extension = 96) {
  const sides: Array<[Point, Point]> = [
    [apex, left],
    [apex, right],
    [left, right],
  ];
  return sides.map(([p, q]) => {
    const length = distance(p, q);
    const ux = (q.x - p.x) / length;
    const uy = (q.y - p.y) / length;
    return {
      x1: round(p.x - ux * extension),
      y1: round(p.y - uy * extension),
      x2: round(q.x + ux * extension),
      y2: round(q.y + uy * extension),
    };
  });
}

export const DIAL_RADIUS = 500;

/** Signed smallest difference between two angles, in (-PI, PI]. */
export function angleDelta(a: number, b: number) {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

/** Instrument dial: a tick every 5 degrees, longer every 30, starting at the apex. */
export function dialTicks() {
  const point = (angle: number, r: number) =>
    `${round(Math.cos(angle) * r)} ${round(Math.sin(angle) * r)}`;
  let minor = "";
  let major = "";
  for (let deg = 0; deg < 360; deg += 5) {
    const angle = ((deg - 90) * Math.PI) / 180;
    const isMajor = deg % 30 === 0;
    const segment = `M${point(angle, DIAL_RADIUS - (isMajor ? 18 : 8))}L${point(angle, DIAL_RADIUS)}`;
    if (isMajor) major += segment;
    else minor += segment;
  }
  return { minor, major };
}

/** A circle as a path that starts at the top, so dashes travel from the apex. */
export function circlePath(r: number, cx = 0, cy = 0) {
  return `M${cx} ${cy - r}A${r} ${r} 0 1 1 ${cx} ${cy + r}A${r} ${r} 0 1 1 ${cx} ${cy - r}Z`;
}
