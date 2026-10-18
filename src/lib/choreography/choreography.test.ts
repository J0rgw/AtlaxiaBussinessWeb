import { describe, expect, it } from "vitest";
import { compile, sample, stateAt, toTransform, type Cue } from "./choreography";

const cues: Cue[] = [
  { target: "a", at: [0.2, 0.4], opacity: [0, 1], ease: "linear" },
  { target: "a", at: [0.6, 0.8], opacity: [1, 0.5], y: [0, -10], ease: "linear" },
  { target: "b", at: [0, 1], scaleX: [0, 1], ease: "out" },
];

describe("choreography", () => {
  it("holds the first value before a cue and the last one after it", () => {
    expect(stateAt(cues, 0).get("a")?.opacity).toBe(0);
    expect(stateAt(cues, 0.5).get("a")?.opacity).toBe(1);
    expect(stateAt(cues, 1).get("a")?.opacity).toBe(0.5);
  });

  it("interpolates inside a cue", () => {
    expect(stateAt(cues, 0.3).get("a")?.opacity).toBeCloseTo(0.5);
    expect(stateAt(cues, 0.7).get("a")?.y).toBeCloseTo(-5);
  });

  it("leaves untouched properties at rest", () => {
    const b = stateAt(cues, 0.5).get("b")!;
    expect(b.opacity).toBe(1);
    expect(b.x).toBe(0);
    expect(b.scaleY).toBe(1);
  });

  it("compiles one linear track per element that matches the static state", () => {
    const tracks = compile(cues);
    expect(tracks.map((t) => t.target)).toEqual(["a", "b"]);
    for (const track of tracks) {
      expect(track.keyframes[0]!.offset).toBe(0);
      expect(track.keyframes.at(-1)!.offset).toBe(1);
      for (const p of [0, 0.1, 0.25, 0.5, 0.65, 0.9, 1]) {
        const expected = stateAt(cues, p).get(track.target)!;
        const played = sample(track.keyframes, p);
        // Eased stretches are sampled: close, not exact
        expect(played.opacity).toBeCloseTo(expected.opacity, 1);
        expect(played.scaleX).toBeCloseTo(expected.scaleX, 1);
      }
    }
  });

  it("writes the same transform string for every engine", () => {
    expect(
      toTransform({ opacity: 1, x: -100, y: 5.123456, scaleX: 1, scaleY: 0.5, rotateX: 0 }),
    ).toBe("translate(-100%, 5.1235%) scale(1, 0.5)");
    expect(toTransform({ opacity: 1, x: 0, y: 0, scaleX: 1, scaleY: 1, rotateX: 52 })).toBe(
      "translate(0%, 0%) scale(1, 1) rotateX(52deg)",
    );
  });
});
