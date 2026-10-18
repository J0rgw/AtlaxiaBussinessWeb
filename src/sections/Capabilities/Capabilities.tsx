import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import {
  ChoreographedScene,
  CueElement,
  CueSnapshot,
} from "@/components/storytelling/ChoreographedScene";
import type { Dictionary } from "@/content";
import type { Engine } from "@/lib/choreography/engines/types";
import { CoherenceChart } from "./CoherenceChart";
import { SCENE_LENGTH, cues, stepOrder, type StepId } from "./cues";
import styles from "./Capabilities.module.css";

type CapabilitiesContent = Dictionary["capabilities"];

const number = (i: number) => String(i + 1).padStart(2, "0");

function StepText({ content, id }: { content: CapabilitiesContent; id: StepId }) {
  const step: { body: string; note?: string } = content.steps[id];
  return (
    <p className={styles.body}>
      {step.body}
      {step.note ? <strong className={styles.note}> {step.note}</strong> : null}
    </p>
  );
}

export type CapabilitiesProps = {
  content: CapabilitiesContent;
  /** In-house engine by default; stories can pass another one. */
  engine?: Engine;
};

/**
 * What ATLAXIA does, told on one signal over one day: a pinned chart gains a
 * sheet at each of five steps (observe, see a system, learn what is normal,
 * detect the mismatch, point to where) while the step text crossfades. The
 * plant model in four layers stays in "Qué estamos construyendo".
 */
export function Capabilities({ content, engine }: CapabilitiesProps) {
  return (
    <Section id="capabilities" labelledBy="capabilities-title" className={styles.section}>
      <Container>
        <SectionHeader
          titleId="capabilities-title"
          eyebrow={content.eyebrow}
          title={content.title}
          lead={content.lead}
        />
      </Container>

      <ChoreographedScene
        cues={cues}
        length={SCENE_LENGTH}
        engine={engine}
        stageClassName={styles.stage}
        fallback={<Fallback content={content} />}
      >
        <Container className={styles.layout}>
          <div className={styles.text}>
            {/* Visual index of the steps; the panels below carry the headings */}
            <ol role="list" className={styles.index} aria-hidden="true">
              {stepOrder.map((id, i) => (
                <CueElement as="li" key={id} name={`title-${id}`} className={styles.indexItem}>
                  <span className={styles.number}>{number(i)}</span>
                  {content.steps[id].title}
                </CueElement>
              ))}
            </ol>
            <ol role="list" className={styles.panels} aria-label={content.stepsLabel}>
              {stepOrder.map((id, i) => (
                <CueElement as="li" key={id} name={`panel-${id}`} className={styles.panel}>
                  <h3 className={styles.panelTitle}>
                    <span className={styles.number}>{number(i)}</span>
                    {content.steps[id].title}
                  </h3>
                  <StepText content={content} id={id} />
                </CueElement>
              ))}
            </ol>
          </div>
          <CoherenceChart content={content.chart} className={styles.chart} />
        </Container>
      </ChoreographedScene>

      <Container>
        <p className={styles.after}>
          <span className={styles.afterLabel}>{content.inside.label}</span>
          {content.inside.body}
        </p>
      </Container>
    </Section>
  );
}

/** Reduced motion and no JavaScript: the five steps in order, then the finished chart. */
function Fallback({ content }: { content: CapabilitiesContent }) {
  return (
    <Container className={styles.static}>
      <ol role="list" className={styles.staticSteps} aria-label={content.stepsLabel}>
        {stepOrder.map((id, i) => (
          <li key={id} className={styles.staticStep}>
            <h3 className={styles.staticTitle}>
              <span className={styles.number}>{number(i)}</span>
              {content.steps[id].title}
            </h3>
            <StepText content={content} id={id} />
          </li>
        ))}
      </ol>
      <CueSnapshot cues={cues} progress={1}>
        <CoherenceChart content={content.chart} />
      </CueSnapshot>
    </Container>
  );
}
