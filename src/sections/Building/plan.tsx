import type { ReactNode } from "react";
import type { Dictionary } from "@/content";
import { company } from "@/content/shared/company";
import type { LayerId } from "./layers";
import styles from "./plan.module.css";

/*
  The plant model drawn on the plan of one pumping station (the Vision water
  case). The plant itself is the background: tank, pump with its motor, the
  line to the network, in thin grey and without labels. Each layer adds only
  its own pieces, in cobalt, in two steps the scroll lays down one after the
  other. The last layer, the influences, is a second sheet floating above
  the plan (InfluenceGraph). An illustration: no real plant, no values.
*/

type Plan = Dictionary["building"]["plan"];
type Point = readonly [number, number];
type Rect = { x: number; y: number; w: number; h: number };

export const planSize = { width: 640, height: 400 } as const;

/* Geometry ----------------------------------------------------------------- */

const ZONE_Y = 150;
const ZONE_BOTTOM = 366;
const zones = {
  intake: { x: 20, w: 182 },
  pumping: { x: 216, w: 224 },
  distribution: { x: 454, w: 166 },
} as const;

const PIPE = 224;
const SUCTION = 292;
const pump: Point = [300, SUCTION];
const PUMP_R = 22;
const motor: Rect = { x: 285, y: 326, w: 30, h: 20 };
const tank: Rect = { x: 48, y: 186, w: 90, h: 140 };

/**
 * ISA tags: the first letter is the variable (L level, P pressure, F flow,
 * V vibration, J power, Y state). `tap` is the point each one measures.
 */
const signals: Array<{ tag: string; at: Point; tap: Point; digital?: boolean }> = [
  { tag: "LT-101", at: [172, 204], tap: [tank.x + tank.w, 204] },
  { tag: "PT-102", at: [404, 190], tap: [404, PIPE] },
  { tag: "FT-103", at: [500, 190], tap: [500, PIPE - 11] },
  { tag: "VT-104", at: [354, 262], tap: [pump[0] + 16, pump[1] - 15] },
  { tag: "JT-105", at: [370, 336], tap: [motor.x + motor.w, motor.y + motor.h / 2] },
  { tag: "YS-106", at: [244, 316], tap: [motor.x, motor.y + 6], digital: true },
];
const BUBBLE = 15;
const at = (tag: string) => signals.find((s) => s.tag === tag)!.at;

const devices = {
  scada: { x: 214, y: 18, w: 80, h: 34 },
  historian: { x: 306, y: 18, w: 112, h: 34 },
  switch: { x: 282, y: 72, w: 68, h: 12 },
  plc1: { x: 79, y: 104, w: 62, h: 22 },
  plc2: { x: 285, y: 104, w: 62, h: 22 },
  rtu: { x: 495, y: 104, w: 62, h: 22 },
  atlaxia: { x: 462, y: 56, w: 76, h: 22 },
} as const;
const fieldDevices = { plc1: "PLC-1", plc2: "PLC-2", rtu: "RTU-3" } as const;

const relations: Array<{ from: string; to: string; via: Point; weight: number }> = [
  { from: "PT-102", to: "FT-103", via: [452, 224], weight: 1 },
  { from: "PT-102", to: "JT-105", via: [420, 270], weight: 0.8 },
  { from: "VT-104", to: "JT-105", via: [330, 306], weight: 0.6 },
  { from: "LT-101", to: "PT-102", via: [288, 214], weight: 0.35 },
];

/* Pieces ------------------------------------------------------------------- */

function Svg({ children }: { children: ReactNode }) {
  return (
    <div className={styles.frame}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${planSize.width} ${planSize.height}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        {children}
      </svg>
    </div>
  );
}

function Box({ d, className }: { d: Rect; className?: string }) {
  return <rect className={className} x={d.x} y={d.y} width={d.w} height={d.h} rx={3} />;
}

const mid = (d: Rect) => d.x + d.w / 2;

/** Point on a bubble's edge, towards `toward`. */
function edge([x, y]: Point, [tx, ty]: Point): Point {
  const length = Math.hypot(tx - x, ty - y) || 1;
  const r = BUBBLE + 2;
  return [x + ((tx - x) / length) * r, y + ((ty - y) / length) * r];
}

function arrow([x, y]: Point) {
  return `M${x - 8} ${y - 5}L${x} ${y}L${x - 8} ${y + 5}`;
}

