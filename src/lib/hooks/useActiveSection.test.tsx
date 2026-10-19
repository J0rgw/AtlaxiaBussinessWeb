import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mockIntersectionObserver } from "@/test/intersectionObserver";
import { useActiveSection } from "./useActiveSection";

function Reader() {
  const active = useActiveSection(["one", "two"], { rootMargin: "-45% 0px -45% 0px" });
  return (
    <>
      <div id="one" />
      <div id="two" />
      <p>{active ?? "none"}</p>
    </>
  );
}

describe("useActiveSection", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("measures against the page's own document, so the reading line also holds inside an iframe", () => {
    const io = mockIntersectionObserver();
    render(<Reader />);

    expect(io.options()).toEqual([{ root: document, rootMargin: "-45% 0px -45% 0px" }]);
    act(() => io.setIntersecting("two", true));
    expect(screen.getByText("two")).toBeInTheDocument();
  });

  it("falls back to the viewport where a document cannot be the root", () => {
    const created: Array<IntersectionObserverInit | undefined> = [];
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(_: unknown, options?: IntersectionObserverInit) {
          if (options?.root) throw new TypeError("root must be an Element");
          created.push(options);
        }
        observe() {}
        disconnect() {}
      },
    );
    render(<Reader />);

    expect(created).toEqual([{ rootMargin: "-45% 0px -45% 0px" }]);
  });
});
