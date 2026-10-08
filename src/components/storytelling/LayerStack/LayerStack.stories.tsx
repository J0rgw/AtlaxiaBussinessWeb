import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Activity, LayoutDashboard, Server, Waypoints } from "lucide-react";
import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { LayerStack, type StackLayer } from "./LayerStack";

// Sample text.
const layers: StackLayer[] = [
  {
    id: "interface",
    index: "04",
    title: "Interfaz",
    tagline: "Para quien opera el proceso.",
    description: <p>Descripción de ejemplo de la capa.</p>,
    items: [
      { id: "a", icon: <LayoutDashboard />, label: "Panel", sub: "Operación" },
      { id: "b", icon: <Activity />, label: "Eventos", sub: "Histórico" },
    ],
  },
  {
    id: "model",
    index: "03",
    title: "Modelo",
    tagline: "Relaciones entre señales.",
    items: [{ id: "c", icon: <Waypoints />, label: "Grafo", sub: "Relaciones" }],
  },
  {
    id: "plant",
    index: "02",
    title: "Planta",
    tagline: "Junto al sistema de control.",
    items: [{ id: "d", icon: <Server />, label: "Equipo local", sub: "On-premise" }],
  },
];

const aside = (
  <div style={{ display: "grid", gap: "var(--space-3)" }}>
    <p style={{ fontWeight: 600 }}>Producto</p>
    <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
      Columna transversal a todas las capas.
    </p>
  </div>
);

const meta = {
  title: "Storytelling/LayerStack",
  component: LayerStack,
  parameters: { layout: "fullscreen" },
  args: { layers, label: "Capas", aside },
  argTypes: { layers: { control: false }, aside: { control: false } },
  render: (args) => (
    <Section id="stack" tone="dark">
      <Container>
        <LayerStack {...args} />
      </Container>
    </Section>
  ),
} satisfies Meta<typeof LayerStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithCrossCuttingColumn: Story = { name: "With cross-cutting column (dark)" };

export const WithoutAside: Story = { name: "Layers only", args: { aside: undefined } };

export const OnLight: Story = {
  name: "On a light surface",
  render: (args) => (
    <Section id="stack-light">
      <Container>
        <LayerStack {...args} />
      </Container>
    </Section>
  ),
};

export const Mobile: Story = {
  name: "Narrow screen",
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
