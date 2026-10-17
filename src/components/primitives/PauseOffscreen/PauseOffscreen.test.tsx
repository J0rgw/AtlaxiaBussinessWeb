import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mockIntersectionObserver } from "@/test/intersectionObserver";
import { PauseOffscreen } from "./PauseOffscreen";

describe("PauseOffscreen", () => {
  let io: ReturnType<typeof mockIntersectionObserver>;
  beforeEach(() => {
    io = mockIntersectionObserver();
  });
  afterEach(() => io.restore());

  it("marks itself paused off screen and resumes on screen", () => {
    render(
      <PauseOffscreen id="loop" data-testid="loop" aria-hidden="true">
        <span />
      </PauseOffscreen>,
    );
    const element = screen.getByTestId("loop");
    expect(element).toHaveAttribute("aria-hidden", "true");
    expect(element).not.toHaveAttribute("data-paused");

    io.setIntersecting("loop", false);
    expect(element).toHaveAttribute("data-paused");

    io.setIntersecting("loop", true);
    expect(element).not.toHaveAttribute("data-paused");
  });
});
