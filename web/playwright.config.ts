import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke test config. Runs against the production build (`vite preview`),
 * not the dev server, so it exercises what actually ships. See
 * tests/smoke.spec.ts and docs/README.md.
 *
 * `npm run test:smoke` builds first (see the `pretest:smoke` script) then
 * runs these; `npx playwright test` alone assumes `dist/` is already
 * up to date.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: 30_000,

  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  webServer: {
    command: "npm run preview -- --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },

  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // A touch-capable, phone-sized viewport on the Chromium engine —
      // deliberately not devices["iPhone 13"], which pulls in WebKit and
      // isn't guaranteed to be installed everywhere this suite runs.
      // Good enough to smoke-test the touch control overlay and layout.
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      },
    },
  ],
});
