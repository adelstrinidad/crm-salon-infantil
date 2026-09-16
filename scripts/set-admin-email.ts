// Change the admin account's login email.
//
// Needed when the seeded address (admin@salon.local) cannot receive mail, which
// leaves the "reset link by email" route unusable. Requires shell access to the
// server, like the other last-resort scripts.
//
// Usage: npm run set-admin-email -- 'nuevo@dominio.com'
import "dotenv/config";
import { getSoleUser, setUserEmail } from "@/lib/auth/userService";
import { requestResetSchema } from "@/lib/auth/schema";
import { prisma } from "@/lib/prisma";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npm run set-admin-email -- 'nuevo@dominio.com'");
    process.exit(1);
  }

  const parsed = requestResetSchema.safeParse({ email });
  if (!parsed.success) {
    console.error(parsed.error.issues[0].message);
    process.exit(1);
  }

  const user = await getSoleUser();
  if (!user) {
    console.error(
      "No hay ninguna cuenta todavía. Creala con: npm run reset-password -- '<clave>' <email>"
    );
    process.exit(1);
  }

  const updated = await setUserEmail(user.id, parsed.data.email);
  console.log(`Email actualizado: ${user.email} → ${updated.email}`);
  console.log("La contraseña no cambió. ADMIN_EMAIL en .env ya no se usa (solo bootstrap).");
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
