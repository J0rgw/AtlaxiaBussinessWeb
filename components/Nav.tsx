"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import logoMark from "./imgs/logosinfondo.png";

const ITEMS = [
  { href: "#platform", label: "Plataforma" },
  { href: "#detection", label: "Detección" },
  { href: "#context", label: "Contexto" },
  { href: "#deployment", label: "Despliegue" },
  { href: "#onboarding", label: "Primeros pasos" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) {
      requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    window.addEventListener("keydown", onKey);

    const focusTimer = requestAnimationFrame(() =>
      firstLinkRef.current?.focus({ preventScroll: true })
    );

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(focusTimer);
    };
  }, [open, close]);

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    setOpen(false);
    setTimeout(() => {
      const target = document.querySelector(href);
      if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", href);
      }
    }, 60);
  };

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur bg-cream-bg/85 border-b border-cream-line">
        <div className="container-x h-[60px] flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src={logoMark}
              alt=""
              aria-hidden
              width={28}
              height={28}
              className="rounded-sm"
              priority
            />
            <span className="font-display font-semibold text-[18px] tracking-tighter2 text-cream-ink">
              AtlaXia
            </span>
          </Link>

          <nav
            aria-label="Secciones"
            className="hidden md:flex items-center gap-7 text-[14px] text-cream-mute"
          >
            {ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="py-2 -my-2 hover:text-cream-ink transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#contact"
              className="hidden md:inline-flex text-[14px] text-cream-mute hover:text-cream-ink px-3 py-1.5 transition-colors"
            >
              Contacto
            </a>
            <a
              href="#contact"
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded text-[13px] font-medium bg-accent text-white hover:bg-accent-ink transition-colors"
            >
              Solicitar demo
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                <path
                  d="M2 6h7M6 3l3 3-3 3"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>

            <button
              ref={triggerRef}
              type="button"
              onClick={() => (open ? close(false) : setOpen(true))}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="md:hidden inline-flex items-center justify-center h-11 px-1 -mr-1 text-cream-ink"
            >
              <span className="sr-only">
                {open ? "Cerrar menú" : "Abrir menú"}
              </span>
              <span
                aria-hidden
                className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded border font-mono text-[11px] tracking-tracked uppercase transition-colors ${
                  open
                    ? "border-cream-ink bg-cream-ink text-cream-bg"
                    : "border-cream-line2 text-cream-ink"
                }`}
              >
                {open ? "Cerrar" : "Menú"}
                <svg
                  width="9"
                  height="9"
                  viewBox="0 0 9 9"
                  aria-hidden
                  className={`transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    open ? "rotate-180" : ""
                  }`}
                >
                  <path
                    d="M1.5 3.25 4.5 6.25 7.5 3.25"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!open}
        className={`md:hidden fixed inset-x-0 top-[60px] bottom-0 z-30 bg-cream-bg/95 backdrop-blur-xl border-b border-cream-line transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="container-x h-full overflow-y-auto py-8 flex flex-col">
          <h2 id={titleId} className="sr-only">
            Navegación
          </h2>
          <p className="eyebrow mb-7">Secciones</p>
          <ul className="flex flex-col">
            {ITEMS.map((item, i) => (
              <li key={item.href}>
                <a
                  ref={i === 0 ? firstLinkRef : undefined}
                  href={item.href}
                  onClick={(e) => handleAnchorClick(e, item.href)}
                  className="flex items-baseline gap-5 py-3 -mx-1 px-1 rounded-sm"
                >
                  <span className="font-mono text-[12px] tabular tracking-tracked text-cream-mute w-9 shrink-0">
                    {String(i + 1).padStart(2, "0")}/
                  </span>
                  <span className="font-display font-semibold text-cream-ink leading-[1.02] tracking-tightest text-[clamp(30px,8vw,44px)]">
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-10 flex items-center justify-between gap-4 border-t border-cream-line">
            <a
              href="#contact"
              onClick={(e) => handleAnchorClick(e, "#contact")}
              className="text-[14px] text-cream-mute py-3 -my-3"
            >
              Contacto
            </a>
            <a
              href="#contact"
              onClick={(e) => handleAnchorClick(e, "#contact")}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded text-[14px] font-medium bg-accent text-white min-h-[44px]"
            >
              Solicitar demo
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                <path
                  d="M2 6h7M6 3l3 3-3 3"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
