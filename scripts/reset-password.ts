// Last-resort password recovery: writes a new admin password straight to the
// database. Use it when both the password AND the manager code are lost and no
// reset email can be received — it needs shell access to the server, which is
// the real trust anchor behind every other recovery route.
//
// Usage: npm run reset-password -- 'nueva-contraseña' [email]
//   The email argument is only needed when no account exists yet (it falls back
//   to ADMIN_EMAIL).
import "dotenv/config";
import { resetAdminPassword } from "@/lib/auth/userService";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/schema";
import { prisma } from "@/lib/prisma";

async function main() {
  const password = process.argv[2];
  const email = process.argv[3];
  if (!password) {
    console.error("Usage: npm run reset-password -- '<nueva-contraseña>' [email]");
    process.exit(1);
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    console.error(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
    process.exit(1);
  }

  const result = await resetAdminPassword(password, email);
  console.log(
    result.created
      ? `Usuario creado: ${result.email}`
      : `Contraseña actualizada para ${result.email}`
  );
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
