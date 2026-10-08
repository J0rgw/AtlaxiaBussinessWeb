import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/cx";
import type { SplitRatio } from "../SplitLayout";
import styles from "./StickyLayout.module.css";

export type StickyLayoutProps = {
  /** Content that stays in view while the other column scrolls (usually a visual). */
  sticky: ReactNode;
  /** Long content that scrolls past it (usually steps or text). */
  children: ReactNode;
  /** Column of the sticky content on wide containers. DOM order follows it. */
  stickySide?: "start" | "end";
  /** Column proportion, start:end, on a 12-column basis. */
  ratio?: SplitRatio;
  /**
   * "top": the sticky content pins below the offset.
   * "center": it stays vertically centered in the viewport.
   */
  stickyAlign?: "top" | "center";
  /** Distance from the top of the viewport while pinned. Any CSS length. */
  offset?: string;
  className?: string;
};

/**
 * Two columns where one stays pinned while the other scrolls: the base of
 * sticky storytelling. Stacks, without pinning, when its container is narrow.
 * Note: `position: sticky` stops working if an ancestor has overflow hidden or auto.
 */
export function StickyLayout({
  sticky,
  children,
  stickySide = "end",
  ratio = "1:1",
  stickyAlign = "top",
  offset,
  className,
}: StickyLayoutProps) {
  const stickyColumn = (
    <div className={cx(styles.sticky, styles[`align-${stickyAlign}`])}>{sticky}</div>
  );
  const scrollColumn = <div className={styles.scroll}>{children}</div>;
  const style = offset ? ({ "--sticky-offset": offset } as CSSProperties) : undefined;

  return (
    <div className={cx(styles.container, className)} style={style}>
      <div className={styles.grid} data-ratio={ratio}>
        {stickySide === "start" ? (
          <>
            {stickyColumn}
            {scrollColumn}
          </>
        ) : (
          <>
            {scrollColumn}
            {stickyColumn}
          </>
        )}
      </div>
    </div>
  );
}
