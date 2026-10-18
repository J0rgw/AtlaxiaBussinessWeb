import { ArrowUpRight } from "lucide-react";
import { cx } from "@/lib/cx";
import styles from "./EvidenceList.module.css";

export type Evidence = {
  id: string;
  /** Short mark that leads the item: a figure or a name. */
  figure: string;
  /** Reads on from the figure. */
  statement: string;
  source: { label: string; href: string };
};

export type EvidenceListProps = {
  title: string;
  titleId: string;
  /** Word before each source, such as "Fuente". */
  sourceLabel: string;
  items: readonly Evidence[];
  className?: string;
};

/**
 * Facts from outside ATLAXIA, each with its source linked: the "claim plus
 * evidence" rule of CLAUDE.md as a component. Sources open in a new tab.
 */
export function EvidenceList({ title, titleId, sourceLabel, items, className }: EvidenceListProps) {
  return (
    <div className={cx(styles.root, className)}>
      <h3 id={titleId} className={styles.title}>
        {title}
      </h3>
      <ul role="list" aria-labelledby={titleId} className={styles.list}>
        {items.map(({ id, figure, statement, source }) => (
          <li key={id} className={styles.item}>
            <p className={styles.claim}>
              <span className={styles.figure}>{figure}</span> {statement}
            </p>
            <p className={styles.source}>
              {sourceLabel}:{" "}
              <a href={source.href} target="_blank" rel="noopener noreferrer">
                {source.label}
                <ArrowUpRight aria-hidden="true" className={styles.icon} />
              </a>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
