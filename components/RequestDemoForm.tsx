"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { CONTACT_EMAIL } from "@/lib/site";

type Status = "idle" | "loading" | "ok" | "error";

function getFormspreeEndpoint(): string | null {
  const id = process.env.NEXT_PUBLIC_FORMSPREE_ID;
  return id ? `https://formspree.io/f/${id}` : null;
}

export function RequestDemoForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(form: HTMLFormElement) {
    const data = new FormData(form);

    // Honeypot — silent success on bot fill
    if (data.get("website")) {
      setStatus("ok");
      return;
    }

    const endpoint = getFormspreeEndpoint();
    if (!endpoint) {
      setStatus("error");
      setError(`El formulario no está configurado. Escríbenos a ${CONTACT_EMAIL}.`);
      return;
    }

    setStatus("loading");
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("ok");
        form.reset();
        return;
      }
      const json = await res.json().catch(() => null);
      const msg =
        json?.errors?.[0]?.message ??
        "No se pudo enviar. Inténtalo de nuevo o escríbenos por email.";
      setStatus("error");
      setError(msg);
    } catch {
      setStatus("error");
      setError("Error de red. Inténtalo de nuevo o escríbenos por email.");
    }
  }

  if (status === "ok") return <Success />;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit(e.currentTarget);
      }}
      className="text-left rounded-card ring-1 ring-cream-line bg-cream-elevated p-6 sm:p-8"
      aria-label="Formulario de solicitud de demo"
      noValidate
    >
      <div aria-hidden className="hidden">
        <label>
          Sitio web
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-5 gap-y-4">
        <Field label="Nombre" name="name" required autoComplete="name" />
        <Field label="Empresa" name="company" required autoComplete="organization" />
        <Field label="Email" name="email" type="email" required autoComplete="email" />
        <Field
          label="Cargo"
          name="role"
          autoComplete="organization-title"
          placeholder="Jefe de planta, SCADA, Ingeniería"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="message" className="block text-[12px] font-medium text-cream-ink mb-1.5">
          Mensaje <span className="text-cream-mute2 font-normal">(opcional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          maxLength={4000}
          className="w-full rounded ring-1 ring-cream-line focus:ring-2 focus:ring-[var(--accent-ink)] bg-cream-bg px-3 py-2 text-[14px] text-cream-ink outline-none resize-y leading-relaxed"
          placeholder="¿Qué SCADA usas? ¿Cuántos sensores? ¿Cuándo te vendría bien una demo?"
        />
      </div>

      {status === "error" && error && (
        <div
          role="alert"
          aria-live="polite"
          className="mt-4 px-3 py-2.5 rounded text-[13px] bg-error-bg text-error-ink ring-1 ring-error-ink/15"
        >
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[12px] text-cream-mute2">
          O escríbenos a{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-mono text-cream-ink2 hover:text-cream-ink underline underline-offset-2 decoration-cream-line"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center gap-2 px-5 py-3 sm:py-2.5 min-h-[44px] sm:min-h-0 rounded text-[14px] font-medium bg-accent text-white hover:bg-accent-ink disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Enviando…
            </>
          ) : (
            <>
              Solicitar demo
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                <path
                  d="M2 7h9M7 3l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  autoComplete,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
}) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="block text-[12px] font-medium text-cream-ink mb-1.5">
        {label}
        {required && (
          <span className="ml-1" style={{ color: "var(--accent-ink)" }} aria-hidden>
            *
          </span>
        )}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        maxLength={200}
        className="w-full rounded ring-1 ring-cream-line focus:ring-2 focus:ring-[var(--accent-ink)] bg-cream-bg px-3 py-2 text-[14px] text-cream-ink outline-none"
      />
    </div>
  );
}

function Success() {
  return (
    <div
      className="rounded-card ring-1 ring-cream-line bg-cream-elevated p-8 text-center"
      role="status"
      aria-live="polite"
    >
      <div
        className="size-12 rounded-full mx-auto grid place-items-center"
        style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}
        aria-hidden
      >
        <Check className="size-6" />
      </div>
      <h3 className="mt-5 font-display font-semibold text-cream-ink text-[22px] tracking-tighter2">
        Hemos recibido tu solicitud.
      </h3>
      <p className="mt-3 text-[15px] text-cream-ink2 max-w-md mx-auto leading-relaxed">
        Un técnico te escribirá en menos de 24 horas para coordinar la export del historian y la
        primera replay sobre tu planta.
      </p>
    </div>
  );
}
