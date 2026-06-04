import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Marketing surfaces — single source of truth lives in app/globals.css :root
        cream: {
          bg: "var(--bg)",
          inset: "var(--bg-inset)",
          elevated: "var(--bg-elevated)",
          line: "var(--line)",
          line2: "var(--line2)",
          line3: "var(--line3)",
          ink: "var(--ink)",
          ink2: "var(--ink2)",
          mute: "var(--mute)",
          mute2: "var(--mute2)",
          mute3: "var(--mute3)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          ink: "var(--accent-ink)",
          soft: "var(--accent-soft)",
        },
        // Product / data widget surfaces (control-room dark — used inside embedded panels)
        bg: {
          base: "#0d1117",
          surface: "#151b23",
          raised: "#1c2330",
          inset: "#0a0e14",
        },
        border: {
          subtle: "#21262d",
          DEFAULT: "#30363d",
          emphasis: "#484f58",
        },
        text: {
          primary: "#e6edf3",
          secondary: "#8b949e",
          muted: "#484f58",
        },
        status: {
          normal: "#3fb950",
          advisory: "#58a6ff",
          warning: "#d29922",
          critical: "#f85149",
          emergency: "#da3633",
        },
        error: {
          bg: "#fdecec",
          ink: "#8a1f1f",
        },
      },
      fontFamily: {
        display: ["'Open Runde'", "Nunito", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-plex-sans)", "system-ui", "sans-serif"],
        body: ["Nunito", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        xs: ["11px", "16px"],
        sm: ["12px", "18px"],
        base: ["14px", "22px"],
        md: ["16px", "26px"],
        lg: ["20px", "28px"],
        xl: ["28px", "36px"],
        "2xl": ["36px", "44px"],
        "3xl": ["48px", "56px"],
        "display-hero": ["clamp(40px, 5.4vw, 72px)", { lineHeight: "0.98", letterSpacing: "-0.03em" }],
        "display-cta": ["clamp(40px, 6vw, 80px)", { lineHeight: "0.98", letterSpacing: "-0.035em" }],
        eyebrow: ["12px", "16px"],
      },
      letterSpacing: {
        tightest: "-0.035em",
        tighter2: "-0.025em",
        tracked: "0.18em",
      },
      borderRadius: {
        sm: "var(--r-sm)",
        DEFAULT: "var(--r-md)",
        card: "var(--r-lg)",
      },
      boxShadow: {
        float: "var(--shadow-float)",
      },
      maxWidth: {
        container: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
