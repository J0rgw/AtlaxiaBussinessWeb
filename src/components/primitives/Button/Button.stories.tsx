import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowRight } from "lucide-react";
import { Surface } from "../Surface";
import { Button } from "./Button";

const meta = {
  title: "Primitives/Button",
  component: Button,
  args: {
    children: "Solicitar demo",
    variant: "primary",
    size: "md",
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary"] },
    size: { control: "inline-radio", options: ["md", "sm"] },
    endIcon: { control: false },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Ver la demo" },
};

export const WithIcon: Story = {
  args: { endIcon: <ArrowRight /> },
};

export const AsLink: Story = {
  name: "As link (external)",
  args: {
    href: "https://demo.atlaxia.es",
    target: "_blank",
    variant: "secondary",
    children: "Abrir demo",
    endIcon: <ArrowRight />,
  },
};

export const Small: Story = {
  args: { size: "sm", children: "Contacto" },
};

export const LongLabel: Story = {
  args: { children: "Hablar con el equipo sobre investigación y colaboración" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const OnDarkSurface: Story = {
  render: (args) => (
    <Surface tone="dark" padding="lg">
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Button {...args} />
        <Button {...args} variant="secondary">
          Ver la demo
        </Button>
      </div>
    </Surface>
  ),
};
