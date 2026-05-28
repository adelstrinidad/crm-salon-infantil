import { getProveedorPayments } from "@/lib/pagos/pagosService";
import { listAccounts } from "@/lib/finanzas/finanzasService";
import { listProveedores } from "@/lib/proveedores/proveedorService";
import { PagarProveedorButton } from "./PagarProveedorButton";

type Props = {
  searchParams: Promise<{ from?: string; to?: string; proveedorId?: string; estado?: string }>;
};

function localDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fmt(n: number) {
  return `$${n.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;
}

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
      <h1 className="text-2xl font-bold">Pago a proveedores</h1>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap items-end gap-3 p-4 border rounded-lg bg-muted/20">
        <div className="space-y-1">
          <label className="text-sm font-medium">Fecha evento desde</label>
          <input type="date" name="from" defaultValue={from ? localDate(from) : ""} className="border rounded px-2 py-1.5 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Hasta</label>
          <input type="date" name="to" defaultValue={to ? localDate(to) : ""} className="border rounded px-2 py-1.5 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Proveedor</label>
          <select name="proveedorId" defaultValue={params.proveedorId ?? ""} className="border rounded px-2 py-1.5 text-sm">
            <option value="">Todos</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Estado</label>
          <select name="estado" defaultValue={params.estado ?? ""} className="border rounded px-2 py-1.5 text-sm">
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
          </select>
        </div>
        <button type="submit" className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90">
          Filtrar
        </button>
      </form>

      {/* Summary */}
      {rows.length > 0 && (
        <div className="flex gap-6 text-sm px-1">
          <span>
            <span className="text-muted-foreground">Pendiente: </span>
            <span className="font-medium text-red-600">{fmt(totalPendiente)}</span>
          </span>
          <span>
            <span className="text-muted-foreground">Pagado: </span>
            <span className="font-medium text-green-600">{fmt(totalPagado)}</span>
          </span>
          <span className="text-muted-foreground">{rows.length} asignaci{rows.length !== 1 ? "ones" : "ón"}</span>
        </div>
      )}

      {/* Table */}
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin asignaciones en el período.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left bg-muted/40">
                <th className="py-2 px-3">Proveedor</th>
                <th className="py-2 px-3">Servicio</th>
                <th className="py-2 px-3">Evento</th>
                <th className="py-2 px-3">Fecha evento</th>
                <th className="py-2 px-3 text-right">Monto</th>
                <th className="py-2 px-3">Estado</th>
                <th className="py-2 px-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const amount = r.service.cost * r.qty;
                return (
                  <tr key={r.id} className="border-b hover:bg-muted/40">
                    <td className="py-2 px-3 font-medium">{r.service.proveedor!.name}</td>
                    <td className="py-2 px-3">{r.service.name}</td>
                    <td className="py-2 px-3">{r.event.name}</td>
                    <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">
                      {new Date(r.event.startAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="py-2 px-3 text-right font-medium">{fmt(amount)}</td>
                    <td className="py-2 px-3">
                      {r.paid ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                          Pagado {r.paidAt ? new Date(r.paidAt).toLocaleDateString("es-AR") : ""}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3">
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
