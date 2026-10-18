import type { CSSProperties, ReactNode } from "react";
import { CueElement } from "@/components/storytelling/ChoreographedScene";
import type { Dictionary } from "@/content";
import { cx } from "@/lib/cx";
import type { ChartLayer } from "./cues";
import {
  EXPECTED_SPREAD,
  MARKER_AT,
  OPERATOR_LIMIT,
  TAGS,
  at,
  bandPath,
  illustration,
  layout,
  linePath,
  type Layout,
} from "./illustration";
import styles from "./CoherenceChart.module.css";

type ChartContent = Dictionary["capabilities"]["chart"];

const data = illustration();
const drawings = [layout("wide"), layout("narrow")] as const;
const hoursWide = [0, 6, 12, 18, 24];
const hoursNarrow = [0, 12, 24];

/** "LT-101 · nivel del depósito": the tag stays out of the translated copy. */
const tagged = (tag: string, name: string) => `${tag} · ${name}`;

type Draw = (l: Layout, c: ChartContent) => ReactNode;

/**
 * One sheet of the chart, drawn twice (beside the steps and on phones) so
 * labels keep their size. The scene fades whole sheets in.
 */
function Sheet({ name, draw, content }: { name?: string; draw: Draw; content: ChartContent }) {
  const svgs = drawings.map((l) => (
    <svg
      key={l.narrow ? "narrow" : "wide"}
      className={l.narrow ? styles.narrow : styles.wide}
      viewBox={`0 0 ${l.width} ${l.height}`}
      focusable="false"
    >
      {draw(l, content)}
    </svg>
  ));
  return name ? (
    <CueElement name={name} className={styles.sheet}>
      {svgs}
    </CueElement>
  ) : (
    <div className={styles.sheet}>{svgs}</div>
  );
}

const base: Draw = (l, c) => {
  const { box } = l.main;
  const hours = l.narrow ? hoursNarrow : hoursWide;
  return (
    <>
      <line
        className={styles.axis}
        x1={box.x}
        x2={box.x + box.w}
        y1={box.y + box.h}
        y2={box.y + box.h}
      />
      {hours.map((h, i) => (
        <text
          key={h}
          className={styles.tick}
          x={box.x + (h / 24) * box.w}
          y={box.y + box.h + 16}
          textAnchor={i === 0 ? "start" : i === hours.length - 1 ? "end" : "middle"}
        >
          {`${String(h).padStart(2, "0")}:00`}
        </text>
      ))}
      <text className={cx(styles.label, styles.strong)} x={box.x} y={box.y - 8}>
        {tagged(TAGS.level, c.signals.level)}
      </text>
    </>
  );
};

const measured: Draw = (l) => (
  <path className={styles.measured} d={linePath(data.t, data.measured, l.main)} />
);

