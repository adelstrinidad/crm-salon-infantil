import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Two test projects:
//   unit        — pure functions & schemas, no database. Fast, the default.
//   integration — service layer against a real migrated SQLite test DB.
// Run all with `npm test`, or one with `npm run test:unit` / `test:integration`.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node", // switch to "jsdom" once we add React component tests
          include: ["lib/**/*.test.ts", "tests/unit/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          environment: "node",
          include: ["tests/integration/**/*.test.ts"],
          globalSetup: ["tests/integration/setup/globalSetup.ts"],
          env: {
            // Point the Prisma client at the throwaway test DB (never dev.db).
            DATABASE_URL: "file:./prisma/test.db",
            // Importing a Server Action pulls in lib/auth/jwt.ts, which refuses
            // to load without a long-enough secret. Test-only value; sessions
            // are never minted here.
            AUTH_SECRET: "test-only-secret-not-used-to-sign-anything-32+",
          },
          // One shared SQLite file → run test files serially so resetDb() in
          // one file can't wipe rows another file is mid-test on.
          fileParallelism: false,
        },
      },
    ],
  },
});
