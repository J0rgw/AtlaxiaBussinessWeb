import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import {
  ChoreographedScene,
  CueElement,
  CueSnapshot,
} from "@/components/storytelling/ChoreographedScene";
import type { Cue } from "@/lib/choreography/choreography";
import type { Engine } from "@/lib/choreography/engines/types";
import type { Dictionary } from "@/content";
import type { CSSProperties } from "react";
import { SectionIntro } from "@/components/storytelling/SectionIntro";
import { chapterNumber } from "@/content/shared/sections";
import { IntroFigure, introFigureCues } from "./IntroFigure";
import { InfluenceGraph, PlanBase, PlanLayer, sensorPoints } from "./plan";
import { NodeLabels, type Projection } from "./NodeLabels";
import { layerOrder, type LayerId } from "./layers";
import { Method, ProductToday } from "./shared";
import styles from "./Building.module.css";

type BuildingContent = Dictionary["building"];

/*
  "Láminas superpuestas": one plan of the plant, large, pinned while the
  page scrolls. Beside it, the layers stack up like the sheets do: each one
  arrives with its title large and its text, and when the next arrives it
  shrinks to one line and stays piled above. As a layer arrives, its sheet is
  laid over the plan in two steps and the earlier sheets step back. For the
  last layer the plan tilts back and the influence graph appears on a second
  sheet above it, each node on a post over its instrument: what ATLAXIA adds,
  on its own level.
*/

const LAYERS = layerOrder.length;
const FIRST = 0.1;
const LAST = 0.9;
/** Progress where each layer is centered and read. */
const centerOf = (i: number) => FIRST + ((LAST - FIRST) * i) / (LAYERS - 1);
const HALF = (LAST - FIRST) / (LAYERS - 1) / 2;
const DIM = 0.22;
/** Scale and opacity of a layer's title once the next layer has arrived. */
const SMALL = 0.5;
const SMALL_OPACITY = 0.55;
/** Opacity of the plant's own sheet under the influence graph. */
const UNDER = 0.5;

/** Keeps a stretch inside the scene, so the first and last sheets finish on screen. */
function clamp(from: number, to: number): readonly [number, number] {
  const lo = Math.max(0, Math.min(from, 0.96));
  return [lo, Math.max(lo + 0.03, Math.min(to, 1))];
}

/**
 * The plan tilts back while the last card arrives; the graph follows once it
 * has settled. With this perspective and scale no part of the tilted plan
 * grows past its drawn size, so the rasterized text never gets magnified.
 */
const TILT: readonly [number, number] = [
  centerOf(LAYERS - 1) - HALF * 0.95,
  centerOf(LAYERS - 1) - HALF * 0.3,
];
/** The plan lies almost flat; the graph above it stays more upright. */
const TILT_DEG = 68;
const GRAPH_DEG = 52;
/** Height of the graph over the plan, as a fraction of the sheet's width (also --lift in the CSS). */
const LIFT = 0.18;
/** Final scale and vertical shift (% of the sheet's height) of the tilt. */
const TILT_SCALE = 0.88;
const TILT_SHIFT = -14;
/** transform-origin of the sheet (also in the CSS). */
const ORIGIN = [0.5, 0.62] as const;

const projection: Projection = {
  tiltDeg: TILT_DEG,
  graphDeg: GRAPH_DEG,
  scale: TILT_SCALE,
  shift: TILT_SHIFT,
  lift: LIFT,
  origin: ORIGIN,
};
const ASPECT = 640 / 400;

/**
 * Each post joins an instrument on the plan with its node on the graph. The
 * graph sheet is lifted and then counter-tilted around its own center, so
 * the post's length and angle depend on how far the node is from the
 * center. Lengths in units of the plan's width.
 */
function postFor(y: number) {
  const back = ((TILT_DEG - GRAPH_DEG) * Math.PI) / 180;
  const dy = (y / 100 - 0.5) / ASPECT;
  const rise = dy * (Math.cos(back) - 1);
  const depth = LIFT - dy * Math.sin(back);
  return {
    length: Math.hypot(rise, depth),
    angle: (Math.atan2(depth, rise) * 180) / Math.PI,
  };
}

