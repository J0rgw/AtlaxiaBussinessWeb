import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Surface.module.css";

export type SurfaceTone = "raised" | "inset" | "dark";
export type SurfacePadding = "none" | "md" | "lg";

export type SurfaceProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * "raised" and "inset" sit on the light page.
   * "dark" is the control-room panel: it flips every color token for its children.
   */
  tone?: SurfaceTone;
  padding?: SurfacePadding;
  children: ReactNode;
};

/** A bounded area of the page: card, panel or product frame body. */
export function Surface({
  tone = "raised",
  padding = "md",
  className,
  children,
  ...rest
}: SurfaceProps) {
  return (
    <div
      className={cx(styles.surface, styles[tone], styles[`padding-${padding}`], className)}
      data-surface={tone === "dark" ? "dark" : undefined}
      {...rest}
    >
      {children}
    </div>
  );
}
