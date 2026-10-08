import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageSwitcher, type LanguageOption } from "./LanguageSwitcher";

const options: LanguageOption[] = [
  { code: "es", label: "ES", name: "Español", href: "/" },
  { code: "en", label: "EN", name: "English", href: "/en/" },
];

describe("LanguageSwitcher", () => {
  const assign = vi.fn();
  const originalLocation = window.location;

  beforeEach(() => {
    // jsdom cannot navigate; replace location with a stub we can inspect.
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, hash: "", assign },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
    assign.mockReset();
  });

  it("renders a labelled navigation with one link per language", () => {
    render(<LanguageSwitcher options={options} current="es" label="Idioma" />);

    expect(screen.getByRole("navigation", { name: "Idioma" })).toBeInTheDocument();
    const english = screen.getByRole("link", { name: "EN English" });
    expect(english).toHaveAttribute("href", "/en/");
    expect(english).toHaveAttribute("hreflang", "en");
    expect(english).toHaveAttribute("lang", "en");
  });

  it("marks only the current language", () => {
    render(<LanguageSwitcher options={options} current="es" label="Idioma" />);

    expect(screen.getByRole("link", { name: "ES Español" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("link", { name: "EN English" })).not.toHaveAttribute("aria-current");
  });

  it("keeps the section hash and stores the choice", async () => {
    window.location.hash = "#vision";
    render(
      <LanguageSwitcher options={options} current="es" label="Idioma" persistKey="test.locale" />,
    );

    await userEvent.click(screen.getByRole("link", { name: "EN English" }));

    expect(assign).toHaveBeenCalledWith("/en/#vision");
    expect(window.localStorage.getItem("test.locale")).toBe("en");
  });

  it("does not navigate when the current language is chosen again", async () => {
    render(<LanguageSwitcher options={options} current="es" label="Idioma" />);

    await userEvent.click(screen.getByRole("link", { name: "ES Español" }));

    expect(assign).not.toHaveBeenCalled();
  });
});
