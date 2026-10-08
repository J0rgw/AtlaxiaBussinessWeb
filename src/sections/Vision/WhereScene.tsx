import type { CSSProperties } from "react";
import { ScrubLottie } from "@/components/data-display/ScrubLottie";
import { ParallaxLayer, ScrollScene } from "@/components/storytelling/ScrollScene";
import type { Dictionary } from "@/content";
import styles from "./VisionScenes.module.css";

type WhereContent = Dictionary["vision"]["scenes"]["where"];
type StageId = keyof WhereContent["stages"];

/*
  When each stage word shows, as scene progress (0 to 1). Tied to the frames of
  public/animations/vision-where.json (scripts/lottie/scene-where.mjs): the
  process is complete around 0.45, the plant at 0.73, the network at 0.97.
*/
const stages: Array<{ id: StageId; from: number; to: number }> = [
  { id: "today", from: 0.28, to: 0.62 },
  { id: "next", from: 0.62, to: 0.84 },
  // Past the end on purpose: the last word stays once the scene is over
  { id: "goal", from: 0.84, to: 1.5 },
];

type WhereSceneProps = {
  content: WhereContent;
};

/**
 * Scene A, "Hacia dónde vamos": the heading holds the stage while the camera
 * pulls back from one sensor to a whole network of plants. Three words mark
 * where we are (today), what comes next and the goal.
 */
export function WhereScene({ content }: WhereSceneProps) {
  return (
    <ScrollScene length={4.5} stageClassName={styles.stage}>
      <ParallaxLayer className={styles.grid} scale={[1.35, 1]} opacity={[0.6, 0.35]} />

      <div className={styles.whereLayout}>
        <ParallaxLayer className={styles.heading} y={["0vh", "-3vh"]}>
          <h3 className={`${styles.title} ${styles.titleWhere}`}>{content.title}</h3>
        </ParallaxLayer>

        <div className={styles.whereDrawing}>
          <ScrubLottie src="/animations/vision-where.json" className={styles.lottie} />
          <p className="visually-hidden">{content.description}</p>
        </div>

        <ol className={styles.cues} aria-label={content.stagesLabel}>
          {stages.map(({ id, from, to }) => (
            <li
              key={id}
              className={styles.cue}
              style={{ "--from": from, "--to": to } as CSSProperties}
            >
              <span className={styles.cueWord}>{content.stages[id].word}</span>
              <span className={styles.cueDetail} data-long={id === "goal" ? "" : undefined}>
                {content.stages[id].detail}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </ScrollScene>
  );
}
