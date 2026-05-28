import Link from "next/link";
import { listMovementsFiltered, listAccounts } from "@/lib/finanzas/finanzasService";
import { MOVEMENT_TYPE_LABELS, MovementType, MOVEMENT_SIGN } from "@/lib/finanzas/schema";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DeleteMovementButton } from "../DeleteMovementButton";

type Props = { searchParams: Promise<{ from?: string; to?: string; accountId?: string; type?: string }> };

function localDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default async function MovimientosPage({ searchParams }: Props) {
  const params = await searchParams;

  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const from = params.from ? new Date(params.from + "T00:00:00") : defaultFrom;
  const to = params.to ? new Date(params.to + "T23:59:59") : defaultTo;

  const [movements, accounts] = await Promise.all([
    listMovementsFiltered({
      from,
      to,
      accountId: params.accountId || undefined,
      type: params.type || undefined,
    }),
    listAccounts(),
  ]);

  const totalIngreso = movements.reduce((s, m) => {
    const sign = MOVEMENT_SIGN[m.type as keyof typeof MOVEMENT_SIGN];
    return sign > 0 ? s + m.amount : s;
  }, 0);
  const totalEgreso = movements.reduce((s, m) => {
    const sign = MOVEMENT_SIGN[m.type as keyof typeof MOVEMENT_SIGN];
    return sign < 0 ? s + m.amount : s;
  }, 0);

  function fmt(n: number) {
    return `$${n.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Movimientos</h1>
        <Link href="/finanzas/movimientos/nuevo" className={cn(buttonVariants())}>
          + Movimiento
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap items-end gap-3 p-4 border rounded-lg bg-muted/20">
        <div className="space-y-1">
          <label className="text-sm font-medium">Desde</label>
          <input type="date" name="from" defaultValue={localDate(from)} className="border rounded px-2 py-1.5 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Hasta</label>
          <input type="date" name="to" defaultValue={localDate(to)} className="border rounded px-2 py-1.5 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Cuenta</label>
          <select name="accountId" defaultValue={params.accountId ?? ""} className="border rounded px-2 py-1.5 text-sm">
            <option value="">Todas</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Tipo</label>
          <select name="type" defaultValue={params.type ?? ""} className="border rounded px-2 py-1.5 text-sm">
            <option value="">Todos</option>
            {Object.values(MovementType).map((t) => (
              <option key={t} value={t}>{MOVEMENT_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90">
          Filtrar
        </button>
        <Link href="/finanzas/movimientos" className="px-4 py-1.5 text-sm border rounded hover:bg-muted text-sm">
          Limpiar
        </Link>
      </form>

      {/* Summary row */}
      {movements.length > 0 && (
        <div className="flex gap-6 text-sm px-1">
          <span>
            <span className="text-muted-foreground">Ingresos: </span>
            <span className="text-green-600 font-medium">{fmt(totalIngreso)}</span>
          </span>
          <span>
            <span className="text-muted-foreground">Egresos: </span>
            <span className="text-red-600 font-medium">{fmt(totalEgreso)}</span>
          </span>
          <span>
            <span className="text-muted-foreground">Neto: </span>
            <span className={`font-medium ${totalIngreso - totalEgreso >= 0 ? "text-green-600" : "text-red-600"}`}>
              {fmt(totalIngreso - totalEgreso)}
            </span>
          </span>
          <span className="text-muted-foreground">{movements.length} movimiento{movements.length !== 1 ? "s" : ""}</span>
        </div>
      )}

      {/* Table */}
      {movements.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin movimientos en el período.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left bg-muted/40">
                <th className="py-2 px-3">Fecha</th>
                <th className="py-2 px-3">Tipo</th>
                <th className="py-2 px-3">Descripción</th>
                <th className="py-2 px-3">Cuenta</th>
                <th className="py-2 px-3 text-right">Monto</th>
                <th className="py-2 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => {
                const sign = MOVEMENT_SIGN[m.type as keyof typeof MOVEMENT_SIGN];
                return (
                  <tr key={m.id} className="border-b hover:bg-muted/40">
                    <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">
                      {new Date(m.date).toLocaleDateString("es-AR")}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${sign > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {MOVEMENT_TYPE_LABELS[m.type as keyof typeof MOVEMENT_TYPE_LABELS]}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">{m.description ?? "—"}</td>
                    <td className="py-2 px-3">{m.account.name}</td>
                    <td className={`py-2 px-3 text-right font-medium ${sign > 0 ? "text-green-600" : "text-red-600"}`}>
                      {sign > 0 ? "+" : "−"}{fmt(m.amount)}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/finanzas/movimientos/${m.id}/editar`}
                          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                        >
                          Editar
                        </Link>
                        <DeleteMovementButton id={m.id} redirectTo="/finanzas/movimientos" />
                      </div>
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
