import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./ProcessFlow.module.css";

export type ProcessStep = {
  id: string;
  label: string;
  /** Short mono tag above the label, such as a stage name ("Hoy", "Siguiente"). */
  meta?: string;
  description?: ReactNode;
};

export type ProcessFlowProps = {
  steps: ProcessStep[];
  /** Accessible name of the sequence, e.g. "De los datos a la acción". */
  label: string;
  /**
   * Progress through the flow. Steps before it read as reached, this one as
   * current, later ones as pending; connectors fill as each step is reached.
   * Leave undefined for a static, fully reached flow.
   */
  activeIndex?: number | null;
  /**
   * Announce the current step to assistive tech (`aria-current="step"`). Off for a
   * conceptual chain at rest, where no step is "current" for the reader.
   */
  announceCurrent?: boolean;
  /** "auto": horizontal on wide containers, vertical on narrow ones. */
  orientation?: "auto" | "horizontal" | "vertical";
  /**
   * Feedback loop: after the last step the flow returns to step `from`, drawn
   * as a return line once the last step is reached. `label` names it on wide
   * layouts only and is hidden from assistive tech: say it in the steps too.
   */
  loop?: { from: number; label?: string };
  className?: string;
};

type StepState = "reached" | "current" | "pending";

type LoopPart = "start" | "through" | "end";

function loopPart(index: number, last: number, from: number | undefined): LoopPart | null {
  if (from === undefined || index < from) return null;
  if (index === from) return "start";
  return index === last ? "end" : "through";
}

function stateFor(index: number, activeIndex: number | null | undefined): StepState {
  if (activeIndex === undefined) return "reached";
  if (activeIndex === null || index > activeIndex) return "pending";
  return index === activeIndex ? "current" : "reached";
}

/**
 * An ordered sequence of stages joined by connectors, such as
 * data, context, behavior, understanding, action.
 * Presentational: whoever owns the scroll or the state drives `activeIndex`.
 */
export function ProcessFlow({
  steps,
  label,
  activeIndex,
  announceCurrent = true,
  orientation = "auto",
  loop,
  className,
}: ProcessFlowProps) {
  const last = steps.length - 1;
  // A loop must start on a step before the last one (an indexOf miss gives -1)
  const loopFrom = loop && loop.from >= 0 && loop.from < last ? loop.from : undefined;
  return (
    <div
      className={cx(styles.container, className)}
      data-loop={loopFrom === undefined ? undefined : ""}
    >
      <ol role="list" aria-label={label} className={styles.flow} data-orientation={orientation}>
        {steps.map((step, index) => {
          const state = stateFor(index, activeIndex);
          const nextState = index < last ? stateFor(index + 1, activeIndex) : null;
          const part = loopPart(index, last, loopFrom);
          return (
            <li
              key={step.id}
              className={styles.step}
              data-state={state}
              aria-current={announceCurrent && state === "current" ? "step" : undefined}
            >
              <span className={styles.node} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              {nextState ? (
                <span
                  className={styles.connector}
                  data-filled={nextState !== "pending" ? "" : undefined}
                  aria-hidden="true"
                />
              ) : null}
              {part ? (
                <span className={styles.loop} data-loop={part} aria-hidden="true">
                  {part === "start" && loop?.label ? (
                    <span className={styles.loopLabel}>{loop.label}</span>
                  ) : null}
                </span>
              ) : null}
              <span className={styles.text}>
                {step.meta ? <span className={styles.meta}>{step.meta}</span> : null}
                <span className={styles.label}>{step.label}</span>
                {step.description ? (
                  <span className={styles.description}>{step.description}</span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
