import { afterEach, describe, expect, it, vi } from "vitest";
import { LOCALE_STORAGE_KEY } from "./config";
import { getLocalePreferenceScript } from "./preference";

function runScript(pathname: string, stored: string | null) {
  const replace = vi.fn();
  const location = { pathname, hash: "#contact", replace };
  const localStorage = {
    getItem: vi.fn((key: string) => (key === LOCALE_STORAGE_KEY ? stored : null)),
  };
  new Function("location", "localStorage", getLocalePreferenceScript())(location, localStorage);
  return replace;
}

describe("locale preference script", () => {
  afterEach(() => vi.restoreAllMocks());

  it("does nothing on a first visit", () => {
    expect(runScript("/", null)).not.toHaveBeenCalled();
  });

  it("redirects the Spanish home to English after an explicit English choice", () => {
    expect(runScript("/", "en")).toHaveBeenCalledWith("/en/#contact");
  });

  it("does not redirect other paths", () => {
    expect(runScript("/aviso-legal/", "en")).not.toHaveBeenCalled();
  });

  it("stays on Spanish when Spanish was chosen", () => {
    expect(runScript("/", "es")).not.toHaveBeenCalled();
  });
});
