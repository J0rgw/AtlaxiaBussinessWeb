import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Tag.module.css";

/**
 * Closed set of tones, same as the product badges.
 * - critical, high, medium, low, normal: ISA-18.2 criticality scale. Only for severity.
 * - neutral family (one slate hue graded by luminosity): everything else.
 *   Neutral tags are told apart by icon, never by color.
 * - cobalt: references (standards, documents).
 */
export type TagTone =
  | "neutral"
  | "neutral-faint"
  | "neutral-strong"
  | "neutral-muted"
  | "cobalt"
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "normal";

export type TagProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: TagTone;
  /** Leading icon, decorative. Its shape should carry meaning so it survives color loss. */
  icon?: ReactNode;
  children: ReactNode;
};

/** Solid chip with optional icon: status, category or placeholder marker. */
export function Tag({ tone = "neutral", icon, className, children, ...rest }: TagProps) {
  return (
    <span className={cx(styles.tag, styles[`tone-${tone}`], className)} {...rest}>
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </span>
  );
}
