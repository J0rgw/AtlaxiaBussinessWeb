import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { Tag } from "@/components/primitives/Tag";
import type { Dictionary } from "@/content";
import { mailto } from "@/lib/mailto";
import { CaseCard, PressureTrend, RelatedList, ScadaList, TrendNote } from "./CasePanels";
import { PumpStation, type InstrumentState } from "./PumpStation";
import type { CaseSignal } from "./waterCase";
import styles from "./WaterCase.module.css";

type VisionContent = Dictionary["vision"];
type CaseContent = VisionContent["waterCase"];

export type CaseStep = keyof CaseContent["steps"];
export const caseSteps: CaseStep[] = ["scada", "drift", "expected", "related", "decision"];

const allNormal: Record<CaseSignal, InstrumentState> = {
  level: "normal",
  pressure: "normal",
  flow: "normal",
  vibration: "normal",
  energy: "normal",
};

const moving: Record<CaseSignal, InstrumentState> = {
  level: "muted",
  pressure: "deviation",
  flow: "related",
  vibration: "related",
  energy: "related",
};

/** What the station and the side panel show at each step of the story. */
function stepView(step: CaseStep, content: CaseContent) {
  const trendNotes = Object.fromEntries(
    (["level", "pressure", "flow", "vibration", "energy"] as CaseSignal[]).map((signal) => [
      signal,
      <TrendNote key={signal} signal={signal} content={content} />,
    ]),
  ) as Record<CaseSignal, ReactNode>;

  switch (step) {
    case "scada":
      return {
        states: allNormal,
        relations: false,
        notes: {},
        panel: <ScadaList content={content} />,
      };
    case "drift":
      return {
        states: { ...allNormal, pressure: "focus" as const },
        relations: false,
        notes: {},
        panel: <PressureTrend content={content} />,
      };
    case "expected":
      return {
        states: { ...allNormal, pressure: "deviation" as const },
        relations: false,
        notes: { pressure: <Tag tone="medium">{content.status.deviation}</Tag> },
        panel: <PressureTrend content={content} showExpected showDetection />,
      };
    case "related":
      return {
        states: moving,
        relations: true,
        notes: trendNotes,
        panel: <RelatedList content={content} />,
      };
    case "decision":
      return {
        states: moving,
        relations: true,
        notes: trendNotes,
        panel: <PressureTrend content={content} showExpected showDetection showDecision />,
      };
  }
}

type WaterCaseFrameProps = {
  content: CaseContent;
  step: CaseStep;
};

/**
 * One moment of the water case ("Dónde empezamos"): the heading, the step
 * message in large type next to what it explains, the station and a panel.
 * Static; the scroll scene will move between these frames.
 */
export function WaterCaseFrame({ content, step }: WaterCaseFrameProps) {
  const index = caseSteps.indexOf(step);
  const view = stepView(step, content);

  return (
    <div className={styles.frame}>
      <header className={styles.head}>
        <h3 className={styles.title}>{content.title}</h3>
        <p className={styles.place}>
          {content.place} <span className={styles.placeNote}>{content.illustration}</span>
        </p>
      </header>

      <p className={styles.message}>
        <span className={styles.stepIndex}>
          {String(index + 1).padStart(2, "0")} / {String(caseSteps.length).padStart(2, "0")}
        </span>
        {content.steps[step]}
      </p>

      <div className={styles.body}>
        <PumpStation
          content={content}
          states={view.states}
          showRelations={view.relations}
          notes={view.notes}
        />
        {view.panel}
      </div>
    </div>
  );
}

type DirectionFrameProps = {
  content: VisionContent;
};

/** "Hacia dónde vamos": the direction in one sentence, the invitation and the alert with its slots to come. */
export function DirectionFrame({ content }: DirectionFrameProps) {
  const { direction } = content;
  return (
    <div className={styles.frame} data-variant="direction">
      <div className={styles.directionText}>
        <h3 className={styles.title}>{direction.title}</h3>
        <p className={styles.statement}>{direction.statement}</p>
        <p className={styles.invitation}>{direction.invitation}</p>
        <a className={styles.cta} href={mailto(direction.cta)}>
          {direction.cta}
          <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
      <CaseCard card={direction.card} content={content.waterCase} />
    </div>
  );
}
