import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const markup = (id: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" data-figure="${id}"><g/></svg>`;

// The loader keeps its queue at module level: a fresh copy for each test
async function freshLoader() {
  vi.resetModules();
  return import("./loader");
}

describe("anatomy figure loader", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn(async (url: string) =>
      url.endsWith(".svg")
        ? new Response(markup(url.replace(/\.svg$/, "")))
        : new Response(JSON.stringify({ v: 1, tracks: [] })),
    );
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads a figure that nears the viewport right away, parsed but not in the page", async () => {
    const { queueFigure } = await freshLoader();
    const ready = vi.fn();
    const figure = queueFigure("/a", ready);
    expect(fetchMock).not.toHaveBeenCalled();

    figure.near();
    await vi.waitFor(() => expect(ready).toHaveBeenCalledTimes(1));
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(["/a.svg", "/a.json"]);
    const [svg, timeline] = ready.mock.calls[0]!;
    expect(svg.dataset.figure).toBe("/a");
    expect(svg.isConnected).toBe(false);
    expect(timeline).toEqual({ v: 1, tracks: [] });
  });

  it("never hands over a figure that was cancelled", async () => {
    const { queueFigure } = await freshLoader();
    const ready = vi.fn();
    const figure = queueFigure("/b", ready);
    figure.cancel();
    figure.near();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(ready).not.toHaveBeenCalled();
  });

  it("prefetches every queued figure once the page is idle and hands them over in order", async () => {
    vi.stubGlobal("requestIdleCallback", (callback: () => void) => setTimeout(callback, 0));
    const { queueFigure } = await freshLoader();
    const order: string[] = [];
    queueFigure("/first", (svg) => order.push(svg.dataset.figure ?? ""));
    queueFigure("/second", (svg) => order.push(svg.dataset.figure ?? ""));

    await vi.waitFor(() => expect(order).toEqual(["/first", "/second"]));
  });
});
