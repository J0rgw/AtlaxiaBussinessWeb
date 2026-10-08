import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Section.module.css";

export type SectionProps = Omit<HTMLAttributes<HTMLElement>, "id"> & {
  /** Anchor id used by the section navigation. */
  id: string;
  /** Id of the heading that names this region for assistive technology. */
  labelledBy?: string;
  /** "dark" flips every color token for the section (control-room surface). */
  tone?: "default" | "inset" | "dark";
  spacing?: "default" | "compact";
  children: ReactNode;
};

/**
 * Top-level narrative block of a long page. Handles landmark semantics,
 * vertical rhythm and anchor offset. Width is left to the children (Container).
 */
export function Section({
  id,
  labelledBy,
  tone = "default",
  spacing = "default",
  className,
  children,
  ...rest
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-surface={tone === "dark" ? "dark" : undefined}
      className={cx(
        styles.section,
        styles[`tone-${tone}`],
        styles[`spacing-${spacing}`],
        className,
      )}
      {...rest}
    >
      {children}
    </section>
  );
}
