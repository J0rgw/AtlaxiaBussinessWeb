import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { dictionaries } from "@/content";
import { Building } from "./Building/Building";
import { Contact } from "./Contact/Contact";
import { Hero } from "./Hero/Hero";
import { Vision } from "./Vision/Vision";

/** Real sections with the real dictionaries, to review copy and layout in both languages. */
const meta = {
  title: "Sections",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const HeroEs: Story = {
  name: "Hero (ES)",
  render: () => <Hero locale="es" content={dictionaries.es.hero} />,
};

export const HeroEn: Story = {
  name: "Hero (EN)",
  render: () => <Hero locale="en" content={dictionaries.en.hero} />,
};

export const VisionEs: Story = {
  name: "Vision (ES)",
  render: () => <Vision content={dictionaries.es.vision} />,
};

export const VisionEn: Story = {
  name: "Vision (EN)",
  render: () => <Vision content={dictionaries.en.vision} />,
};

export const HeroMobile: Story = {
  name: "Hero (ES, narrow screen)",
  globals: { viewport: { value: "mobile2", isRotated: false } },
  render: () => <Hero locale="es" content={dictionaries.es.hero} />,
};

export const VisionMobile: Story = {
  name: "Vision (ES, narrow screen)",
  globals: { viewport: { value: "mobile2", isRotated: false } },
  render: () => <Vision content={dictionaries.es.vision} />,
};

export const BuildingEs: Story = {
  name: "Building (ES)",
  render: () => (
    <Building
      locale="es"
      eyebrow={dictionaries.es.nav.building}
      content={dictionaries.es.building}
    />
  ),
};

export const BuildingEn: Story = {
  name: "Building (EN)",
  render: () => (
    <Building
      locale="en"
      eyebrow={dictionaries.en.nav.building}
      content={dictionaries.en.building}
    />
  ),
};

export const ContactEs: Story = {
  name: "Contact (ES)",
  render: () => <Contact content={dictionaries.es.contact} />,
};

export const ContactEn: Story = {
  name: "Contact (EN)",
  render: () => <Contact content={dictionaries.en.contact} />,
};

export const ContactMobile: Story = {
  name: "Contact (ES, narrow screen)",
  globals: { viewport: { value: "mobile2", isRotated: false } },
  render: () => <Contact content={dictionaries.es.contact} />,
};
