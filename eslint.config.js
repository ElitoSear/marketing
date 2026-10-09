import eslintComments from "@eslint-community/eslint-plugin-eslint-comments";
import elitosearRules from "@elitosear/eslint-rules";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  { ignores: ["dist/**", "templates/**", "node_modules/**", "eslint.config.js"] },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { projectService: true },
      globals: { ...globals.node, ...globals.browser },
    },
    plugins: {
      "eslint-comments": eslintComments,
      "@typescript-eslint": tseslint.plugin,
      "custom-rules": elitosearRules,
    },
    rules: {
      "id-length": ["error", { min: 2, properties: "always", exceptions: ["_", "x", "y"] }],
      "eslint-comments/require-description": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "custom-rules/no-index-files": "error",
      "custom-rules/no-export-reexport": "error",
      "custom-rules/no-zod-any": "error",
      "custom-rules/no-iife": "error",
      "custom-rules/no-excessive-nested-ternary": "error",
      "custom-rules/no-abbreviations-in-arrow-functions": "error",
      "custom-rules/rename-unused-underscore": "error",
    },
  },
];
