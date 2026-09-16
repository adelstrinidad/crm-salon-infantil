import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { checkResetToken } from "@/lib/auth/resetTokens";
import { buttonVariants } from "@/components/ui/button";
import { NuevaPasswordForm } from "./NuevaPasswordForm";

type Props = { params: Promise<{ token: string }> };

// The token is only *checked* here (not spent) so a link preview or a reload
// does not burn it; the Server Action consumes it on submit.
export default async function RecuperarTokenPage({ params }: Props) {
  const { token } = await params;
  const result = await checkResetToken(token);

  if (!result.ok) {
    return (
      <AuthShell title="Enlace vencido">
        <p className="text-sm text-muted-foreground">{result.error}</p>
        <Link href="/recuperar" className={buttonVariants({ size: "lg", className: "w-full" })}>
          Pedir un enlace nuevo
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Nueva contraseña" subtitle="Elegí una contraseña para tu cuenta">
      <NuevaPasswordForm token={token} />
    </AuthShell>
  );
}