export const cues: Cue[] = layerOrder.flatMap((id, i): Cue[] => {
  const c = centerOf(i);
  // The text of the layer before shrinks first, then this one's arrives: they never share the column
  const arrive = clamp(c - HALF * 0.5, c - HALF * 0.15);
  const last = i === LAYERS - 1;
  const cues: Cue[] = last
    ? [
        {
          target: "tilt",
          at: TILT,
          rotateX: [0, TILT_DEG],
          scale: [1, TILT_SCALE],
          y: [0, TILT_SHIFT],
        },
        // The plan's own tags give way: the graph's labels carry the names
        { target: "physical-tags", at: TILT, opacity: [1, 0] },
        // Posts and nodes together, then the relations
        ...sensorPoints.flatMap(({ tag }): Cue[] => [
          { target: `post-${tag}`, at: clamp(TILT[1], c), opacity: [0, 1] },
          { target: `label-${tag}`, at: clamp(TILT[1], c), opacity: [0, 1] },
        ]),
        { target: `${id}-first`, at: clamp(TILT[1], c), opacity: [0, 1] },
        { target: `${id}-then`, at: clamp(c, c + HALF * 0.45), opacity: [0, 1] },
      ]
    : [
        // Each layer in two steps: first its frame (processes, devices...), then its detail
        { target: `${id}-first`, at: clamp(c - HALF * 0.6, c - HALF * 0.1), opacity: [0, 1] },
        { target: `${id}-then`, at: clamp(c - HALF * 0.1, c + HALF * 0.35), opacity: [0, 1] },
      ];
  if (id === "physical") {
    cues.push({
      target: "physical-tags",
      at: clamp(c - HALF * 0.1, c + HALF * 0.35),
      opacity: [0, 1],
    });
  }
  // The layer's text arrives large (the first one is there from the start)
  if (i > 0) {
    cues.push({ target: `title-${id}`, at: arrive, opacity: [0, 1], y: [30, 0], ease: "out" });
    cues.push({ target: `body-${id}`, at: arrive, opacity: [0, 1], y: [12, 0], ease: "out" });
  }
  if (i > 0 && !last) {
    cues.push({ target: `sheet-${id}`, at: arrive, opacity: [0, 1], x: [4, 0], ease: "out" });
  }
  if (!last) {
    const next = centerOf(i + 1);
    const shrink = clamp(next - HALF * 0.95, next - HALF * 0.55);
    // When the next layer arrives, this one shrinks to a line and stays stacked above
    cues.push({
      target: `title-${id}`,
      at: shrink,
      scale: [1, SMALL],
      opacity: [1, SMALL_OPACITY],
    });
    cues.push({ target: `body-${id}`, at: shrink, opacity: [1, 0], y: [0, -8] });
    cues.push({
      target: `sheet-${id}`,
      at: [next - HALF * 0.9, next - HALF * 0.4],
      opacity: [1, DIM],
    });
    // Under the graph the plan stays at half light; only the instruments, which hold the posts, come back some
    if (id === "physical") {
      cues.push({
        target: `sheet-${id}`,
        at: [TILT[1], centerOf(LAYERS - 1)],
        opacity: [DIM, UNDER],
      });
    }
  }
  return cues;
});

/** The chapter cover: the layers stack up while the lead is read. */
const introCues = introFigureCues();

const flatLayers = layerOrder.filter(
  (id): id is Exclude<LayerId, "influence"> => id !== "influence",
);