const layers: Record<ChartLayer, Draw> = {
  // The plant as a system: the pump, the outflow and the guides where they change
  system: (l, c) => {
    const { main, pump, outflow } = l;
    const first = main.box.x + data.transitions[0]! * main.box.w;
    return (
      <>
        <text className={styles.label} x={pump.box.x} y={pump.box.y - 8}>
          {tagged(TAGS.pump, c.signals.pump)}
        </text>
        <path className={styles.context} d={linePath(data.t, data.pump, pump, true)} />
        <text className={styles.label} x={outflow.box.x} y={outflow.box.y - 8}>
          {tagged(TAGS.outflow, c.signals.outflow)}
        </text>
        <path className={styles.context} d={linePath(data.t, data.outflow, outflow)} />
        {data.transitions.map((x) => {
          const gx = main.box.x + x * main.box.w;
          return (
            <line
              key={x}
              className={styles.guide}
              x1={gx}
              x2={gx}
              y1={main.box.y}
              y2={outflow.box.y + outflow.box.h}
            />
          );
        })}
        {l.narrow ? (
          <text
            className={cx(styles.label, styles.accent)}
            x={main.box.x}
            y={outflow.box.y + outflow.box.h + 22}
          >
            {c.notes.coherenceShort}
          </text>
        ) : (
          <text className={cx(styles.label, styles.accent)} x={first + 6} y={main.box.y + 12}>
            {c.notes.coherence}
          </text>
        )}
      </>
    );
  },
  normal: (l) => (
    <>
      <path className={styles.band} d={bandPath(data.t, data.expected, EXPECTED_SPREAD, l.main)} />
      <path className={styles.expected} d={linePath(data.t, data.expected, l.main)} />
    </>
  ),
  mismatch: (l, c) => {
    const { main, pump, outflow } = l;
    const x0 = main.box.x + data.anomaly[0] * main.box.w;
    const x1 = main.box.x + data.anomaly[1] * main.box.w;
    const limit = at(main, 0, OPERATOR_LIMIT).y;
    return (
      <>
        <rect
          className={styles.anomaly}
          x={x0}
          y={main.box.y}
          width={x1 - x0}
          height={main.box.h}
        />
        <rect
          className={styles.usual}
          x={x0}
          y={pump.box.y}
          width={x1 - x0}
          height={outflow.box.y + outflow.box.h - pump.box.y}
        />
        <line
          className={styles.limit}
          x1={main.box.x}
          x2={main.box.x + main.box.w}
          y1={limit}
          y2={limit}
        />
        <text className={styles.label} x={main.box.x + main.box.w} y={limit - 6} textAnchor="end">
          {c.notes.limit}
        </text>
        <text
          className={cx(styles.label, styles.alert)}
          x={x0 - 6}
          y={main.box.y + main.box.h - 10}
          textAnchor="end"
        >
          {c.notes.anomaly}
        </text>
        {l.narrow ? null : (
          <text
            className={styles.label}
            x={main.box.x + main.box.w}
            y={pump.box.y - 8}
            textAnchor="end"
          >
            {c.notes.usual}
          </text>
        )}
      </>
    );
  },
  where: (l, c) => {
    const i = Math.round(MARKER_AT * (data.t.length - 1));
    const p = at(l.main, data.t[i]!, data.measured[i]!);
    return (
      <>
        <circle className={styles.marker} cx={p.x} cy={p.y} r={5} />
        <text className={cx(styles.label, styles.alert)} x={p.x} y={p.y - 12} textAnchor="middle">
          {c.notes.here}
        </text>
      </>
    );
  },
};

export type CoherenceChartProps = {
  content: ChartContent;
  className?: string;
};

/**
 * Illustration of a pumping station over one day, in sheets the scene lays
 * down one by one: the level, the pump and outflow that move with it, the
 * expected range, the anomaly and where it is. Inside a CueSnapshot it
 * renders any step statically.
 */
export function CoherenceChart({ content, className }: CoherenceChartProps) {
  const ratios = {
    "--wide-ratio": `${drawings[0].width} / ${drawings[0].height}`,
    "--narrow-ratio": `${drawings[1].width} / ${drawings[1].height}`,
  } as CSSProperties;

  return (
    <figure className={cx(styles.figure, className)}>
      <div className={styles.frame}>
        <div className={styles.sheets} style={ratios} role="img" aria-label={content.description}>
          <Sheet draw={base} content={content} />
          {(["system", "normal", "mismatch"] as const).map((id) => (
            <Sheet key={id} name={`layer-${id}`} draw={layers[id]} content={content} />
          ))}
          <Sheet draw={measured} content={content} />
          <Sheet name="layer-where" draw={layers.where} content={content} />
        </div>
      </div>
      <figcaption className={styles.caption}>
        <span className={styles.captionLabel}>{content.label}</span>
        <CueElement name="levels" className={styles.levels}>
          <ul role="list" aria-label={content.levelsLabel} className={styles.chips}>
            <li className={cx(styles.chip, styles.hot)}>
              {tagged(TAGS.level, content.levels.sensor)} <b>4</b>
            </li>
            <li className={styles.chip}>
              {content.levels.process} <b>3</b>
            </li>
            <li className={styles.chip}>
              {content.levels.plant} <b>2</b>
            </li>
          </ul>
        </CueElement>
      </figcaption>
    </figure>
  );
}
