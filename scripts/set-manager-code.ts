// Last-resort rotation of the manager approval code, for when it is lost (the
// UI at /cuenta asks for the current one). Needs shell access to the server.
//
// Usage: npm run set-manager-code -- 'nuevo-codigo'
import "dotenv/config";
import { setManagerCode } from "@/lib/auth/managerCodeStore";
import { MIN_MANAGER_CODE_LENGTH } from "@/lib/auth/schema";
import { prisma } from "@/lib/prisma";

async function main() {
  const code = process.argv[2];
  if (!code) {
    console.error("Usage: npm run set-manager-code -- '<nuevo-codigo>'");
    process.exit(1);
  }
  if (code.length < MIN_MANAGER_CODE_LENGTH) {
    console.error(`El código debe tener al menos ${MIN_MANAGER_CODE_LENGTH} caracteres.`);
    process.exit(1);
  }

  await setManagerCode(code);
  console.log("Código de encargado actualizado. MANAGER_CODE_HASH en .env ya no se usa.");
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
