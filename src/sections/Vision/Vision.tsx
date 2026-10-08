import { NodeGraph } from "@/components/data-display/NodeGraph";
import { SignalChart } from "@/components/data-display/SignalChart";
import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { ProcessFlowReveal, type ProcessStep } from "@/components/storytelling/ProcessFlow";
import { StickyIndexStory, type IndexStoryItem } from "@/components/storytelling/StickyIndexStory";
import type { Dictionary } from "@/content";
import {
  contextSignals,
  expectedBehavior,
  graphRelations,
  graphSignals,
  graphSize,
} from "./illustrations";
import { SectorsScene } from "./SectorsScene";
import { WhereScene } from "./WhereScene";
import styles from "./Vision.module.css";

type VisionContent = Dictionary["vision"];
type FlowStepId = keyof VisionContent["flow"]["steps"];

const flowOrder: FlowStepId[] = ["data", "context", "behavior", "understanding", "action"];

type VisionProps = {
  content: VisionContent;
};

/**
 * Why ATLAXIA exists, told as the Cerebrium "Why" pattern: the section opens
 * straight on a pinned index of reasons (its label is the section heading) with
 * a visual panel for each. A company thesis that holds even if the current
 * product changes (AGENTS.md, section 6). It closes with two full-width scroll
 * scenes: where the company is going and where it starts.
 */
export function Vision({ content }: VisionProps) {
  const { reasons } = content;
  const behavior = expectedBehavior();

  const flowSteps: ProcessStep[] = flowOrder.map((id) => ({
    id,
    label: content.flow.steps[id].label,
    description: content.flow.steps[id].description,
  }));

  const items: IndexStoryItem[] = [
    {
      id: "context",
      label: reasons.context.label,
      title: reasons.context.title,
      body: <p>{reasons.context.body}</p>,
      visual: (
        <Panel>
          <SignalChart series={contextSignals()} description={reasons.context.chartDescription} />
        </Panel>
      ),
    },
    {
      id: "relations",
      label: reasons.relations.label,
      title: reasons.relations.title,
      body: <p>{reasons.relations.body}</p>,
      visual: (
        <Panel>
          <NodeGraph
            nodes={graphSignals.map((s) => ({ ...s, label: reasons.relations.nodes[s.id] }))}
            edges={graphRelations}
            width={graphSize.width}
            height={graphSize.height}
            description={reasons.relations.graphDescription}
          />
        </Panel>
      ),
    },
    {
      id: "behavior",
      label: reasons.behavior.label,
      title: reasons.behavior.title,
      body: <p>{reasons.behavior.body}</p>,
      visual: (
        <Panel>
          <SignalChart
            series={behavior.series}
            band={behavior.band}
            deviations={[behavior.deviation]}
            description={reasons.behavior.chartDescription}
            legend={[
              { key: "observed", label: reasons.behavior.legend.observed },
              { key: "expected", label: reasons.behavior.legend.expected },
              { key: "band", label: reasons.behavior.legend.band },
              { key: "deviation", label: reasons.behavior.legend.deviation },
            ]}
          />
        </Panel>
      ),
    },
    {
      id: "action",
      label: reasons.action.label,
      title: reasons.action.title,
      body: <p>{reasons.action.body}</p>,
      visual: (
        <Panel>
          <ProcessFlowReveal steps={flowSteps} label={content.flow.label} orientation="vertical" />
        </Panel>
      ),
    },
  ];

  return (
    <Section id="vision" labelledBy="vision-title">
      <Container>
        <StickyIndexStory
          items={items}
          label={content.indexLabel}
          labelAs="h2"
          labelId="vision-title"
        />
      </Container>

      {/* Full width: each scene pins its own viewport-tall stage */}
      <div className={styles.scenes}>
        <WhereScene content={content.scenes.where} />
        <SectorsScene content={content.scenes.sectors} />
      </div>
    </Section>
  );
}

/** Blueprint sheet for each visual: raised surface over a fine grid. */
function Panel({ children }: { children: React.ReactNode }) {
  return <div className={styles.panel}>{children}</div>;
}
