import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Surface } from "@/components/primitives/Surface";
import { SignalChart, type SignalSeries } from "./SignalChart";

// Sample data only: smooth expected curve, observed noise and a drift at the end.
const length = 60;
const expected = Array.from({ length }, (_, i) => 50 + 12 * Math.sin(i / 7));
const observed = expected.map((e, i) => e + Math.sin(i * 1.7) * 2 + (i > 46 ? (i - 46) * 1.1 : 0));
const band = { upper: expected.map((e) => e + 6), lower: expected.map((e) => e - 6) };
const last = length - 1;

const contextSeries: SignalSeries[] = [70, 50, 30].map((base, k) => ({
  id: `s${k}`,
  role: "context",
  values: Array.from({ length }, (_, i) => base + 6 * Math.sin(i / (5 + k * 3) + k)),
}));

const meta = {
  title: "Data display/SignalChart",
  component: SignalChart,
  args: {
    series: [
      { id: "expected", role: "expected", values: expected },
      { id: "observed", role: "observed", values: observed },
    ],
    band,
    deviations: [{ seriesId: "observed", index: last }],
    description: "Señal observada frente a su comportamiento esperado; al final se sale del rango.",
    legend: [
      { key: "observed", label: "Observado" },
      { key: "expected", label: "Esperado" },
      { key: "band", label: "Rango esperado" },
      { key: "deviation", label: "Desviación" },
    ],
  },
  argTypes: { series: { control: false }, band: { control: false } },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SignalChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ObservedVersusExpected: Story = { name: "Observed vs expected" };

export const ContextOnly: Story = {
  name: "Signals without context",
  args: {
    series: contextSeries,
    band: undefined,
    deviations: [],
    legend: undefined,
    description: "Varias señales sin contexto.",
  },
};

export const OnDarkSurface: Story = {
  name: "On a dark surface",
  decorators: [
    (Story) => (
      <Surface tone="dark" padding="lg">
        <Story />
      </Surface>
    ),
  ],
};
