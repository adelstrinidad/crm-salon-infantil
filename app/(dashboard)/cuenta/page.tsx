import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";
import { getSoleUser } from "@/lib/auth/userService";
import { requireSession } from "@/lib/auth/session";
import { CambiarPasswordForm } from "./CambiarPasswordForm";

export default async function CuentaPage() {
  await requireSession();
  const user = await getSoleUser();

  return (
    <div className="space-y-6">
      <PageHeader title="Mi cuenta" />
      <Card className="p-6 space-y-4">
        <div className="space-y-1">
          <SectionTitle>Datos de acceso</SectionTitle>
          <p className="text-sm text-muted-foreground">{user?.email ?? "Sin cuenta configurada"}</p>
        </div>
        <CambiarPasswordForm />
      </Card>
    </div>
  );
}
