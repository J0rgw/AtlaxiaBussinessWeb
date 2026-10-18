import type { ReactNode } from "react";
import { CueElement } from "@/components/storytelling/ChoreographedScene";
import { introTimeline } from "@/components/storytelling/SectionIntro";
import type { Dictionary } from "@/content";
import type { Cue } from "@/lib/choreography/choreography";
import { layerOrder, type LayerId } from "./layers";
import styles from "./IntroFigure.module.css";

type Layers = Dictionary["building"]["layers"];

/*
  The four layers as sheets: three describe the plant and stack up from the
  bottom (first sentence); the fourth, the one the model learns, rises above
  them in the accent, held by posts (second). The plan that follows lays the
  same sheets over one station.
*/

const W = 360;
const H = 300;
const DEPTH = 52;
const SKEW = 64;
const LEFT = 120;
const WIDTH = 176;
const BASE = { physical: 272, network: 226, functional: 180, influence: 104 } as const;

const sheetPath = (y: number) =>
  `M${LEFT} ${y}H${LEFT + WIDTH}L${LEFT + WIDTH + SKEW} ${y - DEPTH}H${LEFT + SKEW}Z`;

/** Nodes on the learned sheet, in sheet coordinates (0 to 1 across, 0 to 1 deep). */
const nodes = [
  [0.18, 0.3],
  [0.45, 0.7],
  [0.62, 0.25],
  [0.86, 0.62],
] as const;
const edges = [
  [0, 1],
  [1, 2],
  [2, 3],
  [1, 3],
] as const;
const onSheet = ([u, v]: readonly [number, number], y: number) =>
  [LEFT + u * WIDTH + v * SKEW, y - v * DEPTH] as const;

function Sheet({ name, children }: { name: string; children: ReactNode }) {
  return (
    <CueElement name={name} className={styles.sheet}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} focusable="false">
        {children}
      </svg>
    </CueElement>
  );
}

export function IntroFigure({ layers }: { layers: Layers }) {
  const label = (id: LayerId) => (
    <text
      className={id === "influence" ? styles.labelLearned : styles.label}
      x={LEFT - 12}
      y={BASE[id] - 6}
      textAnchor="end"
    >
      {layers[id].name}
    </text>
  );
  return (
    <div className={styles.figure} style={{ aspectRatio: `${W} / ${H}` }}>
      {/* The four places, in outline from the start */}
      <div className={styles.sheet}>
        <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} focusable="false">
          {layerOrder.map((id) => (
            <path key={id} className={styles.ghost} d={sheetPath(BASE[id])} />
          ))}
        </svg>
      </div>
      {layerOrder
        .filter((id) => id !== "influence")
        .map((id) => (
          <Sheet key={id} name={`fig-${id}`}>
            <path className={styles.plane} d={sheetPath(BASE[id])} />
            {label(id)}
          </Sheet>
        ))}
      <Sheet name="fig-influence">
        {/* Posts from the top described sheet up to the learned one */}
        {nodes.map((node, i) => {
          const [x, y] = onSheet(node, BASE.influence);
          const [, y2] = onSheet(node, BASE.functional);
          return <path key={i} className={styles.post} d={`M${x} ${y}V${y2}`} />;
        })}
        <path className={styles.learned} d={sheetPath(BASE.influence)} />
        {edges.map(([a, b]) => {
          const [x1, y1] = onSheet(nodes[a], BASE.influence);
          const [x2, y2] = onSheet(nodes[b], BASE.influence);
          return <path key={`${a}${b}`} className={styles.edge} d={`M${x1} ${y1}L${x2} ${y2}`} />;
        })}
        {nodes.map((node, i) => {
          const [x, y] = onSheet(node, BASE.influence);
          return <circle key={i} className={styles.node} cx={x} cy={y} r={5} />;
        })}
        {label("influence")}
      </Sheet>
    </div>
  );
}

/** Cues of the figure, on the beats of an intro of two sentences. */
export function introFigureCues(): Cue[] {
  const t = introTimeline(2);
  const [s0] = t.beat(0);
  const [s1] = t.beat(1);
  const described = layerOrder.filter((id) => id !== "influence");
  return [
    // First sentence: the three sheets that describe the plant stack up from the bottom
    ...described.map((id, k): Cue => ({
      target: `fig-${id}`,
      at: [s0 + 0.04 * k, s0 + 0.04 * k + 0.06],
      opacity: [0, 1],
      y: [10, 0],
      ease: "out",
    })),
    // Second: the one the model learns rises above them
    { target: "fig-influence", at: [s1, s1 + 0.08], opacity: [0, 1], y: [14, 0], ease: "out" },
  ];
}
