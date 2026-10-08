import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Container } from "@/components/primitives/Container";
import { Surface } from "@/components/primitives/Surface";
import { StickyStory, type StoryStep } from "./StickyStory";

function PlaceholderVisual({ label }: { label: string }) {
  return (
    <Surface tone="dark" padding="lg">
      <div
        style={{
          aspectRatio: "4 / 3",
          display: "grid",
          placeItems: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          letterSpacing: "var(--tracking-label)",
          textTransform: "uppercase",
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

// Recommended structure for "Qué estamos construyendo" (AGENTS.md). Sample text.
const steps: StoryStep[] = ["Monitorizar", "Entender", "Relacionar", "Investigar", "Desplegar"].map(
  (title) => ({
    id: title.toLowerCase(),
    title,
    body: (
      <p>
        Texto de ejemplo del paso. Mientras se lee, el panel muestra su visual; al pasar al
        siguiente, cambia con un fundido.
      </p>
    ),
    visual: <PlaceholderVisual label={`Visual: ${title}`} />,
  }),
);

const meta = {
  title: "Storytelling/StickyStory",
  component: StickyStory,
  parameters: { layout: "fullscreen" },
  args: {
    steps,
    label: "Qué estamos construyendo, paso a paso",
    stickySide: "end",
    ratio: "5:7",
    titleAs: "h3",
  },
  argTypes: {
    stickySide: { control: "inline-radio", options: ["start", "end"] },
    ratio: { control: "inline-radio", options: ["1:1", "5:7", "7:5", "4:8", "8:4"] },
    steps: { control: false },
  },
  render: (args) => (
    <div style={{ paddingBlock: "var(--space-24)" }}>
      <Container>
        <StickyStory {...args} />
      </Container>
      <div style={{ height: "40vh" }} />
    </div>
  ),
} satisfies Meta<typeof StickyStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProductStory: Story = {
  name: "Product story (01 to 05)",
};

export const PanelOnStart: Story = {
  name: "Panel on the start side",
  args: { stickySide: "start", ratio: "7:5" },
};

export const Mobile: Story = {
  name: "Narrow screen (inline visuals)",
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
