import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Surface } from "@/components/primitives/Surface";
import { LanguageSwitcher } from "./LanguageSwitcher";

const meta = {
  title: "Navigation/LanguageSwitcher",
  component: LanguageSwitcher,
  args: {
    label: "Idioma",
    current: "es",
    // "#" hrefs keep the story from navigating away from Storybook.
    options: [
      { code: "es", label: "ES", name: "Español", href: "#" },
      { code: "en", label: "EN", name: "English", href: "#" },
    ],
    preserveHash: false,
  },
} satisfies Meta<typeof LanguageSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Spanish: Story = {};

export const English: Story = {
  args: { current: "en", label: "Language" },
};

export const ThreeLanguages: Story = {
  name: "Three languages (API check)",
  args: {
    options: [
      { code: "es", label: "ES", name: "Español", href: "#" },
      { code: "en", label: "EN", name: "English", href: "#" },
      { code: "pt", label: "PT", name: "Português", href: "#" },
    ],
  },
};

export const OnDarkSurface: Story = {
  render: (args) => (
    <Surface tone="dark">
      <LanguageSwitcher {...args} />
    </Surface>
  ),
};
