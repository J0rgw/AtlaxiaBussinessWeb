import { TeamGallery, type TeamMember } from "@/components/data-display/TeamGallery";
import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import type { Dictionary } from "@/content";
import { memberOrder, teamMedia } from "@/content/shared/team";
import { withBasePath } from "@/lib/paths";
import styles from "./Team.module.css";

type TeamContent = Dictionary["team"];

const media = (name: string) => withBasePath(`/media/team/${name}`);

/** The portrait files of a member, made at 480 × 600 and 960 × 1200. */
function portraitOf(stem: string) {
  return {
    src: media(`${stem}-1x.webp`),
    srcSet: `${media(`${stem}-1x.webp`)} 1x, ${media(`${stem}-2x.webp`)} 2x`,
    avifSrcSet: `${media(`${stem}-1x.avif`)} 1x, ${media(`${stem}-2x.avif`)} 2x`,
    width: 480,
    height: 600,
  };
}

type TeamProps = {
  content: TeamContent;
};

/**
 * The founding team, as a section of its own after Quiénes somos: the three
 * side by side, the name and role inside each portrait; one opens to its
 * sheet while the others make room.
 */
export function Team({ content }: TeamProps) {
  const { fields } = content;
  const members: TeamMember[] = memberOrder.map((id) => {
    const member = content.members[id];
    const { initials, photo, linkedin } = teamMedia[id];
    return {
      id,
      name: member.name,
      role: member.role,
      initials,
      portrait: photo ? portraitOf(photo) : undefined,
      facts: [
        { label: fields.profile, value: member.profile },
        { label: fields.atlaxia, value: member.atlaxia },
        { label: fields.technical, value: member.skills.technical },
        { label: fields.social, value: member.skills.social },
      ],
      linkedin,
      linkedinText: fields.linkedin.replace("{name}", member.name),
    };
  });

  return (
    <Section id="team" labelledBy="team-title" tone="inset" spacing="compact">
      <Container>
        <SectionHeader
          titleId="team-title"
          eyebrow={content.eyebrow}
          title={content.title}
          size="display"
          layout="split"
          lead={
            <>
              <span className={styles.leadIn}>{content.lead.lead}</span> {content.lead.text}
            </>
          }
        />
        <TeamGallery members={members} labelledBy="team-title" className={styles.gallery} />
      </Container>
    </Section>
  );
}
