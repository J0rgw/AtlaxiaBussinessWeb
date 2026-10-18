import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { dictionaries } from "@/content";
import { edgeDevice } from "@/sections/Edge/Edge";
import { EdgeShowcase } from "./EdgeShowcase";

const { lines, split, lede, alt } = dictionaries.es.edge;

const meta = {
  title: "Storytelling/EdgeShowcase",
  component: EdgeShowcase,
  parameters: { layout: "fullscreen" },
  args: { titleId: "edge-title", lines, split, lede, image: { ...edgeDevice, alt } },
  argTypes: { image: { control: false } },
} satisfies Meta<typeof EdgeShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The device crosses the lines; over it the text turns paper color. */
export const Default: Story = {};

export const English: Story = {
  args: {
    lines: dictionaries.en.edge.lines,
    split: dictionaries.en.edge.split,
    lede: dictionaries.en.edge.lede,
  },
};

export const LongHeadline: Story = {
  name: "Long headline, four lines",
  args: {
    lines: ["Todo el software", "funciona en un equipo", "instalado", "en la planta."],
  },
};

export const Mobile: Story = {
  name: "Narrow screen",
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
