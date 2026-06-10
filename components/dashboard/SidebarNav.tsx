"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  PartyPopper,
  Users,
  Sparkles,
  Tag,
  UserCog,
  UsersRound,
  Truck,
  Package,
  ShoppingCart,
  Wallet,
  ArrowLeftRight,
  HandCoins,
  Receipt,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon };
type NavGroup = { label: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    label: "Operaciones",
    items: [
      { href: "/calendario", label: "Calendario", icon: Calendar },
      { href: "/eventos", label: "Eventos", icon: PartyPopper },
    ],
  },
  {
    label: "Clientes",
    items: [{ href: "/clientes", label: "Clientes", icon: Users }],
  },
  {
    label: "Catálogo",
    items: [
      { href: "/servicios", label: "Servicios", icon: Sparkles },
      { href: "/tipos-evento", label: "Tipos de evento", icon: Tag },
      { href: "/prestadores", label: "Prestadores", icon: UserCog },
      { href: "/personal", label: "Personal", icon: UsersRound },
      { href: "/proveedores", label: "Proveedores", icon: Truck },
      { href: "/insumos", label: "Insumos", icon: Package },
      { href: "/compras", label: "Compras", icon: ShoppingCart },
    ],
  },
  {
    label: "Finanzas",
    items: [
      { href: "/finanzas", label: "Cuentas", icon: Wallet },
      { href: "/finanzas/movimientos", label: "Movimientos", icon: ArrowLeftRight },
      { href: "/pagos/prestadores", label: "Pago prestadores", icon: HandCoins },
      { href: "/pagos/personal", label: "Pago personal", icon: UsersRound },
      { href: "/pagos/proveedores", label: "Pago proveedores", icon: Receipt },
      { href: "/reportes", label: "Reportes", icon: BarChart3 },
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

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const allHrefs = groups.flatMap((g) => g.items.map((i) => i.href));

  return (
    <nav className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto">
      {groups.map((group) => (
        <div key={group.label} className="mb-4">
          <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/65">
            {group.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href, allHrefs);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "relative flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium bg-sidebar-accent text-sidebar-accent-foreground before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:rounded-r-full before:bg-sidebar-primary"
                      : "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground transition-colors"
                  }
                >
                  <Icon
                    className={
                      active
                        ? "size-4 shrink-0 text-sidebar-primary"
                        : "size-4 shrink-0 text-sidebar-foreground/50"
                    }
                  />
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
