import { describe, expect, it, vi } from "vitest";
import { getEntryScrollScript } from "./entryScroll";

type Visit = {
  hash?: string;
  type?: "navigate" | "reload" | "back_forward";
  referrer?: string;
};

function runScript({ hash = "#vision", type = "navigate", referrer = "" }: Visit) {
  const history = { scrollRestoration: "auto", state: { tree: 1 }, replaceState: vi.fn() };
  const location = {
    origin: "https://atlaxia.com",
    pathname: "/en/",
    search: "",
    hash,
  };
  const performance = { getEntriesByType: () => [{ type }] };
  const document = { referrer };
  const listeners = new Map<string, (event: { persisted?: boolean }) => void>();
  const addEventListener = (type: string, listener: () => void) => listeners.set(type, listener);
  const setTimeout = (callback: () => void) => callback();
  const fire = (type: string, event = {}) => listeners.get(type)!(event);

  new Function(
    "history",
    "location",
    "performance",
    "document",
    "addEventListener",
    "setTimeout",
    getEntryScrollScript(),
  )(history, location, performance, document, addEventListener, setTimeout);

  return { history, fire };
}

describe("entry scroll script", () => {
  it("stops the browser from restoring the last position, until the page has loaded", () => {
    const { history, fire } = runScript({ hash: "" });
    expect(history.scrollRestoration).toBe("manual");
    fire("load");
    expect(history.scrollRestoration).toBe("auto");
  });

  it("leaves manual restoration behind, so a reload opens on the hero too", () => {
    const { history, fire } = runScript({ hash: "" });
    fire("load");
    fire("pagehide");
    expect(history.scrollRestoration).toBe("manual");
    // Back from another site, from the cache: the page is where it was
    fire("pageshow", { persisted: true });
    expect(history.scrollRestoration).toBe("auto");
  });

  it("drops the fragment of a link from outside, so the page opens on the hero", () => {
    const { history } = runScript({ referrer: "https://www.google.com/" });
    expect(history.replaceState).toHaveBeenCalledWith({ tree: 1 }, "", "/en/");
  });

  it("drops the fragment on reload, even after a language change", () => {
    const { history } = runScript({ type: "reload", referrer: "https://atlaxia.com/" });
    expect(history.replaceState).toHaveBeenCalled();
  });

  it("keeps the section when the visitor changes language", () => {
    const { history } = runScript({ referrer: "https://atlaxia.com/" });
    expect(history.replaceState).not.toHaveBeenCalled();
  });

  it("leaves an address without fragment as it is", () => {
    const { history } = runScript({ hash: "" });
    expect(history.replaceState).not.toHaveBeenCalled();
  });
});
