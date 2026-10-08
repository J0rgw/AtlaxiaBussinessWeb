import { Clock } from "lucide-react";
import { StableLabel } from "@/components/primitives/StableLabel";
import { Tag } from "@/components/primitives/Tag";

type PendingTagProps = {
  label: string;
  /** The label in the other languages, so the tag keeps its width when switching. */
  alternatives?: readonly string[];
};

/**
 * Placeholder marker for content that still needs real data.
 * Same as the product "Pendiente" triage state: neutral slate + clock icon.
 */
export function PendingTag({ label, alternatives }: PendingTagProps) {
  return (
    <Tag tone="neutral" icon={<Clock />}>
      <StableLabel alternatives={alternatives}>{label}</StableLabel>
    </Tag>
  );
}
