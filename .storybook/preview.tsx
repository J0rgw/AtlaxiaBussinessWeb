import type { Preview } from "@storybook/nextjs-vite";
import "../src/styles/index.css";

const preview: Preview = {
  parameters: {
    layout: "padded",
    controls: {
      matchers: { color: /(background|color)$/i },
    },
    backgrounds: {
      options: {
        paper: { name: "Paper", value: "#f2f4f8" },
        inset: { name: "Inset", value: "#eaedf2" },
        night: { name: "Night", value: "#0d1117" },
      },
    },
    a11y: {
      // Fail the a11y panel on violations instead of only listing them.
      test: "error",
    },
  },
  initialGlobals: {
    backgrounds: { value: "paper" },
    motion: "full",
  },
  globalTypes: {
    motion: {
      description: "Motion preference (mirrors prefers-reduced-motion)",
      toolbar: {
        title: "Motion",
        icon: "lightning",
        items: [
          { value: "full", title: "Full motion" },
          { value: "reduce", title: "Reduced motion" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const root = document.documentElement;
      if (context.globals.motion === "reduce") root.dataset.motion = "reduce";
      else delete root.dataset.motion;
      return <Story />;
    },
  ],
};

export default preview;
