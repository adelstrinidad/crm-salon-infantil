// Single source of truth for the credentials the suite logs in with. Never
// hardcode an email, password or manager code in a page object or spec — import
// from here.
//
// Values come from .env.e2e (loaded by playwright.config.ts) or from the shell
// environment, which wins. The fallbacks match what `npx prisma db seed` creates
// on a fresh clone; any install whose account was changed (npm run
// set-admin-email / reset-password) must set them.
//
//   cp .env.e2e.example .env.e2e   # then fill in
export const AdminCredentials = {
  email: process.env.E2E_ADMIN_EMAIL ?? "admin@salon.local",
  password: process.env.E2E_ADMIN_PASSWORD ?? "admin1234",
} as const;

// Manager approval code — gates voids, payment reversals and the manager-code
// password reset. Must match MANAGER_CODE_HASH in the app's .env.
export const MANAGER_CODE = process.env.E2E_MANAGER_CODE ?? "encargado1234";
