import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Surface } from "@/components/primitives/Surface";
import { NodeGraph, type GraphEdge, type GraphNode } from "./NodeGraph";

const nodes: GraphNode[] = [
  { id: "a", x: 320, y: 185, label: "Presión", role: "focus" },
  { id: "b", x: 165, y: 105, label: "Caudal", role: "related" },
  { id: "c", x: 480, y: 95, label: "Temperatura", role: "related" },
  { id: "d", x: 465, y: 285, label: "Nivel", role: "related" },
  { id: "e", x: 70, y: 215, label: "Vibración" },
  { id: "f", x: 585, y: 195, label: "Energía" },
  { id: "g", x: 195, y: 305, label: "Humedad" },
  { id: "h", x: 325, y: 345, label: "Velocidad" },
];

const edges: GraphEdge[] = [
  { from: "a", to: "b", strength: "strong" },
  { from: "a", to: "c", strength: "strong" },
  { from: "a", to: "d", strength: "strong" },
  { from: "b", to: "e" },
  { from: "e", to: "g" },
  { from: "g", to: "h" },
  { from: "h", to: "d" },
  { from: "d", to: "f" },
  { from: "f", to: "c" },
  { from: "c", to: "b" },
];

const meta = {
  title: "Data display/NodeGraph",
  component: NodeGraph,
  args: {
    nodes,
    edges,
    width: 640,
    height: 400,
    description:
      "Red de señales de ejemplo. La presión ocupa el centro y se relaciona con tres señales.",
    animated: true,
  },
  argTypes: { nodes: { control: false }, edges: { control: false } },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "44rem" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NodeGraph>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Static: Story = {
  args: { animated: false },
};

export const OnDarkSurface: Story = {
  render: (args) => (
    <Surface tone="dark" padding="lg">
      <NodeGraph {...args} />
    </Surface>
  ),
};

export const SmallContainer: Story = {
  name: "Small container (labels scale up)",
  render: (args) => (
    <div style={{ maxWidth: "20rem", outline: "1px dashed var(--color-border-strong)" }}>
      <NodeGraph {...args} />
    </div>
  ),
};
