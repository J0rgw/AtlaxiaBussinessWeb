import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { EvidenceList } from "@/components/data-display/EvidenceList";
import type { Dictionary } from "@/content";
import { SectorsScene, type SceneDrawing } from "./SectorsScene";
import { WhereScene } from "./WhereScene";
import styles from "./Vision.module.css";

type VisionContent = Dictionary["vision"];

const evidenceOrder = ["perte", "nis2", "isac"] as const;

/**
 * The drawings the two scroll scenes play on the home: the isometric anatomy
 * models (scripts/anatomy). "lottie" brings back the P&ID sketches.
 */
const SCENE_DRAWING: SceneDrawing = "anatomy";

type VisionProps = {
  /** Name of the section (its navigation label), for assistive technology. */
  title: string;
  content: VisionContent;
};

/**
 * Where ATLAXIA is going. Two full-width scroll scenes (where it is going,
 * then where it starts: water, and where it could grow) and, closing them,
 * why now, with sources: the facts that make water the place to start.
 */
export function Vision({ title, content }: VisionProps) {
  return (
    <Section id="vision" labelledBy="vision-title">
      {/* The scenes carry their own visible titles; this one only names the region */}
      <h2 id="vision-title" className="visually-hidden">
        {title}
      </h2>

      {/* Full width: each scene pins its own viewport-tall stage */}
      <WhereScene content={content.scenes.where} drawing={SCENE_DRAWING} />
      <SectorsScene content={content.scenes.sectors} drawing={SCENE_DRAWING} />

      <Container>
        <EvidenceList
          className={styles.evidence}
          title={content.evidence.title}
          titleId="vision-evidence"
          sourceLabel={content.evidence.sourceLabel}
          items={evidenceOrder.map((id) => {
            const { figure, statement, source, href } = content.evidence.items[id];
            return { id, figure, statement, source: { label: source, href } };
          })}
        />
      </Container>
    </Section>
  );
}
