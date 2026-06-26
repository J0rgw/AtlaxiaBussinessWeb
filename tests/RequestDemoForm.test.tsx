import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RequestDemoForm } from "@/components/RequestDemoForm";

describe("RequestDemoForm", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_FORMSPREE_ID", "test123");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("renders the required fields with associated labels", () => {
    render(<RequestDemoForm />);
    expect(screen.getByLabelText(/nombre/i)).toBeRequired();
    expect(screen.getByLabelText(/empresa/i)).toBeRequired();
    expect(screen.getByLabelText(/email/i)).toBeRequired();
  });

  it("renders an optional message textarea", () => {
    render(<RequestDemoForm />);
    const textarea = screen.getByLabelText(/mensaje/i);
    expect(textarea).toBeInTheDocument();
    expect(textarea).not.toBeRequired();
  });

  it("renders the submit button and the email fallback link", () => {
    render(<RequestDemoForm />);
    expect(screen.getByRole("button", { name: /solicitar demo/i })).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /helloatlaxia@gmail\.com/i });
    expect(link).toHaveAttribute("href", expect.stringMatching(/^mailto:/));
  });

  it("shows the success state after a 200 from the form endpoint", async () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response("{}", { status: 200, headers: { "content-type": "application/json" } }));

    render(<RequestDemoForm />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/nombre/i), "Jane");
    await user.type(screen.getByLabelText(/empresa/i), "AcmeAguas");
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.click(screen.getByRole("button", { name: /solicitar demo/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(screen.getByText(/hemos recibido tu solicitud/i)).toBeInTheDocument();
  });

  it("shows an error message when the endpoint returns a 4xx", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ errors: [{ message: "Email inválido" }] }), {
        status: 422,
        headers: { "content-type": "application/json" },
      })
    );

    render(<RequestDemoForm />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/nombre/i), "Jane");
    await user.type(screen.getByLabelText(/empresa/i), "AcmeAguas");
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.click(screen.getByRole("button", { name: /solicitar demo/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/email inválido/i);
  });
});
