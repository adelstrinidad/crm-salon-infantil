import {
  getProviderPayments,
  getServicePrestadorPayments,
  getRemovedPayments,
} from "@/lib/pagos/pagosService";
import { listAccounts } from "@/lib/finanzas/finanzasService";
import { listProviders } from "@/lib/providers/providerService";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Money } from "@/components/ui/money";
import { Button } from "@/components/ui/button";
import { PagarButton } from "./PagarButton";
import { AnularPagoButton } from "@/components/pagos/AnularPagoButton";
import type { PaymentSourceKind } from "./actions";
import { formatMoney } from "@/lib/money";
import { SelectFilter } from "@/components/ui/select-filter";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { HandCoins } from "lucide-react";

type Props = {
  searchParams: Promise<{ from?: string; to?: string; prestadorId?: string; estado?: string }>;
};

// A normalized payment row: active (direct event-provider or service-backed) or
// a removed (audited) line shown as "Eliminado".
type PaymentRow = {
  key: string;
  kind: PaymentSourceKind;
  id: string;
  prestadorName: string;
  prestadorRole: string | null;
  eventName: string;
  eventStartAt: Date | null;
  createdAt: Date;
  amount: number;
  paid: boolean;
  paidAt: Date | null;
  removed: boolean;
  removedAt: Date | null;
};

function localDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const fmt = formatMoney;

