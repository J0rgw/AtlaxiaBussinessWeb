import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { Surface } from "@/components/primitives/Surface";
import { SplitLayout } from "./SplitLayout";

function Visual({ label = "Visual", tall = false }: { label?: string; tall?: boolean }) {
  return (
    <Surface tone="dark" padding="lg">
      <div
        style={{
          minHeight: tall ? "28rem" : "16rem",
          display: "grid",
          placeItems: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          color: "var(--color-text-muted)",
          backgroundImage:
            "linear-gradient(var(--color-signal-grid) 1px, transparent 1px), linear-gradient(90deg, var(--color-signal-grid) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        {label}
      </div>
    </Surface>
  );
}

const text: ReactNode = (
  <SectionHeader
    index="01"
    eyebrow="Visión"
    title="Texto de ejemplo en la columna de inicio"
    lead="La columna de texto va primero en el DOM y en el orden de lectura. En contenedores estrechos las dos columnas se apilan."
  />
);

const meta = {
  title: "Layout/SplitLayout",
  component: SplitLayout,
  args: {
    start: text,
    end: <Visual />,
    ratio: "5:7",
    align: "center",
    order: "start-first",
    gap: "lg",
  },
  argTypes: {
    ratio: { control: "inline-radio", options: ["1:1", "5:7", "7:5", "4:8", "8:4"] },
    align: { control: "inline-radio", options: ["start", "center", "end", "stretch"] },
    order: { control: "inline-radio", options: ["start-first", "end-first"] },
    gap: { control: "inline-radio", options: ["md", "lg"] },
    start: { control: false },
    end: { control: false },
  },
} satisfies Meta<typeof SplitLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextAndVisual: Story = {
  name: "Text and visual (hero case)",
};

export const EndFirst: Story = {
  name: "Visual first (alternating sections)",
  args: { order: "end-first", ratio: "7:5", end: <Visual label="Visual, 7 columnas" /> },
};

export const Equal: Story = {
  args: { ratio: "1:1", align: "start" },
};

export const Stretch: Story = {
  name: "Stretch (same height)",
  args: { align: "stretch", end: <Visual tall /> },
};

export const LongContent: Story = {
  args: {
    align: "start",
    start: (
      <SectionHeader
        eyebrow="Quiénes somos"
        title="Un titular largo para comprobar que la columna estrecha aguanta varias líneas sin romper el ritmo"
        lead="Un párrafo largo. El contenido real puede ocupar bastante más de lo previsto en el diseño, y la rejilla tiene que seguir funcionando con columnas de proporciones distintas y alturas desiguales."
      />
    ),
  },
};

/** Container query: the same component stacks inside a narrow box on a wide screen. */
export const NarrowContainer: Story = {
  name: "Narrow container (stacks)",
  render: (args) => (
    <div style={{ display: "grid", gap: "2rem" }}>
      <div style={{ maxWidth: "24rem", outline: "1px dashed var(--color-border-strong)" }}>
        <SplitLayout {...args} />
      </div>
      <div style={{ outline: "1px dashed var(--color-border-strong)" }}>
        <SplitLayout {...args} />
      </div>
    </div>
  ),
};
