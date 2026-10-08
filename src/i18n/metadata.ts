import type { Metadata } from "next";
import { getDictionary } from "@/content";
import { company } from "@/content/shared/company";
import { localeHomePaths, locales, openGraphLocales, type Locale } from "./config";

/** Page metadata with canonical and hreflang alternates for both languages. */
export function buildHomeMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);
  const languages = Object.fromEntries(locales.map((l) => [l, localeHomePaths[l]]));

  return {
    metadataBase: new URL(company.siteUrl),
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: localeHomePaths[locale],
      languages: { ...languages, "x-default": localeHomePaths.es },
    },
    openGraph: {
      type: "website",
      siteName: company.name,
      title: dict.meta.title,
      description: dict.meta.description,
      locale: openGraphLocales[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => openGraphLocales[l]),
    },
  };
}
