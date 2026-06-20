import Image from "next/image";
import Link from "next/link";
import logoMark from "./imgs/logo-mark.png";
import { CONTACT_EMAIL } from "../lib/site";

const PLATFORM_LINKS = [
  { href: "#platform", label: "Plataforma" },
  { href: "#detection", label: "Detección" },
  { href: "#context", label: "Contexto" },
  { href: "#deployment", label: "Despliegue" },
  { href: "#onboarding", label: "Primeros pasos" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-cream-line bg-cream-inset">
      <div className="container-x pt-14 pb-8 md:pt-20 md:pb-10">
        <div className="grid gap-12 md:gap-16 md:grid-cols-12">
          <div className="md:col-span-5 flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <Image
                src={logoMark}
                alt=""
                aria-hidden
                width={28}
                height={28}
                className="rounded-sm"
              />
              <span className="font-display font-semibold text-[18px] tracking-tighter2 text-cream-ink">
                AtlaXia
              </span>
            </Link>
            <p className="text-[14px] leading-[22px] text-cream-mute2 max-w-[32ch]">
              Detección de anomalías para ICS/SCADA en infraestructura hidráulica.
            </p>
          </div>

          <nav
            aria-label="Plataforma"
            className="md:col-span-4 flex flex-col gap-3.5"
          >
            <div className="text-[11px] font-mono uppercase tracking-tracked text-cream-mute">
              Plataforma
            </div>
            <ul className="flex flex-col gap-2.5">
              {PLATFORM_LINKS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-[14px] text-cream-ink2 hover:text-cream-ink transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-label="Contacto"
            className="md:col-span-3 flex flex-col gap-3.5"
          >
            <div className="text-[11px] font-mono uppercase tracking-tracked text-cream-mute">
              Contacto
            </div>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-[14px] text-cream-ink2 hover:text-cream-ink transition-colors break-all"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href="#onboarding"
                  className="text-[14px] text-cream-ink2 hover:text-cream-ink transition-colors"
                >
                  Solicitar demo
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-14 md:mt-20 pt-6 border-t border-cream-line2 flex flex-col-reverse md:flex-row md:items-center justify-between gap-4">
          <div className="text-[11px] font-mono uppercase tracking-tracked text-cream-mute tabular">
            © <span className="tabular-nums">{year}</span> AtlaXia
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-mono uppercase tracking-tracked text-cream-mute2">
            <span>UX ISA-101</span>
            <span>WebSocket 1 Hz</span>
            <span>On-prem airgap</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
