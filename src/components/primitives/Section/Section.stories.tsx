import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Container } from "../Container";
import { SectionHeader } from "../SectionHeader";
import { Section } from "./Section";

const meta = {
  title: "Primitives/Section",
  component: Section,
  parameters: { layout: "fullscreen" },
  args: {
    id: "vision",
    labelledBy: "vision-title",
    tone: "default",
    spacing: "default",
    children: null,
  },
  argTypes: {
    tone: { control: "inline-radio", options: ["default", "inset"] },
    spacing: { control: "inline-radio", options: ["default", "compact"] },
    children: { control: false },
  },
  render: (args) => (
    <Section {...args}>
      <Container>
        <SectionHeader
          titleId={args.labelledBy}
          index="01"
          eyebrow="Visión"
          title="Título de sección"
          lead="Section se encarga de la semántica (landmark con nombre), el ritmo vertical y el offset de ancla. El ancho lo decide Container."
        />
      </Container>
    </Section>
  ),
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Inset: Story = {
  args: { tone: "inset" },
};

export const Compact: Story = {
  args: { spacing: "compact" },
};

export const Stacked: Story = {
  name: "Stacked sections",
  render: () => (
    <>
      {["vision", "capabilities", "building"].map((id, i) => (
        <Section key={id} id={id} labelledBy={`${id}-title`} spacing="compact">
          <Container>
            <SectionHeader titleId={`${id}-title`} index={`0${i + 1}`} title={`Sección ${i + 1}`} />
          </Container>
        </Section>
      ))}
    </>
  ),
};
