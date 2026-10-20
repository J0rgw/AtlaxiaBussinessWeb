import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TeamGallery, type TeamMember } from "./TeamGallery";

const members: TeamMember[] = ["Ana", "Bea", "Carla"].map((name, i) => ({
  id: `m${i}`,
  name,
  role: `Cargo ${i + 1}`,
  initials: name.slice(0, 2).toUpperCase(),
  facts: [
    { label: "Perfil", value: `Perfil de ${name}` },
    { label: "En ATLAXIA", value: `Trabajo de ${name}` },
  ],
}));

/** Pretends the screen is wide (the row) or narrow (the stack). */
function setWide(wide: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: wide && query.includes("min-width"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

afterEach(() => vi.unstubAllGlobals());

describe("TeamGallery", () => {
  it("lists every person with name, role and sheet in the document", () => {
    setWide(true);
    render(<TeamGallery members={members} />);

    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    for (const [i, item] of items.entries()) {
      expect(within(item).getByRole("heading", { level: 3 })).toHaveTextContent(members[i]!.name);
      expect(item).toHaveTextContent(members[i]!.role);
      expect(item).toHaveTextContent(`Trabajo de ${members[i]!.name}`);
    }
  });

  it("opens the first on wide screens; a click opens another, one at a time", () => {
    setWide(true);
    render(<TeamGallery members={members} />);
    const button = (name: string) => screen.getByRole("button", { name });

    expect(button("Ana")).toHaveAttribute("aria-expanded", "true");
    expect(button("Bea")).toHaveAttribute("aria-expanded", "false");
    const sheet = document.getElementById(button("Bea").getAttribute("aria-controls")!)!;
    expect(sheet).toHaveTextContent("Trabajo de Bea");

    act(() => fireEvent.click(button("Bea")));
    expect(button("Bea")).toHaveAttribute("aria-expanded", "true");
    expect(button("Ana")).toHaveAttribute("aria-expanded", "false");

    // A second click closes it
    act(() => fireEvent.click(button("Bea")));
    expect(screen.getAllByRole("button").map((b) => b.getAttribute("aria-expanded"))).toEqual([
      "false",
      "false",
      "false",
    ]);
  });

  it("closes with Escape", () => {
    setWide(true);
    render(<TeamGallery members={members} />);

    act(() => fireEvent.keyDown(screen.getByRole("button", { name: "Carla" }), { key: "Escape" }));
    expect(
      screen.getAllByRole("button").every((b) => b.getAttribute("aria-expanded") === "false"),
    ).toBe(true);
    expect(screen.getByRole("list")).toHaveAttribute("data-quiet", "");
  });

  it("has nothing to toggle on narrow screens: every sheet is in view", () => {
    setWide(false);
    render(<TeamGallery members={members} />);

    expect(screen.queryAllByRole("button")).toEqual([]);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Ana",
      "Bea",
      "Carla",
    ]);
  });

  it("keeps the links of closed sheets out of the tab order, and those of the pinned one in", () => {
    setWide(true);
    render(
      <TeamGallery
        members={members.map((member) => ({
          ...member,
          linkedin: "https://www.linkedin.com/in/example",
          linkedinText: `LinkedIn de ${member.name}`,
        }))}
      />,
    );
    const link = (name: string) => screen.getByRole("link", { name: `LinkedIn de ${name}` });

    // Ana is open: her link is reachable, the other two are not
    expect(link("Ana")).not.toHaveAttribute("tabindex");
    expect(link("Bea")).toHaveAttribute("tabindex", "-1");
    expect(link("Carla")).toHaveAttribute("tabindex", "-1");

    // Pinning another tile moves the tab stop with it
    act(() => fireEvent.click(screen.getByRole("button", { name: "Bea" })));
    expect(link("Ana")).toHaveAttribute("tabindex", "-1");
    expect(link("Bea")).not.toHaveAttribute("tabindex");

    // Closed all (Escape): none of them
    act(() => fireEvent.keyDown(screen.getByRole("button", { name: "Bea" }), { key: "Escape" }));
    for (const name of ["Ana", "Bea", "Carla"]) {
      expect(link(name)).toHaveAttribute("tabindex", "-1");
    }
  });

  it("leaves every link in the tab order when the sheets are stacked", () => {
    setWide(false);
    render(
      <TeamGallery
        members={members.map((member) => ({
          ...member,
          linkedin: "https://www.linkedin.com/in/example",
          linkedinText: `LinkedIn de ${member.name}`,
        }))}
      />,
    );
    for (const link of screen.getAllByRole("link")) expect(link).not.toHaveAttribute("tabindex");
  });

  it("draws a list value (skills) as a list of tags under its label", () => {
    setWide(true);
    render(
      <TeamGallery
        members={[
          {
            ...members[0]!,
            facts: [{ label: "Habilidades técnicas", value: ["Inteligencia artificial", "Redes"] }],
          },
        ]}
      />,
    );

    const term = screen.getByText("Habilidades técnicas");
    expect(term.tagName).toBe("DT");
    const tags = within(term.nextElementSibling as HTMLElement).getByRole("list");
    expect(
      within(tags)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual(["Inteligencia artificial", "Redes"]);
  });

  it("names the profile link after the person, and shows the portrait without alt", () => {
    setWide(true);
    const { container } = render(
      <TeamGallery
        members={[
          {
            ...members[0]!,
            linkedin: "https://www.linkedin.com/in/example",
            linkedinText: "LinkedIn de Ana",
            portrait: {
              src: "/a-1x.webp",
              srcSet: "/a-1x.webp 1x, /a-2x.webp 2x",
              width: 480,
              height: 600,
            },
          },
        ]}
      />,
    );

    const link = screen.getByRole("link", { name: "LinkedIn de Ana" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(container.querySelector("svg")).toBeNull();
  });
});
