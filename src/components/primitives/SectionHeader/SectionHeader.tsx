import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./SectionHeader.module.css";

export type SectionHeaderProps = {
  title: ReactNode;
  /** Set it and pass the same value to Section `labelledBy`. */
  titleId?: string;
  /** Heading level. Visual size is controlled separately with `size`. */
  as?: "h1" | "h2" | "h3";
  size?: "heading" | "display";
  /**
   * "split": on wide screens the lead moves beside the title, aligned to its
   * foot, so the header takes two lines less. Stacks again on narrow screens.
   */
  layout?: "stack" | "split";
  /** Ordinal shown before the eyebrow, e.g. "01". */
  index?: string;
  eyebrow?: ReactNode;
  lead?: ReactNode;
  className?: string;
};

/** Eyebrow, title and lead paragraph that open a section. */
export function SectionHeader({
  title,
  titleId,
  as: Heading = "h2",
  size = "heading",
  layout = "stack",
  index,
  eyebrow,
  lead,
  className,
}: SectionHeaderProps) {
  const hasKicker = Boolean(index || eyebrow);

  return (
    <div className={cx(styles.header, layout === "split" && styles.split, className)}>
      {hasKicker ? (
        <p className={styles.kicker}>
          {index ? <span className={styles.index}>{index}</span> : null}
          {eyebrow ? <span>{eyebrow}</span> : null}
        </p>
      ) : null}
      <Heading id={titleId} className={cx(styles.title, styles[size])}>
        {title}
      </Heading>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
    </div>
  );
}
