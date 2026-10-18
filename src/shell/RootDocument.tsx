import type { ReactNode } from "react";
import { SmoothAnchorScroll } from "@/components/navigation/SmoothAnchorScroll";
import { SmoothScroll } from "@/components/navigation/SmoothScroll";
import { getDictionary } from "@/content";
import { defaultLocale, type Locale } from "@/i18n/config";
import { getLocalePreferenceScript } from "@/i18n/preference";
import { getEntryScrollScript } from "@/lib/entryScroll";

type RootDocumentProps = {
  locale: Locale;
  children: ReactNode;
};

/**
 * <html> and <body> shared by every root layout. Each locale has its own root
 * layout, so the static HTML ships with the right `lang` from the first byte.
 */
export function RootDocument({ locale, children }: RootDocumentProps) {
  const dict = getDictionary(locale);

  return (
    <html lang={locale}>
      {/* App Router root layout: a plain <head> is valid here (the rule targets the Pages Router). */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        {/* Before the locale redirect, so a fragment it would carry is already gone */}
        <script id="entry-scroll" dangerouslySetInnerHTML={{ __html: getEntryScrollScript() }} />
        {locale === defaultLocale ? (
          // Plain inline script (not next/script) so it runs before first paint.
          <script
            id="locale-preference"
            dangerouslySetInnerHTML={{ __html: getLocalePreferenceScript() }}
          />
        ) : null}
      </head>
      <body>
        <a className="skip-link" href="#main">
          {dict.a11y.skipToContent}
        </a>
        {children}
        <SmoothScroll />
        <SmoothAnchorScroll />
      </body>
    </html>
  );
}
