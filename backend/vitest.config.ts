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
    coverage: {
      provider: "v8",
      // Gate only the code we're actively building under test discipline (recruitment). The rest
      // of the backend is intentionally ungated for now — no forced backfill. Widen the include
      // glob as other areas grow real suites.
      include: [
        "src/services/recruitment/**",
        "src/services/secure-links.service.ts",
        "src/services/text-extraction.service.ts",
        "src/controllers/recruitment.ts",
        "src/controllers/recruitment-pipeline.ts",
        "src/controllers/offers.ts",
        "src/db/schema/recruitment/**",
      ],
      reporter: ["text-summary"],
      thresholds: {
        // Per-glob 90% floor for recruitment code; CI fails the run if any drops below.
        "src/services/recruitment/**": {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90,
        },
      },
    },
  },
});
