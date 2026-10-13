import { render } from "@testing-library/react";
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
