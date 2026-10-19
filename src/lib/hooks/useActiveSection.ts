"use client";

import { useEffect, useState } from "react";

export type UseActiveSectionOptions = {
  /**
   * Reading line, as an IntersectionObserver rootMargin. The default is a thin
   * band at about 40 % of the viewport height: the section crossing it is active.
   */
  rootMargin?: string;
  /** Keep the last active id when nothing crosses the line (gaps between steps). */
  keepLast?: boolean;
};

const DEFAULT_ROOT_MARGIN = "-40% 0px -55% 0px";

/**
 * Returns the id of the element (section, story step...) currently being read, or null when none of
 * the given sections crosses the reading line (for example, over the hero).
 * Uses IntersectionObserver, no scroll listeners.
 */
export function useActiveSection(
  ids: readonly string[],
  { rootMargin = DEFAULT_ROOT_MARGIN, keepLast = false }: UseActiveSectionOptions = {},
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const key = ids.join("|");

  useEffect(() => {
    const sectionIds = key ? key.split("|") : [];
    if (sectionIds.length === 0 || typeof IntersectionObserver === "undefined") return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const intersecting = new Set<string>();

    const onChange: IntersectionObserverCallback = (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) intersecting.add(entry.target.id);
        else intersecting.delete(entry.target.id);
      }
      // Document order wins if two sections touch the band at once.
      const next = sectionIds.find((id) => intersecting.has(id)) ?? null;
      setActiveId((previous) => next ?? (keepLast ? previous : null));
    };
    // The page's own document as root: with the implicit root, a page shown in a
    // cross-origin iframe (a preview, an embed) has its rootMargin ignored and the
    // reading line becomes the whole viewport.
    let observer: IntersectionObserver;
    try {
      observer = new IntersectionObserver(onChange, { root: document, rootMargin });
    } catch {
      observer = new IntersectionObserver(onChange, { rootMargin });
    }

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key, rootMargin, keepLast]);

  return activeId;
}
