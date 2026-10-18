import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Container } from "@/components/primitives/Container";
import { CueSnapshot } from "@/components/storytelling/ChoreographedScene";
import { dictionaries } from "@/content";
import { Capabilities } from "./Capabilities";
import { CoherenceChart } from "./CoherenceChart";
import { cues, stepOrder } from "./cues";

/**
 * "Qué hacemos". The full section plays on scroll (scroll the canvas); the
 * chart stories freeze it in the middle of each step, as the in-house engine
 * would paint it there.
 */
const meta = {
  title: "Sections/Capabilities",
  parameters: { layout: "fullscreen" },
  argTypes: { locale: { control: "inline-radio", options: ["es", "en"] } },
  args: { locale: "es" as "es" | "en" },
} satisfies Meta;

export default meta;
type Story = StoryObj<{ locale: "es" | "en" }>;

export const Section: Story = {
  render: ({ locale }) => <Capabilities content={dictionaries[locale].capabilities} />,
};

export const SectionNarrow: Story = {
  name: "Section (narrow screen)",
  globals: { viewport: { value: "mobile2", isRotated: false } },
  render: ({ locale }) => <Capabilities content={dictionaries[locale].capabilities} />,
};

/** Static version: every step open and the finished chart. */
export const ReducedMotion: Story = {
  globals: { motion: "reduce" },
  render: ({ locale }) => <Capabilities content={dictionaries[locale].capabilities} />,
};

/** The chart at the middle of each step. */
export const ChartSteps: Story = {
  render: ({ locale }) => {
    const { capabilities } = dictionaries[locale];
    return (
      <Container style={{ display: "grid", gap: "3rem", paddingBlock: "3rem", maxWidth: "52rem" }}>
        {stepOrder.map((id, i) => (
          <div key={id} style={{ display: "grid", gap: "0.75rem" }}>
            <p className="visually-hidden">{capabilities.steps[id].title}</p>
            <p aria-hidden="true" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
              {String(i + 1).padStart(2, "0")} {capabilities.steps[id].title}
            </p>
            <CueSnapshot cues={cues} progress={(i + 0.5) / stepOrder.length}>
              <CoherenceChart content={capabilities.chart} />
            </CueSnapshot>
          </div>
        ))}
      </Container>
    );
  },
};

/** The phone drawing of the chart, finished. */
export const ChartNarrow: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
  render: ({ locale }) => (
    <Container style={{ paddingBlock: "2rem" }}>
      <CueSnapshot cues={cues} progress={1}>
        <CoherenceChart content={dictionaries[locale].capabilities.chart} />
      </CueSnapshot>
    </Container>
  ),
};
