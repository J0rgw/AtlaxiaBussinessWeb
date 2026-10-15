import { Fragment, type CSSProperties } from "react";
import styles from "./ScrollTextReveal.module.css";

export type ScrollTextRevealProps = {
  /** The statement. It is the section heading, so it must read well as plain text. */
  text: string;
  /** Short mono label above the statement. */
  eyebrow?: string;
  /** Pass the same value to the section `labelledBy`. */
  titleId?: string;
  as?: "h1" | "h2";
  /** Functional line under the statement: what the company does, in plain words. */
  lead?: string;
  /** "stacked" puts every word on its own line, for statements of two or three words. */
  layout?: "flow" | "stacked";
};

// Share of the pinned stretch, in percent of the scroll timeline, in which the words light up.
const START = 31;
const END = 64;
const WINDOW = 9;

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
}: ScrollTextRevealProps) {
  const words = text.split(/\s+/).filter(Boolean);
  const last = Math.max(1, words.length - 1);

  return (
    <div className={styles.track}>
      <div className={styles.stage}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <Heading id={titleId} className={styles.statement} data-layout={layout}>
          {words.map((word, i) => {
            const from = START + ((END - START - WINDOW) * i) / last;
            const style = {
              "--from": `${from.toFixed(2)}%`,
              "--to": `${(from + WINDOW).toFixed(2)}%`,
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
