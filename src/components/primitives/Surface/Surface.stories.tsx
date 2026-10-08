import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tag } from "../Tag";
import { Surface } from "./Surface";

function SampleContent({ title }: { title: string }) {
  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      <Tag>Sensor 01</Tag>
      <strong style={{ fontSize: "1.125rem" }}>{title}</strong>
      <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
        Los tokens de color se resuelven según la superficie: el mismo contenido funciona en claro y
        en oscuro.
      </p>
    </div>
  );
}

const meta = {
  title: "Primitives/Surface",
  component: Surface,
  args: {
    tone: "raised",
    padding: "md",
    children: <SampleContent title="Superficie" />,
  },
  argTypes: {
    tone: { control: "inline-radio", options: ["raised", "inset", "dark"] },
    padding: { control: "inline-radio", options: ["none", "md", "lg"] },
    children: { control: false },
  },
} satisfies Meta<typeof Surface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Raised: Story = {};

export const Inset: Story = {
  args: { tone: "inset" },
};

export const Dark: Story = {
  name: "Dark (control room)",
  args: { tone: "dark", padding: "lg", children: <SampleContent title="Panel de producto" /> },
};

export const AllTones: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
      }}
    >
      <Surface tone="raised">
        <SampleContent title="Raised" />
      </Surface>
      <Surface tone="inset">
        <SampleContent title="Inset" />
      </Surface>
      <Surface tone="dark">
        <SampleContent title="Dark" />
      </Surface>
    </div>
  ),
};
