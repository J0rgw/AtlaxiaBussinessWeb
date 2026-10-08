import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./LayerStack.module.css";

export type LayerItem = {
  id: string;
  /** Line icon, decorative. */
  icon?: ReactNode;
  label: string;
  sub?: string;
};

export type StackLayer = {
  id: string;
  /** Ordinal shown large, e.g. "04". */
  index: string;
  title: string;
  tagline?: string;
  description?: ReactNode;
  items?: LayerItem[];
};

export type LayerStackProps = {
  /** Top to bottom, as they should read. */
  layers: StackLayer[];
  /** Accessible name of the list of layers. */
  label: string;
  /** Cross-cutting column that every layer connects to (a control surface, the product...). */
  aside?: ReactNode;
  className?: string;
};

/**
 * A system shown as stacked layers with a column that runs across all of them.
 * Pattern of the Radiant product presentation: numbered layers, line icons with
 * mono labels, connectors to a cross-cutting column, a thin frame with marks.
 */
export function LayerStack({ layers, label, aside, className }: LayerStackProps) {
  return (
    <div className={cx(styles.container, className)}>
      <div className={cx(styles.frame, aside ? styles.withAside : undefined)}>
        <span className={styles.mark} data-corner="tl" aria-hidden="true" />
        <span className={styles.mark} data-corner="tr" aria-hidden="true" />
        <span className={styles.mark} data-corner="bl" aria-hidden="true" />
        <span className={styles.mark} data-corner="br" aria-hidden="true" />

        <ol role="list" aria-label={label} className={styles.layers}>
          {layers.map((layer) => (
            <li key={layer.id} className={styles.layer}>
              <div className={styles.head}>
                <span className={styles.index} aria-hidden="true">
                  {layer.index}
                </span>
                <h3 className={styles.title}>{layer.title}</h3>
                {layer.tagline ? <p className={styles.tagline}>{layer.tagline}</p> : null}
                {layer.description ? (
                  <div className={styles.description}>{layer.description}</div>
                ) : null}
              </div>
              {layer.items?.length ? (
                <ul role="list" className={styles.items}>
                  {layer.items.map((item) => (
                    <li key={item.id} className={styles.item}>
                      {item.icon ? (
                        <span className={styles.icon} aria-hidden="true">
                          {item.icon}
                        </span>
                      ) : null}
                      <span className={styles.itemLabel}>{item.label}</span>
                      {item.sub ? <span className={styles.itemSub}>{item.sub}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : null}
              {aside ? <span className={styles.connector} aria-hidden="true" /> : null}
            </li>
          ))}
        </ol>

        {aside ? <aside className={styles.aside}>{aside}</aside> : null}
      </div>
    </div>
  );
}
