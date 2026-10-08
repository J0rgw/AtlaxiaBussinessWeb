import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionHeader } from "../SectionHeader";
import { Section } from "./Section";

describe("Section + SectionHeader", () => {
  it("exposes a named region through aria-labelledby", () => {
    render(
      <Section id="vision" labelledBy="vision-title">
        <SectionHeader
          titleId="vision-title"
          index="01"
          eyebrow="Visión"
          title="Por qué existimos"
        />
      </Section>,
    );

    const region = screen.getByRole("region", { name: "Por qué existimos" });
    expect(region).toHaveAttribute("id", "vision");
    expect(
      screen.getByRole("heading", { level: 2, name: "Por qué existimos" }),
    ).toBeInTheDocument();
  });

  it("renders the heading level requested, independent of visual size", () => {
    render(<SectionHeader as="h1" size="display" title="ATLAXIA" />);

    expect(screen.getByRole("heading", { level: 1, name: "ATLAXIA" })).toBeInTheDocument();
  });
});
