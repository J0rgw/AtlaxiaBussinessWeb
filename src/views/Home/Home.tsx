import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { getDictionary } from "@/content";
import { navSectionIds } from "@/content/shared/sections";
import { otherLocaleValues } from "@/i18n/alternatives";
import type { Locale } from "@/i18n/config";
import { Building } from "@/sections/Building/Building";
import { Capabilities } from "@/sections/Capabilities/Capabilities";
import { Contact } from "@/sections/Contact/Contact";
import { Hero } from "@/sections/Hero/Hero";
import { Vision } from "@/sections/Vision/Vision";
import { PendingTag } from "@/shell/PendingTag";
import { SiteFooter } from "@/shell/SiteFooter/SiteFooter";
import { SiteNav } from "@/shell/SiteNav/SiteNav";
import styles from "./Home.module.css";

type HomeProps = {
  locale: Locale;
};

/** Home composition, in the narrative order of AGENTS.md. */
export function Home({ locale }: HomeProps) {
  const dict = getDictionary(locale);
  const pendingAlternatives = otherLocaleValues(locale, (d) => d.scaffold.pending);

  return (
    <>
      <SiteNav locale={locale} dict={dict} />
      <main id="main" tabIndex={-1} className={styles.main}>
        <Hero locale={locale} content={dict.hero} />
        {navSectionIds.map((id) => {
          switch (id) {
            case "vision":
              return <Vision key={id} content={dict.vision} />;
            case "capabilities":
              return <Capabilities key={id} content={dict.capabilities} />;
            case "building":
              return (
                <Building
                  key={id}
                  locale={locale}
                  eyebrow={dict.nav.building}
                  content={dict.building}
                />
              );
            case "contact":
              return <Contact key={id} content={dict.contact} />;
            default:
              // Not built yet: pending placeholder keeps the anchor and the order.
              return (
                <Section key={id} id={id} labelledBy={`${id}-title`}>
                  <Container>
                    <SectionHeader titleId={`${id}-title`} title={dict.nav[id]} />
                    <PendingNote label={dict.scaffold.pending} alternatives={pendingAlternatives}>
                      {dict.scaffold.sectionNote}
                    </PendingNote>
                  </Container>
                </Section>
              );
          }
        })}
      </main>
      <SiteFooter locale={locale} dict={dict} />
    </>
  );
}

type PendingNoteProps = { label: string; alternatives: readonly string[]; children: string };

function PendingNote({ label, alternatives, children }: PendingNoteProps) {
  return (
    <p className={styles.pending}>
      <PendingTag label={label} alternatives={alternatives} />
      <span>{children}</span>
    </p>
  );
}
