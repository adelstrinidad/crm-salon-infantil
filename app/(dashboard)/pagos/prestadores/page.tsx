import { getProviderPayments } from "@/lib/pagos/pagosService";
import { listAccounts } from "@/lib/finanzas/finanzasService";
import { listProviders } from "@/lib/providers/providerService";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Money } from "@/components/ui/money";
import { Button } from "@/components/ui/button";
import { PagarButton } from "./PagarButton";
import { formatMoney } from "@/lib/money";

type Props = {
  searchParams: Promise<{ from?: string; to?: string; providerId?: string; estado?: string }>;
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

  const [rows, accounts, providers] = await Promise.all([
    getProviderPayments({ from, to, providerId: params.providerId || undefined, paid: paidFilter }),
    listAccounts(),
    listProviders(),
  ]);

  const totalPendiente = rows.filter((r) => !r.paid).reduce((s, r) => s + r.provider.cost, 0);
  const totalPagado = rows.filter((r) => r.paid).reduce((s, r) => s + r.provider.cost, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Pago a prestadores" />

      {/* Filters */}
      <Card className="p-4">
        <form method="GET" className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Fecha evento desde</label>
            <input type="date" name="from" defaultValue={from ? localDate(from) : ""} className="border border-border bg-background rounded-md px-2 py-1.5 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Hasta</label>
            <input type="date" name="to" defaultValue={to ? localDate(to) : ""} className="border border-border bg-background rounded-md px-2 py-1.5 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Prestador</label>
            <select name="providerId" defaultValue={params.providerId ?? ""} className="border border-border bg-background rounded-md px-2 py-1.5 text-sm">
              <option value="">Todos</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}{p.role ? ` (${p.role})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Estado</label>
            <select name="estado" defaultValue={params.estado ?? ""} className="border border-border bg-background rounded-md px-2 py-1.5 text-sm">
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
            </select>
          </div>
          <Button type="submit" size="sm">Filtrar</Button>
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
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-2 font-medium">
                    {r.provider.name}
                    {r.provider.role && <span className="text-muted-foreground text-xs ml-1">({r.provider.role})</span>}
                  </td>
                  <td className="px-4 py-2">{r.event.name}</td>
                  <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                    {new Date(r.event.startAt).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-2 text-right font-medium">{fmt(r.provider.cost)}</td>
                  <td className="px-4 py-2">
                    {r.paid ? (
                      <span className="inline-flex items-center rounded-full border bg-success/10 text-success border-success/20 px-2.5 py-0.5 text-xs font-medium">
                        Pagado {r.paidAt ? new Date(r.paidAt).toLocaleDateString("es-AR") : ""}
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
                        eventProviderId={r.id}
                        amount={r.provider.cost}
                        description={`Pago ${r.provider.name} — ${r.event.name}`}
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