/** The sheet and the plant on it: the background every layer is drawn over. */
export function PlanBase({ plan, sketch }: { plan: Plan; sketch: string }) {
  const { width, height } = planSize;
  const [px, py] = pump;
  return (
    <Svg>
      <rect className={styles.sheet} x={1} y={1} width={width - 2} height={height - 2} rx={4} />
      <g className={styles.plant}>
        {/* Inlet, tank, suction, pump and motor */}
        <path d={`M8 200H${tank.x}`} />
        <rect x={tank.x} y={tank.y} width={tank.w} height={tank.h} rx={8} />
        <path d={`M${tank.x + tank.w} ${SUCTION}H${px - PUMP_R}`} />
        <circle cx={px} cy={py} r={PUMP_R} />
        <path d={`M${px - 13} ${py + 17}L${px} ${py - PUMP_R}L${px + 13} ${py + 17}`} />
        <path d={`M${px} ${py + PUMP_R}V${motor.y}`} />
        <Box d={motor} />
        <text className={styles.plantLabel} x={mid(motor)} y={motor.y + 14} textAnchor="middle">
          M
        </text>
        {/* Discharge: flowmeter and valve, to the network */}
        <path d={`M${px} ${py - PUMP_R}V${PIPE}H${width - 10}`} />
        <rect x={487} y={PIPE - 11} width={26} height={22} />
        <path d={`M548 ${PIPE - 9}L572 ${PIPE + 9}V${PIPE - 9}L548 ${PIPE + 9}Z`} />
        <path d={arrow([width - 10, PIPE])} />
      </g>
      <g className={styles.titleBlock}>
        <rect x={404} y={376} width={226} height={18} />
        <line x1={548} x2={548} y1={376} y2={394} />
        <text x={412} y={389}>
          {plan.title}
        </text>
        <text x={556} y={389}>
          {sketch}
        </text>
      </g>
    </Svg>
  );
}

export type LayerPart = "first" | "then";
/** The physical layer also draws its instrument tags apart, so the tilt can fade them. */
export type PhysicalPart = LayerPart | "tags";

function Physical({ plan, part }: { plan: Plan; part: PhysicalPart }) {
  if (part === "first") {
    return (
      <>
        {(Object.keys(zones) as Array<keyof typeof zones>).map((id) => (
          <g key={id}>
            <rect
              className={styles.zone}
              x={zones[id].x}
              y={ZONE_Y}
              width={zones[id].w}
              height={ZONE_BOTTOM - ZONE_Y}
              rx={6}
            />
            <text className={styles.zoneLabel} x={zones[id].x + 12} y={ZONE_BOTTOM - 12}>
              {plan.zones[id]}
            </text>
          </g>
        ))}
      </>
    );
  }
  if (part === "tags") {
    return (
      <>
        {signals.map(({ tag, at: [x, y] }) => {
          const [letters, number] = tag.split("-");
          return (
            <g key={tag}>
              <text className={styles.bubbleText} x={x} y={y - 3} textAnchor="middle">
                {letters}
              </text>
              <text className={styles.bubbleText} x={x} y={y + 9} textAnchor="middle">
                {number}
              </text>
            </g>
          );
        })}
      </>
    );
  }
  return (
    <>
      {signals.map(({ tag, at: [x, y], tap, digital }) => {
        const [ex, ey] = edge([x, y], tap);
        return (
          <g key={tag}>
            {/* Process connection: what the instrument measures */}
            <line className={styles.lead} x1={ex} y1={ey} x2={tap[0]} y2={tap[1]} />
            {digital ? (
              <rect
                className={styles.bubble}
                x={x - BUBBLE}
                y={y - BUBBLE}
                width={BUBBLE * 2}
                height={BUBBLE * 2}
                rx={3}
              />
            ) : (
              <circle className={styles.bubble} cx={x} cy={y} r={BUBBLE} />
            )}
          </g>
        );
      })}
    </>
  );
}

function Network({ plan, part }: { plan: Plan; part: LayerPart }) {
  const { scada, historian, switch: sw, plc1, plc2, rtu, atlaxia } = devices;
  if (part === "then") {
    // ATLAXIA on the network: the arrow points one way, it only reads
    return (
      <>
        <path
          className={styles.link}
          d={`M${sw.x + sw.w} ${sw.y + 6}H${atlaxia.x - 22}L${atlaxia.x} ${atlaxia.y + atlaxia.h / 2}`}
        />
        <path className={styles.line} d={arrow([atlaxia.x, atlaxia.y + atlaxia.h / 2])} />
        <Box d={atlaxia} className={styles.device} />
        <text
          className={styles.deviceLabel}
          x={mid(atlaxia)}
          y={atlaxia.y + 15}
          textAnchor="middle"
        >
          {company.name}
        </text>
      </>
    );
  }
  const bus = sw.y + sw.h + 10;
  return (
    <>
      <path
        className={styles.link}
        d={`M${mid(scada)} ${scada.y + scada.h}L${sw.x + 16} ${sw.y}M${mid(historian)} ${historian.y + historian.h}L${sw.x + sw.w - 16} ${sw.y}`}
      />
      <path
        className={styles.link}
        d={`M${mid(sw)} ${sw.y + sw.h}V${bus}M${mid(plc1)} ${plc1.y}V${bus}H${mid(rtu)}V${rtu.y}M${mid(plc2)} ${bus}V${plc2.y}`}
      />
      <Box d={sw} className={styles.device} />
      {(["scada", "historian"] as const).map((id) => (
        <g key={id}>
          <Box d={devices[id]} className={styles.device} />
          <text
            className={styles.deviceLabel}
            x={mid(devices[id])}
            y={devices[id].y + 21}
            textAnchor="middle"
          >
            {plan.devices[id]}
          </text>
        </g>
      ))}
      {(Object.keys(fieldDevices) as Array<keyof typeof fieldDevices>).map((id) => (
        <g key={id}>
          <Box d={devices[id]} className={styles.device} />
          <text
            className={styles.deviceLabel}
            x={mid(devices[id])}
            y={devices[id].y + 15}
            textAnchor="middle"
          >
            {fieldDevices[id]}
          </text>
        </g>
      ))}
    </>
  );
}

