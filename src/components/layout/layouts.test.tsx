import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SplitLayout } from "./SplitLayout";
import { StickyLayout } from "./StickyLayout";

function textOrder(container: HTMLElement) {
  return Array.from(container.querySelectorAll("[data-testid]")).map((el) =>
    el.getAttribute("data-testid"),
  );
}

describe("SplitLayout", () => {
  it("keeps start before end in the DOM even when the visual order is swapped", () => {
    const { container } = render(
      <SplitLayout
        order="end-first"
        start={<p data-testid="text">Texto</p>}
        end={<div data-testid="visual" />}
      />,
    );

    expect(textOrder(container)).toEqual(["text", "visual"]);
    expect(screen.getByText("Texto")).toBeInTheDocument();
  });

  it("exposes the ratio and order to the stylesheet", () => {
    const { container } = render(<SplitLayout ratio="5:7" order="end-first" start="A" end="B" />);

    const grid = container.querySelector("[data-ratio]");
    expect(grid).toHaveAttribute("data-ratio", "5:7");
    expect(grid).toHaveAttribute("data-order", "end-first");
  });
});

describe("StickyLayout", () => {
  it("places the sticky content first in the DOM when it sits on the start side", () => {
    const { container } = render(
      <StickyLayout stickySide="start" sticky={<div data-testid="panel" />}>
        <p data-testid="steps">Pasos</p>
      </StickyLayout>,
    );

    expect(textOrder(container)).toEqual(["panel", "steps"]);
  });

  it("puts the scrolling content first by default (sticky on the end side)", () => {
    const { container } = render(
      <StickyLayout sticky={<div data-testid="panel" />}>
        <p data-testid="steps">Pasos</p>
      </StickyLayout>,
    );

    expect(textOrder(container)).toEqual(["steps", "panel"]);
  });

  it("applies a custom pin offset", () => {
    const { container } = render(
      <StickyLayout sticky="Panel" offset="6rem">
        Pasos
      </StickyLayout>,
    );

    expect((container.firstChild as HTMLElement).style.getPropertyValue("--sticky-offset")).toBe(
      "6rem",
    );
  });
});
