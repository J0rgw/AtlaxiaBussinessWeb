import { dictionaries, type Dictionary } from "@/content";
import { locales, type Locale } from "./config";

/**
 * The same text in the other locales. UI controls use it to reserve the widest
 * width, so switching language does not resize them.
 */
export function otherLocaleValues(locale: Locale, pick: (dict: Dictionary) => string): string[] {
  return locales.filter((other) => other !== locale).map((other) => pick(dictionaries[other]));
}
