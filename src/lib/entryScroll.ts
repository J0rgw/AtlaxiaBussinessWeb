/**
 * Inline script for every page: entering the site always opens at the top,
 * on the hero. The browser does not restore the last position on reload, and
 * an address with #section (shared link, reload after using the index) loses
 * its fragment before the browser can jump to it.
 *
 * One exception: changing language keeps the section, because the
 * LanguageSwitcher sends the fragment on purpose. That is a fresh navigation
 * from another page of this site; a reload or a visit from outside is not.
 *
 * Restoration goes back to "auto" once the page has loaded, so back and
 * forward between sections (SmoothAnchorScroll adds them to history) still
 * work, and to "manual" again as the page is left: the browser reads the mode
 * the page leaves behind, before this script can run on the next load.
 */
export function getEntryScrollScript(): string {
  return `(function(){try{var h=history,on=addEventListener,mode=function(m){return function(){h.scrollRestoration=m}};mode("manual")();on("load",function(){setTimeout(mode("auto"))});on("pageshow",function(e){if(e.persisted)mode("auto")()});on("pagehide",mode("manual"));if(!location.hash)return;var n=performance.getEntriesByType("navigation")[0],r=document.referrer?new URL(document.referrer):null;if(n&&n.type==="navigate"&&r&&r.origin===location.origin&&r.pathname!==location.pathname)return;h.replaceState(h.state,"",location.pathname+location.search)}catch(e){}})();`;
}
