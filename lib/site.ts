export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://atlaxia.example";

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hola@atlaxia.example";

export const SITE_HOST = new URL(SITE_URL).host;
