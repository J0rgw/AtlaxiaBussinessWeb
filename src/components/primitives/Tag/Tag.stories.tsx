import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CircleAlert,
  CircleCheck,
  CircleHelp,
  CircleX,
  Clock,
  Droplets,
  Factory,
  FileText,
  Gauge,
  Info,
  ShieldCheck,
  TriangleAlert,
  Wheat,
} from "lucide-react";
import type { ReactNode } from "react";
import { Surface } from "../Surface";
import { Tag, type TagTone } from "./Tag";

const meta = {
  title: "Primitives/Tag",
  component: Tag,
  args: { children: "Pendiente", tone: "neutral", icon: <Clock /> },
  argTypes: {
    tone: {
      control: "select",
      options: [
        "neutral",
        "neutral-faint",
        "neutral-strong",
        "neutral-muted",
        "cobalt",
        "critical",
        "high",
        "medium",
        "low",
        "normal",
      ],
    },
    icon: { control: false },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutIcon: Story = {
  name: "Free tag (no icon)",
  args: { icon: undefined, children: "Sensor 01" },
};

type Row = { label: string; tags: Array<{ tone: TagTone; icon?: ReactNode; text: string }> };

const productRows: Row[] = [
  {
    label: "Criticality (ISA-18.2, color)",
    tags: [
      { tone: "critical", icon: <TriangleAlert />, text: "Crítica" },
      { tone: "high", icon: <CircleAlert />, text: "Alta" },
      { tone: "medium", icon: <Gauge />, text: "Media" },
      { tone: "low", icon: <Info />, text: "Baja" },
      { tone: "normal", icon: <CircleCheck />, text: "Normal" },
    ],
  },
  {
    label: "State (neutral graded)",
    tags: [
      { tone: "neutral-faint", icon: <CircleHelp />, text: "Posible" },
      { tone: "neutral", icon: <Clock />, text: "Pendiente" },
      { tone: "neutral-strong", icon: <CircleCheck />, text: "Confirmada" },
      { tone: "neutral-strong", icon: <ShieldCheck />, text: "Confirmada real" },
      { tone: "neutral-muted", icon: <CircleX />, text: "Falso positivo" },
    ],
  },
  {
    label: "Importance (neutral graded)",
    tags: [
      { tone: "neutral-strong", icon: <ArrowUp />, text: "Alta" },
      { tone: "neutral", icon: <ArrowRight />, text: "Media" },
      { tone: "neutral-muted", icon: <ArrowDown />, text: "Baja" },
    ],
  },
  {
    label: "Reference (cobalt)",
    tags: [{ tone: "cobalt", icon: <FileText />, text: "Documento" }],
  },
];

// Web usage: never severity colors for non-severity concepts.
const webRows: Row[] = [
  {
    label: "Placeholder",
    tags: [{ tone: "neutral", icon: <Clock />, text: "Pendiente" }],
  },
  {
    label: "Categories (neutral, told apart by icon)",
    tags: [
      { tone: "neutral", icon: <Wheat />, text: "Agrifood" },
      { tone: "neutral", icon: <Factory />, text: "Metalurgia" },
      { tone: "neutral", icon: <Droplets />, text: "Agua" },
    ],
  },
];

function Board({ rows }: { rows: Row[] }) {
  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      {rows.map((row) => (
        <div key={row.label} style={{ display: "grid", gap: "0.5rem" }}>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
            }}
          >
            {row.label}
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {row.tags.map((t) => (
              <Tag key={`${row.label}-${t.text}`} tone={t.tone} icon={t.icon}>
                {t.text}
              </Tag>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LightAndDark({ rows }: { rows: Row[] }) {
  return (
    <div
      style={{
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))",
      }}
    >
      <Surface tone="raised" padding="lg">
        <Board rows={rows} />
      </Surface>
      <Surface tone="dark" padding="lg">
        <Board rows={rows} />
      </Surface>
    </div>
  );
}

export const ProductTones: Story = {
  args: {
    tone: "neutral",
  },

  name: "Product tones (light and dark)",

  parameters: {
    docs: {
      description: {
        story:
          "Same tones as the product badges. In light mode high, medium, low, normal and neutral-faint are below 4.5:1 with white 11px text (see docs/DECISIONES.md).",
      },
    },
  },

  render: () => <LightAndDark rows={productRows} />,
};

export const WebUsage: Story = {
  name: "Web usage",
  render: () => <LightAndDark rows={webRows} />,
};
