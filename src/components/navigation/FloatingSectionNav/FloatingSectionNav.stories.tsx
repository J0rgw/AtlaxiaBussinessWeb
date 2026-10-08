import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Box, Compass, Layers, Mail, Users } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { StableLabel } from "@/components/primitives/StableLabel";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { FloatingSectionNav, type SectionNavItem } from "./FloatingSectionNav";

const items: SectionNavItem[] = [
  { id: "vision", label: "Visión", alternatives: ["Vision"], icon: <Compass /> },
  { id: "capabilities", label: "Qué hacemos", alternatives: ["What we do"], icon: <Layers /> },
  {
    id: "building",
    label: "Qué estamos construyendo",
    alternatives: ["What we are building"],
    icon: <Box />,
  },
  { id: "about", label: "Quiénes somos", alternatives: ["Who we are"], icon: <Users /> },
];

const itemsEn: SectionNavItem[] = items.map((item, i) => ({
  ...item,
  label: ["Vision", "What we do", "What we are building", "Who we are"][i]!,
  alternatives: [["Visión"], ["Qué hacemos"], ["Qué estamos construyendo"], ["Quiénes somos"]][i],
}));

const brand = (
  <a
    href="#top"
    style={{ fontWeight: 600, letterSpacing: "0.06em", textDecoration: "none", color: "inherit" }}
  >
    M
  </a>
);

function actionsFor(current: "es" | "en") {
  return (
    <>
      <LanguageSwitcher
        label={current === "es" ? "Idioma" : "Language"}
        current={current}
        preserveHash={false}
        options={[
          { code: "es", label: "ES", name: "Español", href: "#" },
          { code: "en", label: "EN", name: "English", href: "#" },
        ]}
      />
      <Button href="#contact" size="sm" endIcon={<Mail />}>
        <StableLabel alternatives={["Contacto", "Contact"]}>
          {current === "es" ? "Contacto" : "Contact"}
        </StableLabel>
      </Button>
    </>
  );
}

/** Long page so scrolling moves the active section, then past it. */
function DemoPage() {
  return (
    <main>
      <Section id="top" labelledBy="top-title">
        <Container>
          <SectionHeader
            as="h1"
            size="display"
            titleId="top-title"
            title="Página de ejemplo"
            lead="Haz scroll: la pastilla sigue a la sección que se lee. Al llegar a Contacto sale hacia la derecha; al volver al inicio, hacia la izquierda."
          />
        </Container>
      </Section>
      {[...items, { id: "contact", label: "Contacto" }].map((item, i) => (
        <Section key={item.id} id={item.id} labelledBy={`${item.id}-title`}>
          <Container>
            <div style={{ minHeight: "70vh" }}>
              <SectionHeader
                index={String(i + 1).padStart(2, "0")}
                titleId={`${item.id}-title`}
                title={item.label}
              />
            </div>
          </Container>
        </Section>
      ))}
    </main>
  );
}

const meta = {
  title: "Navigation/FloatingSectionNav",
  component: FloatingSectionNav,
  parameters: { layout: "fullscreen" },
  args: {
    items,
    label: "Navegación principal",
    brand,
    actions: actionsFor("es"),
    placement: "bottom",
  },
  argTypes: {
    placement: { control: "inline-radio", options: ["bottom", "top"] },
    brand: { control: false },
    actions: { control: false },
    items: { control: false },
  },
  render: (args) => (
    <>
      <FloatingSectionNav {...args} />
      <DemoPage />
    </>
  ),
} satisfies Meta<typeof FloatingSectionNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ScrollTracking: Story = {
  name: "Scroll tracking",
};

export const TopPlacement: Story = {
  name: "Top placement",
  args: { placement: "top" },
};

/** Spanish and English side by side: the bars must be exactly as wide. */
export const SameWidthAcrossLanguages: Story = {
  name: "Same width in ES and EN",
  render: () => (
    <div style={{ display: "grid", gap: "6rem", paddingBlock: "3rem" }}>
      {(["es", "en"] as const).map((lang) => (
        // transform makes this box the containing block of the fixed bar,
        // so both bars render in place instead of stacking on the viewport.
        <div key={lang} style={{ height: "4rem", transform: "translateZ(0)" }}>
          <FloatingSectionNav
            items={lang === "es" ? items : itemsEn}
            label={lang === "es" ? "Navegación principal" : "Main navigation"}
            brand={brand}
            actions={actionsFor(lang)}
            activeId="building"
            placement="top"
          />
        </div>
      ))}
    </div>
  ),
};

export const Mobile: Story = {
  name: "Narrow screen (icons)",
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
