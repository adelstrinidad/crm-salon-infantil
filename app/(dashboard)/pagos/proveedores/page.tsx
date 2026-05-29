import { getProveedorPayments } from "@/lib/pagos/pagosService";
import { listAccounts } from "@/lib/finanzas/finanzasService";
import { listProveedores } from "@/lib/proveedores/proveedorService";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Money } from "@/components/ui/money";
import { Button } from "@/components/ui/button";
import { PagarProveedorButton } from "./PagarProveedorButton";
import { formatMoney } from "@/lib/money";
import { SelectFilter } from "@/components/ui/select-filter";
import { Input } from "@/components/ui/input";

type Props = {
  searchParams: Promise<{ from?: string; to?: string; proveedorId?: string; estado?: string }>;
};

function localDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const fmt = formatMoney;

export default async function PagosProveedoresPage({ searchParams }: Props) {
  const params = await searchParams;

  const from = params.from ? new Date(params.from + "T00:00:00") : undefined;
  const to = params.to ? new Date(params.to + "T23:59:59") : undefined;

  const paidFilter =
    params.estado === "pagado" ? true : params.estado === "pendiente" ? false : undefined;

  const [rows, accounts, proveedores] = await Promise.all([
    getProveedorPayments({ from, to, proveedorId: params.proveedorId || undefined, paid: paidFilter }),
    listAccounts(),
    listProveedores(),
  ]);

  const totalPendiente = rows.filter((r) => !r.paid).reduce((s, r) => s + r.service.cost * r.qty, 0);
  const totalPagado = rows.filter((r) => r.paid).reduce((s, r) => s + r.service.cost * r.qty, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Pago a proveedores" />

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
            <label className="text-sm font-medium">Proveedor</label>
            <SelectFilter
              name="proveedorId"
              defaultValue={params.proveedorId ?? ""}
              allLabel="Todos"
              options={proveedores.map((p) => ({ value: p.id, label: p.name }))}
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
                <th className="px-4 py-3 text-left">Proveedor</th>
                <th className="px-4 py-3 text-left">Servicio</th>
                <th className="px-4 py-3 text-left">Evento</th>
                <th className="px-4 py-3 text-left">Fecha evento</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((r) => {
                const amount = r.service.cost * r.qty;
                return (
                  <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-2 font-medium">{r.service.proveedor!.name}</td>
                    <td className="px-4 py-2">{r.service.name}</td>
                    <td className="px-4 py-2">{r.event.name}</td>
                    <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                      {new Date(r.event.startAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">{fmt(amount)}</td>
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
                        <PagarProveedorButton
                          eventServiceId={r.id}
                          amount={amount}
                          description={`Pago ${r.service.proveedor!.name} — ${r.service.name} — ${r.event.name}`}
                          accounts={accounts}
                        />
                      )}
                      {!r.paid && accounts.length === 0 && (
                        <span className="text-xs text-muted-foreground">Sin cuentas</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
