import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { dictionaries } from "@/content";
import { EvidenceList, type Evidence } from "./EvidenceList";

function itemsOf(locale: "es" | "en"): Evidence[] {
  return Object.entries(dictionaries[locale].vision.evidence.items).map(([id, item]) => ({
    id,
    figure: item.figure,
    statement: item.statement,
    source: { label: item.source, href: item.href },
  }));
}

const meta = {
  title: "Data display/EvidenceList",
  component: EvidenceList,
  args: {
    title: dictionaries.es.vision.evidence.title,
    titleId: "evidence",
    sourceLabel: dictionaries.es.vision.evidence.sourceLabel,
    items: itemsOf("es"),
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "2rem", maxWidth: "72rem" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EvidenceList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Each fact with its source: "claim plus evidence". */
export const Default: Story = {};

export const English: Story = {
  args: {
    title: dictionaries.en.vision.evidence.title,
    sourceLabel: dictionaries.en.vision.evidence.sourceLabel,
    items: itemsOf("en"),
  },
};

export const Narrow: Story = {
  name: "Narrow screen",
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
