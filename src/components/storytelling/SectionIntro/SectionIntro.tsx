import { Fragment, type ReactNode } from "react";
import {
  ChoreographedScene,
  CueElement,
  CueSnapshot,
} from "@/components/storytelling/ChoreographedScene";
import type { Cue, Range } from "@/lib/choreography/choreography";
import { cx } from "@/lib/cx";
import styles from "./SectionIntro.module.css";

/** One sentence of the lead, read on its own. `emphasis` is a part of `text` set in the accent. */
export type IntroBeat = { text: string; emphasis?: string };

/*
  Timeline of an intro, in scene progress. The title lights up word by word;
  then the lead is read one sentence at a time, in one place: each sentence
  leaves before the next arrives. Figures time their cues on the same beats.
*/
const TITLE: Range = [0.03, 0.34];
const WORD = 0.08;
const BEATS: Range = [0.42, 0.97];
const FADE = 0.045;

export function introTimeline(beats: number) {
  const slot = (BEATS[1] - BEATS[0]) / Math.max(1, beats);
  const start = (i: number) => BEATS[0] + slot * i;
  return {
    title: TITLE,
    /** Stretch of beat `i`, from its arrival to the arrival of the next one. */
    beat: (i: number): Range => [start(i), i < beats - 1 ? start(i + 1) : 1],
    /** Arrival of beat `i`. */
    beatIn: (i: number): Range => [start(i), start(i) + FADE],
    /** Departure of beat `i`, just before the next one arrives. */
    beatOut: (i: number): Range => [start(i + 1) - FADE, start(i + 1)],
  };
}

/** `text` with its `emphasis` (if found) set in the accent. */
export function withEmphasis(text: string, emphasis?: string): ReactNode {
  const at = emphasis ? text.indexOf(emphasis) : -1;
  if (!emphasis || at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <em className={styles.em}>{emphasis}</em>
      {text.slice(at + emphasis.length)}
    </>
  );
}

type Word = { text: string; emphasized: boolean };

/** The title split into words, each marked if it falls inside the emphasis. */
function wordsOf(title: string, emphasis?: string): Word[] {
  const from = emphasis ? title.indexOf(emphasis) : -1;
  const to = from < 0 ? -1 : from + emphasis!.length;
  const words: Word[] = [];
  for (const match of title.matchAll(/\S+/g)) {
    const at = match.index;
    words.push({ text: match[0], emphasized: from >= 0 && at >= from && at < to });
  }
  return words;
}

function introCues(words: number, beats: number, figureCues: readonly Cue[]): Cue[] {
  const timeline = introTimeline(beats);
  const [t0, t1] = TITLE;
  const step = words > 1 ? (t1 - t0 - WORD) / (words - 1) : 0;
  const cues: Cue[] = [];
  for (let i = 0; i < words; i++) {
    const at = t0 + step * i;
    cues.push({ target: `intro-word-${i}`, at: [at, at + WORD], opacity: [0.14, 1], y: [24, 0] });
  }
  // With several sentences, focus moves from the title to the one being read
  if (beats > 1) {
    cues.push({
      target: "intro-title",
      at: [BEATS[0] - 0.05, BEATS[0] + 0.01],
      opacity: [1, 0.36],
    });
  }
  for (let i = 0; i < beats; i++) {
    cues.push({
      target: `intro-beat-${i}`,
      at: timeline.beatIn(i),
      opacity: [0, 1],
      y: [18, 0],
      ease: "out",
    });
    if (i < beats - 1) {
      cues.push({
        target: `intro-beat-${i}`,
        at: timeline.beatOut(i),
        opacity: [1, 0],
        y: [0, -10],
      });
    }
  }
  // The chapter number drifts down across the whole scene (parallax)
  cues.push({ target: "intro-index", at: [0, 1], y: [0, 18], ease: "linear" });
  return [...cues, ...figureCues];
}

