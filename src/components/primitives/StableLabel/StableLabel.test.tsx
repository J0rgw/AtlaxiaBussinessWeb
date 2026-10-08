import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StableLabel } from "./StableLabel";

describe("StableLabel", () => {
  it("exposes only the visible text to assistive technology", () => {
    render(
      <button type="button">
        <StableLabel alternatives={["Contact"]} reserveBold>
          Contacto
        </StableLabel>
      </button>,
    );

    expect(screen.getByRole("button", { name: "Contacto" })).toBeInTheDocument();
  });

  it("reserves every alternative once, plus bold copies when asked", () => {
    const { container } = render(
      <StableLabel alternatives={["Vision", "Visión"]} reserveBold>
        Visión
      </StableLabel>,
    );

    const reserved = container.querySelectorAll('[aria-hidden="true"]');
    // "Visión" and "Vision", regular and bold.
    expect(reserved).toHaveLength(4);
  });
});
