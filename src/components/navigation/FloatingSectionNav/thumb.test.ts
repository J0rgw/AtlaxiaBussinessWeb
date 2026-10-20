import { describe, expect, it } from "vitest";
import { nextThumb } from "./thumb";

const base = { itemCount: 4, trackWidth: 400, fallbackWidth: 60 };

describe("nextThumb", () => {
  it("sits on the active link", () => {
    expect(
      nextThumb({ ...base, target: { x: 120, width: 90 }, previous: null, lastActiveIndex: 1 }),
    ).toEqual({ x: 120, width: 90, parked: null });
  });

  it("parks a pixel past the edge, so a fractional track width leaves no sliver inside", () => {
    const previous = { x: 300, width: 96, parked: null };
    const right = nextThumb({ ...base, target: null, previous, lastActiveIndex: 3 });
    expect(right.x).toBeGreaterThan(base.trackWidth);
    const left = nextThumb({ ...base, target: null, previous, lastActiveIndex: 0 });
    expect(left.x + left.width).toBeLessThan(0);
  });

  it("leaves to the right after the last sections (towards contact)", () => {
    const previous = { x: 300, width: 96, parked: null };
    expect(nextThumb({ ...base, target: null, previous, lastActiveIndex: 3 })).toEqual({
      x: 401,
      width: 96,
      parked: "right",
    });
  });

  it("leaves to the left before the first section (back to the hero)", () => {
    const previous = { x: 4, width: 70, parked: null };
    expect(nextThumb({ ...base, target: null, previous, lastActiveIndex: 0 })).toEqual({
      x: -71,
      width: 70,
      parked: "left",
    });
  });

  it("parks left with a fallback width before any section has been active", () => {
    expect(nextThumb({ ...base, target: null, previous: null, lastActiveIndex: null })).toEqual({
      x: -61,
      width: 60,
      parked: "left",
    });
  });

  it("stays parked on the same side when re-measured", () => {
    const parked = { x: 401, width: 96, parked: "right" as const };
    expect(nextThumb({ ...base, target: null, previous: parked, lastActiveIndex: 3 })).toEqual(
      parked,
    );
  });
});
