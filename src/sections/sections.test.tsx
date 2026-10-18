import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NodeGraph } from "@/components/data-display/NodeGraph";
import { ScrubFigure } from "@/components/data-display/ScrubFigure";
import { ScrubLottie } from "@/components/data-display/ScrubLottie";
import { SignalChart } from "@/components/data-display/SignalChart";
import { ProcessFlowReveal } from "@/components/storytelling/ProcessFlow";
import { ParallaxLayer, ScrollScene } from "@/components/storytelling/ScrollScene";
import { dictionaries } from "@/content";
import { stateAt } from "@/lib/choreography/choreography";
import { mockIntersectionObserver } from "@/test/intersectionObserver";
import { About } from "./About/About";
import { Building, cues as buildingCues } from "./Building/Building";
import { layerOrder } from "./Building/layers";
import { Contact } from "./Contact/Contact";
import { Edge } from "./Edge/Edge";
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
    // The legend is a list, not a caption: the figure is named by the chart's description only
    expect(container.querySelector("figcaption")).toBeNull();
    expect(screen.getByRole("list")).toHaveTextContent("ObservadoEsperado");
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
  const renderVision = () =>
    render(<Vision title={dictionaries.es.nav.vision} content={dictionaries.es.vision} />);

  it("is named by its navigation label", () => {
    renderVision();

    expect(screen.getByRole("region", { name: dictionaries.es.nav.vision })).toHaveAttribute(
      "id",
      "vision",
    );
  });

  it("plays the two scroll scenes: where we are going, then where we start", () => {
    const { scenes } = dictionaries.es.vision;
    renderVision();

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

  it("closes with why now, after the scenes, each fact with its source", () => {
    const { scenes, evidence } = dictionaries.es.vision;
    renderVision();

    const headings = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(headings.at(-1)).toBe(evidence.title);
    expect(headings.indexOf(scenes.sectors.title)).toBeLessThan(headings.indexOf(evidence.title));
    const facts = within(screen.getByRole("list", { name: evidence.title })).getAllByRole(
      "listitem",
    );
    expect(facts).toHaveLength(3);
    expect(within(facts[0]!).getByRole("link")).toHaveAttribute("href", evidence.items.perte.href);
  });
});

describe("Building", () => {
  const content = dictionaries.es.building;

  it("never shows two layer texts on top of each other while the scene plays", () => {
    const visible = (state: ReturnType<typeof stateAt>, name: string) =>
      (state.get(name)?.opacity ?? 1) > 0.15;
    for (let progress = 0; progress <= 1; progress += 0.005) {
      const state = stateAt(buildingCues, progress);
      const bodies = layerOrder.filter((id) => visible(state, `body-${id}`));
      expect(bodies.length, `progress ${progress.toFixed(3)}`).toBeLessThanOrEqual(1);
      // A title arrives only once the text above it has gone
      layerOrder.slice(1).forEach((id, i) => {
        if (visible(state, `body-${layerOrder[i]}`)) {
          expect(
            state.get(`title-${id}`)?.opacity,
            `${id} at ${progress.toFixed(3)}`,
          ).toBeLessThanOrEqual(0.15);
        }
      });
    }
  });

  it("passes the four layers from the plant up, each saying what it represents", () => {
    render(<Building content={content} />);

    const region = screen.getByRole("region", { name: "Un modelo de la planta en cuatro capas" });
    expect(region).toHaveAttribute("data-surface", "dark");
    const cards = within(region).getAllByRole("heading", { level: 3 }).slice(0, 4);
    expect(cards.map((h) => h.textContent)).toEqual([
      "Física",
      "Red OT",
      "Funcional",
      "Influencias",
    ]);
    (["physical", "network", "functional", "influence"] as const).forEach((id, index) => {
      expect(cards[index]!.nextElementSibling).toHaveTextContent(content.layers[id].body);
    });
    // A learned relation stays a lead, never a proven cause
    expect(cards[3]!.nextElementSibling).toHaveTextContent("no una causa probada");
  });

  it("describes the product as it is today, without a name, and links to the demo in a new tab", () => {
    render(<Building content={content} />);

    const product = screen.getByRole("heading", { name: "En un equipo en la planta" })
      .parentElement!.parentElement!;
    expect(product).not.toHaveTextContent("SCADAXIA");
    const available = screen.getByText("Telemetría en tiempo real").closest("ul")!;
    expect(within(available).getAllByRole("listitem")).toHaveLength(6);
    // What is in development stays apart from what is available today
    const next = screen.getByText(content.product.next[0]!).closest("ul")!;
    expect(next).not.toBe(available);
    expect(within(next).getAllByRole("listitem")).toHaveLength(content.product.next.length);
    const demo = within(product).getByRole("link", { name: "Ver la demo" });
    expect(demo).toHaveAttribute("href", "https://demo.atlaxia.es");
    expect(demo).toHaveAttribute("target", "_blank");
  });

  it("ends with how it comes into a plant, the last steps looping back as it improves", () => {
    const { container } = render(<Building content={content} />);

    const steps = within(screen.getByRole("list", { name: "Cómo llega ATLAXIA a una planta" }))
      .getAllByRole("listitem")
      .map((step) => step.textContent);
    expect(steps).toHaveLength(4);
    expect(steps[1]).toContain("Nos conectamos a su red OT");
    expect(steps[3]).toContain(content.method.steps.run.description);
    expect(
      Array.from(container.querySelectorAll("[data-loop]"), (el) => el.getAttribute("data-loop")),
    ).toEqual(["", "start", "end"]);
  });
});

