import { cn } from "@/lib/utils";

/**
 * Event-state badge — single source of truth for state → color mapping
 * (was duplicated across `eventos/page.tsx` and `eventos/[id]/page.tsx`).
 */
export type EventStateBadge =
  | "RESERVADO"
  | "SENADO"
  | "PAGADO"
  | "CERRADO"
  | "SUSPENDIDO"
  | "PRESUPUESTADO"
  | "DIA_FESTIVO";

const STATE_LABEL: Record<EventStateBadge, string> = {
  RESERVADO: "Reservado",
  SENADO: "Señado",
  PAGADO: "Pagado",
  CERRADO: "Cerrado",
  SUSPENDIDO: "Suspendido",
  PRESUPUESTADO: "Presupuestado",
  DIA_FESTIVO: "Día festivo",
};

// Soft palette: status hues, lower-chroma than raw tailwind defaults, so they
// sit naturally on the linen-cream background instead of shouting.
const STATE_CLASS: Record<EventStateBadge, string> = {
  RESERVADO:     "bg-blue-100/70 text-blue-900 border-blue-200",
  SENADO:        "bg-amber-100/70 text-amber-900 border-amber-200",
  PAGADO:        "bg-emerald-100/70 text-emerald-900 border-emerald-200",
  CERRADO:       "bg-muted text-foreground border-border",
  SUSPENDIDO:    "bg-rose-100/70 text-rose-900 border-rose-200",
  PRESUPUESTADO: "bg-violet-100/70 text-violet-900 border-violet-200",
  DIA_FESTIVO:   "bg-orange-100/70 text-orange-900 border-orange-200",
};

export function statusBadgeClass(state: string): string {
  return STATE_CLASS[state as EventStateBadge] ?? STATE_CLASS.CERRADO;
}

export function statusBadgeLabel(state: string): string {
  return STATE_LABEL[state as EventStateBadge] ?? state;
}

export function StatusBadge({
  state,
  className,
}: {
  state: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusBadgeClass(state),
        className,
      )}
    >
      {statusBadgeLabel(state)}
    </span>
  );
}