export default async function PagosPrestadoresPage({ searchParams }: Props) {
  const params = await searchParams;

  const from = params.from ? new Date(params.from + "T00:00:00") : undefined;
  const to = params.to ? new Date(params.to + "T23:59:59") : undefined;
  const prestadorId = params.prestadorId || undefined;
  const estado = params.estado ?? "";

  const showActive = estado !== "eliminado";
  // Removed rows have no prestadorId to match, so they're hidden when filtering
  // by a specific prestador.
  const showRemoved = (estado === "" || estado === "eliminado") && !prestadorId;
  const paidFilter = estado === "pagado" ? true : estado === "pendiente" ? false : undefined;

  const [directRows, serviceRows, removedRows, accounts, providers] = await Promise.all([
    showActive ? getProviderPayments({ from, to, paid: paidFilter, providerId: prestadorId }) : [],
    showActive ? getServicePrestadorPayments({ from, to, paid: paidFilter, prestadorId }) : [],
    showRemoved ? getRemovedPayments({ kinds: ["provider", "service"], from, to }) : [],
    listAccounts(),
    listProviders(),
  ]);

  const activeRows: PaymentRow[] = [
    ...directRows.map((r): PaymentRow => ({
      key: `ep-${r.id}`,
      kind: "event-provider",
      id: r.id,
      prestadorName: r.provider.name,
      prestadorRole: r.provider.role,
      eventName: r.event.name,
      eventStartAt: r.event.startAt,
      createdAt: r.createdAt,
      amount: r.cost,
      paid: r.paid,
      paidAt: r.paidAt,
      removed: false,
      removedAt: null,
    })),
    ...serviceRows.map((r): PaymentRow => ({
      key: `svc-${r.id}`,
      kind: "service",
      id: r.id,
      prestadorName: r.service.prestador!.name,
      prestadorRole: r.service.prestador!.role,
      eventName: r.event.name,
      eventStartAt: r.event.startAt,
      createdAt: r.createdAt,
      amount: r.service.cost * r.qty,
      paid: r.paid,
      paidAt: r.paidAt,
      removed: false,
      removedAt: null,
    })),
  ].sort((a, b) => (a.eventStartAt!.getTime() - b.eventStartAt!.getTime()));

  const removed: PaymentRow[] = removedRows.map((r): PaymentRow => ({
    key: `rm-${r.id}`,
    kind: r.kind === "provider" ? "event-provider" : "service",
    id: r.id,
    prestadorName: r.entityName,
    prestadorRole: r.entityRole,
    eventName: r.eventName,
    eventStartAt: null,
    createdAt: r.originalCreatedAt,
    amount: r.amount,
    paid: r.paid,
    paidAt: r.paidAt,
    removed: true,
    removedAt: r.removedAt,
  }));

  const rows = [...activeRows, ...removed];

  // Totals exclude removed (historical/cancelled) lines.
  const totalPendiente = activeRows.filter((r) => !r.paid).reduce((s, r) => s + r.amount, 0);
  const totalPagado = activeRows.filter((r) => r.paid).reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Pago a prestadores" />

      {/* Filters */}
      <Card className="p-4">
        <form method="GET" className="flex flex-wrap items-end gap-3">
          <div className="space-y-1 w-full sm:w-44">
            <label className="text-sm font-medium">Fecha desde</label>
            <Input type="date" name="from" defaultValue={from ? localDate(from) : ""} />
          </div>
          <div className="space-y-1 w-full sm:w-40">
            <label className="text-sm font-medium">Hasta</label>
            <Input type="date" name="to" defaultValue={to ? localDate(to) : ""} />
          </div>
          <div className="space-y-1 w-full sm:w-48">
            <label className="text-sm font-medium">Prestador</label>
            <SelectFilter
              name="prestadorId"
              defaultValue={params.prestadorId ?? ""}
              allLabel="Todos"
              options={providers.map((p) => ({
                value: p.id,
                label: `${p.name}${p.role ? ` (${p.role})` : ""}`,
              }))}
            />
          </div>
          <div className="space-y-1 w-full sm:w-44">
            <label className="text-sm font-medium">Estado</label>
            <SelectFilter
              name="estado"
              defaultValue={params.estado ?? ""}
              allLabel="Todos"
              options={[
                { value: "pendiente", label: "Pendiente" },
                { value: "pagado", label: "Pagado" },
                { value: "eliminado", label: "Eliminado" },
              ]}
            />
          </div>
          <Button type="submit">Filtrar</Button>
        </form>
      </Card>

      {/* Summary */}
      {rows.length > 0 && (
        <div className="flex gap-6 text-sm px-1">
          <span>
            <span className="text-muted-foreground">Pendiente: </span>
            <Money tone="loss" className="font-medium">{fmt(totalPendiente)}</Money>
          </span>
          <span>
            <span className="text-muted-foreground">Pagado: </span>
            <Money tone="success" className="font-medium">{fmt(totalPagado)}</Money>
          </span>
          <span className="text-muted-foreground">{rows.length} asignaci{rows.length !== 1 ? "ones" : "ón"}</span>
        </div>
      )}

      {/* Table */}
      {rows.length === 0 ? (
        <EmptyState
          icon={HandCoins}
          title="Sin asignaciones en el período"
          description="Los pagos a prestadores de los eventos del rango seleccionado van a aparecer acá."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Prestador</th>
                <th className="px-4 py-3 text-left">Evento</th>
                <th className="px-4 py-3 text-left">Fecha evento</th>
                <th className="px-4 py-3 text-left">Fecha de alta</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3 text-left">Fecha de pago</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((r) => (
                <tr key={r.key} className={`hover:bg-muted/40 transition-colors${r.removed ? " opacity-60" : ""}`}>
                  <td className="px-4 py-2 font-medium">
                    {r.prestadorName}
                    {r.prestadorRole && <span className="text-muted-foreground text-xs ml-1">({r.prestadorRole})</span>}
                  </td>
                  <td className="px-4 py-2">{r.eventName}</td>
                  <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                    {r.eventStartAt ? new Date(r.eventStartAt).toLocaleDateString("es-AR") : "—"}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-2 text-right font-medium">{fmt(r.amount)}</td>
                  <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                    {r.paidAt ? new Date(r.paidAt).toLocaleDateString("es-AR") : "—"}
                  </td>
                  <td className="px-4 py-2">
                    {r.removed ? (
                      <span className="inline-flex items-center rounded-full border bg-muted text-muted-foreground border-border px-2.5 py-0.5 text-xs font-medium">
                        Eliminado {r.removedAt ? new Date(r.removedAt).toLocaleDateString("es-AR") : ""}
                      </span>
                    ) : r.paid ? (
                      <span className="inline-flex items-center rounded-full border bg-success/10 text-success border-success/20 px-2.5 py-0.5 text-xs font-medium">
                        Pagado
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border bg-amber-100/70 text-amber-900 border-amber-200 px-2.5 py-0.5 text-xs font-medium">
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {!r.removed && !r.paid && accounts.length > 0 && (
                      <PagarButton kind={r.kind} id={r.id} accounts={accounts} />
                    )}
                    {!r.removed && !r.paid && accounts.length === 0 && (
                      <span className="text-xs text-muted-foreground">Sin cuentas</span>
                    )}
                    {!r.removed && r.paid && <AnularPagoButton kind={r.kind} id={r.id} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
