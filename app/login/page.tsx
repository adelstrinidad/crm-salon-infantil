import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <AuthShell title="Salón Infantil" subtitle="Ingresá tus credenciales para continuar">
      <LoginForm />
      <p className="text-center text-sm">
        <Link href="/recuperar" className="text-muted-foreground underline hover:text-foreground">
          ¿Olvidaste tu contraseña?
        </Link>
      </p>
    </AuthShell>
  );
}
