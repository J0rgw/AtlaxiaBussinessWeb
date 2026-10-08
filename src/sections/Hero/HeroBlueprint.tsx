import {
  apex,
  arch,
  circlePath,
  circumradius,
  extendedSides,
  HALF,
  incircle,
  left,
  right,
  symbolPath,
  symbolTransform,
  VIEW,
} from "./geometry";
import styles from "./HeroBlueprint.module.css";
import { HeroCanvas } from "./HeroCanvas";
import { HeroDial } from "./HeroDial";

/*
  The hero backdrop: the ATLAXIA mark constructed as a technical drawing
  (Matta), centered behind the headline like the Cerebrium artwork.

  Motion, by function:
  - reveal: the construction appears from the center, then the mark is drawn;
  - story: signals travel along the mark and its circle, the system at work;
  - feedback: with a mouse, the part of the dial nearest to the pointer swells,
    darkens and follows it (HeroDial).
  Decorative: the headline carries the meaning, so it is hidden from assistive
  technology. Static with reduced motion; paused while off screen.
*/

const AXIS = 3200;
const sides = extendedSides();
const nodes = [apex, left, right, arch];
const viewBox = `${-HALF} ${-HALF} ${VIEW} ${VIEW}`;

export function HeroBlueprint() {
  return (
    <HeroCanvas className={styles.canvas}>
      <div className={styles.glow} />
      <div className={styles.field}>
        <div className={styles.grid} />
      </div>

      <svg className={styles.drawing} viewBox={viewBox} focusable="false">
        <defs>
          <pattern
            id="hero-hatch"
            width="9"
            height="9"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="9" className={styles.hatchLine} />
          </pattern>
          <clipPath id="hero-mark">
            <path d={symbolPath} transform={symbolTransform} />
          </clipPath>
        </defs>

        {/* Axes through the common center, past the edges of the drawing */}
        <g className={`${styles.axes} ${styles.expand}`}>
          <line x1={-AXIS} y1={0} x2={AXIS} y2={0} />
          <line x1={0} y1={-AXIS} x2={0} y2={AXIS} />
        </g>

        {/* Instrument dial, follows the pointer */}
        <HeroDial />

        {/* Construction: circumscribed and inscribed circles, sides extended */}
        <g className={styles.expand}>
          <circle r={circumradius} className={styles.circumcircle} />
          <circle cx={incircle.x} cy={incircle.y} r={incircle.r} className={styles.incircle} />
          {sides.map((side) => (
            <line key={`${side.x1}-${side.y1}`} {...side} className={styles.side} />
          ))}
        </g>

        {/* The mark: section hatching and its outline */}
        <rect
          x={-HALF}
          y={-HALF}
          width={VIEW}
          height={VIEW}
          fill="url(#hero-hatch)"
          clipPath="url(#hero-mark)"
          className={styles.hatch}
        />
        <path
          d={symbolPath}
          transform={symbolTransform}
          pathLength={1}
          className={`${styles.outline} ${styles.draw}`}
        />

        {/* Vertices as nodes of the system */}
        <g className={styles.nodes}>
          {nodes.map((node, i) => (
            <g key={`${node.x}-${node.y}`} transform={`translate(${node.x} ${node.y})`}>
              {/* Inner group: the CSS scale must not override the translate attribute */}
              <g className={styles.node} style={{ animationDelay: `${2000 + i * 120}ms` }}>
                <circle r={15} className={styles.halo} />
                <circle r={5.5} className={styles.dot} />
              </g>
            </g>
          ))}
        </g>
      </svg>

      {/* Signals: their own layer, so the loop repaints only this */}
      <svg className={`${styles.drawing} ${styles.signals}`} viewBox={viewBox} focusable="false">
        <g transform={symbolTransform}>
          {(["a", "b"] as const).map((id) => (
            <g key={id} className={styles.signal} data-signal={id}>
              <path d={symbolPath} pathLength={1} className={styles.tail} />
              <path d={symbolPath} pathLength={1} className={styles.head} />
            </g>
          ))}
        </g>
        <g className={`${styles.signal} ${styles.orbit}`}>
          <path d={circlePath(circumradius)} pathLength={1} className={styles.tail} />
          <path d={circlePath(circumradius)} pathLength={1} className={styles.head} />
        </g>
      </svg>

      <div className={styles.veil} />
    </HeroCanvas>
  );
}
