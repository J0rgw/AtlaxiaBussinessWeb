import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./SplitLayout.module.css";

export type SplitRatio = "1:1" | "5:7" | "7:5" | "4:8" | "8:4";

export type SplitLayoutProps = {
  /** First column on wide containers, first block when stacked. Usually the text. */
  start: ReactNode;
  /** Second column. Usually the visual or evidence. */
  end: ReactNode;
  /** Column proportion on a 12-column basis. */
  ratio?: SplitRatio;
  /** Vertical alignment of the two columns. */
  align?: "start" | "center" | "end" | "stretch";
  /**
   * Visual order on wide containers only. DOM and reading order always stay
   * start then end, so screen readers and the stacked layout are unaffected.
   */
  order?: "start-first" | "end-first";
  gap?: "md" | "lg";
  className?: string;
};

/**
 * Two columns side by side that stack when their container is narrow.
 * Driven by a container query, so it adapts to where it is placed, not to the viewport.
 */
export function SplitLayout({
  start,
  end,
  ratio = "1:1",
  align = "start",
  order = "start-first",
  gap = "lg",
  className,
}: SplitLayoutProps) {
  return (
    <div className={cx(styles.container, className)}>
      <div
        className={cx(styles.grid, styles[`gap-${gap}`], styles[`align-${align}`])}
        data-ratio={ratio}
        data-order={order}
      >
        <div className={styles.start}>{start}</div>
        <div className={styles.end}>{end}</div>
      </div>
    </div>
  );
}
