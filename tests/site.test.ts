import { beforeEach, describe, expect, it, vi } from "vitest";

describe("lib/site", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  });

  it("falls back to the placeholder domain when env is unset", async () => {
    const { SITE_URL, CONTACT_EMAIL, SITE_HOST } = await import("@/lib/site");
    expect(SITE_URL).toBe("https://atlaxia.example");
    expect(CONTACT_EMAIL).toBe("hola@atlaxia.example");
    expect(SITE_HOST).toBe("atlaxia.example");
  });

  it("strips trailing slashes from SITE_URL", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://atlaxia.com/";
    vi.resetModules();
    const { SITE_URL, SITE_HOST } = await import("@/lib/site");
    expect(SITE_URL).toBe("https://atlaxia.com");
    expect(SITE_HOST).toBe("atlaxia.com");
  });

  it("respects a custom contact email", async () => {
    process.env.NEXT_PUBLIC_CONTACT_EMAIL = "ventas@atlaxia.com";
    vi.resetModules();
    const { CONTACT_EMAIL } = await import("@/lib/site");
    expect(CONTACT_EMAIL).toBe("ventas@atlaxia.com");
  });
});
