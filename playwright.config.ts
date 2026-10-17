import { defineConfig, devices } from "@playwright/test"

/**
 * E2E smoke — requires a running `pnpm dev` (Turborepo starts web :3000 and
 * api :4000); Next 16 detaches `next-server` from its wrapper, which breaks
 * Playwright webServer teardown, so the dev stack is started manually.
 * Run it locally before merging a PR; CI runs the unit suite only at this
 * stage (spec 00).
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://localhost:3000", trace: "retain-on-retry" },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 13"] },
    },
  ],
})
