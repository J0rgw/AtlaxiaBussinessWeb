import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { ScrollTextReveal } from "@/components/storytelling/ScrollTextReveal";
import type { Dictionary } from "@/content";
import { SectorsScene, type SceneDrawing } from "./SectorsScene";
import { WhereScene } from "./WhereScene";
import styles from "./Vision.module.css";

type VisionContent = Dictionary["vision"];

/**
 * The drawings the two scroll scenes play on the home: the isometric anatomy
 * models (scripts/anatomy). "lottie" brings back the P&ID sketches.
 */
const SCENE_DRAWING: SceneDrawing = "anatomy";

type VisionProps = {
  content: VisionContent;
};

/**
 * The company thesis. It opens with a promise of what ATLAXIA does, read as the
 * page scrolls, and closes with two full-width scroll scenes: where the company
 * is going and where it starts.
 */
export function Vision({ content }: VisionProps) {
  return (
    <Section id="vision" labelledBy="vision-title">
      <Container>
        <ScrollTextReveal titleId="vision-title" text={content.promise} />
      </Container>

      {/* Full width: each scene pins its own viewport-tall stage */}
      <div className={styles.scenes}>
        <WhereScene content={content.scenes.where} drawing={SCENE_DRAWING} />
        <SectorsScene content={content.scenes.sectors} drawing={SCENE_DRAWING} />
      </div>
    </Section>
  );
}
