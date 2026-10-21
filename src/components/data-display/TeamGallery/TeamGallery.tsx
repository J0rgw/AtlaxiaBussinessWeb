"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { cx } from "@/lib/cx";
import styles from "./TeamGallery.module.css";

/** A portrait in two densities; AVIF first, WebP as the fallback. */
export type Portrait = {
  src: string;
  srcSet: string;
  avifSrcSet?: string;
  width: number;
  height: number;
};

export type TeamMember = {
  id: string;
  name: string;
  /** Position in the company, set under the name inside the frame. */
  role: string;
  /** Two letters drawn large in the frame while there is no portrait. */
  initials: string;
  portrait?: Portrait;
  /** The sheet: short label and its text, or a list (skills) drawn as tags. */
  facts: readonly { label: string; value: string | readonly string[] }[];
  linkedin?: string;
  /** Text of the profile link, e.g. "LinkedIn de David Palazón Palau". */
  linkedinText?: string;
};

export type TeamGalleryProps = {
  members: readonly TeamMember[];
  /** Id of the heading that names the list. */
  labelledBy?: string;
  /** Member open when the page loads on wide screens; `null` for none. Defaults to the first. */
  defaultOpen?: string | null;
  className?: string;
};

/**
 * Wide screens show the row; below it the people stack with their sheets in
 * view. Same query as the stylesheet's row.
 */
const ROW_QUERY = "(min-width: 60rem) and (scripting: enabled)";

/**
 * The founders side by side, the name and role inside each portrait. On wide
 * screens one tile is open: it widens and shows its sheet while the others
 * narrow to make room. Hovering or tabbing to a tile previews it; clicking
 * (or Enter) pins it; Escape closes. Tab visits the name buttons and the
 * links of the pinned sheet only: a sheet that is merely previewed, or closed
 * and clipped out of sight, is not in the tab order (its links still work
 * with the pointer). On phones the tiles stack and every sheet is in view. The sheets are always in the document, so assistive
 * technology reads them whichever tile is open.
 */
export function TeamGallery({ members, labelledBy, defaultOpen, className }: TeamGalleryProps) {
  const [open, setOpen] = useState<string | null>(
    defaultOpen === undefined ? (members[0]?.id ?? null) : defaultOpen,
  );
  // Escape also silences the hover and focus preview until the pointer or focus moves on
  const [quiet, setQuiet] = useState(false);
  // The disclosure exists only where tiles can be closed: the row
  const [row, setRow] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(ROW_QUERY);
    const update = () => setRow(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key !== "Escape") return;
    setOpen(null);
    setQuiet(true);
  };

  return (
    <ul
      role="list"
      className={cx(styles.row, className)}
      aria-labelledby={labelledBy}
      data-quiet={quiet ? "" : undefined}
      onKeyDown={onKeyDown}
      onPointerMove={quiet ? () => setQuiet(false) : undefined}
      onFocus={quiet ? () => setQuiet(false) : undefined}
    >
      {members.map((member) => {
        const detailId = `team-${member.id}-sheet`;
        const isOpen = open === member.id;
        return (
          <li key={member.id} className={styles.tile} data-open={isOpen ? "" : undefined}>
            <article className={styles.card} aria-labelledby={`team-${member.id}-name`}>
              <div className={cx(styles.face, member.portrait ? styles.withPhoto : null)}>
                {member.portrait ? (
                  <picture>
                    {member.portrait.avifSrcSet ? (
                      <source type="image/avif" srcSet={member.portrait.avifSrcSet} />
                    ) : null}
                    <img
                      className={styles.photo}
                      src={member.portrait.src}
                      srcSet={member.portrait.srcSet}
                      width={member.portrait.width}
                      height={member.portrait.height}
                      // The name is set right over it as text
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                ) : (
                  <svg
                    className={styles.monogram}
                    viewBox="0 0 100 125"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <text x="50" y="74" textAnchor="middle">
                      {member.initials}
                    </text>
                  </svg>
                )}
                <div className={styles.caption}>
                  <h3 id={`team-${member.id}-name`} className={styles.name}>
                    {row ? (
                      <button
                        type="button"
                        className={styles.toggle}
                        aria-expanded={isOpen}
                        aria-controls={detailId}
                        onClick={() => setOpen(isOpen ? null : member.id)}
                      >
                        {member.name}
                      </button>
                    ) : (
                      member.name
                    )}
                  </h3>
                  <p className={styles.role}>{member.role}</p>
                </div>
              </div>
              <div id={detailId} className={styles.sheet}>
                <dl className={styles.facts}>
                  {member.facts.map((fact) => (
                    <div key={fact.label} className={styles.fact}>
                      <dt className={styles.label}>{fact.label}</dt>
                      <dd className={styles.value}>
                        {typeof fact.value === "string" ? (
                          fact.value
                        ) : (
                          <ul role="list" className={styles.tags}>
                            {fact.value.map((item) => (
                              <li key={item} className={styles.tag}>
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
                {member.linkedin ? (
                  <p className={styles.profile}>
                    <a
                      className={styles.link}
                      href={member.linkedin}
                      // On the row, only the pinned sheet takes the focus: the others are
                      // clipped out of sight, or only a preview, and the button pins them
                      tabIndex={row && !isOpen ? -1 : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {member.linkedinText ?? "LinkedIn"}
                    </a>
                  </p>
                ) : null}
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
