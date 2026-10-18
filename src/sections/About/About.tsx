import { SplitLayout } from "@/components/layout/SplitLayout";
import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import type { Dictionary } from "@/content";
import styles from "./About.module.css";

type AboutContent = Dictionary["about"];
type MemberId = keyof AboutContent["team"];

const memberOrder: MemberId[] = ["ceo", "cto", "cmo"];

type AboutProps = {
  content: AboutContent;
};

/**
 * Where ATLAXIA comes from, then the people: origin first, no résumés
 * (CLAUDE.md). Only the facts agreed for the site: name and role per person.
 */
export function About({ content }: AboutProps) {
  const { origin } = content;

  return (
    <Section id="about" labelledBy="about-title">
      <Container>
        <SectionHeader titleId="about-title" title={content.title} />
        <SplitLayout
          ratio="7:5"
          start={
            <div className={styles.origin}>
              <h3 className={styles.originTitle}>{origin.title}</h3>
              <p className={styles.originBody}>{origin.body}</p>
            </div>
          }
          end={
            <div className={styles.team}>
              <h3 className={styles.teamLabel}>{content.teamLabel}</h3>
              <ul role="list" className={styles.members}>
                {memberOrder.map((id) => (
                  <li key={id} className={styles.member}>
                    <span className={styles.name}>{content.team[id].name}</span>
                    <span className={styles.role}>{content.team[id].role}</span>
                  </li>
                ))}
              </ul>
            </div>
          }
        />
      </Container>
    </Section>
  );
}
