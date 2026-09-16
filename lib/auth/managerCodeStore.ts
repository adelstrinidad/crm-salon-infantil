// Where the manager approval code lives.
//
// The hash moved out of .env into the AppSetting table so the venue can rotate
// it from /cuenta without shell access. MANAGER_CODE_HASH stays as the
// *bootstrap* source: on a database with no row yet, the env value is copied in
// on first use and the DB is authoritative from then on — so a stale .env can
// never resurrect a rotated code.
import { prisma } from "@/lib/prisma";
import { hashPassword } from "./password";
import { RESET_PURPOSE } from "./resetTokens";

export const MANAGER_CODE_KEY = "managerCodeHash";

export async function getManagerCodeHash(): Promise<string | undefined> {
  const row = await prisma.appSetting.findUnique({ where: { key: MANAGER_CODE_KEY } });
  if (row) return row.value;

  const bootstrap = process.env.MANAGER_CODE_HASH;
  if (!bootstrap) return undefined;

  // Materialize the env value once, so the first rotation has something to
  // replace and the env var stops mattering.
  await prisma.appSetting.upsert({
    where: { key: MANAGER_CODE_KEY },
    update: {},
    create: { key: MANAGER_CODE_KEY, value: bootstrap },
  });
  return bootstrap;
}

export async function setManagerCode(code: string): Promise<void> {
  const value = await hashPassword(code);
  await prisma.$transaction([
    prisma.appSetting.upsert({
      where: { key: MANAGER_CODE_KEY },
      update: { value },
      create: { key: MANAGER_CODE_KEY, value },
    }),
    // A link that could still rotate the code must not outlive the rotation.
    prisma.passwordResetToken.deleteMany({ where: { purpose: RESET_PURPOSE.managerCode } }),
  ]);
}
