import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getDictionary } from "@/content";
import { Home } from "./Home";

describe("Home", () => {
  it.each(["es", "en"] as const)(
    "every section in the bar has its block on the page (%s)",
    (locale) => {
      const dict = getDictionary(locale);
      const { container } = render(<Home locale={locale} />);

      const nav = screen.getByRole("navigation", { name: dict.navigation.label });
      const links = within(nav)
        .getAllByRole("link")
        .filter((a) => a.getAttribute("href")?.startsWith("#"));
      const targets = links.map((a) => a.getAttribute("href")!.slice(1));

      expect(targets).toEqual(["vision", "capabilities", "building", "about", "team", "contact"]);
      for (const id of targets) expect(container.querySelector(`section#${id}`)).not.toBeNull();
      expect(within(nav).getByRole("link", { name: dict.nav.team })).toHaveAttribute(
        "href",
        "#team",
      );
    },
  );
});
