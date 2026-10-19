import { describe, expect, it } from "vitest";
import { dictionaries, getDictionary } from "@/content";

type Leaf = { path: string; value: unknown };

function leaves(node: unknown, path = ""): Leaf[] {
  // Arrays of objects (the intro beats) are walked; arrays of strings are one leaf
  if (Array.isArray(node) && node.some((item) => item !== null && typeof item === "object")) {
    return node.flatMap((item, i) => leaves(item, `${path}.${i}`));
  }
  if (node !== null && typeof node === "object" && !Array.isArray(node)) {
    return Object.entries(node).flatMap(([key, child]) =>
      leaves(child, path ? `${path}.${key}` : key),
    );
  }
  return [{ path, value: node }];
}

describe("content dictionaries", () => {
  const esLeaves = leaves(dictionaries.es);
  const enLeaves = leaves(dictionaries.en);

  it("English has exactly the same keys as Spanish", () => {
    expect(enLeaves.map((l) => l.path)).toEqual(esLeaves.map((l) => l.path));
  });

  it("has no empty strings in any locale", () => {
    for (const leaf of [...esLeaves, ...enLeaves]) {
      if (typeof leaf.value === "string") {
        expect(leaf.value.trim(), leaf.path).not.toBe("");
      }
    }
  });

  it("uses no em dashes, en dashes or middots in copy", () => {
    for (const leaf of [...esLeaves, ...enLeaves]) {
      if (typeof leaf.value === "string") {
        expect(leaf.value, leaf.path).not.toMatch(/[\u2013\u2014\u00b7]/);
      }
    }
  });

  // Owner's wording rules (2026-10-17)
  const text = (leaf: Leaf) =>
    typeof leaf.value === "string"
      ? leaf.value
      : Array.isArray(leaf.value)
        ? leaf.value.join(" ")
        : "";

  it("calls what the model flags an anomaly, never a deviation", () => {
    for (const leaf of [...esLeaves, ...enLeaves]) {
      expect(text(leaf), leaf.path).not.toMatch(/desviaci|deviation/i);
    }
  });

  // Business vocabulary (owner's business repo, AGENTS.md 2.8; aligned on 2026-10-19): a trial at a
  // plant is a "prueba acotada", never a pilot; the model of the plant is never a digital twin.
  it("speaks of scoped trials and the plant model, never of pilots or digital twins", () => {
    for (const leaf of [...esLeaves, ...enLeaves]) {
      expect(text(leaf), leaf.path).not.toMatch(/piloto|\bpilots?\b|gemelo digital|digital twin/i);
    }
  });

  // External kit: ATLAXIA does not anticipate; it is a limit of its identity (understanding the
  // plant). Catching things early is the proof of value, never the promise.
  it("never promises to anticipate, predict or forecast", () => {
    for (const leaf of [...esLeaves, ...enLeaves]) {
      expect(text(leaf), leaf.path).not.toMatch(/anticip|predic|previsi|forecast/i);
    }
  });

  it("says the system only reads in one place: What we do", () => {
    const where = (all: Leaf[], phrase: RegExp) =>
      all.filter((leaf) => phrase.test(text(leaf))).map((leaf) => leaf.path);
    expect(where(esLeaves, /solo lee/i)).toEqual(["capabilities.steps.observe.note"]);
    expect(where(enLeaves, /only reads/i)).toEqual(["capabilities.steps.observe.note"]);
  });

  it("sets in the accent only words that are in the text", () => {
    for (const dict of [dictionaries.es, dictionaries.en]) {
      for (const [title, intro] of [
        [dict.capabilities.title, dict.capabilities.intro],
        [dict.building.title, dict.building.intro],
        [dict.about.title, dict.about.intro],
      ] as const) {
        expect(title).toContain(intro.emphasis);
        for (const beat of intro.beats) expect(beat.text).toContain(beat.emphasis);
      }
    }
  });

  it("falls back to Spanish for unknown locales", () => {
    expect(getDictionary("fr")).toBe(dictionaries.es);
    expect(getDictionary("")).toBe(dictionaries.es);
    expect(getDictionary("en")).toBe(dictionaries.en);
  });
});
