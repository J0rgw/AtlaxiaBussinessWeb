import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CSSProperties, ReactNode } from "react";
import { Surface } from "@/components/primitives/Surface";

/** Visual reference of the design tokens defined in src/styles/tokens.css. */
const meta = {
  title: "Foundations/Tokens",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const colorGroups: Record<string, string[]> = {
  Surfaces: ["--color-bg", "--color-bg-inset", "--color-bg-raised"],
  Text: ["--color-text", "--color-text-secondary", "--color-text-muted", "--color-text-subtle"],
  Borders: ["--color-border-subtle", "--color-border", "--color-border-strong"],
  Accent: ["--color-accent", "--color-accent-text", "--color-accent-soft", "--color-focus"],
  Signals: [
    "--color-signal-observed",
    "--color-signal-expected",
    "--color-signal-deviation",
    "--color-signal-grid",
  ],
  Status: [
    "--color-status-normal",
    "--color-status-advisory",
    "--color-status-warning",
    "--color-status-critical",
  ],
};

const label: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-xs)",
  color: "var(--color-text-muted)",
};

function Swatch({ token }: { token: string }) {
  return (
    <div style={{ display: "grid", gap: "0.375rem" }}>
      <div
        style={{
          height: "3rem",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border-subtle)",
          background: `var(${token})`,
        }}
      />
      <code style={label}>{token.replace("--color-", "")}</code>
    </div>
  );
}

function Palette() {
  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {Object.entries(colorGroups).map(([group, tokens]) => (
        <div key={group} style={{ display: "grid", gap: "0.75rem" }}>
          <strong>{group}</strong>
          <div
            style={{
              display: "grid",
              gap: "0.75rem",
              gridTemplateColumns: "repeat(auto-fill, minmax(8rem, 1fr))",
            }}
          >
            {tokens.map((token) => (
              <Swatch key={token} token={token} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export const Colors: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "2rem" }}>
      <Palette />
      <Surface tone="dark" padding="lg">
        <div style={{ display: "grid", gap: "1rem" }}>
          <strong>data-surface=&quot;dark&quot;</strong>
          <Palette />
        </div>
      </Surface>
    </div>
  ),
};

type TypeSample = {
  token: string;
  sample: string;
  weight: "regular" | "semibold";
  style?: CSSProperties;
};

const typeScale: TypeSample[] = [
  {
    token: "--text-display",
    sample: "ATLAXIA",
    weight: "semibold",
    style: { lineHeight: "var(--leading-display)", letterSpacing: "var(--tracking-display)" },
  },
  {
    token: "--text-heading",
    sample: "Sistemas industriales complejos",
    weight: "semibold",
    style: { lineHeight: "var(--leading-heading)", letterSpacing: "var(--tracking-heading)" },
  },
  { token: "--text-title", sample: "Observado frente a esperado", weight: "semibold" },
  {
    token: "--text-lead",
    sample: "Párrafo de entrada para abrir una sección. Relaciones, contexto y comportamiento.",
    weight: "regular",
  },
  {
    token: "--text-base",
    sample:
      "Texto de cuerpo. Los sensores miden; el contexto explica. Cifras 0123456789, acentos áéíóú ñ ¿¡.",
    weight: "regular",
  },
  { token: "--text-sm", sample: "Texto secundario y pies de figura.", weight: "regular" },
];

function Row({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gap: "0.5rem",
        paddingBlock: "1rem",
        borderBottom: "1px solid var(--color-border-subtle)",
      }}
    >
      <code style={label}>{name}</code>
      {children}
    </div>
  );
}

export const Typography: Story = {
  render: () => (
    <div>
      {typeScale.map(({ token, sample, weight, style }) => (
        <Row key={token} name={`${token} / --font-sans ${weight}`}>
          <span
            style={{ fontSize: `var(${token})`, fontWeight: `var(--weight-${weight})`, ...style }}
          >
            {sample}
          </span>
        </Row>
      ))}
      <Row name="--text-label / --font-mono">
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-label)",
            letterSpacing: "var(--tracking-label)",
            textTransform: "uppercase",
          }}
        >
          01 Visión, sensor 01, 1 Hz
        </span>
      </Row>
      <Row name="--font-mono, tabular numbers">
        <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>
          observado 120.40, esperado 118.75, desviación +1.65
        </span>
      </Row>
    </div>
  ),
};

const spaces = ["1", "2", "3", "4", "6", "8", "12", "16", "24"];

export const SpacingAndShape: Story = {
  name: "Spacing and shape",
  render: () => (
    <div style={{ display: "grid", gap: "2rem" }}>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        {spaces.map((step) => (
          <div key={step} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <code style={{ ...label, width: "5rem" }}>space-{step}</code>
            <div
              style={{
                width: `var(--space-${step})`,
                height: "0.75rem",
                background: "var(--color-accent)",
                borderRadius: 2,
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {["sm", "md", "lg"].map((r) => (
          <div
            key={r}
            style={{
              width: "6rem",
              height: "4rem",
              display: "grid",
              placeItems: "center",
              border: "1px solid var(--color-border)",
              borderRadius: `var(--radius-${r})`,
              background: "var(--color-bg-raised)",
            }}
          >
            <code style={label}>radius-{r}</code>
          </div>
        ))}
        <div
          style={{
            width: "10rem",
            height: "4rem",
            display: "grid",
            placeItems: "center",
            borderRadius: "var(--radius-lg)",
            background: "var(--color-bg-raised)",
            boxShadow: "var(--shadow-float)",
          }}
        >
          <code style={label}>shadow-float</code>
        </div>
      </div>
    </div>
  ),
};
