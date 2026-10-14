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
