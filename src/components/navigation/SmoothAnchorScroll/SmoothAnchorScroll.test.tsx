import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setSmoothScroll } from "@/lib/smoothScroll";
import type Lenis from "lenis";
import { planJump, SmoothAnchorScroll } from "./SmoothAnchorScroll";

function Page() {
  return (
    <>
      <SmoothAnchorScroll />
      <a href="#about">Quiénes somos</a>
      <a href="#missing">Sin destino</a>
      <a href="/en/">English</a>
      <section id="about" aria-label="Quiénes somos" />
    </>
  );
}

describe("SmoothAnchorScroll", () => {
  const scrollIntoView = vi.fn();

  beforeEach(() => {
    // jsdom does not implement scrolling.
    Element.prototype.scrollIntoView = scrollIntoView;
    window.history.replaceState(null, "", "/");
  });

  afterEach(() => {
    scrollIntoView.mockReset();
    setSmoothScroll(null);
    delete document.documentElement.dataset.motion;
  });

  it("scrolls smoothly to the section, updates the hash and moves focus", async () => {
    render(<Page />);

    await userEvent.click(screen.getByRole("link", { name: "Quiénes somos" }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    expect(window.location.hash).toBe("#about");
    expect(screen.getByRole("region", { name: "Quiénes somos" })).toHaveFocus();
  });

  it("jumps without animation when reduced motion is requested", async () => {
    document.documentElement.dataset.motion = "reduce";
    render(<Page />);

    await userEvent.click(screen.getByRole("link", { name: "Quiénes somos" }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
  });

  it("scrolls through Lenis with a timed animation to the section's landing point", async () => {
    const scrollTo = vi.fn();
    setSmoothScroll({ scrollTo, animatedScroll: 500 } as unknown as Lenis);
    render(<Page />);
    const section = screen.getByRole("region", { name: "Quiénes somos" });
    section.style.scrollMarginTop = "80px";
    section.getBoundingClientRect = () => ({ top: 600 }) as DOMRect;

    await userEvent.click(screen.getByRole("link", { name: "Quiénes somos" }));

    // Margin subtracted once: 500 + 600 - 80 (as an element target with an offset it landed 80 px short)
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith(1020, {
      duration: expect.any(Number),
      easing: expect.any(Function),
    });
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("cuts long jumps to one viewport before the target, then glides", async () => {
    const scrollTo = vi.fn();
    setSmoothScroll({ scrollTo, animatedScroll: 0 } as unknown as Lenis);
    render(<Page />);
    const section = screen.getByRole("region", { name: "Quiénes somos" });
    section.getBoundingClientRect = () => ({ top: 10 * window.innerHeight }) as DOMRect;

    await userEvent.click(screen.getByRole("link", { name: "Quiénes somos" }));

    expect(scrollTo).toHaveBeenNthCalledWith(1, 9 * window.innerHeight, { immediate: true });
    expect(scrollTo).toHaveBeenNthCalledWith(2, 10 * window.innerHeight, {
      duration: expect.any(Number),
      easing: expect.any(Function),
    });
  });

  it("leaves anchors without a target and other pages to the browser", async () => {
    render(<Page />);

    await userEvent.click(screen.getByRole("link", { name: "Sin destino" }));

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});

describe("planJump", () => {
  const viewport = 900;

  it("animates short jumps whole, longer ones for longer, within 0.6 to 1.2 s", () => {
    const near = planJump(300, viewport);
    const far = planJump(-2 * viewport, viewport);
    expect(near.cut).toBe(0);
    expect(far.cut).toBe(0);
    expect(near.duration).toBeGreaterThanOrEqual(0.6);
    expect(far.duration).toBeGreaterThan(near.duration);
    expect(far.duration).toBeLessThanOrEqual(1.2);
  });

  it("cuts long jumps to one viewport before the target, in either direction", () => {
    expect(planJump(10 * viewport, viewport).cut).toBe(9 * viewport);
    expect(planJump(-10 * viewport, viewport).cut).toBe(-9 * viewport);
  });

  it("keeps every animated frame small: at 60 Hz no step reaches a fifth of the viewport", () => {
    for (const distance of [200, viewport, 2.5 * viewport, 12 * viewport]) {
      const { cut, duration, easing } = planJump(distance, viewport);
      const travel = distance - cut;
      const frames = Math.round(duration * 60);
      let largest = 0;
      for (let i = 1; i <= frames; i++) {
        largest = Math.max(
          largest,
          Math.abs(travel * (easing(i / frames) - easing((i - 1) / frames))),
        );
      }
      expect(largest).toBeLessThan(viewport / 5);
    }
  });
});
