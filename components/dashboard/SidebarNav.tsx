"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };
type NavGroup = { label: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    label: "Operaciones",
    items: [
      { href: "/calendario", label: "Calendario" },
      { href: "/eventos", label: "Eventos" },
    ],
  },
  {
    label: "Clientes",
    items: [{ href: "/clientes", label: "Clientes" }],
  },
  {
    label: "Catálogo",
    items: [
      { href: "/servicios", label: "Servicios" },
      { href: "/tipos-evento", label: "Tipos de evento" },
      { href: "/prestadores", label: "Prestadores" },
      { href: "/proveedores", label: "Proveedores" },
    ],
  },
  {
    label: "Finanzas",
    items: [
      { href: "/finanzas", label: "Cuentas" },
      { href: "/finanzas/movimientos", label: "Movimientos" },
      { href: "/pagos/prestadores", label: "Pago prestadores" },
      { href: "/pagos/proveedores", label: "Pago proveedores" },
      { href: "/reportes", label: "Reportes" },
    ],
  },
];

/**
 * Most specific match wins so `/finanzas/movimientos` doesn't also light up
 * `/finanzas`. Exact-match check first, then longest-prefix fallback for
 * nested detail routes like `/eventos/123`.
 */
function isActive(pathname: string, href: string, allHrefs: string[]): boolean {
  if (pathname === href) return true;
  if (!pathname.startsWith(href + "/")) return false;
  // Prefix match: only "win" if no other href is a longer prefix of pathname.
  const longer = allHrefs.find(
    (h) => h !== href && h.startsWith(href + "/") && pathname.startsWith(h),
  );
  return !longer;
}

export function SidebarNav() {
  const pathname = usePathname();
  const allHrefs = groups.flatMap((g) => g.items.map((i) => i.href));

  return (
    <nav className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto">
      {groups.map((group) => (
        <div key={group.label} className="mb-4">
          <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/50">
            {group.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href, allHrefs);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "relative px-3 py-2 rounded-md text-sm font-medium bg-sidebar-accent text-sidebar-accent-foreground block before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:rounded-r-full before:bg-sidebar-primary"
                      : "px-3 py-2 rounded-md text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground transition-colors block"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