describe("About", () => {
  const content = dictionaries.es.about;
  let io: ReturnType<typeof mockIntersectionObserver>;

  beforeEach(() => {
    io = mockIntersectionObserver();
  });
  afterEach(() => io.restore());

  it("tells the origin in chapters, each paragraph opening with its summary", () => {
    render(<About content={content} />);

    const region = screen.getByRole("region", { name: content.title });
    expect(region).toHaveTextContent(content.statement);
    const index = screen.getByRole("navigation", { name: content.chaptersLabel });
    expect(
      within(index)
        .getAllByRole("link")
        .map((l) => l.textContent),
    ).toEqual(["01Origen", "02TRUEDATA", "03ATLAXIA", "04Equipo"]);
    expect(
      within(region)
        .getAllByRole("heading", { level: 3 })
        .map((h) => h.textContent),
    ).toEqual([
      "Un equipo que viene de la investigación",
      "Probado en el agua antes de ser empresa",
      "Del proyecto al producto",
      "Equipo fundador",
    ]);
    for (const chapter of Object.values(content.chapters)) {
      for (const paragraph of chapter.paragraphs) {
        expect(region).toHaveTextContent(`${paragraph.lead} ${paragraph.text}`);
      }
    }
  });

  it("closes with the founding team: role, name and profile", () => {
    render(<About content={content} />);

    const members = within(screen.getByRole("list", { name: content.teamLabel })).getAllByRole(
      "listitem",
    );
    expect(members.map((m) => m.textContent)).toEqual([
      "CEOJuan Miguel Navarro RuizCatedrático de Telecomunicación",
      "CTO y desarrollo de IADavid Palazón PalauDoctorando en Telecomunicación",
      "CMO y desarrollo full-stackJorge Arcas VerdejoEstudiante de Ingeniería Informática",
    ]);
  });
});

describe("Edge", () => {
  it("reads the headline once and describes the unit; the paper copy stays hidden", () => {
    const { container } = render(<Edge content={dictionaries.es.edge} />);

    const region = screen.getByRole("region", {
      name: "Todo el software funciona en un equipo instalado en la planta.",
    });
    expect(within(region).getAllByRole("heading")).toHaveLength(1);
    expect(within(region).getByRole("img")).toHaveAccessibleName(dictionaries.es.edge.alt);
    expect(region).toHaveTextContent(dictionaries.es.edge.lede);
    // The knockout copy repeats the words for the eye only.
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
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
