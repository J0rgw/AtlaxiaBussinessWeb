import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "../Button";
import { StableLabel } from "./StableLabel";

const meta = {
  title: "Primitives/StableLabel",
  component: StableLabel,
  args: { children: "Qué estamos construyendo", alternatives: ["What we are building"] },
} satisfies Meta<typeof StableLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <span style={{ outline: "1px dashed var(--color-border-strong)" }}>
      <StableLabel {...args} />
    </span>
  ),
};

/** Toggle the language: the button keeps its width. */
export const LanguageToggle: Story = {
  name: "Width stays put across languages",
  render: () => {
    const [lang, setLang] = useState<"es" | "en">("es");
    const label = lang === "es" ? "Contacto" : "Contact";
    return (
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Button size="sm">
          <StableLabel alternatives={["Contacto", "Contact"]}>{label}</StableLabel>
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setLang(lang === "es" ? "en" : "es")}>
          {lang === "es" ? "Cambiar a EN" : "Switch to ES"}
        </Button>
      </div>
    );
  },
};
