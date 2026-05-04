import Image from "next/image";
import Link from "next/link";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-cream-bg/85 border-b border-cream-line">
      <div className="container-x h-[60px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo-mark.png"
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
        <nav className="hidden md:flex items-center gap-7 text-[14px] text-cream-mute">
          <a href="#platform" className="hover:text-cream-ink transition-colors">Plataforma</a>
          <a href="#detection" className="hover:text-cream-ink transition-colors">Detección</a>
          <a href="#forecasting" className="hover:text-cream-ink transition-colors">Predicción</a>
          <a href="#compare" className="hover:text-cream-ink transition-colors">vs SCADA</a>
          <a href="#onboarding" className="hover:text-cream-ink transition-colors">Primeros pasos</a>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="#contact"
            className="hidden sm:inline-flex text-[14px] text-cream-mute hover:text-cream-ink px-3 py-1.5 transition-colors"
          >
            Contacto
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-cream-ink text-cream-bg hover:bg-cream-ink2 transition-colors"
          >
            Solicitar demo
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <path d="M2 6h7M6 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
