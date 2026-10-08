import { LOCALE_STORAGE_KEY, localeHomePaths } from "./config";
import { withBasePath } from "@/lib/paths";

/**
 * Inline script for the Spanish home. If the visitor explicitly chose English
 * before (via the switcher), send them to /en/ before first paint.
 * First visits and crawlers have no stored choice, so they always get Spanish.
 */
export function getLocalePreferenceScript(): string {
  const esHome = JSON.stringify(withBasePath(localeHomePaths.es));
  const enHome = JSON.stringify(withBasePath(localeHomePaths.en));
  const key = JSON.stringify(LOCALE_STORAGE_KEY);

  return `(function(){try{if(location.pathname!==${esHome})return;if(localStorage.getItem(${key})==="en"){location.replace(${enHome}+location.hash);}}catch(e){}})();`;
}
