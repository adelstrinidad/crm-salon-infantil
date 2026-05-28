import Link from "next/link";
import { logoutAction } from "@/lib/auth/actions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col">
        <div className="px-6 py-4 text-lg font-bold border-b border-gray-700">
          Salón Infantil
        </div>
        <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">

          <NavSection label="Operaciones">
            <NavLink href="/calendario">Calendario</NavLink>
            <NavLink href="/eventos">Eventos</NavLink>
          </NavSection>

          <NavSection label="Clientes">
            <NavLink href="/clientes">Clientes</NavLink>
          </NavSection>

          <NavSection label="Catálogo">
            <NavLink href="/servicios">Servicios</NavLink>
            <NavLink href="/tipos-evento">Tipos de evento</NavLink>
            <NavLink href="/prestadores">Prestadores</NavLink>
            <NavLink href="/proveedores">Proveedores</NavLink>
          </NavSection>

          <NavSection label="Finanzas">
            <NavLink href="/finanzas">Cuentas</NavLink>
            <NavLink href="/finanzas/movimientos">Movimientos</NavLink>
            <NavLink href="/pagos/prestadores">Pago prestadores</NavLink>
            <NavLink href="/pagos/proveedores">Pago proveedores</NavLink>
            <NavLink href="/reportes">Reportes</NavLink>
          </NavSection>

        </nav>
        <div className="p-4 border-t border-gray-700">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full px-4 py-2 rounded-md text-sm text-gray-400 hover:bg-gray-700 hover:text-white transition-colors text-left"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  );
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </p>
      {children}
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors block"
    >
      {children}
    </Link>
  );
}
