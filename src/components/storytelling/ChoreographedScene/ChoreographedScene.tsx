"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import {
  compile,
  stateAt,
  toTransform,
  type Cue,
  type CueState,
} from "@/lib/choreography/choreography";
import { nativeEngine } from "@/lib/choreography/engines/native";
import type { Engine } from "@/lib/choreography/engines/types";
import { cx } from "@/lib/cx";
import { prefersReducedMotion } from "@/lib/motion";
import styles from "./ChoreographedScene.module.css";

const CueContext = createContext<Map<string, CueState> | null>(null);

/** Renders cued elements at a fixed progress: first paint, snapshots, stories. */
export function CueSnapshot({
  cues,
  progress,
  children,
}: {
  cues: readonly Cue[];
  progress: number;
  children: ReactNode;
}) {
  const states = useMemo(() => stateAt(cues, progress), [cues, progress]);
  return <CueContext.Provider value={states}>{children}</CueContext.Provider>;
}

type CueProps = HTMLAttributes<HTMLElement> & {
  /** Name the scene's cues refer to. */
  name: string;
  as?: "div" | "span" | "li" | "article" | "p" | "h3";
  ref?: Ref<HTMLElement>;
};

/**
 * An element the scene moves. Renders the static state of the closest
 * snapshot as inline styles; the engine takes over once it starts.
 */
export function CueElement({ name, as = "div", style, className, ...rest }: CueProps) {
  const states = useContext(CueContext);
  const state = states?.get(name);
  const own: CSSProperties | undefined = state
    ? { opacity: state.opacity, transform: toTransform(state) }
    : undefined;
  return createElement(as, {
    ...rest,
    "data-cue": name,
    className: cx(styles.cue, className),
    style: { ...own, ...style },
  });
}

export type ChoreographedSceneProps = {
  cues: readonly Cue[];
  /** Scroll length of the scene, in viewport heights. */
  length?: number;
  /** Plays the cues. In-house by default (no dependency); Motion and GSAP fit the same signature. */
  engine?: Engine;
  className?: string;
  /** Class of the pinned stage (one viewport tall). */
  stageClassName?: string;
  /**
   * Without `pinned`: the pinned stage itself, one viewport tall.
   * With `pinned`: content that scrolls normally beside the pinned column.
   */
  children: ReactNode;
  /**
   * Sticky column next to flowing content (StickyLayout pattern). The scene
   * is then as tall as its content and `length` is ignored; lay out both
   * columns with `className`.
   */
  pinned?: ReactNode;
  /**
   * Static version of the same content, in the normal flow: shown with
   * reduced motion and without JavaScript. Usually one snapshot per step.
   */
  fallback: ReactNode;
};

/**
 * A pinned stage whose elements follow declarative cues while the page
 * scrolls past it. The same cues run on any engine (in-house, Motion, GSAP)
 * and also give the static snapshots, so the three can be compared on equal
 * terms and reduced motion never needs a separate drawing.
 */
export function ChoreographedScene({
  cues,
  length = 4,
  engine = nativeEngine,
  className,
  stageClassName,
  children,
  pinned,
  fallback,
}: ChoreographedSceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tracks = useMemo(() => compile(cues), [cues]);

  useEffect(() => {
    const scene = ref.current;
    if (!scene) return;
    if (prefersReducedMotion()) {
      scene.dataset.static = "";
      return;
    }
    return engine(scene, tracks);
  }, [engine, tracks]);

  return (
    <div className={cx(styles.root, pinned ? null : className)}>
      <div
        ref={ref}
        className={cx(styles.scene, pinned ? styles.flowing : null, pinned ? className : null)}
        style={pinned ? undefined : ({ "--scene-length": length } as CSSProperties)}
        data-scene=""
      >
        <CueSnapshot cues={cues} progress={0}>
          {pinned ? (
            <>
              <div className={cx(styles.pin, stageClassName)}>{pinned}</div>
              <div className={styles.flow}>{children}</div>
            </>
          ) : (
            <div className={cx(styles.stage, stageClassName)}>{children}</div>
          )}
        </CueSnapshot>
      </div>
      {/* data-fallback lets a scene that needs more room show its static version sooner */}
      <div className={styles.fallback} data-fallback="">
        {fallback}
      </div>
    </div>
  );
}
