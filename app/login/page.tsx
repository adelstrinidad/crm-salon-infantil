import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-6 bg-white rounded-xl shadow-md p-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Salón Infantil</h1>
          <p className="text-sm text-muted-foreground">Ingresá tus credenciales para continuar</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
