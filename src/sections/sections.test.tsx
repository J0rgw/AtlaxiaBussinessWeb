import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NodeGraph } from "@/components/data-display/NodeGraph";
import { ScrubFigure } from "@/components/data-display/ScrubFigure";
import { ScrubLottie } from "@/components/data-display/ScrubLottie";
import { SignalChart } from "@/components/data-display/SignalChart";
import { ProcessFlowReveal } from "@/components/storytelling/ProcessFlow";
import { ParallaxLayer, ScrollScene } from "@/components/storytelling/ScrollScene";
import { dictionaries } from "@/content";
import { mockIntersectionObserver } from "@/test/intersectionObserver";
import { Building } from "./Building/Building";
import { Contact } from "./Contact/Contact";
import { Hero } from "./Hero/Hero";
import { SectorsScene } from "./Vision/SectorsScene";
import { Vision } from "./Vision/Vision";
import { DirectionFrame, WaterCaseFrame } from "./Vision/waterCase/WaterCaseFrame";
import { WhereScene } from "./Vision/WhereScene";

describe("NodeGraph", () => {
  it("exposes the description as the image name and draws one node per signal", () => {
    const { container } = render(
      <NodeGraph
        width={100}
        height={100}
        description="Red de ejemplo"
        nodes={[
          { id: "a", x: 10, y: 10, label: "A", role: "focus" },
          { id: "b", x: 80, y: 80, label: "B" },
        ]}
        edges={[{ from: "a", to: "b", strength: "strong" }]}
      />,
    );

    expect(screen.getByRole("img", { name: "Red de ejemplo" })).toBeInTheDocument();
    expect(container.querySelectorAll("text")).toHaveLength(2);
  });
});

describe("SignalChart", () => {
  it("names the chart, draws one path per series and marks deviations", () => {
    const { container } = render(
      <SignalChart
        description="Señal frente a lo esperado"
        series={[
          { id: "e", role: "expected", values: [1, 2, 3] },
          { id: "o", role: "observed", values: [1, 2, 6] },
        ]}
        deviations={[{ seriesId: "o", index: 2 }]}
        legend={[
          { key: "observed", label: "Observado" },
          { key: "expected", label: "Esperado" },
        ]}
      />,
    );

    expect(screen.getByRole("img", { name: "Señal frente a lo esperado" })).toBeInTheDocument();
    expect(container.querySelectorAll("svg > path")).toHaveLength(2);
    expect(container.querySelectorAll("circle")).toHaveLength(2);
    expect(container.querySelector("figcaption")).toHaveTextContent("ObservadoEsperado");
  });

  it("skips deviations that point outside the series", () => {
    const { container } = render(
      <SignalChart
        description="Sin desviación"
        series={[{ id: "o", values: [1, 2] }]}
        deviations={[{ seriesId: "o", index: 9 }]}
      />,
    );
    expect(container.querySelectorAll("circle")).toHaveLength(0);
  });
});

describe("ProcessFlowReveal", () => {
  const steps = [
    { id: "a", label: "Datos" },
    { id: "b", label: "Contexto" },
    { id: "c", label: "Acción" },
  ];
  let io: ReturnType<typeof mockIntersectionObserver>;

  beforeEach(() => {
    vi.useFakeTimers();
    io = mockIntersectionObserver();
  });
  afterEach(() => {
    io.restore();
    vi.useRealTimers();
  });

  function states() {
    return screen.getAllByRole("listitem").map((li) => li.dataset.state);
  }

  it("renders the final state before anything happens (no JS, SSR)", () => {
    render(<ProcessFlowReveal steps={steps} label="Flujo" />);
    expect(states()).toEqual(["reached", "reached", "current"]);
  });

  it("resets while off screen and plays step by step once it comes into view", () => {
    render(<ProcessFlowReveal steps={steps} label="Flujo" stepDuration={100} />);
    const target = screen.getByRole("list").parentElement!.parentElement!;
    target.id = "flow";

    act(() => io.setIntersecting("flow", false));
    expect(states()).toEqual(["pending", "pending", "pending"]);

    act(() => io.setIntersecting("flow", true));
    expect(states()).toEqual(["current", "pending", "pending"]);

    act(() => vi.advanceTimersByTime(100));
    expect(states()).toEqual(["reached", "current", "pending"]);

    act(() => vi.advanceTimersByTime(100));
    expect(states()).toEqual(["reached", "reached", "current"]);
  });

  it("does not replay when it is already visible on load", () => {
    render(<ProcessFlowReveal steps={steps} label="Flujo" />);
    const target = screen.getByRole("list").parentElement!.parentElement!;
    target.id = "flow";

    act(() => io.setIntersecting("flow", true));
    expect(states()).toEqual(["reached", "reached", "current"]);
  });
});

