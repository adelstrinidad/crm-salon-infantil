import { AccountForm } from "@/components/finanzas/AccountForm";
import { createAccountAction } from "../../actions";
import { PageHeader } from "@/components/ui/page-header";

export default function NuevaCuentaPage() {
  return (
    <div>
      <PageHeader title="Nueva cuenta" />
      <AccountForm onSubmit={createAccountAction} submitLabel="Crear cuenta" />
    </div>
  );
}
