// eslint.config.mjs
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

import nextPlugin from "@next/eslint-plugin-next";

export default [
  {
    ignores: [
      "node_modules",
      ".next",
      "dist",
      "out",
      "build",
      "coverage",
      "**/*.config.*",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "no-unused-vars": ["warn"],
      "@typescript-eslint/no-explicit-any": ["warn"],
      "react/no-unescaped-entities": "off",
      "react/react-in-jsx-scope": "off",
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
    },
  },
];
