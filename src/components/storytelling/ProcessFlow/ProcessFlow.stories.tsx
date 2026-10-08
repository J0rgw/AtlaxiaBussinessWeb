import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "@/components/primitives/Button";
import { Surface } from "@/components/primitives/Surface";
import { ProcessFlow, type ProcessStep } from "./ProcessFlow";

// Concept from CLAUDE.md (Vision). Descriptions are sample text, not final copy.
const steps: ProcessStep[] = [
  { id: "data", label: "Datos", description: "Lecturas de sensores y sistemas." },
  { id: "context", label: "Contexto", description: "Qué rodea a cada señal." },
  { id: "behavior", label: "Comportamiento", description: "Qué es lo normal y qué no." },
  { id: "understanding", label: "Comprensión", description: "Por qué ocurre lo que ocurre." },
  { id: "action", label: "Acción", description: "Qué hacer con ello." },
];

const meta = {
  title: "Storytelling/ProcessFlow",
  component: ProcessFlow,
  args: {
    steps,
    label: "De los datos a la acción",
    orientation: "auto",
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["auto", "horizontal", "vertical"] },
    activeIndex: { control: { type: "range", min: 0, max: 4, step: 1 } },
    steps: { control: false },
  },
} satisfies Meta<typeof ProcessFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Static: Story = {
  name: "Static (all reached)",
};

export const InProgress: Story = {
  name: "In progress",
  args: { activeIndex: 2 },
};

export const Vertical: Story = {
  args: { orientation: "vertical", activeIndex: 1 },
};

/** Stage tags above the labels; pending tracks are dashed (still to come). */
export const Roadmap: Story = {
  name: "Roadmap (stage tags)",
  args: {
    label: "Hoja de ruta",
    orientation: "vertical",
    activeIndex: 0,
    steps: [
      { id: "today", meta: "Hoy", label: "Procesos", description: "Lo que ya hacemos." },
      { id: "next", meta: "Siguiente", label: "Plantas", description: "El próximo paso." },
      { id: "goal", meta: "Objetivo", label: "Sistemas", description: "Hacia dónde vamos." },
    ],
  },
};

export const LabelsOnly: Story = {
  name: "Labels only",
  args: { steps: steps.map(({ id, label }) => ({ id, label })), activeIndex: 3 },
};

/** Step through to see the connectors fill (respects the Motion toolbar). */
export const Stepper: Story = {
  render: (args) => {
    const [index, setIndex] = useState(0);
    return (
      <div style={{ display: "grid", gap: "2rem" }}>
        <ProcessFlow {...args} activeIndex={index} />
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button size="sm" variant="secondary" onClick={() => setIndex(Math.max(0, index - 1))}>
            Anterior
          </Button>
          <Button size="sm" onClick={() => setIndex(Math.min(steps.length - 1, index + 1))}>
            Siguiente
          </Button>
        </div>
      </div>
    );
  },
};

export const OnDarkSurface: Story = {
  args: { activeIndex: 2 },
  render: (args) => (
    <Surface tone="dark" padding="lg">
      <ProcessFlow {...args} />
    </Surface>
  ),
};

export const NarrowContainer: Story = {
  name: "Narrow container (vertical)",
  args: { activeIndex: 2 },
  render: (args) => (
    <div style={{ maxWidth: "22rem", outline: "1px dashed var(--color-border-strong)" }}>
      <ProcessFlow {...args} />
    </div>
  ),
};