export type SectionIntroProps = {
  /** Id of the title; pass the same value to the Section's `labelledBy`. */
  titleId: string;
  /** Chapter number, e.g. "02". Shown large; hidden from assistive tech. */
  index?: string;
  eyebrow: string;
  title: string;
  /** Part of the title set in the accent. */
  emphasis?: string;
  /** The lead, one sentence per beat. */
  beats: readonly IntroBeat[];
  /** Drawing beside the text, made of CueElements; time it with `introTimeline`. */
  figure?: ReactNode;
  figureCues?: readonly Cue[];
  /** Scroll length, in viewport heights. */
  length?: number;
  className?: string;
};

/**
 * The cover of a chapter, read as the page scrolls: the scene pins for a few
 * screens, the title lights up word by word and the lead follows one sentence
 * at a time, while the figure beside it shows what each sentence says. With
 * reduced motion, without JavaScript or on very short screens it is a plain
 * header: title, the whole lead and the figure finished.
 */
export function SectionIntro({
  titleId,
  index,
  eyebrow,
  title,
  emphasis,
  beats,
  figure,
  figureCues = [],
  length = 3,
  className,
}: SectionIntroProps) {
  const words = wordsOf(title, emphasis);
  const cues = introCues(words.length, beats.length, figureCues);

  const kicker = (
    <p className={styles.kicker}>
      {index ? <span className={styles.kickerIndex}>{index}</span> : null}
      <span>{eyebrow}</span>
    </p>
  );

  return (
    <ChoreographedScene
      cues={cues}
      length={length}
      className={className}
      stageClassName={styles.stage}
      fallback={
        <Static
          kicker={kicker}
          title={withEmphasis(title, emphasis)}
          beats={beats}
          figure={figure}
          cues={cues}
        />
      }
    >
      {index ? (
        <CueElement name="intro-index" className={styles.index} aria-hidden="true">
          {index}
        </CueElement>
      ) : null}
      <div className={cx(styles.layout, figure ? styles.withFigure : null)}>
        <div className={styles.text}>
          {kicker}
          <CueElement name="intro-title">
            <h2 id={titleId} className={styles.title}>
              {words.map((word, i) => (
                <Fragment key={i}>
                  {i > 0 ? " " : null}
                  <CueElement as="span" name={`intro-word-${i}`} className={styles.word}>
                    {word.emphasized ? <em className={styles.em}>{word.text}</em> : word.text}
                  </CueElement>
                </Fragment>
              ))}
            </h2>
          </CueElement>
          {/* One place for every sentence: each one leaves before the next arrives */}
          <div className={styles.beats}>
            {beats.map((beat, i) => (
              <CueElement as="p" key={i} name={`intro-beat-${i}`} className={styles.beat}>
                {withEmphasis(beat.text, beat.emphasis)}
              </CueElement>
            ))}
          </div>
        </div>
        {figure ? (
          <div className={styles.figure} aria-hidden="true">
            {figure}
          </div>
        ) : null}
      </div>
    </ChoreographedScene>
  );
}

type StaticProps = {
  kicker: ReactNode;
  title: ReactNode;
  beats: readonly IntroBeat[];
  figure?: ReactNode;
  cues: readonly Cue[];
};

/** The same header in the normal flow: the whole lead at once, the figure finished. */
function Static({ kicker, title, beats, figure, cues }: StaticProps) {
  return (
    <div className={cx(styles.layout, styles.static, figure ? styles.withFigure : null)}>
      <div className={styles.text}>
        {kicker}
        {/* The scene keeps the id; this heading is the one read when the scene is not shown */}
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.lead}>
          {beats.map((beat, i) => (
            <Fragment key={i}>
              {i > 0 ? " " : null}
              {withEmphasis(beat.text, beat.emphasis)}
            </Fragment>
          ))}
        </p>
      </div>
      {figure ? (
        <div className={styles.figure} aria-hidden="true">
          <CueSnapshot cues={cues} progress={1}>
            {figure}
          </CueSnapshot>
        </div>
      ) : null}
    </div>
  );
}
