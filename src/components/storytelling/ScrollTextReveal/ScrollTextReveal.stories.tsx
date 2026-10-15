import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Container } from "@/components/primitives/Container";
import { ScrollTextReveal } from "./ScrollTextReveal";

const meta = {
  title: "Storytelling/ScrollTextReveal",
  component: ScrollTextReveal,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div>
        <div style={{ height: "60svh" }} />
        <Container>
          <Story />
        </Container>
        <div style={{ height: "60svh" }} />
      </div>
    ),
  ],
} satisfies Meta<typeof ScrollTextReveal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    eyebrow: "Visión",
    text: "Construimos software para que quien opera una planta entienda qué ocurre y por qué, antes de que se convierta en un problema.",
  },
};

export const Short: Story = {
  args: { eyebrow: "Visión", text: "Entender a tiempo lo que hoy solo se mide." },
};

export const Mobile: Story = {
  ...Default,
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

/*
  Options for the Vision promise, one per pattern seen in the references.
  Draft copy in Spanish, built only from facts already in docs/CONTENIDO.md.
*/
const FUNCTIONAL =
  "ATLAXIA desarrolla software que relaciona las señales de una planta y explica qué ha cambiado y por qué.";

export const OptionCurrent: Story = {
  name: "Actual: una frase larga (21 palabras)",
  args: {
    text: "Construimos software para que quien opera una planta entienda qué ocurre y por qué, antes de que se convierta en un problema.",
  },
};

export const OptionMatta: Story = {
  name: "A. Titular corto + línea funcional (Matta)",
  args: { text: "Entender el proceso a tiempo", lead: FUNCTIONAL },
};

export const OptionCerebrium: Story = {
  name: "B. Tres palabras apiladas (Cerebrium)",
  args: {
    text: "Ver. Entender. Decidir.",
    layout: "stacked",
    lead: "Software para ver lo que ocurre en una planta, entender por qué y decidir a tiempo.",
  },
};

export const OptionProlibu: Story = {
  name: "C. Completitud en una frase (Prolibu)",
  args: { text: "Todo lo que ocurre en una planta, explicado a tiempo.", lead: FUNCTIONAL },
};

export const OptionRig: Story = {
  name: "D. Imperativo directo (Rig)",
  args: { text: "Entiende tu planta antes de que sea un problema.", lead: FUNCTIONAL },
};

export const OptionShort: Story = {
  name: "E. Promesa acortada (12 palabras)",
  args: {
    text: "Que quien opera una planta entienda qué ocurre antes de que sea un problema.",
    lead: FUNCTIONAL,
  },
};
