import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";

// Runs ONCE before the integration test project. Creates a fresh SQLite file
// and applies all Prisma migrations to it, so the service-layer tests run
// against a real, fully-migrated schema — never the dev database.
//
// The DB url is the same one the integration project injects as DATABASE_URL
// (.env.test → file:./prisma/test.db). We resolve it to an absolute path so
// the migrate CLI and the Prisma client agree regardless of cwd.

const TEST_DB = path.resolve(process.cwd(), "prisma/test.db");
const DB_URL = `file:${TEST_DB}`;

function removeDbFiles() {
  // SQLite leaves journal/WAL sidecar files; clear them all for a clean slate.
  for (const suffix of ["", "-journal", "-wal", "-shm"]) {
    const f = `${TEST_DB}${suffix}`;
    if (existsSync(f)) rmSync(f);
  }
}

export default function setup() {
  removeDbFiles();

  // `migrate deploy` applies the committed migrations exactly as production
  // would — this also smoke-tests that the migration history is valid.
  // Capture output and only surface it if migration fails, to keep the test
  // run output pristine.
  try {
    execSync("npx prisma migrate deploy", {
      stdio: "pipe",
      env: { ...process.env, DATABASE_URL: DB_URL },
    });
  } catch (err) {
    const e = err as { stdout?: Buffer; stderr?: Buffer };
    process.stderr.write(e.stdout?.toString() ?? "");
    process.stderr.write(e.stderr?.toString() ?? "");
    throw new Error("prisma migrate deploy failed for the integration test DB");
  }

  // Teardown: delete the throwaway DB after the whole run.
  return () => removeDbFiles();
}
