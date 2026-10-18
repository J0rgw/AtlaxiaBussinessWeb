import { Fragment, type CSSProperties } from "react";
import styles from "./ScrollTextReveal.module.css";

export type ScrollTextRevealProps = {
  /** The statement. As a heading it must read well as plain text. */
  text: string;
  /** Short mono label above the statement. */
  eyebrow?: string;
  /** Pass the same value to the section `labelledBy`. */
  titleId?: string;
  as?: "h1" | "h2" | "p";
  /** Functional line under the statement: what the company does, in plain words. */
  lead?: string;
  /** "stacked" puts every word on its own line, for statements of two or three words. */
  layout?: "flow" | "stacked";
  /**
   * true: the statement holds the screen while its words light up (one idea
   * per screen). false: it scrolls with the page and lights up as it crosses
   * the viewport, for a statement inside a longer text.
   */
  pin?: boolean;
  align?: "center" | "start";
};

/*
  Where the words light up, in percent of the timeline. Pinned: a stretch of
  the pinned track. In the flow: the paragraph's "contain" range, from fully
  on screen to its top reaching the top of the viewport; done by about 60 %.
*/
const RANGES = {
  pinned: { start: 31, end: 64, window: 9 },
  flow: { start: 0, end: 60, window: 14 },
};

/**
 * A statement that is read as the page scrolls: it pins to the viewport and its
 * words go from dim to full ink one after another, driven by scroll progress
 * (CSS view timeline), never by a clock. Without scroll timelines or with
 * reduced motion it is plain, fully readable text and nothing is pinned.
 */
export function ScrollTextReveal({
  text,
  eyebrow,
  titleId,
  as: Heading = "h2",
  lead,
  layout = "flow",
  pin = true,
  align = "center",
}: ScrollTextRevealProps) {
  const words = text.split(/\s+/).filter(Boolean);
  const last = Math.max(1, words.length - 1);
  const { start, end, window } = RANGES[pin ? "pinned" : "flow"];

  return (
    <div className={styles.track} data-pin={pin ? "" : undefined} data-align={align}>
      <div className={styles.stage}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <Heading id={titleId} className={styles.statement} data-layout={layout}>
          {words.map((word, i) => {
            const from = start + ((end - start - window) * i) / last;
            const style = {
              "--from": `${from.toFixed(2)}%`,
              "--to": `${(from + window).toFixed(2)}%`,
            } as CSSProperties;
            return (
              <Fragment key={i}>
                {i > 0 ? " " : null}
                <span className={styles.word} style={style}>
                  {word}
                </span>
              </Fragment>
            );
          })}
        </Heading>
        {lead ? <p className={styles.lead}>{lead}</p> : null}
      </div>
    </div>
  );
}
