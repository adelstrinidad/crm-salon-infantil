This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Configuration (.env)

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | yes | SQLite file URL (`file:./dev.db`) |
| `AUTH_SECRET` | yes | Signing key for session JWTs |
| `ADMIN_EMAIL` | bootstrap | Email of the admin account, used only to create the first `User` row |
| `ADMIN_PASSWORD_HASH` | bootstrap | scrypt hash (`salt:hash`) for that first row — generate with `npm run hash-password -- 'clave'` |
| `MANAGER_CODE_HASH` | bootstrap | scrypt hash of the manager approval code (voids, payment reversals, password recovery); after the first run it lives in the DB and is rotated at /cuenta |
| `RESEND_API_KEY` | no | Resend API key for outgoing mail. Unset → reset links are printed to the server console instead of emailed |
| `MAIL_FROM` | with Resend | Sender, e.g. `Salón Infantil <no-reply@tu-dominio.com>` (domain verified in Resend) |
| `APP_URL` | in production | Public origin used to build links inside emails; falls back to the request host |

After the first run the login credential lives in the database, not in `.env`: changing `ADMIN_PASSWORD_HASH` afterwards has no effect.

## Recovering a lost password

1. **Manager code** — `/recuperar`, tab "Código de encargado": enter the manager code and pick a new password. No email needed.
2. **Emailed link** — `/recuperar`, tab "Enlace por email": a single-use link valid for 1 hour. Without `RESEND_API_KEY`/`MAIL_FROM` the link is written to the server log instead of sent.
3. **Last resort** — with shell access to the server:

   ```bash
   npm run reset-password -- 'nueva-contrasena'
   ```

   Writes the new hash straight to the database and kills any outstanding reset link. Pass an email as a second argument to create the account when the database has none yet.

There is deliberately no "change password" form behind the login: a new password is always chosen through `/recuperar`, so there is one way in and one way to set it.

### Changing the manager code

The manager code gates voids, payment reversals, and the manager-code password reset. Like the password, its hash lives in the database (`AppSetting`, key `managerCodeHash`); `MANAGER_CODE_HASH` in `.env` is only the bootstrap value, copied in on first use.

Rotate it at **/cuenta → Código de encargado**. It asks for the **current** code: a logged-in session alone must not be able to replace the gate that authorizes voids and reversals, or it would stop being a factor independent of the login.

If the code itself is lost, the escape hatch needs shell access to the server:

```bash
npm run set-manager-code -- 'nuevo-codigo'
```

Editing `MANAGER_CODE_HASH` in `.env` has no effect once the value has been bootstrapped into the database.

### Changing the account's email

The seeded address (`admin@salon.local`) cannot receive mail, so the "reset link by email" route is unusable until the account points at a real inbox:

```bash
npm run set-admin-email -- 'tu-email@dominio.com'
```

Changes `User.email` only — the password stays, and any outstanding reset link is dropped. `ADMIN_EMAIL` in `.env` is not consulted after the first run.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
