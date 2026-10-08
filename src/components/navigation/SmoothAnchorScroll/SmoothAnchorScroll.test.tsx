import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setSmoothScroll } from "@/lib/smoothScroll";
import type Lenis from "lenis";
import { SmoothAnchorScroll } from "./SmoothAnchorScroll";

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
    delete document.documentElement.dataset.motion;
  });

  it("scrolls through Lenis when inertial scrolling is active, honoring scroll-margin-top", async () => {
    const scrollTo = vi.fn();
    setSmoothScroll({ scrollTo } as unknown as Lenis);
    render(<Page />);
    screen.getByRole("region", { name: "Quiénes somos" }).style.scrollMarginTop = "80px";

    await userEvent.click(screen.getByRole("link", { name: "Quiénes somos" }));

    expect(scrollTo).toHaveBeenCalledWith(screen.getByRole("region", { name: "Quiénes somos" }), {
      offset: -80,
    });
    expect(scrollIntoView).not.toHaveBeenCalled();
    setSmoothScroll(null);
  });

  it("leaves anchors without a target and other pages to the browser", async () => {
    render(<Page />);

    await userEvent.click(screen.getByRole("link", { name: "Sin destino" }));

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
