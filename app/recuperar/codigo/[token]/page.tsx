import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { checkResetToken, RESET_PURPOSE } from "@/lib/auth/resetTokens";
import { buttonVariants } from "@/components/ui/button";
import { NuevoCodigoForm } from "./NuevoCodigoForm";

type Props = { params: Promise<{ token: string }> };

// Only checked here (not spent) so a link preview or a reload does not burn it.
// The purpose check means a password-reset link cannot land on this screen.
export default async function RecuperarCodigoPage({ params }: Props) {
  const { token } = await params;
  const result = await checkResetToken(token, RESET_PURPOSE.managerCode);

  if (!result.ok) {
    return (
      <AuthShell title="Enlace vencido">
        <p className="text-sm text-muted-foreground">{result.error}</p>
        <Link href="/cuenta" className={buttonVariants({ size: "lg", className: "w-full" })}>
          Ir a Mi cuenta
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Nuevo código de encargado" subtitle="Elegí un código para el salón">
      <NuevoCodigoForm token={token} />
    </AuthShell>
  );
}
