import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ScrubFigure } from "./ScrubFigure";

/*
  The anatomy figures (scripts/anatomy) at a fixed progress: drag the
  `progress` control to scrub one. In the page they follow the scroll scene.
*/

const meta = {
  title: "Data display/ScrubFigure",
  component: ScrubFigure,
  args: {
    src: "/animations/anatomy/sector-water",
    progress: 1,
    aspect: 3 / 2,
  },
  argTypes: {
    progress: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
    src: {
      control: "select",
      options: [
        "/animations/anatomy/sector-water",
        "/animations/anatomy/sector-food",
        "/animations/anatomy/sector-metal",
        "/animations/anatomy/vision-where",
      ],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ScrubFigure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Water: Story = {};

export const Food: Story = { args: { src: "/animations/anatomy/sector-food", progress: 0.8 } };

export const Metal: Story = { args: { src: "/animations/anatomy/sector-metal", progress: 0.6 } };

export const WhereProcess: Story = {
  name: "Where, the process (0.5)",
  args: { src: "/animations/anatomy/vision-where", progress: 0.5, aspect: 1 },
};

export const WhereNetwork: Story = {
  name: "Where, the network (1)",
  args: { src: "/animations/anatomy/vision-where", progress: 1, aspect: 1 },
};
