/**
 * Anchor ids of the main navigation, in page order.
 * They are language independent so /#vision and /en/#vision point to the same block.
 * "building" becomes "products" when the product catalog grows.
 */
export const navSectionIds = ["vision", "capabilities", "building", "about", "contact"] as const;

export type NavSectionId = (typeof navSectionIds)[number];
