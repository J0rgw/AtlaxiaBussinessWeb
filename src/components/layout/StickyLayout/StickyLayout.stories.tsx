import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Container } from "@/components/primitives/Container";
import { Surface } from "@/components/primitives/Surface";
import { StickyLayout } from "./StickyLayout";

// Placeholder steps: the recommended structure for "Qué estamos construyendo" (AGENTS.md).
const steps = ["Monitorizar", "Entender", "Relacionar", "Investigar", "Desplegar"];

function Steps() {
  return (
    <ol role="list" style={{ display: "grid", gap: 0, margin: 0, padding: 0, listStyle: "none" }}>
      {steps.map((step, i) => (
        <li
          key={step}
          style={{
            minHeight: "60vh",
            paddingBlock: "var(--space-8)",
            borderTop: "1px solid var(--color-border-subtle)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-label)",
              letterSpacing: "var(--tracking-label)",
              color: "var(--color-accent-text)",
            }}
          >
            {String(i + 1).padStart(2, "0")}
          </p>
          <h3 style={{ fontSize: "var(--text-title)", marginTop: "var(--space-2)" }}>{step}</h3>
          <p style={{ color: "var(--color-text-muted)", marginTop: "var(--space-3)" }}>
            Texto de ejemplo del paso. Mientras se lee, el panel de la otra columna permanece a la
            vista.
          </p>
        </li>
      ))}
    </ol>
  );
}

function Panel() {
  return (
    <Surface tone="dark" padding="lg">
      <div
        style={{
          aspectRatio: "4 / 3",
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
        Panel fijo
      </div>
    </Surface>
  );
}

const meta = {
  title: "Layout/StickyLayout",
  component: StickyLayout,
  parameters: { layout: "fullscreen" },
  args: {
    sticky: <Panel />,
    children: <Steps />,
    stickySide: "end",
    ratio: "5:7",
    stickyAlign: "center",
  },
  argTypes: {
    stickySide: { control: "inline-radio", options: ["start", "end"] },
    ratio: { control: "inline-radio", options: ["1:1", "5:7", "7:5", "4:8", "8:4"] },
    stickyAlign: { control: "inline-radio", options: ["top", "center"] },
    sticky: { control: false },
    children: { control: false },
  },
  render: (args) => (
    <div style={{ paddingBlock: "var(--space-16)" }}>
      <Container>
        <StickyLayout {...args} />
      </Container>
      <div style={{ height: "60vh" }} />
    </div>
  ),
} satisfies Meta<typeof StickyLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StepsWithPinnedPanel: Story = {
  name: "Steps with pinned panel (product story case)",
};

export const PinnedStart: Story = {
  name: "Pinned on the start side",
  args: { stickySide: "start", ratio: "7:5" },
};

export const PinnedTop: Story = {
  name: "Pinned to the top",
  args: { stickyAlign: "top", offset: "var(--space-16)" },
};

export const Mobile: Story = {
  name: "Narrow screen (stacks, no pinning)",
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
