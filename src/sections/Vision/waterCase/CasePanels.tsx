import type { CSSProperties } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Tag } from "@/components/primitives/Tag";
import type { Dictionary } from "@/content";
import {
  bandPath,
  caseTrend,
  linePath,
  pressureCase,
  sparkline,
  THRESHOLD,
  type CaseSignal,
} from "./waterCase";
import styles from "./WaterCase.module.css";

type CaseContent = Dictionary["vision"]["waterCase"];

const tags: Record<CaseSignal, string> = {
  level: "LT-101",
  pressure: "PT-102",
  flow: "FT-103",
  vibration: "VT-104",
  energy: "JT-105",
};

/** Trend word with its arrow, for the related signals. */
export function TrendNote({ signal, content }: { signal: CaseSignal; content: CaseContent }) {
  const trend = caseTrend[signal];
  const Icon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus;
  const word =
    trend === "up"
      ? content.status.up
      : trend === "down"
        ? content.status.down
        : content.status.stable;
  return (
    <span className={styles.trend} data-trend={trend}>
      <Icon aria-hidden="true" />
      {word}
    </span>
  );
}

// ---------------------------------------------------------------------------
// SCADA view: every signal against its threshold, all normal
// ---------------------------------------------------------------------------

const scadaOrder: CaseSignal[] = ["level", "pressure", "flow", "energy", "vibration"];

