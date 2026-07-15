import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: true,
    // Integration tests share one Postgres and reset between files, so run files serially.
    fileParallelism: false,
    globalSetup: ["./tests/global-setup.ts"],
    setupFiles: ["./tests/setup.ts"],
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    // Legacy HR unit tests (sinon/chai, tied to the retired HR auth) are quarantined until
    // rewritten under the real-DB strategy in FND-05/07.
    exclude: ["node_modules/**", "dist/**", "src/__tests__/**"],
    testTimeout: 20000,
    hookTimeout: 60000,
  },
});
