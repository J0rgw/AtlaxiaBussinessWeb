import { describe, expect, it } from "vitest";
import { createPlayer, type Timeline } from "./player";

function sheet(markup: string) {
  const host = document.createElement("div");
  host.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg">${markup}</svg>`;
  return host.querySelector("svg")!;
}

describe("anatomy player", () => {
  it("holds the first and last keys outside a track and hides what is fully transparent", () => {
    const svg = sheet(`<g data-g="pump"></g>`);
    const timeline: Timeline = {
      v: 1,
      tracks: [
        {
          s: '[data-g~="pump"]',
          o: [
            [0.2, 0],
            [0.4, 1],
          ],
          e: "l",
        },
      ],
    };
    const player = createPlayer(svg, timeline);
    const pump = svg.querySelector<SVGGElement>("g")!;

    player.seek(0);
    expect(pump.style.display).toBe("none");
    player.seek(0.3);
    expect(Number(pump.style.opacity)).toBeCloseTo(0.5);
    player.seek(1);
    expect(pump.style.opacity).toBe("1");
    expect(pump.style.display).toBe("");
  });

  it("reveals parts in the order of their position along a line", () => {
    const svg = sheet(`<g data-g="line" data-at="0"></g><g data-g="line" data-at="1"></g>`);
    const player = createPlayer(svg, {
      v: 1,
      tracks: [{ s: '[data-g~="line"]', rv: [0, 1, 0.1] }],
    });
    const [first, last] = Array.from(svg.querySelectorAll<SVGGElement>("g"));

    player.seek(0.5);
    expect(first!.style.opacity).toBe("1");
    expect(last!.style.display).toBe("none");
    player.seek(1);
    expect(last!.style.opacity).toBe("1");
  });

  it("keeps a draw-on mask only while it draws: hidden before, lifted once complete", () => {
    const svg = sheet(
      `<defs><mask id="m"><path class="fx-draw" data-g="rel" pathLength="1" d="M0 0L10 0"/></mask></defs>` +
        `<path class="fx-relation" mask="url(#m)" d="M0 0L10 0"/>`,
    );
    const player = createPlayer(svg, {
      v: 1,
      tracks: [
        {
          s: '.fx-draw[data-g~="rel"]',
          dr: [
            [0.2, 0],
            [0.6, 1],
          ],
          e: "l",
        },
      ],
    });
    const draw = svg.querySelector<SVGPathElement>(".fx-draw")!;
    const relation = svg.querySelector<SVGPathElement>(".fx-relation")!;

    player.seek(0);
    expect(relation.style.display).toBe("none");
    player.seek(0.4);
    expect(draw.style.strokeDashoffset).toBe("0.5");
    expect(relation.style.display).toBe("");
    expect(relation.getAttribute("mask")).toBe("url(#m)");
    player.seek(1);
    expect(relation.getAttribute("mask")).toBe("none");
    player.seek(0.3);
    expect(relation.getAttribute("mask")).toBe("url(#m)");
  });

  it("morphs a path through a set of shapes by a fractional index", () => {
    const svg = sheet(`<g data-g="slab"><path d="M0 0L10 0"/></g>`);
    const timeline: Timeline = {
      v: 1,
      tracks: [
        {
          s: '[data-g~="slab"]',
          mo: 0,
          k: [
            [0, 0],
            [1, 2],
          ],
          e: "l",
        },
      ],
      morphs: [[["M0 0L10 0"], ["M0 0L20 0"], ["M0 0L40 0"]]],
    };
    const player = createPlayer(svg, timeline);
    const path = svg.querySelector("path")!;

    player.seek(0.25);
    expect(path.getAttribute("d")).toBe("M0 0L15 0");
    player.seek(0.75);
    expect(path.getAttribute("d")).toBe("M0 0L30 0");
  });

  it("zooms about the focus in log space", () => {
    const svg = sheet(`<g data-cam="L1"></g>`);
    const timeline: Timeline = {
      v: 1,
      tracks: [
        {
          s: '[data-cam="L1"]',
          cam: {
            f: [500, 500],
            base: 1,
            k: [
              [0, 4],
              [1, 1],
            ],
          },
        },
      ],
    };
    const player = createPlayer(svg, timeline);
    const level = svg.querySelector("g")!;

    // Halfway in log space between 4 and 1 is 2
    player.seek(0.5);
    expect(level.getAttribute("transform")).toBe("matrix(2 0 0 2 -500 -500)");
  });

  it("drives the repeating motions by progress too, so they stand still with the page", () => {
    const svg = sheet(`<g data-g="fan"></g><path class="fx-flow" data-o="3" d="M0 0L10 0"/>`);
    const timeline: Timeline = {
      v: 1,
      span: 2,
      tracks: [],
      loops: [
        { s: '[data-g="fan"]', spin: 4 },
        { s: ".fx-flow", flow: 5 },
      ],
    };
    const player = createPlayer(svg, timeline);
    const fan = svg.querySelector("g")!;
    const flow = svg.querySelector("path")!;

    // Half the progress is one second of motion: a quarter turn, 5 units of flow
    player.seek(0.5);
    expect(fan.getAttribute("transform")).toBe("rotate(90)");
    expect(flow.style.strokeDashoffset).toBe("-2");
    player.seek(0.5);
    expect(fan.getAttribute("transform")).toBe("rotate(90)");
    player.seek(0);
    expect(fan.getAttribute("transform")).toBe("rotate(0)");
  });
});
