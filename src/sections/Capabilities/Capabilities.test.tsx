import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { dictionaries } from "@/content";
import { stateAt } from "@/lib/choreography/choreography";
import { Capabilities } from "./Capabilities";
import { chartLayers, cues, middleOf, stepOrder } from "./cues";

describe("Capabilities", () => {
  afterEach(() => {
    delete document.documentElement.dataset.motion;
  });

  it("opens on its cover: the section title names the region, the lead is read one sentence at a time", () => {
    const { capabilities } = dictionaries.es;
    const { container } = render(<Capabilities content={capabilities} />);

    expect(screen.getByRole("region", { name: capabilities.title })).toHaveAttribute(
      "id",
      "capabilities",
    );
    expect(
      screen.getAllByRole("heading", { level: 2, name: capabilities.title }).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(capabilities.eyebrow).length).toBeGreaterThan(0);
    const beats = Array.from(
      container.querySelectorAll('[data-cue^="intro-beat-"]'),
      (beat) => beat.textContent,
    );
    expect(beats).toEqual(capabilities.intro.beats.map((beat) => beat.text));
  });

  it("gives every step a heading and its text, in order, in the scene and in the static version", () => {
    const { capabilities } = dictionaries.es;
    render(<Capabilities content={capabilities} />);

    const lists = screen.getAllByRole("list", { name: capabilities.stepsLabel });
    expect(lists).toHaveLength(2);
    for (const list of lists) {
      const titles = within(list)
        .getAllByRole("heading", { level: 3 })
        .map((h) => h.textContent?.replace(/^\d+/, ""));
      expect(titles).toEqual(stepOrder.map((id) => capabilities.steps[id].title));
    }
    // The visual index repeats the titles, so it is hidden from assistive technology
    expect(
      screen
        .getAllByRole("list", { hidden: true })
        .some((l) => l.getAttribute("aria-hidden") === "true"),
    ).toBe(true);
  });

  it("keeps the two fixed messages: read only, and the decision stays with the operator", () => {
    const { capabilities } = dictionaries.es;
    render(<Capabilities content={capabilities} />);

    expect(screen.getAllByText("Solo lee: nunca toca el control.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("La decisión sigue siendo suya.").length).toBeGreaterThan(0);
  });

  it("exposes the chart as one labelled image, marked as an illustration", () => {
    const { chart } = dictionaries.es.capabilities;
    render(<Capabilities content={dictionaries.es.capabilities} />);

    expect(screen.getAllByRole("img", { name: chart.description }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(chart.label).length).toBeGreaterThan(0);
  });

  it("starts on the first step with the chart bare, and ends with every sheet laid down", () => {
    const start = stateAt(cues, 0);
    const end = stateAt(cues, 1);
    expect(start.get(`panel-${stepOrder[0]}`)?.opacity).toBe(1);
    for (const id of stepOrder.slice(1)) expect(start.get(`panel-${id}`)?.opacity).toBe(0);
    for (const layer of chartLayers) {
      expect(start.get(`layer-${layer}`)?.opacity).toBe(0);
      expect(end.get(`layer-${layer}`)?.opacity).toBe(1);
    }
    // It closes on how it works inside, with the five steps lit as a summary
    expect(end.get("inside")?.opacity).toBe(1);
    expect(end.get(`panel-${stepOrder.at(-1)}`)?.opacity).toBe(0);
    for (const id of stepOrder) expect(end.get(`title-${id}`)?.opacity).toBe(1);
  });

  it("shows one step at a time in the middle of each stretch", () => {
    stepOrder.forEach((id, i) => {
      const middle = stateAt(cues, middleOf(i));
      for (const other of stepOrder) {
        expect(middle.get(`panel-${other}`)?.opacity).toBe(other === id ? 1 : 0);
      }
    });
  });

  it("never shows two step texts on top of each other (they share one cell)", () => {
    for (let progress = 0; progress <= 1; progress += 0.0025) {
      const state = stateAt(cues, progress);
      const visible = [...stepOrder.map((id) => `panel-${id}`), "inside"].filter(
        (name) => (state.get(name)?.opacity ?? 0) > 0.15,
      );
      expect(visible.length, `progress ${progress.toFixed(4)}`).toBeLessThanOrEqual(1);
    }
  });

  it("switches to the static version with reduced motion", () => {
    document.documentElement.dataset.motion = "reduce";
    const { container } = render(<Capabilities content={dictionaries.es.capabilities} />);

    expect(container.querySelector("[data-scene]")).toHaveAttribute("data-static");
  });

  it("renders in English", () => {
    const { capabilities } = dictionaries.en;
    render(<Capabilities content={capabilities} />);

    expect(
      screen.getAllByRole("heading", { level: 2, name: capabilities.title }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText("It only reads: it never touches the control system.").length,
    ).toBeGreaterThan(0);
  });
});
