import type { Metadata } from "next";
import { buildHomeMetadata } from "@/i18n/metadata";
import { Home } from "@/views/Home/Home";

export const metadata: Metadata = buildHomeMetadata("es");

export default function SpanishHomePage() {
  return <Home locale="es" />;
}
