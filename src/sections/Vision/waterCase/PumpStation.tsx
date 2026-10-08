import type { CSSProperties, ReactNode } from "react";
import type { Dictionary } from "@/content";
import type { CaseSignal } from "./waterCase";
import styles from "./WaterCase.module.css";

type CaseContent = Dictionary["vision"]["waterCase"];

/** How each instrument reads in a step. Color only for what is abnormal (ISA-101). */
export type InstrumentState = "normal" | "focus" | "deviation" | "related" | "muted";

type Instrument = {
  signal: CaseSignal;
  tag: string;
  number: string;
  x: number;
  y: number;
  /** Measured point the leader goes to. */
  to: [number, number];
  /** Where the HTML label sits relative to the bubble. */
  label: "right" | "left" | "below";
};

const W = 640;
const H = 400;
const R = 17;

const instruments: Instrument[] = [
  { signal: "level", tag: "LT", number: "101", x: 100, y: 66, to: [100, 120], label: "right" },
  { signal: "energy", tag: "JT", number: "105", x: 270, y: 128, to: [270, 180], label: "right" },
  { signal: "pressure", tag: "PT", number: "102", x: 420, y: 345, to: [420, 270], label: "below" },
  { signal: "flow", tag: "FT", number: "103", x: 540, y: 345, to: [540, 282], label: "below" },
  { signal: "vibration", tag: "VT", number: "104", x: 270, y: 352, to: [270, 301], label: "left" },
];

const relations: Array<[CaseSignal, CaseSignal, [number, number]]> = [
  ["energy", "pressure", [470, 200]],
  ["pressure", "flow", [480, 300]],
  ["vibration", "pressure", [345, 380]],
  ["vibration", "energy", [190, 240]],
];

const at = (x: number, y: number) =>
  ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` }) as CSSProperties;

type PumpStationProps = {
  content: CaseContent;
  states: Record<CaseSignal, InstrumentState>;
  /** Cobalt links between the instruments that move together. */
  showRelations?: boolean;
  /** Short note per instrument (status word, trend), shown under its name. */
  notes?: Partial<Record<CaseSignal, ReactNode>>;
};

/**
 * The pumping station as a P&ID: suction tank, pump B-101 with its motor, check
 * valve, flowmeter and discharge to the network, with five instruments.
 * Drawing in SVG; names and notes in HTML so they stay readable at any size.
 */
export function PumpStation({
  content,
  states,
  showRelations = false,
  notes = {},
}: PumpStationProps) {
  const byId = new Map(instruments.map((i) => [i.signal, i]));
  const pumpRelated = showRelations;

  return (
    <div className={styles.station}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.stationSvg} aria-hidden="true">
        {/* Pump halo when its signals relate */}
        {pumpRelated ? <circle cx={270} cy={270} r={46} className={styles.halo} /> : null}

        {/* Suction tank with water */}
        <rect x={41} y={170} width={118} height={129} className={styles.water} />
        <path d="M41 170 H159" className={styles.detail} />
        <path d="M94 160 H106 L100 167 Z" className={styles.detail} />
        <rect x={40} y={120} width={120} height={180} rx={4} className={styles.ink} />

        {/* Piping */}
        <path d="M160 270 H244" className={styles.pipe} />
        <path d="M296 270 H316" className={styles.pipe} />
        <path d="M344 270 H520" className={styles.pipe} />
        <path d="M560 270 H590 V110 H628" className={styles.pipe} />
        <path d="M619 103 L629 110 L619 117" className={styles.pipeThin} />

        {/* Check valve */}
        <path d="M316 260 V280 L330 270 Z" className={styles.valveFilled} />
        <path d="M344 260 V280 L330 270 Z" className={styles.valve} />

        {/* Flowmeter body */}
        <rect x={520} y={258} width={40} height={24} rx={3} className={styles.valve} />

        {/* Motor and shaft */}
        <path d="M270 212 V244" className={styles.pipeThin} />
        <circle cx={270} cy={196} r={16} className={styles.valve} />
        <text x={270} y={196} className={styles.motorText}>
          M
        </text>

        {/* Pump: volute, wear ring, three backward-curved vanes, skid */}
        <rect x={246} y={296} width={48} height={5} rx={1} className={styles.valve} />
        <circle cx={270} cy={270} r={26} className={styles.valve} />
        <circle cx={270} cy={270} r={21} className={styles.detail} />
        {[0, 120, 240].map((a) => (
          <path
            key={a}
            d="M270 266 Q277 256 281 259"
            className={styles.vane}
            transform={`rotate(${a} 270 270)`}
          />
        ))}
        <circle cx={270} cy={270} r={4} className={styles.hub} />

        {/* Relations between the signals that move together */}
        {showRelations
          ? relations.map(([a, b, q]) => {
              const p0 = byId.get(a)!;
              const p1 = byId.get(b)!;
              return (
                <path
                  key={`${a}-${b}`}
                  d={`M${p0.x} ${p0.y} Q${q[0]} ${q[1]} ${p1.x} ${p1.y}`}
                  className={styles.relation}
                />
              );
            })
          : null}

        {/* Instruments */}
        {instruments.map((i) => (
          <g key={i.signal} className={styles.instrument} data-state={states[i.signal]}>
            <path
              d={`M${i.x} ${i.y + (i.to[1] > i.y ? R : 0)} L${i.to[0]} ${i.to[1]}`}
              className={styles.leader}
            />
            {states[i.signal] === "focus" ? (
              <circle cx={i.x} cy={i.y} r={R + 8} className={styles.focusRing} />
            ) : null}
            <circle cx={i.x} cy={i.y} r={R} className={styles.bubble} />
            <text x={i.x} y={i.y - 3} className={styles.tagText}>
              {i.tag}
            </text>
            <text x={i.x} y={i.y + 9} className={styles.tagNumber}>
              {i.number}
            </text>
          </g>
        ))}
      </svg>

      {/* Names, in HTML */}
      {instruments.map((i) => (
        <div
          key={i.signal}
          className={styles.instrumentLabel}
          data-side={i.label}
          data-state={states[i.signal]}
          style={at(i.x, i.y)}
        >
          <span className={styles.instrumentName}>{content.signals[i.signal]}</span>
          {notes[i.signal] ? (
            <span className={styles.instrumentNote}>{notes[i.signal]}</span>
          ) : null}
        </div>
      ))}
      <span className={styles.equipmentLabel} style={at(100, 318)}>
        {content.equipment.tank}
      </span>
      <span className={styles.equipmentLabel} data-align="start" style={at(300, 292)}>
        {content.equipment.pump}
      </span>
      <span className={styles.equipmentLabel} data-align="end" style={at(628, 88)}>
        {content.equipment.network}
      </span>
    </div>
  );
}
