import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { dictionaries } from "@/content";
import { company } from "@/content/shared/company";
import { localeHomePaths } from "@/i18n/config";
import { withBasePath } from "@/lib/paths";
// Only the same global stylesheet the layouts import, and nothing else: in dev,
// a CSS module here produced a separate chunk that the pages registered but never
// linked, and Turbopack HMR failed with "No link element found for chunk".
// Local styles are inline for that reason (they still use the design tokens).
import "@/styles/index.css";

export const metadata: Metadata = {
  title: `404 | ${company.name}`,
  robots: { index: false },
};

const main: CSSProperties = {
  display: "grid",
  alignContent: "center",
  gap: "var(--space-4)",
  minHeight: "100dvh",
  maxWidth: "calc(var(--container-narrow) + 2 * var(--gutter))",
  marginInline: "auto",
  padding: "var(--space-16) var(--gutter)",
};

const code: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-label)",
  letterSpacing: "var(--tracking-label)",
  color: "var(--color-accent-text)",
};

const title: CSSProperties = {
  fontSize: "var(--text-heading)",
  fontWeight: "var(--weight-semibold)",
  lineHeight: "var(--leading-heading)",
  letterSpacing: "var(--tracking-heading)",
};

const body: CSSProperties = { color: "var(--color-text-muted)" };

const link: CSSProperties = {
  justifySelf: "start",
  color: "var(--color-accent-text)",
  textUnderlineOffset: "0.2em",
};

const secondary: CSSProperties = {
  display: "grid",
  gap: "var(--space-2)",
  marginTop: "var(--space-8)",
  paddingTop: "var(--space-6)",
  borderTop: "1px solid var(--color-border-subtle)",
};

/**
 * Static hosting serves one 404 for every language, so it shows Spanish first
 * and English below, each with its own lang attribute.
 */
export default function GlobalNotFound() {
  const { es, en } = dictionaries;

  return (
    <html lang="es">
      <body>
        <main style={main}>
          <p style={code}>404</p>
          <h1 style={title}>{es.notFound.title}</h1>
          <p style={body}>{es.notFound.body}</p>
          <a style={link} href={withBasePath(localeHomePaths.es)}>
            {es.notFound.backHome}
          </a>

          <div lang="en" style={secondary}>
            <p style={body}>
              {en.notFound.title}. {en.notFound.body}
            </p>
            <a style={link} href={withBasePath(localeHomePaths.en)}>
              {en.notFound.backHome}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
