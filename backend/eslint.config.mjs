import { config as baseConfig } from "@workspace/eslint-config/base";

/** @type {import("eslint").Linter.Config} */
export default [
  ...baseConfig,
  { ignores: ["dist/**", "drizzle/**", "swagger/**", "src/__tests__/**"] },
];
