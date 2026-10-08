import { describe, expect, it } from "vitest";
import { angleDelta, DIAL_RADIUS, dialTicks } from "./geometry";

/** Each tick of a path as its outer radius and length. */
function ticks(path: string) {
  return Array.from(path.matchAll(/M(-?[\d.]+) (-?[\d.]+)L(-?[\d.]+) (-?[\d.]+)/g), (m) => {
    const [x1, y1, x2, y2] = m.slice(1).map(Number) as [number, number, number, number];
    return { outer: Math.hypot(x2, y2), length: Math.hypot(x2 - x1, y2 - y1) };
  });
}

describe("hero dial geometry", () => {
  it("has a tick every 5 degrees on the ring, longer every 30", () => {
    const { minor, major } = dialTicks();
    expect(ticks(minor)).toHaveLength(60);
    expect(ticks(major)).toHaveLength(12);
    for (const t of ticks(minor)) {
      expect(t.length).toBeCloseTo(8, 0);
      expect(t.outer).toBeCloseTo(DIAL_RADIUS, 0);
    }
    for (const t of ticks(major)) expect(t.length).toBeCloseTo(18, 0);
  });

  it("measures angle differences the short way round", () => {
    expect(angleDelta(0.1, 2 * Math.PI - 0.1)).toBeCloseTo(0.2);
  });
});
