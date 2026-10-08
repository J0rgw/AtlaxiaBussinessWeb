import { company } from "@/content/shared/company";

/** mailto link with a subject, so each request arrives already labelled. */
export function mailto(subject: string) {
  return `mailto:${company.email}?subject=${encodeURIComponent(`${company.name}: ${subject}`)}`;
}