describe("ScrollScene", () => {
  afterEach(() => {
    delete document.documentElement.dataset.motion;
  });

  it("pins its children in a stage and starts at progress 0", () => {
    const { container } = render(
      <ScrollScene length={4}>
        <p>Escena</p>
      </ScrollScene>,
    );
    const scene = container.firstElementChild as HTMLElement;
    expect(scene.style.getPropertyValue("--scene-length")).toBe("4");
    expect(scene.style.getPropertyValue("--scene-progress")).toBe("0.0000");
    expect(screen.getByText("Escena")).toBeInTheDocument();
  });

  it("with reduced motion, lays out statically in its final state", () => {
    document.documentElement.dataset.motion = "reduce";
    const { container } = render(
      <ScrollScene>
        <p>Escena</p>
      </ScrollScene>,
    );
    expect(container.firstElementChild).toHaveAttribute("data-static");
  });
});

describe("ParallaxLayer", () => {
  it("exposes its travel and range as custom properties for CSS", () => {
    render(
      <ParallaxLayer x={["10vw", "0vw"]} opacity={[0, 1]} range={[0.2, 0.6]}>
        <span>Capa</span>
      </ParallaxLayer>,
    );
    const layer = screen.getByText("Capa").parentElement!;
    expect(layer.style.getPropertyValue("--x0")).toBe("10vw");
    expect(layer.style.getPropertyValue("--o1")).toBe("1");
    expect(layer.style.getPropertyValue("--from")).toBe("0.2");
    expect(layer.style.getPropertyValue("--to")).toBe("0.6");
  });

  it("never divides by zero in CSS: a zero-length range becomes a step", () => {
    render(
      <ParallaxLayer opacity={[1, 0]} range={[1, 1]}>
        <span>Paso</span>
      </ParallaxLayer>,
    );
    const layer = screen.getByText("Paso").parentElement!;
    expect(Number(layer.style.getPropertyValue("--to"))).toBeGreaterThan(1);
  });
});

