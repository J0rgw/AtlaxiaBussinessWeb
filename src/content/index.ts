import { resolveLocale, type Locale } from "@/i18n/config";
import { en } from "./en";
import { es } from "./es";
import type { Dictionary } from "./types";

export const dictionaries: Record<Locale, Dictionary> = { es, en };

/** Returns the dictionary for a locale. Unknown locales fall back to Spanish. */
export function getDictionary(locale: string): Dictionary {
  return dictionaries[resolveLocale(locale)];
}

export type { Dictionary };
