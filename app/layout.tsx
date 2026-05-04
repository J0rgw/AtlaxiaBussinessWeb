import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono, Nunito } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AtlaXia — Infraestructura para la ambición desmedida",
  description:
    "Monitoreo ICS/SCADA AI-native para infraestructura hidráulica. Las redes neuronales de grafos sustituyen los umbrales estáticos por tokens aprendidos del funcionamiento normal — detección de anomalías en tiempo real y predicción antes del fallo.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "AtlaXia — Infraestructura para la ambición desmedida",
    description:
      "Detección de anomalías con GNN para infraestructura hidráulica ICS/SCADA. Una plataforma unificada que sustituye el stack SCADA + Fortinet OT.",
    type: "website",
    locale: "es_ES",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${plexSans.variable} ${jetbrainsMono.variable} ${nunito.variable}`}
    >
      <body className="bg-cream-bg text-cream-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-3 focus:py-2 focus:rounded focus:bg-cream-ink focus:text-cream-bg focus:text-[14px] focus:font-medium"
        >
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
