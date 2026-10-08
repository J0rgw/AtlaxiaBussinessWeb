import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./ParallaxLayer.module.css";

type Pair<T> = readonly [from: T, to: T];

export type ParallaxLayerProps = {
  /** Horizontal travel, any CSS length ("0vw", "-12vw"). */
  x?: Pair<string>;
  /** Vertical travel, any CSS length. */
  y?: Pair<string>;
  scale?: Pair<number>;
  opacity?: Pair<number>;
  /** Part of the scene progress the movement spans (0 to 1). Outside it, the layer holds. */
  range?: Pair<number>;
  className?: string;
  /** Optional: a layer can be pure decoration styled by its className. */
  children?: ReactNode;
};

/**
 * A layer that moves with the scene progress at its own pace: depth for the
 * stage of a ScrollScene. Pure CSS (reads --scene-progress), no re-renders.
 */
export function ParallaxLayer({
  x = ["0px", "0px"],
  y = ["0px", "0px"],
  scale = [1, 1],
  opacity = [1, 1],
  range = [0, 1],
  className,
  children,
}: ParallaxLayerProps) {
  const style = {
    "--x0": x[0],
    "--x1": x[1],
    "--y0": y[0],
    "--y1": y[1],
    "--s0": scale[0],
    "--s1": scale[1],
    "--o0": opacity[0],
    "--o1": opacity[1],
    "--from": range[0],
    // A zero-length range would divide by zero in CSS (NaN scales the layer to 0): make it a step.
    "--to": range[1] > range[0] ? range[1] : range[0] + 0.0001,
  } as CSSProperties;

  return (
    <div className={cx(styles.layer, className)} style={style}>
      {children}
    </div>
  );
}
