import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SegmentedControl } from "./SegmentedControl";

const options = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7 días" },
  { value: "30d", label: "30 días" },
];

describe("SegmentedControl", () => {
  it("exposes a named radio group with the default option checked", () => {
    render(<SegmentedControl label="Rango temporal" options={options} defaultValue="7d" />);

    expect(screen.getByRole("radiogroup", { name: "Rango temporal" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "7 días" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "24h" })).not.toBeChecked();
  });

  it("selects on click and reports the value", async () => {
    const onChange = vi.fn();
    render(<SegmentedControl label="Rango temporal" options={options} onChange={onChange} />);

    await userEvent.click(screen.getByText("30 días", { selector: "span:not([aria-hidden])" }));

    expect(screen.getByRole("radio", { name: "30 días" })).toBeChecked();
    expect(onChange).toHaveBeenCalledWith("30d");
  });

  it("moves the selection with arrow keys", async () => {
    render(<SegmentedControl label="Rango temporal" options={options} defaultValue="24h" />);

    screen.getByRole("radio", { name: "24h" }).focus();
    await userEvent.keyboard("{ArrowRight}");

    expect(screen.getByRole("radio", { name: "7 días" })).toBeChecked();
  });

  it("follows the controlled value", () => {
    const { rerender } = render(
      <SegmentedControl label="Rango temporal" options={options} value="24h" />,
    );
    expect(screen.getByRole("radio", { name: "24h" })).toBeChecked();

    rerender(<SegmentedControl label="Rango temporal" options={options} value="30d" />);
    expect(screen.getByRole("radio", { name: "30 días" })).toBeChecked();
  });
});