/** The water on its way through the plant: the pipes and equipment it goes through, in order. */
function Functional({ part }: { part: LayerPart }) {
  const [px, py] = pump;
  const { width } = planSize;
  if (part === "first") {
    // Intake: inlet, tank, suction and pump
    return (
      <>
        <path className={styles.flow} d={`M8 200H${tank.x}`} />
        <rect className={styles.flow} x={tank.x} y={tank.y} width={tank.w} height={tank.h} rx={8} />
        <path className={styles.flow} d={`M${tank.x + tank.w} ${SUCTION}H${px - PUMP_R}`} />
        <circle className={styles.flow} cx={px} cy={py} r={PUMP_R} />
        <path className={styles.flowArrow} d={arrow([36, 200])} />
        <path className={styles.flowArrow} d={arrow([216, SUCTION])} />
      </>
    );
  }
  // Discharge: up from the pump, through the flowmeter and the valve, to the network
  return (
    <>
      <path className={styles.flow} d={`M${px} ${py - PUMP_R}V${PIPE}H${width - 10}`} />
      <rect className={styles.flow} x={487} y={PIPE - 11} width={26} height={22} />
      <path
        className={styles.flow}
        d={`M548 ${PIPE - 9}L572 ${PIPE + 9}V${PIPE - 9}L548 ${PIPE + 9}Z`}
      />
      <path className={styles.flowArrow} d={arrow([400, PIPE])} />
      <path className={styles.flowArrow} d={arrow([width - 10, PIPE])} />
    </>
  );
}

/** Where each instrument sits, in % of the sheet: the posts that hold the graph up stand here. */
export const sensorPoints = signals.map(({ tag, at: [x, y] }) => ({
  tag,
  letters: tag.split("-")[0]!,
  number: tag.split("-")[1]!,
  x: (x / planSize.width) * 100,
  y: (y / planSize.height) * 100,
}));

/**
 * The influence graph, drawn on its own sheet above the plan: one node over
 * each instrument, and the relations the model learns between them.
 */
export function InfluenceGraph({ part }: { part: LayerPart }) {
  return (
    <Svg>
      {part === "first"
        ? signals.map(({ tag, at: [x, y] }) => {
            const [letters, number] = tag.split("-");
            return (
              <g key={tag}>
                <circle className={styles.node} cx={x} cy={y} r={BUBBLE} />
                {/* Only without JavaScript: with it, NodeLabels draws the names as flat HTML */}
                <text className={styles.nodeText} x={x} y={y - 3} textAnchor="middle">
                  {letters}
                </text>
                <text className={styles.nodeText} x={x} y={y + 9} textAnchor="middle">
                  {number}
                </text>
              </g>
            );
          })
        : relations.map(({ from, to, via, weight }) => {
            // From edge to edge of the nodes, so the tags stay readable
            const [x1, y1] = edge(at(from), via);
            const [x2, y2] = edge(at(to), via);
            return (
              <path
                key={from + to}
                className={styles.relation}
                d={`M${x1} ${y1}Q${via[0]} ${via[1]} ${x2} ${y2}`}
                strokeWidth={1.2 + weight * 2.6}
              />
            );
          })}
    </Svg>
  );
}

/** One layer's pieces, in one of its two steps. */
export function PlanLayer({
  layer,
  plan,
  part,
}: {
  layer: Exclude<LayerId, "influence">;
  plan: Plan;
  part: PhysicalPart;
}) {
  return (
    <Svg>
      {layer === "physical" ? <Physical plan={plan} part={part} /> : null}
      {layer === "network" && part !== "tags" ? <Network plan={plan} part={part} /> : null}
      {layer === "functional" && part !== "tags" ? <Functional part={part} /> : null}
    </Svg>
  );
}
