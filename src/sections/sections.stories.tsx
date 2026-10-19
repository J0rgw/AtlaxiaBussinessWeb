import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { dictionaries } from "@/content";
import { About } from "./About/About";
import { Building } from "./Building/Building";
import { Capabilities } from "./Capabilities/Capabilities";
import { Contact } from "./Contact/Contact";
import { Edge } from "./Edge/Edge";
import { Hero } from "./Hero/Hero";
import { Team } from "./Team/Team";
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
  render: () => <Vision title={dictionaries.es.nav.vision} content={dictionaries.es.vision} />,
};

export const VisionEn: Story = {
  name: "Vision (EN)",
  render: () => <Vision title={dictionaries.en.nav.vision} content={dictionaries.en.vision} />,
};

export const HeroMobile: Story = {
  name: "Hero (ES, narrow screen)",
  globals: { viewport: { value: "mobile2", isRotated: false } },
  render: () => <Hero locale="es" content={dictionaries.es.hero} />,
};

export const VisionMobile: Story = {
  name: "Vision (ES, narrow screen)",
  globals: { viewport: { value: "mobile2", isRotated: false } },
  render: () => <Vision title={dictionaries.es.nav.vision} content={dictionaries.es.vision} />,
};

/** Scroll the canvas to lay the sheets. */
export const BuildingEs: Story = {
  name: "Building (ES)",
  render: () => <Building content={dictionaries.es.building} />,
};

export const BuildingEn: Story = {
  name: "Building (EN)",
  render: () => <Building content={dictionaries.en.building} />,
};

export const BuildingMobile: Story = {
  name: "Building (ES, narrow screen)",
  globals: { viewport: { value: "mobile2", isRotated: false } },
  render: () => <Building content={dictionaries.es.building} />,
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

export const CapabilitiesEs: Story = {
  name: "Capabilities (ES)",
  render: () => <Capabilities content={dictionaries.es.capabilities} />,
};

export const CapabilitiesEn: Story = {
  name: "Capabilities (EN)",
  render: () => <Capabilities content={dictionaries.en.capabilities} />,
};

export const CapabilitiesMobile: Story = {
  name: "Capabilities (ES, narrow screen)",
  globals: { viewport: { value: "mobile2", isRotated: false } },
  render: () => <Capabilities content={dictionaries.es.capabilities} />,
};

export const EdgeEs: Story = {
  name: "Edge (ES)",
  render: () => <Edge content={dictionaries.es.edge} />,
};

export const EdgeEn: Story = {
  name: "Edge (EN)",
  render: () => <Edge content={dictionaries.en.edge} />,
};

export const AboutEs: Story = {
  name: "About (ES)",
  render: () => <About content={dictionaries.es.about} />,
};

export const AboutEn: Story = {
  name: "About (EN)",
  render: () => <About content={dictionaries.en.about} />,
};

export const TeamEs: Story = {
  name: "Team (ES)",
  render: () => <Team content={dictionaries.es.team} />,
};

export const TeamEn: Story = {
  name: "Team (EN)",
  render: () => <Team content={dictionaries.en.team} />,
};
