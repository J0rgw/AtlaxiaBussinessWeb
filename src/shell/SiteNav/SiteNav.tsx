import { Box, Compass, Layers, Mail, Users } from "lucide-react";
import type { ReactNode } from "react";
import { FloatingSectionNav } from "@/components/navigation/FloatingSectionNav";
import { LanguageSwitcher } from "@/components/navigation/LanguageSwitcher";
import { Button } from "@/components/primitives/Button";
import { StableLabel } from "@/components/primitives/StableLabel";
import type { Dictionary } from "@/content";
import { navSectionIds, type NavSectionId } from "@/content/shared/sections";
import { otherLocaleValues } from "@/i18n/alternatives";
import { LOCALE_STORAGE_KEY, localeHomePaths, type Locale } from "@/i18n/config";
import { getHomeLanguageOptions } from "@/i18n/languageOptions";
import { withBasePath } from "@/lib/paths";
import { AtlaxiaSymbol, AtlaxiaWordmark } from "../Brand/Brand";
import styles from "./SiteNav.module.css";

// Narrow screens show these instead of the section titles.
// Avoid the product severity icons (triangle, circle alert, gauge, info, check).
const sectionIcons: Record<NavSectionId, ReactNode> = {
  vision: <Compass />,
  capabilities: <Layers />,
  building: <Box />,
  about: <Users />,
  contact: <Mail />,
};

type SiteNavProps = {
  locale: Locale;
  dict: Dictionary;
};

/**
 * ATLAXIA site navigation: one fixed strip across the sheet frame (Matta): logo cell as home link at the
 * start, sections and actions at the end. Always visible. Contact is the call to action, so it is a button.
 */
export function SiteNav({ locale, dict }: SiteNavProps) {
  const home = withBasePath(localeHomePaths[locale]);

  const items = navSectionIds
    .filter((id) => id !== "contact")
    .map((id) => ({
      id,
      label: dict.nav[id],
      alternatives: otherLocaleValues(locale, (d) => d.nav[id]),
      icon: sectionIcons[id],
    }));

  const actions = (
    <>
      <LanguageSwitcher
        options={getHomeLanguageOptions()}
        current={locale}
        label={dict.a11y.languageSwitcher}
        persistKey={LOCALE_STORAGE_KEY}
      />
      <Button href="#contact" size="sm" className={styles.cta} endIcon={sectionIcons.contact}>
        <span className={styles.ctaLabel}>
          <StableLabel alternatives={otherLocaleValues(locale, (d) => d.nav.contact)}>
            {dict.nav.contact}
          </StableLabel>
        </span>
      </Button>
    </>
  );

  const lockup = (
    <a href={home} className={styles.lockup} aria-label={dict.a11y.homeLink}>
      <AtlaxiaSymbol className={styles.symbol} />
      <AtlaxiaWordmark className={styles.wordmark} />
    </a>
  );

  return (
    <header>
      {/* In-flow space for the sheet frame row; the fixed bar sits on top of it */}
      <div className={styles.top} aria-hidden="true" />
      <FloatingSectionNav
        items={items}
        label={dict.navigation.label}
        placement="top-frame"
        brand={lockup}
        actions={actions}
      />
    </header>
  );
}
