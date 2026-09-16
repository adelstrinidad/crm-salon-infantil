import { AuthShell } from "@/components/auth/AuthShell";
import { RecuperarForm } from "./RecuperarForm";

export default function RecuperarPage() {
  return (
    <AuthShell title="Recuperar contraseña" subtitle="Elegí cómo querés restablecerla">
      <RecuperarForm />
    </AuthShell>
  );
}
