import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import storybook from "eslint-plugin-storybook";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  ...storybook.configs["flat/recommended"],
  prettier,
  globalIgnores([".next/**", "out/**", "storybook-static/**", "next-env.d.ts", "prompts/**"]),
]);
