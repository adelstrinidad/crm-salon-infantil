import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";
import { getSoleUser } from "@/lib/auth/userService";
import { requireSession } from "@/lib/auth/session";
import { CambiarCodigoForm } from "./CambiarCodigoForm";

export default async function CuentaPage() {
  await requireSession();
  const user = await getSoleUser();

  return (
    <div className="space-y-6">
      <PageHeader title="Mi cuenta" />
      <Card className="p-6 space-y-2">
        <SectionTitle>Datos de acceso</SectionTitle>
        <p className="text-sm text-muted-foreground">{user?.email ?? "Sin cuenta configurada"}</p>
        <p className="text-sm text-muted-foreground">
          La contraseña se cambia desde{" "}
          <Link href="/recuperar" className="underline hover:text-foreground">
            recuperar contraseña
          </Link>
          , en la pantalla de login — un solo camino para elegir una nueva.
        </p>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="space-y-1">
          <SectionTitle>Código de encargado</SectionTitle>
          <p className="text-sm text-muted-foreground">
            Autoriza anulaciones de consumos, anulaciones de pagos y la recuperación de contraseña.
            Para cambiarlo hay que saber el actual; si lo olvidaste, pedí un enlace al email de la
            cuenta.
          </p>
        </div>
        <CambiarCodigoForm />
      </Card>
    </div>
  );
}
