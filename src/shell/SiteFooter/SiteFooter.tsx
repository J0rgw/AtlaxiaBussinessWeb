import { Container } from "@/components/primitives/Container";
import { PendingTag } from "../PendingTag";
import type { Dictionary } from "@/content";
import { company } from "@/content/shared/company";
import { otherLocaleValues } from "@/i18n/alternatives";
import type { Locale } from "@/i18n/config";
import styles from "./SiteFooter.module.css";

type SiteFooterProps = {
  locale: Locale;
  dict: Dictionary;
};

/** Minimal footer for the base scaffold. Legal links stay visibly pending. */
export function SiteFooter({ locale, dict }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <p className={styles.brand}>
          {company.name} <span className={styles.year}>{year}</span>
        </p>
        <a className={styles.email} href={`mailto:${company.email}`}>
          {company.email}
        </a>
        {/* TODO(legal): link real legal notice and privacy pages. See docs/CONTENIDO.md. */}
        <div className={styles.legal}>
          <span>{dict.footer.legalNotice}</span>
          <span>{dict.footer.privacy}</span>
          <PendingTag
            label={dict.scaffold.pending}
            alternatives={otherLocaleValues(locale, (d) => d.scaffold.pending)}
          />
          <span>{dict.footer.legalPending}</span>
        </div>
      </Container>
    </footer>
  );
}
