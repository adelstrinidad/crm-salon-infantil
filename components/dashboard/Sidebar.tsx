"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import { SidebarNav } from "@/components/dashboard/SidebarNav";

// Shared inner content: brand, nav, logout. `onNavigate` lets the mobile
// drawer close itself when a link is tapped.
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="px-6 py-5 border-b border-sidebar-border">
        <p className="font-heading text-xl tracking-tight text-sidebar-foreground">
          Salón Infantil
        </p>
        <p className="text-xs text-sidebar-foreground/70 mt-1">Panel de gestión</p>
      </div>
      <SidebarNav onNavigate={onNavigate} />
      <div className="p-3 border-t border-sidebar-border">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full px-3 py-2.5 rounded-md text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-left"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop: persistent sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Mobile: top bar with hamburger */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 border-b border-sidebar-border bg-sidebar px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={open}
          className="inline-flex items-center justify-center rounded-md p-2 text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-heading text-lg tracking-tight text-sidebar-foreground">
          Salón Infantil
        </span>
      </header>

      {/* Mobile: slide-over drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="absolute inset-y-0 left-0 w-72 max-w-[85%] flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-xl"
            role="dialog"
            aria-label="Menú de navegación"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="absolute right-3 top-4 inline-flex items-center justify-center rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
