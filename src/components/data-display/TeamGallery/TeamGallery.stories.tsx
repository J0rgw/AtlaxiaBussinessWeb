import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { dictionaries } from "@/content";
import { TeamGallery, type TeamMember } from "./TeamGallery";

const { members, fields } = dictionaries.es.team;
const initials = { ceo: "JN", cto: "DP", cmo: "JA" } as const;

/* A sample portrait for the stories only: a soft figure drawn as SVG */
const sample = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9dde3"/><stop offset="1" stop-color="#8a95a5"/></linearGradient></defs><rect width="400" height="500" fill="url(#g)"/><circle cx="200" cy="190" r="80" fill="#5d6876"/><rect x="80" y="300" width="240" height="240" rx="120" fill="#2c3440"/></svg>',
)}`;

const people = (withPhoto: boolean): TeamMember[] =>
  (["ceo", "cto", "cmo"] as const).map((id) => ({
    id,
    name: members[id].name,
    role: members[id].role,
    initials: initials[id],
    portrait:
      withPhoto && id === "cto"
        ? { src: sample, srcSet: `${sample} 1x`, width: 400, height: 500 }
        : undefined,
    facts: [
      { label: fields.profile, value: members[id].profile },
      { label: fields.atlaxia, value: members[id].atlaxia },
      { label: fields.technical, value: members[id].skills.technical },
      { label: fields.social, value: members[id].skills.social },
    ],
    linkedin: withPhoto ? "https://www.linkedin.com/" : undefined,
    linkedinText: fields.linkedin.replace("{name}", members[id].name),
  }));

/**
 * The founders side by side. Hover, tab to or click a tile: it opens to its
 * sheet (profile, role and skills as tags) while the others narrow. Escape
 * closes. Below 60rem they stack.
 */
const meta = {
  title: "Data display/TeamGallery",
  component: TeamGallery,
  parameters: { layout: "padded" },
  args: { members: people(false) },
} satisfies Meta<typeof TeamGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As on the home: the first open, no portraits but David's yet. */
export const FirstOpen: Story = { args: { members: people(true) } };

/** All three closed and equal. */
export const AllClosed: Story = { args: { defaultOpen: null } };

/** The longest name open (four words), every frame with its initials. */
export const LongNameOpen: Story = { args: { defaultOpen: "ceo" } };

/** With a portrait and a profile link on the open tile. */
export const WithPhotoAndLink: Story = { args: { members: people(true), defaultOpen: "cto" } };

/** Phones: stacked, every sheet in view. */
export const NarrowScreen: Story = {
  args: { members: people(true) },
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

/** No transitions: the tiles change at once. */
export const ReducedMotion: Story = { globals: { motion: "reduce" } };
