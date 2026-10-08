import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mockIntersectionObserver } from "@/test/intersectionObserver";
import { LayerStack } from "./LayerStack";
import { ProcessFlow } from "./ProcessFlow";
import { StickyIndexStory, type IndexStoryItem } from "./StickyIndexStory";
import { StickyStory, type StoryStep } from "./StickyStory";

const flowSteps = [
  { id: "data", label: "Datos" },
  { id: "context", label: "Contexto" },
  { id: "action", label: "Acción" },
];

describe("ProcessFlow", () => {
  it("is a labelled ordered list with every step reached when static", () => {
    render(<ProcessFlow steps={flowSteps} label="De los datos a la acción" />);

    const list = screen.getByRole("list", { name: "De los datos a la acción" });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items.map((li) => li.dataset.state)).toEqual(["reached", "reached", "reached"]);
  });

  it("marks reached, current and pending steps around activeIndex", () => {
    render(<ProcessFlow steps={flowSteps} label="Flujo" activeIndex={1} />);

    const items = screen.getAllByRole("listitem");
    expect(items.map((li) => li.dataset.state)).toEqual(["reached", "current", "pending"]);
    expect(items[1]).toHaveAttribute("aria-current", "step");
  });

  it("shows a stage tag above the label when the step has one", () => {
    render(
      <ProcessFlow
        steps={[{ id: "today", meta: "Hoy", label: "Procesos" }, ...flowSteps]}
        label="Hoja de ruta"
        activeIndex={0}
      />,
    );

    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("01HoyProcesos");
  });

  it("fills a connector only once the next step is reached", () => {
    const { container } = render(<ProcessFlow steps={flowSteps} label="Flujo" activeIndex={1} />);

    const connectors = Array.from(container.querySelectorAll("li > span[aria-hidden]")).filter(
      (el) => el.textContent === "",
    );
    expect(connectors.map((c) => c.hasAttribute("data-filled"))).toEqual([true, false]);
  });
});

const storySteps: StoryStep[] = ["Monitorizar", "Entender", "Relacionar"].map((title) => ({
  id: title.toLowerCase(),
  title,
  visual: <p>Visual {title}</p>,
}));

describe("StickyStory", () => {
  let io: ReturnType<typeof mockIntersectionObserver>;

  beforeEach(() => {
    io = mockIntersectionObserver();
  });
  afterEach(() => io.restore());

  function stepId(title: string) {
    return screen.getByRole("heading", { name: title }).closest("li")!.id;
  }

  function visibleFrames() {
    // Frames in the pinned panel that are exposed to assistive technology.
    return Array.from(document.querySelectorAll('[aria-hidden="false"]')).map((el) =>
      el.textContent?.trim(),
    );
  }

  it("starts on the first step", () => {
    render(<StickyStory steps={storySteps} label="Pasos" />);

    expect(screen.getByRole("heading", { name: "Monitorizar" }).closest("li")).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(visibleFrames()).toEqual(["Visual Monitorizar"]);
  });

  it("follows the step being read and shows its visual", () => {
    render(<StickyStory steps={storySteps} label="Pasos" />);

    act(() => io.setIntersecting(stepId("Relacionar"), true));

    expect(screen.getByRole("heading", { name: "Relacionar" }).closest("li")).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(visibleFrames()).toEqual(["Visual Relacionar"]);
  });

  it("keeps the last step between steps instead of blanking the panel", () => {
    render(<StickyStory steps={storySteps} label="Pasos" />);
    const id = stepId("Entender");

    act(() => io.setIntersecting(id, true));
    act(() => io.setIntersecting(id, false));

    expect(visibleFrames()).toEqual(["Visual Entender"]);
  });
});

const reasons: IndexStoryItem[] = ["Contexto", "Relaciones", "Acción"].map((label) => ({
  id: label.toLowerCase(),
  label,
  title: `Panel ${label}`,
  body: <p>Texto {label}</p>,
}));

describe("StickyIndexStory", () => {
  let io: ReturnType<typeof mockIntersectionObserver>;

  beforeEach(() => {
    io = mockIntersectionObserver();
  });
  afterEach(() => io.restore());

  function current() {
    const index = screen.getByRole("navigation", { name: "Por qué" });
    return within(index)
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "true")
      .map((link) => link.textContent);
  }

  it("is a labelled index whose entries link to their panels", () => {
    render(<StickyIndexStory items={reasons} label="Por qué" />);

    const links = within(screen.getByRole("navigation", { name: "Por qué" })).getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual(["Contexto", "Relaciones", "Acción"]);
    for (const link of links) {
      const panel = document.getElementById(link.getAttribute("href")!.slice(1));
      expect(panel?.tagName).toBe("ARTICLE");
    }
    expect(screen.getByRole("article", { name: "Panel Relaciones" })).toBeInTheDocument();
    expect(current()).toEqual(["Contexto"]);
  });

  it("can name its section with the label rendered as a heading", () => {
    render(<StickyIndexStory items={reasons} label="Por qué" labelAs="h2" labelId="why" />);

    const heading = screen.getByRole("heading", { level: 2, name: "Por qué" });
    expect(heading).toHaveAttribute("id", "why");
    expect(screen.getByRole("navigation", { name: "Por qué" })).toHaveAttribute(
      "aria-labelledby",
      "why",
    );
  });

  it("emphasizes the reason being read and keeps it between panels", () => {
    render(<StickyIndexStory items={reasons} label="Por qué" />);
    const panelId = screen.getByRole("article", { name: "Panel Acción" }).id;

    act(() => io.setIntersecting(panelId, true));
    expect(current()).toEqual(["Acción"]);

    act(() => io.setIntersecting(panelId, false));
    expect(current()).toEqual(["Acción"]);
  });
});

describe("LayerStack", () => {
  const layers = [
    {
      id: "top",
      index: "02",
      title: "Interfaz",
      items: [{ id: "a", label: "Panel", sub: "Operación" }],
    },
    { id: "bottom", index: "01", title: "Planta" },
  ];

  it("lists the layers in reading order with their items", () => {
    render(<LayerStack layers={layers} label="Capas" />);

    const list = screen.getByRole("list", { name: "Capas" });
    const rows = within(list)
      .getAllByRole("listitem")
      .filter((li) => li.parentElement === list);
    expect(rows.map((row) => within(row).getByRole("heading").textContent)).toEqual([
      "Interfaz",
      "Planta",
    ]);
    expect(within(rows[0]!).getByText("Operación")).toBeInTheDocument();
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  it("renders the cross-cutting column as an aside", () => {
    render(<LayerStack layers={layers} label="Capas" aside={<p>Producto</p>} />);
    expect(screen.getByRole("complementary")).toHaveTextContent("Producto");
  });
});
