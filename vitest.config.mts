import { defineConfig } from "vitest/config"

/**
 * Unit tests only — no project here requires a running Postgres, Redis or
 * Mailpit. E2E (Playwright) lives at the root `tests/e2e` and is a separate
 * command (`pnpm test:e2e`).
 */
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "shared",
          include: ["packages/shared/tests/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "api",
          include: ["apps/api/tests/**/*.test.ts"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["apps/*/src/**", "packages/*/src/**"],
      exclude: [
        "apps/api/src/server.ts", // bootstrap entry point
        "apps/api/src/db/schema.ts", // declarative drizzle config
        "apps/api/src/db/seed.ts", // manual CLI script
        "apps/api/src/db/migrations/**", // generated SQL + journal
        "**/*.config.ts",
        "**/dist/**",
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
})
