import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { stateAt, type Cue } from "@/lib/choreography/choreography";
import { SectionIntro, introTimeline } from "./SectionIntro";

const beats = [
  { text: "Una planta es un sistema dinámico.", emphasis: "sistema dinámico" },
  { text: "ATLAXIA vigila que sus señales cuadren.", emphasis: "cuadren" },
  { text: "Y señala dónde está lo que no cuadra.", emphasis: "señala dónde" },
];

function renderIntro() {
  return render(
    <SectionIntro
      titleId="intro-title"
      index="02"
      eyebrow="Qué hacemos"
      title="Vigilamos que la planta funcione como un todo"
      emphasis="como un todo"
      beats={beats}
    />,
  );
}

describe("SectionIntro", () => {
  it("keeps the title readable as one heading, with the emphasis in the accent", () => {
    renderIntro();

    // The scene and its static version each have the heading; the scene's carries the id
    const headings = screen.getAllByRole("heading", {
      level: 2,
      name: "Vigilamos que la planta funcione como un todo",
    });
    expect(headings).toHaveLength(2);
    const heading = headings.find((h) => h.id === "intro-title")!;
    expect(heading).toBeDefined();
    expect(Array.from(heading.querySelectorAll("em"), (em) => em.textContent)).toEqual([
      "como",
      "un",
      "todo",
    ]);
  });

  it("hides the chapter number from assistive tech", () => {
    const { container } = renderIntro();
    expect(container.querySelector('[data-cue="intro-index"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("reads the lead one sentence at a time, in order", () => {
    const { container } = renderIntro();
    const scene = container.querySelector("[data-scene]")!;
    const cues = Array.from(scene.querySelectorAll('[data-cue^="intro-beat-"]'));
    expect(cues.map((beat) => beat.textContent)).toEqual(beats.map((beat) => beat.text));

    // The cues the component plays, rebuilt from the same timeline
    const timeline = introTimeline(beats.length);
    const beatCues: Cue[] = beats.flatMap((_, i): Cue[] => [
      { target: `b${i}`, at: timeline.beatIn(i), opacity: [0, 1] },
      ...(i < beats.length - 1
        ? [{ target: `b${i}`, at: timeline.beatOut(i), opacity: [1, 0] } as Cue]
        : []),
    ]);
    for (let progress = 0; progress <= 1; progress += 0.0025) {
      const state = stateAt(beatCues, progress);
      const visible = beats.filter((_, i) => (state.get(`b${i}`)?.opacity ?? 0) > 0.15);
      expect(visible.length, `progress ${progress.toFixed(4)}`).toBeLessThanOrEqual(1);
    }
    // At the end the last sentence stays
    expect(stateAt(beatCues, 1).get(`b${beats.length - 1}`)?.opacity).toBe(1);
  });

  it("has a static version with the whole lead at once", () => {
    const { container } = renderIntro();
    const leads = Array.from(container.querySelectorAll("p")).filter(
      (p) => p.textContent === beats.map((beat) => beat.text).join(" "),
    );
    expect(leads).toHaveLength(1);
  });
});
