import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { dictionaries } from "@/content";
import { DirectionFrame, WaterCaseFrame, caseSteps } from "./WaterCaseFrame";

/*
  Storyboard v3 for the end of Vision: the water case ("Dónde empezamos") in
  five static frames, then the direction ("Hacia dónde vamos"). To approve
  before any animation: the scroll scene will move between these frames.
*/

const meta = {
  title: "Sections/Vision water case",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Storyboard({ locale }: { locale: "es" | "en" }) {
  const vision = dictionaries[locale].vision;
  return (
    <div
      style={{
        display: "grid",
        gap: "2.5rem",
        padding: "2.5rem var(--gutter)",
        maxWidth: "88rem",
        margin: "0 auto",
      }}
    >
      {caseSteps.map((step) => (
        <WaterCaseFrame key={step} content={vision.waterCase} step={step} />
      ))}
      <DirectionFrame content={vision} />
    </div>
  );
}

export const StoryboardEs: Story = {
  name: "Storyboard (ES)",
  render: () => <Storyboard locale="es" />,
};

export const StoryboardEn: Story = {
  name: "Storyboard (EN)",
  render: () => <Storyboard locale="en" />,
};
