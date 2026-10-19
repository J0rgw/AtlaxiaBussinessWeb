import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { SectionIntro } from "@/components/storytelling/SectionIntro";
import { StickyIndexStory, type IndexStoryItem } from "@/components/storytelling/StickyIndexStory";
import type { Dictionary } from "@/content";
import { chapterNumber } from "@/content/shared/sections";
import styles from "./About.module.css";

type AboutContent = Dictionary["about"];
type ChapterId = keyof AboutContent["chapters"];

const chapterOrder: ChapterId[] = ["origin", "truedata", "company"];

type AboutProps = {
  content: AboutContent;
};

/** A chapter's text: each paragraph opens with the sentence that sums it up. */
function Chapter({ chapter }: { chapter: AboutContent["chapters"][ChapterId] }) {
  return (
    <>
      {chapter.paragraphs.map((paragraph) => (
        <p key={paragraph.lead} className={styles.paragraph}>
          <span className={styles.lead}>{paragraph.lead}</span> {paragraph.text}
        </p>
      ))}
      {/* The facts of the chapter, as the boxes of a drawing's title block */}
      <ul role="list" className={styles.record}>
        {chapter.record.map((fact) => (
          <li key={fact}>{fact}</li>
        ))}
      </ul>
    </>
  );
}

/**
 * Where ATLAXIA comes from, then the people (CLAUDE.md: origin first, no
 * résumés). The cover, as in "Qué hacemos": the title lights up as the page
 * scrolls and one line sums the origin up. Then three chapters read next to a
 * numbered index that waits at the reading line (Forgis). The people follow in
 * their own section (Team).
 */
export function About({ content }: AboutProps) {
  const items: IndexStoryItem[] = chapterOrder.map((id) => {
    const chapter = content.chapters[id];
    return {
      id,
      label: chapter.label,
      title: chapter.title,
      body: <Chapter chapter={chapter} />,
    };
  });

  return (
    <Section id="about" labelledBy="about-title">
      <SectionIntro
        titleId="about-title"
        index={chapterNumber("about")}
        eyebrow={content.eyebrow}
        title={content.title}
        emphasis={content.intro.emphasis}
        beats={content.intro.beats}
        length={2}
      />
      <Container className={styles.layout}>
        <StickyIndexStory items={items} label={content.chaptersLabel} variant="chapters" />
      </Container>
    </Section>
  );
}
