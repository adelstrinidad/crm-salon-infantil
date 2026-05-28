import { AccountForm } from "@/components/finanzas/AccountForm";
import { createAccountAction } from "../../actions";

export default function NuevaCuentaPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nueva cuenta</h1>
      <AccountForm onSubmit={createAccountAction} submitLabel="Crear cuenta" />
    </div>
  );
}
