import { sample, toTransform, type Track } from "../choreography";
import { resolve, type Engine } from "./types";

/*
  In-house engine, no dependency. One frame loop for every scene: on scroll it
  reads window.scrollY (never a layout read) and writes opacity and transform.
  Geometry is measured only when something resizes, from ResizeObserver, where
  layout is already clean. A scene only listens while it is near the viewport.
*/

type Running = {
  top: number;
  travel: number;
  last: number;
  pairs: Array<[HTMLElement, Track, string]>;
};

const running = new Set<Running>();
let frame = 0;

function update(scene: Running, y: number) {
  const progress = scene.travel > 0 ? Math.min(1, Math.max(0, (y - scene.top) / scene.travel)) : 0;
  if (progress === scene.last) return;
  scene.last = progress;
  for (const pair of scene.pairs) {
    const state = sample(pair[1].keyframes, progress);
    const opacity = state.opacity.toFixed(3);
    const transform = toTransform(state);
    const key = `${opacity}|${transform}`;
    if (key === pair[2]) continue;
    pair[2] = key;
    pair[0].style.opacity = opacity;
    pair[0].style.transform = transform;
  }
}

function tick() {
  frame = 0;
  const y = window.scrollY;
  for (const scene of running) update(scene, y);
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(tick);
}

function start(scene: Running) {
  if (!running.size) {
    window.addEventListener("scroll", schedule, { passive: true });
  }
  running.add(scene);
  schedule();
}

function stop(scene: Running) {
  if (!running.delete(scene)) return;
  // Leaving fast can skip the ends of the range: settle on them once.
  update(scene, window.scrollY);
  if (running.size) return;
  window.removeEventListener("scroll", schedule);
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
}

export const nativeEngine: Engine = (element, tracks) => {
  // Without the observers (old browsers, jsdom) the first state stays painted.
  if (typeof ResizeObserver === "undefined" || typeof IntersectionObserver === "undefined") {
    return () => {};
  }
  const scene: Running = {
    top: 0,
    travel: 0,
    last: -1,
    pairs: resolve(element, tracks).map(([el, track]) => [el, track, ""]),
  };

  // The pinned stage (100svh), not innerHeight: the pin releases after exactly this travel,
  // whatever the mobile URL bar does.
  const stage = element.firstElementChild as HTMLElement | null;

  const measure = () => {
    const rect = element.getBoundingClientRect();
    scene.top = rect.top + window.scrollY;
    scene.travel = rect.height - (stage?.offsetHeight || window.innerHeight);
    scene.last = -1;
    schedule();
  };

  // Page height changes above the scene move it too: watch the document, not only the scene.
  const resizes = new ResizeObserver(measure);
  resizes.observe(element);
  resizes.observe(document.body);

  const visibility = new IntersectionObserver(
    ([entry]) => (entry?.isIntersecting ? start(scene) : stop(scene)),
    { rootMargin: "25% 0px" },
  );
  visibility.observe(element);

  // The painted state stays: clearing it would show every cue at full strength
  // until the next run reaches it (React does not paint its snapshot again).
  return () => {
    visibility.disconnect();
    resizes.disconnect();
    stop(scene);
  };
};
