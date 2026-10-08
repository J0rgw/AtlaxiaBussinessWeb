import { ScrubLottie } from "@/components/data-display/ScrubLottie";
import { ParallaxLayer, ScrollScene, ScrollTrack } from "@/components/storytelling/ScrollScene";
import type { Dictionary } from "@/content";
import styles from "./VisionScenes.module.css";

type SectorsContent = Dictionary["vision"]["scenes"]["sectors"];
type SectorId = keyof SectorsContent["items"];

const sectors: SectorId[] = ["water", "food", "metal"];

/*
  ScrollTrack centers panel i at progress (START + i) / (START + 2): the first
  panel enters a little more than half a step right of center and the last one
  ends centered. Each drawing plays while its panel slides from the previous
  center to its own.
*/
const START = 0.55;
const TRAVEL = START + (sectors.length - 1);
const centerOf = (index: number) => (START + index) / TRAVEL;
const rangeOf = (index: number): [number, number] => [
  index === 0 ? 0 : centerOf(index - 1),
  centerOf(index),
];

type SectorsSceneProps = {
  content: SectorsContent;
};

/** Opacity of a sector that is not the one in the center: present, but not competing. */
const DIM = 0.28;
/** The first sector fades in right after the scene pins (its drawing starts empty). */
const FIRST_IN: [number, number] = [0, 0.06];

/**
 * Scene B, "Dónde empezamos": the heading holds while the three focus sectors
 * slide in sideways. Each sector is one column (its name over its drawing),
 * clearly apart from the next. Only the sector in the center is at full
 * strength; its neighbours are dimmed, so two names never compete. The name
 * rises into place (vertical parallax) and the drawing plays as it arrives.
 */
export function SectorsScene({ content }: SectorsSceneProps) {
  const last = sectors.length - 1;
  return (
    <ScrollScene length={4} stageClassName={styles.stage}>
      <ParallaxLayer className={styles.grid} x={["0vw", "-8vw"]} opacity={[0.6, 0.4]} />

      <div className={styles.sectorsLayout}>
        <ParallaxLayer className={styles.heading} x={["0vw", "-4vw"]}>
          <h3 className={styles.title}>{content.title}</h3>
        </ParallaxLayer>

        <ScrollTrack start={START} className={styles.track}>
          {sectors.map((id, index) => {
            const range = rangeOf(index);
            const center = centerOf(index);
            // The last sector never dims: its fade-out range starts after the scene ends
            const next = index === last ? 2 : centerOf(index + 1);
            return (
              <li key={id} className={styles.panel}>
                {/*
                  Brightens as it reaches the center, dims as it leaves. The first
                  sector is hidden until the scene is pinned, so nothing shows
                  while the heading is still moving into place.
                */}
                <ParallaxLayer
                  className={styles.panelFocus}
                  opacity={index === 0 ? [0, 1] : [DIM, 1]}
                  range={index === 0 ? FIRST_IN : range}
                >
                  <ParallaxLayer
                    className={styles.panelBody}
                    opacity={[1, DIM]}
                    range={[center, next]}
                  >
                    <ParallaxLayer y={["1.5rem", "0rem"]} range={range}>
                      <h4 className={styles.sectorName}>{content.items[id].name}</h4>
                    </ParallaxLayer>
                    <div className={styles.panelDrawing}>
                      <ScrubLottie
                        src={`/animations/sector-${id}.json`}
                        range={range}
                        align="start"
                        className={styles.lottie}
                      />
                    </div>
                  </ParallaxLayer>
                </ParallaxLayer>
                <p className="visually-hidden">{content.items[id].description}</p>
              </li>
            );
          })}
        </ScrollTrack>
      </div>
    </ScrollScene>
  );
}
