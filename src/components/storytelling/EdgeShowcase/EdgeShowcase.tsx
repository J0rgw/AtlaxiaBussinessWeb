import { Fragment, type CSSProperties } from "react";
import { cx } from "@/lib/cx";
import styles from "./EdgeShowcase.module.css";

export type EdgeImage = {
  src: string;
  /** Density descriptors ("a.webp 1x, b.webp 2x"). */
  srcSet?: string;
  /** Same descriptors in AVIF, preferred where supported. */
  avifSrcSet?: string;
  /** Intrinsic size, for the aspect ratio. */
  width: number;
  height: number;
  alt: string;
};

export type EdgeShowcaseProps = {
  id?: string;
  titleId: string;
  /** Headline, one entry per line. */
  lines: readonly string[];
  /** Lines before the device; the rest go after it. Defaults to half. */
  split?: number;
  /** Short paragraph under the headline. */
  lede?: string;
  /**
   * The device cut out on a transparent background. Its alpha is also the
   * mask of the text over it, so it must be same-origin (or CORS-enabled).
   */
  image: EdgeImage;
  className?: string;
};

/**
 * A device at the center of a large headline. The object sits between the
 * two blocks of the headline and crosses them; over it, the text turns paper
 * color, so every word stays readable. On scroll, the two blocks close in on
 * the device (parallax) and stay in place once the composition is complete.
 */
export function EdgeShowcase({
  id,
  titleId,
  lines,
  split = Math.ceil(lines.length / 2),
  lede,
  image,
  className,
}: EdgeShowcaseProps) {
  const upper = lines.slice(0, split);
  const lower = lines.slice(split);
  const style = {
    "--device-ratio": image.height / image.width,
    "--device-mask": `url("${image.src}")`,
  } as CSSProperties;

  return (
    <section id={id} aria-labelledby={titleId} className={cx(styles.showcase, className)}>
      <div className={styles.stage} style={style}>
        <h2 id={titleId} className={styles.title}>
          <Lines lines={upper} className={styles.upper} />{" "}
          <Lines lines={lower} className={styles.lower} />
        </h2>

        <div className={styles.device}>
          <picture>
            {image.avifSrcSet ? <source type="image/avif" srcSet={image.avifSrcSet} /> : null}
            <img
              className={styles.image}
              src={image.src}
              srcSet={image.srcSet}
              width={image.width}
              height={image.height}
              alt={image.alt}
              loading="lazy"
              decoding="async"
            />
          </picture>
          {/* The headline again, in paper color, seen only through the device */}
          <div className={styles.knockout} aria-hidden="true">
            <Lines lines={upper} className={cx(styles.type, styles.copyUpper)} />
            <Lines lines={lower} className={cx(styles.type, styles.copyLower)} />
          </div>
        </div>

        {lede ? <p className={styles.lede}>{lede}</p> : null}
      </div>
    </section>
  );
}

type LinesProps = { lines: readonly string[]; className?: string };

function Lines({ lines, className }: LinesProps) {
  return (
    <span className={className}>
      {lines.map((line, index) => (
        <Fragment key={line}>
          {/* Spaces between block lines keep the accessible name readable */}
          {index > 0 ? " " : null}
          <span className={styles.line}>{line}</span>
        </Fragment>
      ))}
    </span>
  );
}
