import { act, render } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScrollScene, useSceneProgress } from "./ScrollScene";

describe("ScrollScene frame loop", () => {
  let log: string[];
  let top: number;

  beforeEach(() => {
    log = [];
    top = 0;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => {
      log.push("read");
      return { top, height: 3000 } as DOMRect;
    });
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
      setTimeout(() => callback(performance.now()), 0),
    );
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  /** Logs each progress it receives and, like ScrubFigure, takes one step in the scenes' frame. */
  function Follower({ name }: { name: string }) {
    const scene = useSceneProgress();
    useEffect(
      () =>
        scene?.subscribe(() => {
          log.push(`publish ${name}`);
          scene.frame(() => log.push(`step ${name}`));
        }),
      [scene, name],
    );
    return null;
  }

  it("measures every scene before publishing any, then runs the followers' steps", async () => {
    render(
      <>
        <ScrollScene>
          <Follower name="a" />
        </ScrollScene>
        <ScrollScene>
          <Follower name="b" />
        </ScrollScene>
      </>,
    );
    log.length = 0;

    top = -600;
    window.dispatchEvent(new Event("scroll"));
    await vi.waitFor(() => expect(log).toContain("step b"));
    // And no extra frame afterwards: the steps did not ask for one
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(log).toEqual(["read", "read", "publish a", "publish b", "step a", "step b"]);
  });
});

describe("ScrollScene on short viewports", () => {
  const original = window.matchMedia;
  let short: boolean;
  let listeners: Set<() => void>;

  beforeEach(() => {
    listeners = new Set();
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      () => ({ top: -600, height: 3000 }) as DOMRect,
    );
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
      setTimeout(() => callback(performance.now()), 0),
    );
    window.matchMedia = ((query: string) => ({
      get matches() {
        return query === "(max-height: 36rem)" && short;
      },
      media: query,
      addEventListener: (_: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
    })) as unknown as typeof window.matchMedia;
  });
  afterEach(() => {
    window.matchMedia = original;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function setShort(value: boolean) {
    short = value;
    act(() => listeners.forEach((listener) => listener()));
  }

  it("is static on a short viewport, with its final progress", () => {
    short = true;
    const { container } = render(
      <ScrollScene>
        <span />
      </ScrollScene>,
    );
    const scene = container.firstElementChild as HTMLElement;
    expect(scene).toHaveAttribute("data-static");
    expect(scene.style.getPropertyValue("--scene-progress")).toBe("");
  });

  it("stays pinned and tracks the scroll on a tall viewport", () => {
    short = false;
    const { container } = render(
      <ScrollScene>
        <span />
      </ScrollScene>,
    );
    const scene = container.firstElementChild as HTMLElement;
    expect(scene).not.toHaveAttribute("data-static");
    expect(scene.style.getPropertyValue("--scene-progress")).not.toBe("");
  });

  it("follows the rotation of the phone in both directions", () => {
    short = false;
    const { container } = render(
      <ScrollScene>
        <span />
      </ScrollScene>,
    );
    const scene = container.firstElementChild as HTMLElement;

    setShort(true);
    expect(scene).toHaveAttribute("data-static");
    // The inline value from the pinned mode must not outlive it
    expect(scene.style.getPropertyValue("--scene-progress")).toBe("");

    setShort(false);
    expect(scene).not.toHaveAttribute("data-static");
    expect(scene.style.getPropertyValue("--scene-progress")).not.toBe("");
  });

  it("stops listening when it unmounts", () => {
    short = false;
    const { unmount } = render(
      <ScrollScene>
        <span />
      </ScrollScene>,
    );
    expect(listeners.size).toBe(1);
    unmount();
    expect(listeners.size).toBe(0);
  });
});
