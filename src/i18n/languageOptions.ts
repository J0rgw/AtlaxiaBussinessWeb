import type { LanguageOption } from "@/components/navigation/LanguageSwitcher";
import { withBasePath } from "@/lib/paths";
import { localeHomePaths, localeLabels, locales } from "./config";

/** Options for the LanguageSwitcher on the home page. */
export function getHomeLanguageOptions(): LanguageOption[] {
  return locales.map((code) => ({
    code,
    label: localeLabels[code].short,
    name: localeLabels[code].name,
    href: withBasePath(localeHomePaths[code]),
  }));
}
