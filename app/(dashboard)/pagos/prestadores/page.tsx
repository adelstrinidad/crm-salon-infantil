import { getProviderPayments, getServicePrestadorPayments } from "@/lib/pagos/pagosService";
import { listAccounts } from "@/lib/finanzas/finanzasService";
import { listProviders } from "@/lib/providers/providerService";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Money } from "@/components/ui/money";
import { Button } from "@/components/ui/button";
import { PagarButton } from "./PagarButton";
import type { PaymentSourceKind } from "./actions";
import { formatMoney } from "@/lib/money";
import { SelectFilter } from "@/components/ui/select-filter";
import { Input } from "@/components/ui/input";

type Props = {
  searchParams: Promise<{ from?: string; to?: string; prestadorId?: string; estado?: string }>;
};

// A normalized payment row from either source (direct event-provider assignment
// or a service backed by a prestador).
type PaymentRow = {
  key: string;
  kind: PaymentSourceKind;
  id: string;
  prestadorName: string;
  prestadorRole: string | null;
  eventName: string;
  eventStartAt: Date;
  createdAt: Date;
  amount: number;
  paid: boolean;
  paidAt: Date | null;
  description: string;
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

  const paidFilter =
    params.estado === "pagado" ? true : params.estado === "pendiente" ? false : undefined;

  const opts = { from, to, paid: paidFilter };
  const prestadorId = params.prestadorId || undefined;

  const [directRows, serviceRows, accounts, providers] = await Promise.all([
    getProviderPayments({ ...opts, providerId: prestadorId }),
    getServicePrestadorPayments({ ...opts, prestadorId }),
    listAccounts(),
    listProviders(),
  ]);

  // Normalize both sources into a single, sorted list.
  const rows: PaymentRow[] = [
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
      description: `Pago ${r.provider.name} — ${r.event.name}`,
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
      description: `Pago ${r.service.prestador!.name} — ${r.service.name} — ${r.event.name}`,
    })),
  ].sort((a, b) => a.eventStartAt.getTime() - b.eventStartAt.getTime());

  const totalPendiente = rows.filter((r) => !r.paid).reduce((s, r) => s + r.amount, 0);
  const totalPagado = rows.filter((r) => r.paid).reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Pago a prestadores" />

      {/* Filters */}
      <Card className="p-4">
        <form method="GET" className="flex flex-wrap items-end gap-3">
          <div className="space-y-1 w-full sm:w-44">
            <label className="text-sm font-medium">Fecha evento desde</label>
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
        <p className="text-sm text-muted-foreground">Sin asignaciones en el período.</p>
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
                <tr key={r.key} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-2 font-medium">
                    {r.prestadorName}
                    {r.prestadorRole && <span className="text-muted-foreground text-xs ml-1">({r.prestadorRole})</span>}
                  </td>
                  <td className="px-4 py-2">{r.eventName}</td>
                  <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                    {new Date(r.eventStartAt).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-2 text-right font-medium">{fmt(r.amount)}</td>
                  <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                    {r.paidAt ? new Date(r.paidAt).toLocaleDateString("es-AR") : "—"}
                  </td>
                  <td className="px-4 py-2">
                    {r.paid ? (
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
                    {!r.paid && accounts.length > 0 && (
                      <PagarButton
                        kind={r.kind}
                        id={r.id}
                        amount={r.amount}
                        description={r.description}
                        accounts={accounts}
                      />
                    )}
                    {!r.paid && accounts.length === 0 && (
                      <span className="text-xs text-muted-foreground">Sin cuentas</span>
                    )}
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
