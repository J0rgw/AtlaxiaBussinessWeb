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

  it("jumps instantly through Lenis when reduced motion is set after it mounted", async () => {
    const scrollTo = vi.fn();
    setSmoothScroll({ scrollTo } as unknown as Lenis, vi.fn());
    document.documentElement.dataset.motion = "reduce";
    render(<Page />);

    await userEvent.click(screen.getByRole("link", { name: "Quiénes somos" }));

    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith(screen.getByRole("region", { name: "Quiénes somos" }), {
      immediate: true,
    });
  });

  it("scrolls through Lenis with a timed animation, leaving scroll-margin-top to Lenis", async () => {
    const scrollTo = vi.fn();
    const wake = vi.fn();
    setSmoothScroll({ scrollTo } as unknown as Lenis, wake);
    render(<Page />);
    const section = screen.getByRole("region", { name: "Quiénes somos" });
    section.style.scrollMarginTop = "80px";

    await userEvent.click(screen.getByRole("link", { name: "Quiénes somos" }));

    // Lenis subtracts the margin itself: passing it as an offset too landed 80 px short
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith(section, {
      duration: expect.any(Number),
      easing: expect.any(Function),
    });
    expect(wake).toHaveBeenCalled();
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("cuts long jumps to one viewport before the target, then glides", async () => {
    const scrollTo = vi.fn();
    setSmoothScroll({ scrollTo } as unknown as Lenis, vi.fn());
    render(<Page />);
    const section = screen.getByRole("region", { name: "Quiénes somos" });
    section.getBoundingClientRect = () => ({ top: 10 * window.innerHeight }) as DOMRect;

    await userEvent.click(screen.getByRole("link", { name: "Quiénes somos" }));

    expect(scrollTo).toHaveBeenNthCalledWith(1, window.scrollY + 9 * window.innerHeight, {
      immediate: true,
    });
    expect(scrollTo).toHaveBeenNthCalledWith(2, section, {
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
