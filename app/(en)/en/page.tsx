import type { Metadata } from "next";
import { buildHomeMetadata } from "@/i18n/metadata";
import { Home } from "@/views/Home/Home";

export const metadata: Metadata = buildHomeMetadata("en");

export default function EnglishHomePage() {
  return <Home locale="en" />;
}
