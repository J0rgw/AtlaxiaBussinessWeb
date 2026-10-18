import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { ScrollTextReveal } from "@/components/storytelling/ScrollTextReveal";
import { StickyIndexStory, type IndexStoryItem } from "@/components/storytelling/StickyIndexStory";
import type { Dictionary } from "@/content";
import { chapterNumber } from "@/content/shared/sections";
import styles from "./About.module.css";

type AboutContent = Dictionary["about"];
type ChapterId = keyof AboutContent["chapters"];
type MemberId = keyof AboutContent["team"];

const chapterOrder: ChapterId[] = ["origin", "truedata", "company", "team"];
const memberOrder: MemberId[] = ["ceo", "cto", "cmo"];

type AboutProps = {
  content: AboutContent;
};

/** A chapter's text: each paragraph opens with the sentence that sums it up. */
function Chapter({ chapter }: { chapter: AboutContent["chapters"][ChapterId] }) {
  const record: readonly string[] = chapter.record;
  return (
    <>
      {chapter.paragraphs.map((paragraph) => (
        <p key={paragraph.lead} className={styles.paragraph}>
          <span className={styles.lead}>{paragraph.lead}</span> {paragraph.text}
        </p>
      ))}
      {/* The facts of the chapter, as the boxes of a drawing's title block */}
      {record.length ? (
        <ul role="list" className={styles.record}>
          {record.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

function Team({ content }: { content: AboutContent }) {
  return (
    <ul role="list" className={styles.members} aria-label={content.teamLabel}>
      {memberOrder.map((id) => {
        const member = content.team[id];
        return (
          <li key={id} className={styles.member}>
            <span className={styles.role}>{member.role}</span>
            <span className={styles.name}>{member.name}</span>
            <span className={styles.profile}>{member.profile}</span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Where ATLAXIA comes from, then the people (CLAUDE.md: origin first, no
 * résumés). Told in text, as Forgis tells its manifesto: a statement that
 * lights up word by word as it crosses the screen, then four chapters read
 * next to a numbered index that follows the reading.
 */
export function About({ content }: AboutProps) {
  const items: IndexStoryItem[] = chapterOrder.map((id) => {
    const chapter = content.chapters[id];
    return {
      id,
      label: chapter.label,
      title: chapter.title,
      body: (
        <>
          <Chapter chapter={chapter} />
          {id === "team" ? <Team content={content} /> : null}
        </>
      ),
    };
  });

  return (
    <Section id="about" labelledBy="about-title">
      <Container className={styles.layout}>
        <SectionHeader
          titleId="about-title"
          index={chapterNumber("about")}
          eyebrow={content.eyebrow}
          title={content.title}
          size="display"
        />
        <ScrollTextReveal as="p" text={content.statement} pin={false} align="start" />
        <StickyIndexStory
          items={items}
          label={content.chaptersLabel}
          variant="chapters"
          className={styles.chapters}
        />
      </Container>
    </Section>
  );
}
