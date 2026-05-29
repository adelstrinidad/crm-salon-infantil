// Generate a scrypt hash for the admin password.
// Usage: npm run hash-password -- '<password>'
// Then paste the output into ADMIN_PASSWORD_HASH in .env
import { hashPassword } from "../lib/auth/password";

async function main() {
  const password = process.argv[2];
  if (!password) {
    console.error("Usage: npm run hash-password -- '<password>'");
    process.exit(1);
  }
  const hash = await hashPassword(password);
  console.log(hash);
}

main();
