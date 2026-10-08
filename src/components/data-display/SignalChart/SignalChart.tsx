import { cx } from "@/lib/cx";
import styles from "./SignalChart.module.css";

export type SignalSeries = {
  id: string;
  values: number[];
  /** Fixed color meaning (tokens.css): observed ink, expected cobalt, context neutral. */
  role?: "observed" | "expected" | "context";
};

export type SignalChartProps = {
  series: SignalSeries[];
  /** Expected range drawn as a band (same length as the series). */
  band?: { upper: number[]; lower: number[] };
  /** Points to mark as deviations: index in the series and series id. */
  deviations?: Array<{ seriesId: string; index: number }>;
  /** Value range of the vertical axis. Defaults to the data range with some margin. */
  domain?: [number, number];
  width?: number;
  height?: number;
  /** Text alternative describing what the chart shows. */
  description: string;
  /** Visible legend entries, in order. Omit for no legend. */
  legend?: Array<{
    key: "observed" | "expected" | "band" | "deviation" | "context";
    label: string;
  }>;
  className?: string;
};

const PAD = { top: 12, right: 8, bottom: 12, left: 8 };

/** Signals over time, with an optional expected band and deviation markers. */
export function SignalChart({
  series,
  band,
  deviations = [],
  domain,
  width = 640,
  height = 280,
  description,
  legend,
  className,
}: SignalChartProps) {
  const all = [...series.flatMap((s) => s.values), ...(band ? [...band.upper, ...band.lower] : [])];
  const [min, max] = domain ?? padDomain(Math.min(...all), Math.max(...all));
  const count = Math.max(...series.map((s) => s.values.length), band?.upper.length ?? 0);
  const x = (i: number) => PAD.left + (i / Math.max(1, count - 1)) * (width - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + ((max - v) / (max - min)) * (height - PAD.top - PAD.bottom);
  const line = (values: number[]) =>
    values.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");

  const bandPath = band
    ? `${line(band.upper)} ${band.lower
        .map((v, i) => ({ v, i }))
        .reverse()
        .map(({ v, i }) => `L ${x(i).toFixed(1)} ${y(v).toFixed(1)}`)
        .join(" ")} Z`
    : null;

  const byId = new Map(series.map((s) => [s.id, s]));
  const gridLines = [0.25, 0.5, 0.75].map((f) => PAD.top + f * (height - PAD.top - PAD.bottom));

  return (
    <figure className={cx(styles.chart, className)}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={description}>
        {gridLines.map((gy) => (
          <line key={gy} x1={0} x2={width} y1={gy} y2={gy} className={styles.grid} />
        ))}
        {bandPath ? <path d={bandPath} className={styles.band} /> : null}
        {series.map((s) => (
          <path key={s.id} d={line(s.values)} className={styles[s.role ?? "context"]} />
        ))}
        {deviations.map(({ seriesId, index }) => {
          const value = byId.get(seriesId)?.values[index];
          if (value === undefined) return null;
          return (
            <g key={`${seriesId}-${index}`}>
              <circle cx={x(index)} cy={y(value)} r={9} className={styles.deviationHalo} />
              <circle cx={x(index)} cy={y(value)} r={4} className={styles.deviation} />
            </g>
          );
        })}
      </svg>
      {legend ? (
        <figcaption className={styles.legend}>
          {legend.map((entry) => (
            <span key={entry.key} className={styles.legendItem}>
              <span
                className={cx(styles.swatch, styles[`swatch-${entry.key}`])}
                aria-hidden="true"
              />
              {entry.label}
            </span>
          ))}
        </figcaption>
      ) : null}
    </figure>
  );
}

function padDomain(min: number, max: number): [number, number] {
  const pad = (max - min) * 0.12 || 1;
  return [min - pad, max + pad];
}
