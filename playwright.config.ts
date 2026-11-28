import { defineConfig, devices } from "@playwright/test";

import { demoGuideIds, demoGuidePreferenceKey } from "./app/lib/demo-guide-preference";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3099";

export default defineConfig({
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: true,
  workers: 1,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  retries: process.env.CI ? 2 : 0,
  testDir: "./e2e",
  use: {
    baseURL,
    locale: "es-ES",
    // Existing scenarios are tested after onboarding. The guide suite starts with empty storage.
    storageState: {
      cookies: [],
      origins: [{
        origin: new URL(baseURL).origin,
        localStorage: demoGuideIds.map((demo) => ({ name: demoGuidePreferenceKey(demo), value: "1" })),
      }],
    },
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  webServer: {
    command: "pnpm exec next start --hostname 127.0.0.1 --port 3099",
    reuseExistingServer: false,
    stderr: "pipe",
    stdout: "pipe",
    timeout: 120_000,
    url: "http://127.0.0.1:3099/es",
  },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 5"], viewport: { width: 375, height: 812 } },
    },
    {
      name: "firefox-desktop",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "firefox-mobile",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 375, height: 812 },
      },
    },
  ],
});
