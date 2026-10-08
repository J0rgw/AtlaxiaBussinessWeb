import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Container.module.css";

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  /** "narrow" keeps long-form text at a readable width. */
  size?: "default" | "narrow";
  children: ReactNode;
};

/** Centers content with the page max width and responsive side gutters. */
export function Container({ size = "default", className, children, ...rest }: ContainerProps) {
  return (
    <div className={cx(styles.container, styles[size], className)} {...rest}>
      {children}
    </div>
  );
}
