import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mockIntersectionObserver } from "@/test/intersectionObserver";
import { FloatingSectionNav, type SectionNavItem } from "./FloatingSectionNav";
import { useActiveSection } from "@/lib/hooks/useActiveSection";

const items: SectionNavItem[] = [
  { id: "vision", label: "Visión", alternatives: ["Vision"] },
  { id: "capabilities", label: "Qué hacemos", alternatives: ["What we do"] },
  { id: "about", label: "Quiénes somos", alternatives: ["Who we are"] },
];

function Sections() {
  return (
    <>
      {items.map((item) => (
        <section key={item.id} id={item.id} />
      ))}
    </>
  );
}

describe("useActiveSection", () => {
  let io: ReturnType<typeof mockIntersectionObserver>;

  beforeEach(() => {
    io = mockIntersectionObserver();
  });
  afterEach(() => io.restore());

  it("is null until a section crosses the reading line", () => {
    render(<Sections />);
    const { result } = renderHook(() => useActiveSection(["vision", "capabilities", "about"]));
    expect(result.current).toBeNull();

    act(() => io.setIntersecting("capabilities", true));
    expect(result.current).toBe("capabilities");
  });

  it("follows the reader and prefers document order when two sections touch", () => {
    render(<Sections />);
    const { result } = renderHook(() => useActiveSection(["vision", "capabilities", "about"]));

    act(() => {
      io.setIntersecting("about", true);
      io.setIntersecting("vision", true);
    });
    expect(result.current).toBe("vision");

    act(() => io.setIntersecting("vision", false));
    expect(result.current).toBe("about");

    act(() => io.setIntersecting("about", false));
    expect(result.current).toBeNull();
  });
});

describe("FloatingSectionNav", () => {
  let io: ReturnType<typeof mockIntersectionObserver>;

  beforeEach(() => {
    io = mockIntersectionObserver();
  });
  afterEach(() => io.restore());

  it("links every item to its section inside one named navigation", () => {
    render(<FloatingSectionNav items={items} label="Navegación" />);

    const nav = screen.getByRole("navigation", { name: "Navegación" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Visión" })).toHaveAttribute("href", "#vision");
    expect(screen.getByRole("link", { name: "Quiénes somos" })).toHaveAttribute("href", "#about");
  });

  it("keeps the section name as accessible name when an icon is shown", () => {
    render(
      <FloatingSectionNav
        items={[{ id: "vision", label: "Visión", icon: <svg data-testid="icon" /> }]}
        label="Navegación"
      />,
    );

    expect(screen.getByRole("link", { name: "Visión" })).toContainElement(
      screen.getByTestId("icon"),
    );
  });

  it("does not read the reserved translations aloud", () => {
    render(<FloatingSectionNav items={items} label="Navegación" />);

    // The reserved "Vision" copy exists for layout only.
    expect(screen.getByRole("link", { name: "Visión" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Vision/ })).not.toBeInTheDocument();
  });

  it("marks the active section with aria-current when controlled", () => {
    render(<FloatingSectionNav items={items} label="Navegación" activeId="capabilities" />);

    expect(screen.getByRole("link", { name: "Qué hacemos" })).toHaveAttribute(
      "aria-current",
      "location",
    );
    expect(screen.getByRole("link", { name: "Visión" })).not.toHaveAttribute("aria-current");
  });

  it("tracks the section being read when uncontrolled", () => {
    render(
      <>
        <Sections />
        <FloatingSectionNav items={items} label="Navegación" />
      </>,
    );

    act(() => io.setIntersecting("about", true));

    expect(screen.getByRole("link", { name: "Quiénes somos" })).toHaveAttribute(
      "aria-current",
      "location",
    );
  });

  it("goes straight to a clicked section while the page scrolls there", () => {
    render(
      <>
        <Sections />
        <FloatingSectionNav items={items} label="Navegación" />
      </>,
    );
    act(() => io.setIntersecting("vision", true));

    fireEvent.click(screen.getByRole("link", { name: "Quiénes somos" }));
    const about = screen.getByRole("link", { name: "Quiénes somos" });
    expect(about).toHaveAttribute("aria-current", "location");

    // The glide passes "Qué hacemos" on its way: the indicator stays on the target.
    act(() => {
      io.setIntersecting("vision", false);
      io.setIntersecting("capabilities", true);
    });
    expect(about).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("link", { name: "Qué hacemos" })).not.toHaveAttribute("aria-current");

    // Arrived: scrolling back afterwards is tracked again.
    act(() => {
      io.setIntersecting("capabilities", false);
      io.setIntersecting("about", true);
    });
    act(() => {
      io.setIntersecting("about", false);
      io.setIntersecting("capabilities", true);
    });
    expect(screen.getByRole("link", { name: "Qué hacemos" })).toHaveAttribute(
      "aria-current",
      "location",
    );
  });

  it("follows the reader again when they scroll during the glide", () => {
    render(
      <>
        <Sections />
        <FloatingSectionNav items={items} label="Navegación" />
      </>,
    );
    act(() => io.setIntersecting("vision", true));

    fireEvent.click(screen.getByRole("link", { name: "Quiénes somos" }));
    act(() => {
      io.setIntersecting("vision", false);
      io.setIntersecting("capabilities", true);
    });
    fireEvent.wheel(window);

    expect(screen.getByRole("link", { name: "Qué hacemos" })).toHaveAttribute(
      "aria-current",
      "location",
    );
  });
});
