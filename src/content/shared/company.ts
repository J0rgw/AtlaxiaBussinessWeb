/**
 * Company facts that do not change between languages.
 * Source and status of every fact: docs/CONTENIDO.md.
 */
export const company = {
  name: "ATLAXIA",
  email: "hola@atlaxia.es",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://atlaxia.es").replace(/\/+$/, ""),
  demoUrl: "https://demo.atlaxia.es",

  legal: {
    // TODO(legal): replace with the real legal entity, tax id and address before publishing.
    // Required for the legal notice (LSSI) and the privacy policy of the contact form.
    status: "pending",
  },
} as const;
