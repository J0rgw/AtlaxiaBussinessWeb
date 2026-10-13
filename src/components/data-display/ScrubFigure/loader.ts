import { withBasePath } from "@/lib/paths";
import type { Timeline } from "./player";

/*
  Loads the anatomy figures off the scroll path. A figure is a 200 to 600 KB
  SVG: parsing it is one long task, and its first frame (style, layout, paint
  of thousands of paths) is another. So:
  - the files of every queued figure are fetched once the page has loaded and
    gone idle (with Save-Data on, only when a figure nears the viewport);
  - each figure is parsed and handed over in an idle slice of its own, one at
    a time, with a rendered frame between two of them;
  - a figure that nears the viewport before its turn goes next, without
    waiting for idle time.
*/

type Files = { markup: string; timeline: Timeline };

type Job = {
  src: string;
  ready: (svg: SVGSVGElement, timeline: Timeline) => void;
  files?: Files;
  near: boolean;
};

export type QueuedFigure = {
  /** The figure is close to the viewport: load it next. */
  near: () => void;
  cancel: () => void;
};

const requests = new Map<string, Promise<Files>>();
const queue: Job[] = [];
/** On once the page has loaded and gone idle (and Save-Data is off): figures load in order. */
let prefetching = false;
let started = false;
let waking: (() => void) | null = null;

function remove(job: Job) {
  const index = queue.indexOf(job);
  if (index >= 0) queue.splice(index, 1);
}

function saveData() {
  return Boolean((navigator as { connection?: { saveData?: boolean } }).connection?.saveData);
}

function request(src: string) {
  let files = requests.get(src);
  if (!files) {
    const get = (extension: string) =>
      fetch(withBasePath(`${src}.${extension}`)).then((response) => {
        if (!response.ok) throw new Error(`${response.status} ${src}.${extension}`);
        return response;
      });
    files = Promise.all([
      get("svg").then((response) => response.text()),
      get("json").then((response) => response.json() as Promise<Timeline>),
    ]).then(([markup, timeline]) => ({ markup, timeline }));
    // A failed request can be retried by the next figure that asks for it
    files.catch(() => requests.delete(src));
    requests.set(src, files);
  }
  return files;
}

function fetchFiles(job: Job) {
  request(job.src).then(
    (files) => {
      job.files = files;
      pump();
    },
    // Decorative: a figure that cannot load leaves its box empty
    () => remove(job),
  );
}

/** The next figure to hand over: a near one first, then in order once prefetching. */
function next() {
  return (
    queue.find((job) => job.near && job.files) ??
    (prefetching ? queue.find((job) => job.files) : undefined)
  );
}

function pump() {
  if (waking || !next()) return;
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    waking = null;
    const job = next();
    if (!job?.files) return;
    remove(job);
    // Inert until it is moved into the page: static file built by scripts/anatomy
    const template = document.createElement("template");
    template.innerHTML = job.files.markup;
    const svg = template.content.querySelector("svg");
    if (svg) job.ready(svg, job.files.timeline);
    // The next figure waits for this one's first frame
    requestAnimationFrame(() => setTimeout(pump, 0));
  };
  // A near figure is woken right away, after the frame being drawn
  waking = () => requestAnimationFrame(() => setTimeout(run, 0));
  if (next()?.near) waking();
  else if (typeof requestIdleCallback === "function") requestIdleCallback(run);
  else setTimeout(run, 200);
}

function start() {
  if (started) return;
  started = true;
  const begin = () => {
    if (saveData()) return;
    prefetching = true;
    queue.forEach((job) => job.files || fetchFiles(job));
  };
  const idle = () =>
    typeof requestIdleCallback === "function"
      ? requestIdleCallback(begin, { timeout: 4000 })
      : setTimeout(begin, 1000);
  if (document.readyState === "complete") idle();
  else window.addEventListener("load", idle, { once: true });
}

/**
 * Queues an anatomy figure (base path, no extension) for loading. `ready`
 * receives its SVG, parsed but not yet in the page, and its timeline.
 */
export function queueFigure(
  src: string,
  ready: (svg: SVGSVGElement, timeline: Timeline) => void,
): QueuedFigure {
  const job: Job = { src, ready, near: false };
  queue.push(job);
  start();
  if (prefetching) fetchFiles(job);
  return {
    near() {
      if (job.near || !queue.includes(job)) return;
      job.near = true;
      if (job.files) waking?.();
      else if (!prefetching) fetchFiles(job);
      pump();
    },
    cancel: () => remove(job),
  };
}
