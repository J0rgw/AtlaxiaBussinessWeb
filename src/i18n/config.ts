export const locales = ["es", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";

/** Key used to remember an explicit language choice made with the switcher. */
export const LOCALE_STORAGE_KEY = "atlaxia.locale";

/** Route of the home page for each locale, without basePath. */
export const localeHomePaths: Record<Locale, string> = {
  es: "/",
  en: "/en/",
};

/** Short visible label and native name. Names are never translated. */
export const localeLabels: Record<Locale, { short: string; name: string }> = {
  es: { short: "ES", name: "Español" },
  en: { short: "EN", name: "English" },
};

export const openGraphLocales: Record<Locale, string> = {
  es: "es_ES",
  en: "en_US",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/** Any unknown or missing value falls back to Spanish. */
export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : defaultLocale;
}
