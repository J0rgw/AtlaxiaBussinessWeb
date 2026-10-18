import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Container } from "@/components/primitives/Container";
import { StickyIndexStory, type IndexStoryItem } from "./StickyIndexStory";

function Placeholder({ label }: { label: string }) {
  return (
    <div
      style={{
        aspectRatio: "16 / 9",
        display: "grid",
        placeItems: "center",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "var(--radius-lg)",
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
  );
}

// Sample text.
const items: IndexStoryItem[] = [
  "Datos sin contexto",
  "Relaciones entre señales",
  "Comportamiento esperado",
  "De entender a actuar",
].map((label, i) => ({
  id: `reason-${i}`,
  label,
  title: `Título del panel ${i + 1}`,
  body: (
    <p>
      Texto de ejemplo. Al llegar a este panel, su entrada del índice fijo pasa a primer plano; las
      demás se atenúan con color, no con opacidad, para mantener el contraste.
    </p>
  ),
  visual: <Placeholder label={`Visual ${i + 1}`} />,
}));

const meta = {
  title: "Storytelling/StickyIndexStory",
  component: StickyIndexStory,
  parameters: { layout: "fullscreen" },
  args: { items, label: "Por qué existimos", titleAs: "h3" },
  argTypes: { items: { control: false } },
  render: (args) => (
    <div style={{ paddingBlock: "var(--space-24)" }}>
      <Container>
        <StickyIndexStory {...args} />
      </Container>
      <div style={{ height: "50vh" }} />
    </div>
  ),
} satisfies Meta<typeof StickyIndexStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WhyIndex: Story = { name: "Index of reasons" };

export const LongLabels: Story = {
  name: "Long index entries",
  args: {
    items: items.map((item) => ({
      ...item,
      label: `${item.label}, con una entrada bastante más larga de lo normal`,
    })),
  },
};

export const Mobile: Story = {
  name: "Narrow screen (index on top)",
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

/** Numbered chapters of a longer text (Forgis), as in "Quiénes somos". */
export const Chapters: Story = {
  name: "Chapters of a text",
  args: { variant: "chapters", label: "Capítulos" },
};
