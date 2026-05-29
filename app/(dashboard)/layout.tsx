import { logoutAction } from "@/lib/auth/actions";
import { SidebarNav } from "@/components/dashboard/SidebarNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-60 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
        <div className="px-6 py-5 border-b border-sidebar-border">
          <p className="font-heading text-xl tracking-tight text-sidebar-foreground">
            Salón Infantil
          </p>
          <p className="text-xs text-sidebar-foreground/60 mt-1">
            Panel de gestión
          </p>
        </div>
        <SidebarNav />
        <div className="p-3 border-t border-sidebar-border">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full px-3 py-2 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-left"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-background p-8">{children}</main>
    </div>
  );
}
