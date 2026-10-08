import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Surface } from "../Surface";
import { SegmentedControl } from "./SegmentedControl";

const timeRanges = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7 días" },
  { value: "30d", label: "30 días" },
  { value: "custom", label: "Otro" },
];

const meta = {
  title: "Primitives/SegmentedControl",
  component: SegmentedControl,
  args: {
    label: "Rango temporal",
    options: timeRanges,
    defaultValue: "30d",
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TimeRange: Story = {
  name: "Time range (product reference)",
};

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState("7d");
    return (
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <SegmentedControl {...args} value={value} onChange={setValue} />
        <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>value: {value}</code>
      </div>
    );
  },
};

export const LongLabels: Story = {
  name: "Long labels (contact intents)",
  args: {
    label: "Motivo del contacto",
    options: [
      { value: "product", label: "Producto o demo" },
      { value: "collaboration", label: "Colaboración" },
      { value: "research", label: "Investigación" },
      { value: "other", label: "Otra consulta" },
    ],
    defaultValue: "product",
  },
};

export const OnDarkSurface: Story = {
  render: (args) => (
    <Surface tone="dark">
      <SegmentedControl {...args} />
    </Surface>
  ),
};
