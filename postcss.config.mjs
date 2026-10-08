// Own PostCSS config so neither Next nor Vite (Storybook, Vitest) walks up
// and picks the legacy Tailwind 3 config at the repository root.
const config = {
  plugins: {
    autoprefixer: {},
  },
};

export default config;
