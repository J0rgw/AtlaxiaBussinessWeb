import { describe, expect, it } from "vitest";
import { EXPECTED_SPREAD, OPERATOR_LIMIT, MARKER_AT, illustration } from "./illustration";

/*
  The copy makes claims about this drawing ("the level falls when the pump
  starts", "everything stays within limits"...). These tests keep the
  numbers honest if anyone retouches the series.
*/

const data = illustration();
const inAnomaly = (x: number) => x >= data.anomaly[0];

describe("Capabilities illustration", () => {
  it("is deterministic", () => {
    expect(illustration()).toEqual(data);
  });

  it("works as a system: while the pump runs the outflow is higher and the level falls", () => {
    const running = data.t.filter((x, i) => data.pump[i] === 1 && !inAnomaly(x));
    const stopped = data.t.filter((x, i) => data.pump[i] === 0 && !inAnomaly(x));
    const mean = (xs: number[], series: number[]) =>
      xs.reduce((sum, x) => sum + series[data.t.indexOf(x)]!, 0) / xs.length;
    expect(mean(running, data.outflow)).toBeGreaterThan(mean(stopped, data.outflow) + 0.3);

    // Over each normal run of the pump the expected level ends lower than it started
    const starts = data.transitions.filter((x) => data.pump[data.t.indexOf(x)] === 1);
    for (const start of starts.filter((x) => !inAnomaly(x + 0.1))) {
      const i = data.t.indexOf(start);
      const j = data.pump.indexOf(0, i);
      expect(data.expected[j]!).toBeLessThan(data.expected[i]!);
    }
  });

  it("follows the expected range until the anomaly, then leaves it", () => {
    data.t.forEach((x, i) => {
      const gap = Math.abs(data.measured[i]! - data.expected[i]!);
      if (!inAnomaly(x)) expect(gap).toBeLessThanOrEqual(EXPECTED_SPREAD);
    });
    const firstOut = data.t.findIndex((x) => x === data.anomaly[0]);
    expect(Math.abs(data.measured[firstOut]! - data.expected[firstOut]!)).toBeGreaterThan(
      EXPECTED_SPREAD,
    );
    expect(data.anomaly[0]).toBeGreaterThan(0.6);
  });

  it("keeps the pump and the outflow in their usual pattern during the anomaly", () => {
    // Same two plateaus all day: nothing in the pump or the outflow marks the anomaly
    const runs = data.transitions.filter((x) => data.pump[data.t.indexOf(x)] === 1);
    expect(runs.some(inAnomaly)).toBe(false);
    expect(runs.some((x) => inAnomaly(x + 0.15))).toBe(true);
    data.pump.forEach((p, i) => {
      if (i < 4 || data.pump.slice(i - 4, i + 1).some((q) => q !== p)) return;
      expect(Math.abs(data.outflow[i]! - (p ? 0.7 : 0.2))).toBeLessThanOrEqual(0.02);
    });
  });

  it("stays under the operator limit all day, so a fixed threshold would not fire", () => {
    expect(Math.max(...data.measured)).toBeLessThan(OPERATOR_LIMIT);
  });

  it("puts the marker inside the anomaly", () => {
    expect(inAnomaly(MARKER_AT)).toBe(true);
  });
});
