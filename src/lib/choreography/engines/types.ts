import type { Track } from "../choreography";

/** Plays compiled tracks on the elements of a scene. Returns its cleanup. */
export type Engine = (scene: HTMLElement, tracks: readonly Track[]) => () => void;

export type EngineName = "native" | "motion" | "gsap";

/** Elements of a scene by their `data-cue` name; tracks without an element are skipped. */
export function resolve(scene: HTMLElement, tracks: readonly Track[]) {
  const pairs: Array<[HTMLElement, Track]> = [];
  for (const track of tracks) {
    const element = scene.querySelector<HTMLElement>(`[data-cue="${track.target}"]`);
    if (element) pairs.push([element, track]);
  }
  return pairs;
}
