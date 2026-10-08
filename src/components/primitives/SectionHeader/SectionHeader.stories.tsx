import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SectionHeader } from "./SectionHeader";

const meta = {
  title: "Primitives/SectionHeader",
  component: SectionHeader,
  args: {
    index: "01",
    eyebrow: "Visión",
    title: "Los datos industriales no se entienden solos",
    lead: "Texto de ejemplo para medir la longitud del párrafo de entrada. No es copy definitivo.",
  },
  argTypes: {
    as: { control: "inline-radio", options: ["h1", "h2", "h3"] },
    size: { control: "inline-radio", options: ["heading", "display"] },
  },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TitleOnly: Story = {
  args: { index: undefined, eyebrow: undefined, lead: undefined },
};

export const Display: Story = {
  name: "Display (hero)",
  args: { as: "h1", size: "display", index: undefined, eyebrow: undefined, title: "ATLAXIA" },
};

export const LongContent: Story = {
  args: {
    eyebrow: "Qué estamos construyendo",
    title:
      "Un titular deliberadamente largo para comprobar cómo se equilibra el texto en varias líneas y en móvil",
    lead: "Un párrafo de entrada también largo. Sirve para comprobar que la medida de línea se mantiene legible, que el ritmo vertical no se rompe y que el bloque sigue funcionando cuando el contenido real ocupa más de lo previsto en el diseño.",
  },
};

export const English: Story = {
  args: {
    eyebrow: "Vision",
    title: "Industrial data does not explain itself",
    lead: "Sample text to check line length in English. Not final copy.",
  },
};
