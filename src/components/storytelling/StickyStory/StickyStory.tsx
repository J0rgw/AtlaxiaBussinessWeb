"use client";

import { useId, useMemo, type ReactNode } from "react";
import { StickyLayout } from "@/components/layout/StickyLayout";
import type { SplitRatio } from "@/components/layout/SplitLayout";
import { cx } from "@/lib/cx";
import { useActiveSection } from "@/lib/hooks/useActiveSection";
import styles from "./StickyStory.module.css";

export type StoryStep = {
  id: string;
  title: string;
  body?: ReactNode;
  /** What the pinned panel shows while this step is being read. */
  visual: ReactNode;
};

export type StickyStoryProps = {
  steps: StoryStep[];
  /** Accessible name of the list of steps. */
  label: string;
  /** Heading level of each step title, to fit the page outline. */
  titleAs?: "h3" | "h4";
  stickySide?: "start" | "end";
  ratio?: SplitRatio;
  className?: string;
};

// Reading line at the middle of the viewport.
const READING_LINE = "-48% 0px -48% 0px";

/**
 * Steps that scroll past a pinned panel; the panel shows the visual of the
 * step being read. On narrow containers nothing is pinned and every step shows
 * its own visual inline.
 */
export function StickyStory({
  steps,
  label,
  titleAs: Title = "h3",
  stickySide = "end",
  ratio = "5:7",
  className,
}: StickyStoryProps) {
  const prefix = useId();
  const stepIds = useMemo(() => steps.map((step) => `${prefix}-${step.id}`), [prefix, steps]);
  // Between steps nothing crosses the line: keep the last one instead of blanking the panel.
  const trackedId = useActiveSection(stepIds, { rootMargin: READING_LINE, keepLast: true });
  const activeIndex = Math.max(0, trackedId ? stepIds.indexOf(trackedId) : 0);
  const total = String(steps.length).padStart(2, "0");

  const panel = (
    <div className={styles.panel}>
      <p className={styles.counter} aria-hidden="true">
        <span className={styles.counterIndex}>{String(activeIndex + 1).padStart(2, "0")}</span>
        <span> / {total}</span>
        <span className={styles.counterTitle}>{steps[activeIndex]?.title}</span>
      </p>
      <div className={styles.stack}>
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={step.id}
              className={cx(styles.frame, isActive && styles.frameActive)}
              aria-hidden={!isActive}
              inert={!isActive}
            >
              {step.visual}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <StickyLayout
      className={className}
      sticky={panel}
      stickySide={stickySide}
      ratio={ratio}
      stickyAlign="center"
    >
      <ol role="list" aria-label={label} className={styles.steps}>
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          return (
            <li
              key={step.id}
              id={stepIds[index]}
              className={cx(styles.step, isActive && styles.stepActive)}
              aria-current={isActive ? "step" : undefined}
            >
              <p className={styles.index} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </p>
              <Title className={styles.title}>{step.title}</Title>
              {step.body ? <div className={styles.body}>{step.body}</div> : null}
              {/* Narrow containers: the panel is not pinned, so each step carries its visual. */}
              <div className={styles.inlineVisual}>{step.visual}</div>
            </li>
          );
        })}
      </ol>
    </StickyLayout>
  );
}
