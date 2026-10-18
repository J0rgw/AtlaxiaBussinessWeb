import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { dictionaries } from "@/content";
import { stateAt } from "@/lib/choreography/choreography";
import { Capabilities } from "./Capabilities";
import { chartLayers, cues, stepOrder } from "./cues";

describe("Capabilities", () => {
  afterEach(() => {
    delete document.documentElement.dataset.motion;
  });

  it("names the region with the section title and opens with the eyebrow and lead", () => {
    const { capabilities } = dictionaries.es;
    render(<Capabilities content={capabilities} />);

    expect(screen.getByRole("region", { name: capabilities.title })).toHaveAttribute(
      "id",
      "capabilities",
    );
    expect(screen.getByRole("heading", { level: 2, name: capabilities.title })).toBeInTheDocument();
    expect(screen.getByText(capabilities.eyebrow)).toBeInTheDocument();
    expect(screen.getByText(capabilities.lead)).toBeInTheDocument();
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
    expect(end.get(`panel-${stepOrder.at(-1)}`)?.opacity).toBe(1);
  });

  it("shows one step at a time in the middle of each stretch", () => {
    stepOrder.forEach((id, i) => {
      const middle = stateAt(cues, (i + 0.5) / stepOrder.length);
      for (const other of stepOrder) {
        expect(middle.get(`panel-${other}`)?.opacity).toBe(other === id ? 1 : 0);
      }
    });
  });

  it("switches to the static version with reduced motion", () => {
    document.documentElement.dataset.motion = "reduce";
    const { container } = render(<Capabilities content={dictionaries.es.capabilities} />);

    expect(container.querySelector("[data-scene]")).toHaveAttribute("data-static");
  });

  it("renders in English", () => {
    const { capabilities } = dictionaries.en;
    render(<Capabilities content={capabilities} />);

    expect(screen.getByRole("heading", { level: 2, name: capabilities.title })).toBeInTheDocument();
    expect(
      screen.getAllByText("It only reads: it never touches the control system.").length,
    ).toBeGreaterThan(0);
  });
});
