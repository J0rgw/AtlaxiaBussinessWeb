import { cx } from "@/lib/cx";
import styles from "./StableLabel.module.css";

export type StableLabelProps = {
  children: string;
  /**
   * Other texts this label can take (for example its translations). The label
   * reserves the width of the longest one, so controls keep their size when the
   * language changes. Same principle as the product badges.
   */
  alternatives?: readonly string[];
  /** Also reserve the semibold width, for labels that turn bold when selected. */
  reserveBold?: boolean;
  className?: string;
};

/**
 * Inline text whose width never changes between its alternatives or weights.
 * Reserved copies are invisible and hidden from assistive technology.
 */
export function StableLabel({
  children,
  alternatives = [],
  reserveBold = false,
  className,
}: StableLabelProps) {
  const reserved = Array.from(new Set([children, ...alternatives]));

  return (
    <span className={cx(styles.stack, className)}>
      <span>{children}</span>
      {reserved.map((text) => (
        <span key={`r-${text}`} className={styles.reserve} aria-hidden="true">
          {text}
        </span>
      ))}
      {reserveBold
        ? reserved.map((text) => (
            <span key={`b-${text}`} className={cx(styles.reserve, styles.bold)} aria-hidden="true">
              {text}
            </span>
          ))
        : null}
    </span>
  );
}
