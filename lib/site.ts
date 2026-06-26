const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
export const SITE_URL = rawSiteUrl || "https://atlaxia.example";

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "helloatlaxia@gmail.com";

export const SITE_HOST = new URL(SITE_URL).host;
