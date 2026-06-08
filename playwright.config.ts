import { defineConfig, devices } from "@playwright/test";
import { StorageStatePaths } from "./e2e/enums/util/storage";

// E2E config. Reuses a running dev server on :3000 if present, otherwise starts
// one. Tests run serially (workers:1) against the stateful dev.db — specs use
// Faker + unique time slots to stay isolated across runs.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    // Logs in once and saves the admin session.
    { name: "setup", testMatch: "tests/auth.setup.ts" },

    // POM suite — authenticated via stored session.
    {
      name: "e2e",
      testMatch: "tests/**/*.spec.ts",
      use: { ...devices["Desktop Chrome"], storageState: StorageStatePaths.ADMIN },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
