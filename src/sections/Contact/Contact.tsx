import { ArrowUpRight, CornerDownLeft } from "lucide-react";
import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import type { Dictionary } from "@/content";
import { company } from "@/content/shared/company";
import { mailto } from "@/lib/mailto";
import { AtlaxiaSymbol } from "@/shell/Brand/Brand";
import styles from "./Contact.module.css";
import { meshPaths, meshSize } from "./mesh";

type ContactContent = Dictionary["contact"];
type IntentId = keyof ContactContent["intents"];

const intentOrder: IntentId[] = ["collaboration", "research", "partnership", "investment", "other"];

type ContactProps = {
  content: ContactContent;
};

/**
 * Closing call to action (Rig pattern): a dark full-bleed block with a wireframe
 * surface, a short statement and one wide primary action. Other intents stay one
 * click away as labelled mail links. No form until the legal texts exist.
 */
export function Contact({ content }: ContactProps) {
  const { rows, columns } = meshPaths();

  return (
    <Section id="contact" labelledBy="contact-title" tone="dark" className={styles.section}>
      <svg
        className={styles.mesh}
        viewBox={`0 0 ${meshSize.width} ${meshSize.height}`}
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
        focusable="false"
      >
        <g className={styles.meshColumns}>
          {columns.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <g className={styles.meshRows}>
          {rows.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </svg>

      <Container>
        <div className={styles.content}>
          <AtlaxiaSymbol className={styles.symbol} />
          <h2 id="contact-title" className={styles.title}>
            {content.title}
          </h2>
          <p className={styles.lead}>{content.lead}</p>

          <a className={styles.cta} href={mailto(content.primaryCta)}>
            <span>{content.primaryCta}</span>
            <CornerDownLeft aria-hidden="true" className={styles.ctaIcon} />
          </a>

          <div className={styles.intents}>
            <p className={styles.intentsLabel}>{content.intentsLabel}</p>
            <ul role="list" className={styles.intentList}>
              {intentOrder.map((id) => (
                <li key={id}>
                  <a className={styles.intent} href={mailto(content.intents[id])}>
                    {content.intents[id]}
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <p className={styles.email}>
            <span className={styles.emailLabel}>{content.emailLabel}</span>
            <a href={`mailto:${company.email}`}>{company.email}</a>
          </p>
        </div>
      </Container>
    </Section>
  );
}
