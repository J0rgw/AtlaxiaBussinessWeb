import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Surface } from "@/components/primitives/Surface";
import { AtlaxiaSymbol, AtlaxiaWordmark } from "./Brand";

const meta = {
  title: "Brand/Marks",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Lockup({ size }: { size: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.5 }}>
      <AtlaxiaSymbol style={{ height: size, width: "auto" }} />
      <AtlaxiaWordmark style={{ height: size * 0.54, width: "auto" }} />
    </span>
  );
}

function Specimen() {
  return (
    <div style={{ display: "grid", gap: "2rem", color: "var(--color-text)" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "2rem", flexWrap: "wrap" }}>
        <AtlaxiaSymbol title="ATLAXIA" style={{ height: 120, width: "auto" }} />
        <AtlaxiaSymbol style={{ height: 48, width: "auto" }} />
        <AtlaxiaSymbol style={{ height: 24, width: "auto" }} />
        <AtlaxiaSymbol style={{ height: 16, width: "auto" }} />
      </div>
      <AtlaxiaWordmark title="ATLAXIA" style={{ height: 40, width: "auto" }} />
      <div style={{ display: "grid", gap: "1rem" }}>
        <Lockup size={24} />
        <Lockup size={40} />
      </div>
    </div>
  );
}

export const OnPaper: Story = {
  render: () => <Specimen />,
};

export const OnDark: Story = {
  render: () => (
    <Surface tone="dark" padding="lg">
      <Specimen />
    </Surface>
  ),
};

export const Accent: Story = {
  name: "In accent color (currentColor)",
  render: () => (
    <div style={{ color: "var(--color-accent-text)" }}>
      <Lockup size={40} />
    </div>
  ),
};
