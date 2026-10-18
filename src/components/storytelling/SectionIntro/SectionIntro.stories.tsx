import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { dictionaries } from "@/content";
import { SectionIntro } from "./SectionIntro";

/**
 * Chapter cover read on scroll: scroll the canvas. The title lights up word by
 * word, then the lead follows one sentence at a time in the same place.
 */
const meta = {
  title: "Storytelling/SectionIntro",
  component: SectionIntro,
  parameters: { layout: "fullscreen" },
  args: {
    titleId: "intro-title",
    index: "02",
    eyebrow: dictionaries.es.capabilities.eyebrow,
    title: dictionaries.es.capabilities.title,
    emphasis: dictionaries.es.capabilities.intro.emphasis,
    beats: dictionaries.es.capabilities.intro.beats,
  },
} satisfies Meta<typeof SectionIntro>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextOnly: Story = {};

/** A longer lead in two sentences, as in "Qué estamos construyendo". */
export const TwoSentences: Story = {
  args: {
    index: "03",
    eyebrow: dictionaries.es.building.eyebrow,
    title: dictionaries.es.building.title,
    emphasis: dictionaries.es.building.intro.emphasis,
    beats: dictionaries.es.building.intro.beats,
    length: 2.5,
  },
};

export const English: Story = {
  args: {
    eyebrow: dictionaries.en.capabilities.eyebrow,
    title: dictionaries.en.capabilities.title,
    emphasis: dictionaries.en.capabilities.intro.emphasis,
    beats: dictionaries.en.capabilities.intro.beats,
  },
};

export const NarrowScreen: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

/** Static version: the whole lead at once. */
export const ReducedMotion: Story = {
  globals: { motion: "reduce" },
};