describe("ScrubLottie", () => {
  it("is decorative and loads nothing until it nears the viewport", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { container } = render(<ScrubLottie src="/animations/x.json" />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});

describe("ScrubFigure", () => {
  // Loading itself (idle prefetch, near the viewport first) is covered in loader.test.ts
  it("is decorative and loads nothing while it renders", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { container } = render(<ScrubFigure src="/animations/anatomy/x" />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});

describe("Vision scenes", () => {
  it("A: the heading leads, three stage words and a text alternative for the animation", () => {
    const where = dictionaries.es.vision.scenes.where;
    render(<WhereScene content={where} />);

    expect(screen.getByRole("heading", { level: 3, name: where.title })).toBeInTheDocument();
    const stages = within(screen.getByRole("list", { name: where.stagesLabel })).getAllByRole(
      "listitem",
    );
    expect(stages.map((li) => li.textContent)).toEqual([
      `${where.stages.today.word}${where.stages.today.detail}`,
      `${where.stages.next.word}${where.stages.next.detail}`,
      `${where.stages.goal.word}${where.stages.goal.detail}`,
    ]);
    expect(screen.getByText(where.description)).toHaveClass("visually-hidden");
  });

  it("B: the heading leads and each sector is a named panel with its description", () => {
    const sectors = dictionaries.es.vision.scenes.sectors;
    render(<SectorsScene content={sectors} />);

    expect(screen.getByRole("heading", { level: 3, name: sectors.title })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 4 }).map((h) => h.textContent)).toEqual([
      sectors.items.water.name,
      sectors.items.food.name,
      sectors.items.metal.name,
    ]);
    expect(screen.getByText(sectors.items.food.description)).toHaveClass("visually-hidden");
  });
});

describe("Water case storyboard", () => {
  const { vision } = dictionaries.es;

  it("names every instrument in text and tells the step in large type", () => {
    render(<WaterCaseFrame content={vision.waterCase} step="expected" />);

    expect(
      screen.getByRole("heading", { level: 3, name: vision.waterCase.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(vision.waterCase.steps.expected)).toBeInTheDocument();
    for (const name of Object.values(vision.waterCase.signals)) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    }
    expect(screen.getAllByText(vision.waterCase.status.deviation).length).toBeGreaterThan(0);
  });

  it("shows the related signals and the stable one at the related step", () => {
    render(<WaterCaseFrame content={vision.waterCase} step="related" />);
    const list = screen.getByText(vision.waterCase.relatedTitle).nextElementSibling!;
    expect(within(list as HTMLElement).getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getAllByText(vision.waterCase.status.stable).length).toBeGreaterThan(0);
  });

  it("closes with the direction and an invitation that opens an email about the pilot", () => {
    render(<DirectionFrame content={vision} />);

    expect(
      screen.getByRole("heading", { level: 3, name: vision.direction.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(vision.direction.statement)).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: vision.direction.cta });
    expect(cta.getAttribute("href")).toMatch(/^mailto:hola@atlaxia\.es\?subject=/);
    expect(decodeURIComponent(cta.getAttribute("href")!)).toContain(vision.direction.cta);
  });
});

describe("Hero", () => {
  it("states ATLAXIA's territory in the h1, read as one sentence", () => {
    render(<Hero locale="es" content={dictionaries.es.hero} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Tecnología para entender sistemas industriales complejos",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Hablar con el equipo" })).toHaveAttribute(
      "href",
      "#contact",
    );
  });

  it("keeps the headline in one color and the copy short", () => {
    const { container } = render(<Hero locale="es" content={dictionaries.es.hero} />);

    const title = screen.getByRole("heading", { level: 1 });
    expect(title.querySelector("em")).toBeNull();
    expect(container.querySelector("dl")).toBeNull();
    expect(container.querySelectorAll("p")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Ver qué construimos" })).toHaveAttribute(
      "href",
      "#building",
    );
  });

  it("hides the drawing from assistive technology", () => {
    const { container } = render(<Hero locale="en" content={dictionaries.en.hero} />);
    const drawing = container.querySelector("svg")!.closest("[aria-hidden]");
    expect(drawing).toHaveAttribute("aria-hidden", "true");
  });

  it("does not lead with product vocabulary", () => {
    const { container } = render(<Hero locale="es" content={dictionaries.es.hero} />);
    expect(container.textContent).not.toMatch(/GNN|SCADA|anomal/i);
  });
});

describe("Vision", () => {
  it("opens straight on the index of reasons, whose label names the section", () => {
    render(<Vision content={dictionaries.es.vision} />);

    expect(screen.getByRole("region", { name: "Visión" })).toHaveAttribute("id", "vision");
    expect(screen.getByRole("heading", { level: 2, name: "Visión" })).toBeInTheDocument();
    expect(screen.queryByText("Los datos industriales no se explican solos")).toBeNull();
    const index = screen.getByRole("navigation", { name: "Visión" });
    expect(
      within(index)
        .getAllByRole("link")
        .map((l) => l.textContent),
    ).toEqual([
      "Datos sin contexto",
      "Relaciones entre señales",
      "Comportamiento esperado",
      "De entender a actuar",
    ]);
    expect(screen.getByRole("heading", { name: "Hacia dónde vamos" })).toBeInTheDocument();
  });

  it("gives every illustration a text alternative and keeps the five-step flow", () => {
    const { vision } = dictionaries.es;
    render(<Vision content={vision} />);

    expect(
      screen.getByRole("img", { name: vision.reasons.context.chartDescription }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: vision.reasons.relations.graphDescription }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: vision.reasons.behavior.chartDescription }),
    ).toBeInTheDocument();
    const flow = screen.getByRole("list", { name: "De los datos a la acción" });
    expect(within(flow).getAllByRole("listitem")).toHaveLength(5);
  });

  it("closes with the two scroll scenes: where we are going, then where we start", () => {
    const { scenes } = dictionaries.es.vision;
    render(<Vision content={dictionaries.es.vision} />);

    const headings = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(headings).toContain(scenes.where.title);
    expect(headings).toContain(scenes.sectors.title);
    expect(headings.indexOf(scenes.where.title)).toBeLessThan(
      headings.indexOf(scenes.sectors.title),
    );
    expect(screen.getByRole("list", { name: scenes.where.stagesLabel })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 4 }).map((h) => h.textContent)).toEqual([
      scenes.sectors.items.water.name,
      scenes.sectors.items.food.name,
      scenes.sectors.items.metal.name,
    ]);
  });
});

