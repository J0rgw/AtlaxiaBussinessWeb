/**
 * Anchor ids of the main navigation, in page order.
 * They are language independent so /#vision and /en/#vision point to the same block.
 * "building" becomes "products" when the product catalog grows.
 */
export const navSectionIds = ["vision", "capabilities", "building", "about", "contact"] as const;

export type NavSectionId = (typeof navSectionIds)[number];

/** Chapter number of a section, as shown on its cover: "02" for the second. */
export function chapterNumber(id: NavSectionId): string {
  return String(navSectionIds.indexOf(id) + 1).padStart(2, "0");
}
