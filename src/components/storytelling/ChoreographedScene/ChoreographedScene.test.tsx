import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Cue } from "@/lib/choreography/choreography";
import { ChoreographedScene, CueElement } from "./ChoreographedScene";

const cues: Cue[] = [{ target: "panel", at: [0.5, 1], opacity: [0, 1], y: [10, 0] }];

function renderScene() {
  return render(
    <ChoreographedScene cues={cues} fallback={<p>static</p>}>
      <CueElement name="panel">moving</CueElement>
    </ChoreographedScene>,
  );
}

describe("ChoreographedScene", () => {
  afterEach(() => {
    delete document.documentElement.dataset.motion;
  });

  it("paints every cued element at its first state, before any engine runs", () => {
    renderScene();
    const panel = screen.getByText("moving");
    expect(panel).toHaveAttribute("data-cue", "panel");
    expect(panel.style.opacity).toBe("0");
    expect(panel.style.transform).toBe("translate(0%, 10%) scale(1, 1)");
  });

  it("switches to the static fallback with reduced motion", () => {
    document.documentElement.dataset.motion = "reduce";
    const { container } = renderScene();
    expect(container.querySelector("[data-scene]")).toHaveAttribute("data-static");
    expect(screen.getByText("static")).toBeInTheDocument();
  });
});
