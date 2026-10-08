import type { Viewport } from "next";
import type { ReactNode } from "react";
import { RootDocument } from "@/shell/RootDocument";
import "@/styles/index.css";

export const viewport: Viewport = { themeColor: "#f2f4f8" };

export default function EnglishRootLayout({ children }: { children: ReactNode }) {
  return <RootDocument locale="en">{children}</RootDocument>;
}