describe("Building", () => {
  function renderBuilding(locale: "es" | "en" = "es") {
    return render(
      <Building
        locale={locale}
        eyebrow={dictionaries[locale].nav.building}
        content={dictionaries[locale].building}
      />,
    );
  }

  it("presents the product as layers, from the operator down to the plant", () => {
    renderBuilding();

    const region = screen.getByRole("region", { name: "Nuestro primer producto, capa a capa" });
    expect(region).toHaveAttribute("data-surface", "dark");
    const list = screen.getByRole("list", { name: "Capas del producto" });
    const rows = within(list)
      .getAllByRole("listitem")
      .filter((li) => li.parentElement === list);
    expect(rows.map((row) => within(row).getByRole("heading").textContent)).toEqual([
      "Interfaz de operación",
      "Observado frente a esperado",
      "Relaciones entre señales",
      "En la planta, junto al SCADA",
    ]);
    expect(rows.map((row) => row.querySelector('[aria-hidden="true"]')?.textContent)).toEqual([
      "04",
      "03",
      "02",
      "01",
    ]);
  });

  it("marks the product name as provisional and links to the demo in a new tab", () => {
    renderBuilding();

    const aside = screen.getByRole("complementary");
    expect(within(aside).getByText("SCADAXIA")).toBeInTheDocument();
    expect(aside).toHaveTextContent("Nombre provisional");
    expect(within(aside).getAllByRole("listitem")).toHaveLength(5);
    const demo = within(aside).getByRole("link", { name: "Ver la demo" });
    expect(demo).toHaveAttribute("href", "https://demo.atlaxia.es");
    expect(demo).toHaveAttribute("target", "_blank");
  });
});

describe("Contact", () => {
  it("offers one primary action and labelled mail links for every intent", () => {
    render(<Contact content={dictionaries.es.contact} />);

    expect(screen.getByRole("region", { name: "Hablemos" })).toHaveAttribute(
      "data-surface",
      "dark",
    );
    expect(screen.getByRole("link", { name: "Solicitar demo" })).toHaveAttribute(
      "href",
      `mailto:hola@atlaxia.es?subject=${encodeURIComponent("ATLAXIA: Solicitar demo")}`,
    );

    const intents = screen.getByRole("list");
    const links = within(intents).getAllByRole("link");
    expect(links).toHaveLength(5);
    expect(links[1]).toHaveAttribute(
      "href",
      `mailto:hola@atlaxia.es?subject=${encodeURIComponent("ATLAXIA: Investigación o universidad")}`,
    );
    expect(screen.getByRole("link", { name: "hola@atlaxia.es" })).toBeInTheDocument();
  });

  it("keeps the background mesh out of the accessibility tree", () => {
    const { container } = render(<Contact content={dictionaries.en.contact} />);
    const mesh = container.querySelector("section > svg");
    expect(mesh).toHaveAttribute("aria-hidden", "true");
    expect(mesh?.querySelectorAll("path").length).toBeGreaterThan(20);
  });
});
