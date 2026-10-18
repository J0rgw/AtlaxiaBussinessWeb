"use client";

import { useId, useMemo, type ReactNode } from "react";
import { StickyLayout } from "@/components/layout/StickyLayout";
import { cx } from "@/lib/cx";
import { useActiveSection } from "@/lib/hooks/useActiveSection";
import styles from "./StickyIndexStory.module.css";

export type IndexStoryItem = {
  id: string;
  /** Short entry in the pinned index. */
  label: string;
  title: string;
  body?: ReactNode;
  visual?: ReactNode;
};

export type StickyIndexStoryProps = {
  items: IndexStoryItem[];
  /** Accessible name of the index, also shown as its eyebrow. */
  label: string;
  /**
   * Render the eyebrow as a heading when the story opens its section without a
   * section header (the index then names the section). `labelId` lets the
   * section point `aria-labelledby` at it.
   */
  labelAs?: "p" | "h2" | "h3";
  labelId?: string;
  titleAs?: "h3" | "h4";
  /**
   * "reasons": large index entries next to short panels (Cerebrium "Why").
   * "chapters": a compact numbered index next to long reading text (Forgis).
   */
  variant?: "reasons" | "chapters";
  className?: string;
};

// Reading line at the middle of the viewport.
const READING_LINE = "-45% 0px -45% 0px";

/**
 * A pinned index next to panels that scroll past it, each with a visual, a
 * title and a text; the entry of the panel being read is emphasized. Two
 * readings: reasons in large type (Cerebrium "Why") or numbered chapters of a
 * longer text (Forgis). Index entries link to their panel.
 */
export function StickyIndexStory({
  items,
  label,
  labelAs: Label = "p",
  labelId,
  titleAs: Title = "h3",
  variant = "reasons",
  className,
}: StickyIndexStoryProps) {
  const chapters = variant === "chapters";
  const prefix = useId();
  const isHeading = Label !== "p";
  const headingId = labelId ?? `${prefix}-label`;
  const panelIds = useMemo(() => items.map((item) => `${prefix}-${item.id}`), [prefix, items]);
  const activeId = useActiveSection(panelIds, { rootMargin: READING_LINE, keepLast: true });
  const activeIndex = Math.max(0, activeId ? panelIds.indexOf(activeId) : 0);

  const index = (
    <nav
      aria-label={isHeading ? undefined : label}
      aria-labelledby={isHeading ? headingId : undefined}
      className={styles.index}
    >
      <Label
        id={isHeading ? headingId : undefined}
        className={styles.eyebrow}
        aria-hidden={isHeading ? undefined : true}
      >
        {label}
      </Label>
      <ol role="list" className={styles.entries}>
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${panelIds[i]}`}
              className={cx(styles.entry, i === activeIndex && styles.entryActive)}
              aria-current={i === activeIndex ? "true" : undefined}
            >
              {chapters ? (
                <span className={styles.number}>{String(i + 1).padStart(2, "0")}</span>
              ) : null}
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );

  return (
    <StickyLayout
      className={cx(chapters && styles.chapters, className)}
      sticky={index}
      stickySide="start"
      ratio={chapters ? "4:8" : "5:7"}
      stickyAlign="top"
      offset="var(--space-16)"
    >
      <div className={styles.panels}>
        {items.map((item, i) => (
          <article
            key={item.id}
            id={panelIds[i]}
            className={styles.panel}
            aria-labelledby={`${panelIds[i]}-title`}
          >
            {item.visual ? <div className={styles.visual}>{item.visual}</div> : null}
            <Title id={`${panelIds[i]}-title`} className={styles.title}>
              {item.title}
            </Title>
            {item.body ? <div className={styles.body}>{item.body}</div> : null}
          </article>
        ))}
      </div>
    </StickyLayout>
  );
}
