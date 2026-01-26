// This configuration only applies to the package manager root.
/** @type {import("eslint").Linter.Config} */
import { config as baseConfig } from "@workspace/eslint-config/base";

export default [
  ...baseConfig,
  {
    ignores: ["apps/**", "packages/**"],
  },
];