function Plan({ content }: { content: BuildingContent }) {
  return (
    <div className={styles.space} aria-hidden="true">
      <CueElement name="tilt" className={styles.sheetBox}>
        <div className={styles.full}>
          <PlanBase plan={content.plan} sketch={content.sketch} />
        </div>
        {flatLayers.map((id) => (
          <CueElement key={id} name={`sheet-${id}`} className={styles.full}>
            {(["first", "then"] as const).map((part) => (
              <CueElement key={part} name={`${id}-${part}`} className={styles.full}>
                <PlanLayer layer={id} plan={content.plan} part={part} />
              </CueElement>
            ))}
            {id === "physical" ? (
              <CueElement name="physical-tags" className={styles.full}>
                <PlanLayer layer={id} plan={content.plan} part="tags" />
              </CueElement>
            ) : null}
          </CueElement>
        ))}
        {/* Posts from each instrument up to its node; they stand up out of the plan */}
        <div className={styles.posts}>
          {sensorPoints.map(({ tag, x, y }) => {
            const { length, angle } = postFor(y);
            // The post stands up with its own transform; the cue only fades the line inside
            return (
              <div
                key={tag}
                className={styles.post}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  height: `calc(var(--w) * ${length.toFixed(4)})`,
                  transform: `rotateX(${angle.toFixed(2)}deg)`,
                }}
              >
                <CueElement name={`post-${tag}`} className={styles.postLine} />
              </div>
            );
          })}
        </div>
        {/* The second sheet, lifted above the plan and tilted back less than it */}
        <div
          className={styles.lift}
          style={{ transform: `translateZ(var(--lift)) rotateX(${GRAPH_DEG - TILT_DEG}deg)` }}
        >
          {(["first", "then"] as const).map((part) => (
            <CueElement key={part} name={`influence-${part}`} className={styles.full}>
              <InfluenceGraph part={part} />
            </CueElement>
          ))}
        </div>
      </CueElement>
      <NodeLabels labels={sensorPoints} projection={projection} sheet="tilt" />
    </div>
  );
}

/** What the layer represents, in one short text (static version). */
function LayerCard({ content, id }: { content: BuildingContent; id: LayerId }) {
  const layer = content.layers[id];
  return (
    <>
      <h3 className={styles.staticTitle}>{layer.name}</h3>
      <p className={styles.staticBody}>{layer.body}</p>
    </>
  );
}

export type BuildingProps = {
  content: BuildingContent;
  engine?: Engine;
};

export function Building({ content, engine }: BuildingProps) {
  return (
    <Section id="building" labelledBy="building-title" tone="dark" className={styles.section}>
      <SectionIntro
        titleId="building-title"
        index={chapterNumber("building")}
        eyebrow={content.eyebrow}
        title={content.title}
        emphasis={content.intro.emphasis}
        beats={content.intro.beats}
        figure={<IntroFigure layers={content.layers} />}
        figureCues={introCues}
        length={2.5}
      />
      <ChoreographedScene
        cues={cues}
        length={5}
        engine={engine}
        stageClassName={styles.stage}
        fallback={<Fallback content={content} />}
      >
        <ol role="list" className={styles.stack}>
          {layerOrder.map((id, i) => (
            // Each layer has its slot; only its title's scale and its body's opacity change
            <li key={id} className={styles.card} style={{ "--slot-index": i } as CSSProperties}>
              <CueElement as="h3" name={`title-${id}`} className={styles.cardTitle}>
                {content.layers[id].name}
              </CueElement>
              <CueElement as="p" name={`body-${id}`} className={styles.cardBody}>
                {content.layers[id].body}
              </CueElement>
            </li>
          ))}
        </ol>
        <div className={styles.plan}>
          <Plan content={content} />
          <p className="visually-hidden">{content.plan.description}</p>
        </div>
      </ChoreographedScene>
      <Container>
        <ProductToday content={content} />
        <Method content={content} />
      </Container>
    </Section>
  );
}

/** Reduced motion and no JavaScript: the four layers, then every sheet laid down. */
function Fallback({ content }: { content: BuildingContent }) {
  return (
    <Container className={styles.static}>
      <ol role="list" className={styles.staticCards}>
        {layerOrder.map((id) => (
          <li key={id} className={styles.staticCard}>
            <LayerCard content={content} id={id} />
          </li>
        ))}
      </ol>
      <CueSnapshot cues={cues} progress={1}>
        <Plan content={content} />
      </CueSnapshot>
      <p className="visually-hidden">{content.plan.description}</p>
    </Container>
  );
}
