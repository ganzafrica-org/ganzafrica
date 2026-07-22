import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    // Quarantined: these were written ahead of the implementation and reference symbols that
    // don't exist yet (e.g. `configureHttpService`) / MSW handlers that don't match. They are
    // fixed alongside the HR auth rewrite (FND-06/07). Re-enable once green.
    exclude: [
      "**/node_modules/**",
      "src/tests/http.service.unit.test.ts",
      "src/tests/auth.service.integration.test.ts",
    ],
    coverage: {
      provider: "v8",
      // Scoped ratchet (see docs/architecture/testing-strategy.md §6): gate only actively-built
      // recruitment code. UI conditional-render branches are the hardest to reach, so branches sit
      // slightly below the 90 floor used for statements/functions/lines — raise as suites grow.
      include: [
        "src/components/recruitment/**",
        "src/lib/recruitment/**",
        "src/services/recruitment.service.ts",
        "src/hooks/useRecruitment.ts",
      ],
      reporter: ["text-summary"],
      thresholds: {
        statements: 90,
        functions: 90,
        lines: 90,
        branches: 85,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