export function ScadaList({ content }: { content: CaseContent }) {
  return (
    <div className={styles.panel}>
      <p className={styles.panelTitle}>{content.scadaTitle}</p>
      <ul role="list" className={styles.rows}>
        {scadaOrder.map((signal) => (
          <li key={signal} className={styles.row}>
            <span className={styles.rowName}>{content.signals[signal]}</span>
            <span className={styles.rowTag}>{tags[signal]}</span>
            <Tag tone="normal">{content.status.normal}</Tag>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Discharge pressure: measured, threshold, expected, detection, projection
// ---------------------------------------------------------------------------

const CW = 520;
const CH = 280;
const X0 = 8;
const X1 = 512;
const Y0 = 16;
const Y1 = 252;
// Values live between 0.15 and 0.85: normalize them to the plot box
const norm = <T extends { t: number; v: number }>(p: T) => ({ ...p, v: (p.v - 0.15) / 0.7 });
const xAt = (t: number) => X0 + t * (X1 - X0);
const yAt = (v: number) => Y1 - ((v - 0.15) / 0.7) * (Y1 - Y0);
const pct = (x: number, y: number) =>
  ({ left: `${(x / CW) * 100}%`, top: `${(y / CH) * 100}%` }) as CSSProperties;

type PressureTrendProps = {
  content: CaseContent;
  showExpected?: boolean;
  showDetection?: boolean;
  showDecision?: boolean;
};

export function PressureTrend({
  content,
  showExpected = false,
  showDetection = false,
  showDecision = false,
}: PressureTrendProps) {
  const data = pressureCase();
  const measured = data.measured.map(norm);
  const expected = data.expected.map(norm);
  const projection = data.projection.map(norm);
  const last = data.measured[data.measured.length - 1]!;
  const review = { t: data.detection.t + 0.07 };

  return (
    <div className={styles.panel}>
      <div className={styles.chartHead}>
        <p className={styles.panelTitle}>
          {content.signals.pressure} <span className={styles.rowTag}>{tags.pressure}</span>
        </p>
        <ul role="list" className={styles.legend}>
          <li data-key="measured">{content.chart.measured}</li>
          {showExpected ? <li data-key="expected">{content.chart.expected}</li> : null}
          <li data-key="threshold">{content.chart.threshold}</li>
        </ul>
      </div>

      <div className={styles.chart}>
        <svg viewBox={`0 0 ${CW} ${CH}`} className={styles.chartSvg} aria-hidden="true">
          <path d={`M${X0} ${Y1} H${X1}`} className={styles.axis} />
          <path d={`M${X0} ${yAt(THRESHOLD)} H${X1}`} className={styles.threshold} />
          {showExpected ? (
            <>
              <path
                d={bandPath(expected, data.band / 0.7, X0, X1, Y0, Y1)}
                className={styles.band}
              />
              <path d={linePath(expected, X0, X1, Y0, Y1)} className={styles.expected} />
            </>
          ) : null}
          {showDecision ? (
            <>
              <path d={linePath(projection, X0, X1, Y0, Y1)} className={styles.projection} />
              <circle
                cx={xAt(data.crossing.t)}
                cy={yAt(data.crossing.v)}
                r={6}
                className={styles.alarm}
              />
              <path d={`M${xAt(review.t)} ${Y0} V${Y1}`} className={styles.reviewLine} />
            </>
          ) : null}
          <path d={linePath(measured, X0, X1, Y0, Y1)} className={styles.measured} />
          <circle cx={xAt(last.t)} cy={yAt(last.v)} r={4} className={styles.now} />
          {showDetection ? (
            <>
              <path d={`M${xAt(data.detection.t)} ${Y0} V${Y1}`} className={styles.detectionLine} />
              <circle
                cx={xAt(data.detection.t)}
                cy={yAt(data.detection.v)}
                r={7}
                className={styles.detection}
              />
            </>
          ) : null}
        </svg>

        {/* Notes on the chart, in HTML so they stay readable */}
        <span
          className={styles.chartNote}
          data-tone="muted"
          style={pct(X1, yAt(THRESHOLD) + 6)}
          data-align="end"
        >
          {content.chart.threshold}
        </span>
        {showDetection ? (
          <span
            className={styles.chartNote}
            data-tone="deviation"
            style={pct(xAt(data.detection.t) - 8, Y0)}
            data-align="end"
          >
            {content.chart.detection}
          </span>
        ) : null}
        {showDecision ? (
          <>
            <span
              className={styles.chartNote}
              data-tone="ink"
              style={pct(xAt(review.t) + 8, Y0 + 30)}
            >
              {content.chart.review}
            </span>
            <span
              className={styles.chartNote}
              data-tone="muted"
              style={pct(xAt(data.crossing.t) - 8, yAt(THRESHOLD) - 34)}
              data-align="end"
            >
              {content.chart.projection}
            </span>
          </>
        ) : null}
        <span
          className={styles.chartNote}
          data-tone="muted"
          style={pct(X1, Y1 + 6)}
          data-align="end"
        >
          {content.chart.time}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Related signals: the ones that move together, and the one that does not
// ---------------------------------------------------------------------------

const relatedOrder: CaseSignal[] = ["pressure", "flow", "energy", "vibration", "level"];

export function RelatedList({ content }: { content: CaseContent }) {
  return (
    <div className={styles.panel}>
      <p className={styles.panelTitle}>{content.relatedTitle}</p>
      <ul role="list" className={styles.rows}>
        {relatedOrder.map((signal) => {
          const { expected, measured } = sparkline(signal);
          const moving = caseTrend[signal] !== "stable";
          return (
            <li key={signal} className={styles.row} data-moving={moving ? "" : undefined}>
              <span className={styles.rowName}>{content.signals[signal]}</span>
              <svg viewBox="0 0 160 40" className={styles.spark} aria-hidden="true">
                <path d={bandPath(expected, 0.09, 2, 158, 2, 38)} className={styles.band} />
                <path d={linePath(measured, 2, 158, 2, 38)} className={styles.measured} />
              </svg>
              <TrendNote signal={signal} content={content} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The alert as the team receives it, with the slots still to come
// ---------------------------------------------------------------------------

type CaseCardProps = {
  card: Dictionary["vision"]["direction"]["card"];
  content: CaseContent;
};

export function CaseCard({ card, content }: CaseCardProps) {
  const related: CaseSignal[] = ["pressure", "flow", "energy", "vibration"];
  return (
    <article className={styles.card}>
      <header className={styles.cardHead}>
        <Tag tone="medium">{content.status.deviation}</Tag>
        <h4 className={styles.cardTitle}>{card.title}</h4>
      </header>
      <dl className={styles.cardFields}>
        <div>
          <dt>{card.where}</dt>
          <dd>{card.whereValue}</dd>
        </div>
        <div>
          <dt>{card.related}</dt>
          <dd className={styles.chips}>
            {related.map((signal) => (
              <span key={signal} className={styles.chip}>
                {content.signals[signal]}
              </span>
            ))}
          </dd>
        </div>
      </dl>
      <div className={styles.slots}>
        <div className={styles.slot}>{card.why}</div>
        <div className={styles.slot}>{card.what}</div>
      </div>
    </article>
  );
}
