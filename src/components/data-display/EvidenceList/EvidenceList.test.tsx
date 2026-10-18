import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EvidenceList } from "./EvidenceList";

const items = [
  {
    id: "a",
    figure: "60 %",
    statement: "de la población.",
    source: { label: "iAgua, 13 may 2026", href: "https://example.org/a" },
  },
  {
    id: "b",
    figure: "NIS2",
    statement: "Alta criticidad.",
    source: { label: "Directiva", href: "https://example.org/b" },
  },
];

describe("EvidenceList", () => {
  it("lists each fact with its source, opened in a new tab", () => {
    render(<EvidenceList title="Por qué ahora" titleId="why" sourceLabel="Fuente" items={items} />);

    const list = screen.getByRole("list", { name: "Por qué ahora" });
    const rows = within(list).getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("60 % de la población.");
    const link = within(rows[0]!).getByRole("link", { name: "iAgua, 13 may 2026" });
    expect(link).toHaveAttribute("href", "https://example.org/a");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
