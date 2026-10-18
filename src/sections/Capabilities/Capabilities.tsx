import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import {
  ChoreographedScene,
  CueElement,
  CueSnapshot,
} from "@/components/storytelling/ChoreographedScene";
import { SectionIntro } from "@/components/storytelling/SectionIntro";
import type { Dictionary } from "@/content";
import { chapterNumber } from "@/content/shared/sections";
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

/** How it works inside, in one short fact: it closes the five steps. */
function Inside({ content }: { content: CapabilitiesContent }) {
  return (
    <>
      <span className={styles.insideLabel}>{content.inside.label}</span>
      {content.inside.body}
    </>
  );
}

export type CapabilitiesProps = {
  content: CapabilitiesContent;
  /** In-house engine by default; stories can pass another one. */
  engine?: Engine;
};

/**
 * What ATLAXIA does, in two scenes. The cover: the title lights up as the page
 * scrolls and one line hands over to the steps, which carry the story. Then
 * one signal over one day: a pinned chart gains a sheet at each
 * of five steps (observe, see a system, learn what is normal, detect the
 * mismatch, point to where) while the step text changes, and it closes on how
 * it works inside, with the five steps lit. The plant model in four layers
 * stays in "Qué estamos construyendo".
 */
export function Capabilities({ content, engine }: CapabilitiesProps) {
  return (
    <Section id="capabilities" labelledBy="capabilities-title" className={styles.section}>
      <SectionIntro
        titleId="capabilities-title"
        index={chapterNumber("capabilities")}
        eyebrow={content.eyebrow}
        title={content.title}
        emphasis={content.intro.emphasis}
        beats={content.intro.beats}
        length={2}
      />

      <ChoreographedScene
        cues={cues}
        length={SCENE_LENGTH}
        engine={engine}
        className={styles.steps}
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
            {/* The step texts and the closing note share one cell: one at a time */}
            <div className={styles.slot}>
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
              <CueElement as="p" name="inside" className={styles.inside}>
                <Inside content={content} />
              </CueElement>
            </div>
          </div>
          <CoherenceChart content={content.chart} className={styles.chart} />
        </Container>
      </ChoreographedScene>
    </Section>
  );
}

/** Reduced motion and no JavaScript: the five steps in order, how it works inside, then the finished chart. */
function Fallback({ content }: { content: CapabilitiesContent }) {
  return (
    <Container className={styles.static}>
      <div className={styles.staticText}>
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
        <p className={styles.inside}>
          <Inside content={content} />
        </p>
      </div>
      <CueSnapshot cues={cues} progress={1}>
        <CoherenceChart content={content.chart} />
      </CueSnapshot>
    </Container>
  );
}
