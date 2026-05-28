import Link from "next/link";
import {
  getEventGroupedByType,
  getEventPerformanceReport,
  getBalanceSummaryCards,
  getMovementsWithoutEvent,
} from "@/lib/reports/reportsService";
import { MOVEMENT_TYPE_LABELS, MOVEMENT_SIGN } from "@/lib/finanzas/schema";
import { EventState } from "@/lib/events/schema";

type Props = { searchParams: Promise<{ from?: string; to?: string; state?: string }> };

const EVENT_STATE_LABELS: Record<string, string> = {
  PRESUPUESTADO: "Presupuestado",
  RESERVADO: "Reservado",
  SENADO: "Señado",
  PAGADO: "Pagado",
  CERRADO: "Cerrado",
  SUSPENDIDO: "Suspendido",
};

function fmt(n: number) {
  return `$${n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function toInputDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default async function ReportesPage({ searchParams }: Props) {
  const params = await searchParams;

  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const from = params.from ? new Date(params.from + "T00:00:00") : defaultFrom;
  const to = params.to ? new Date(params.to + "T23:59:59") : defaultTo;
  const stateFilter = Object.values(EventState).includes(params.state as EventState)
    ? (params.state as EventState)
    : undefined;

  const filter = { from, to, state: stateFilter };

  const [grouped, eventRows, cards, movWithout] = await Promise.all([
    getEventGroupedByType(filter),
    getEventPerformanceReport(filter),
    getBalanceSummaryCards(from, to, stateFilter),
    getMovementsWithoutEvent(from, to),
  ]);

  const totalProfit = grouped.reduce((s, r) => s + r.profit, 0);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-4">Reportes</h1>

        {/* Filters */}
        <form method="GET" className="flex flex-wrap items-end gap-3 mb-8 p-4 border rounded-lg bg-muted/20">
          <div className="space-y-1">
            <label className="text-sm font-medium">Fecha desde</label>
            <input
              type="date"
              name="from"
              defaultValue={toInputDate(from)}
              className="border rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Fecha hasta</label>
            <input
              type="date"
              name="to"
              defaultValue={toInputDate(to)}
              className="border rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Estado</label>
            <select
              name="state"
              defaultValue={params.state ?? ""}
              className="border rounded px-2 py-1.5 text-sm"
            >
              <option value="">Todos</option>
              {Object.values(EventState).map((s) => (
                <option key={s} value={s}>{EVENT_STATE_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Filtrar
          </button>
        </form>
      </div>

      {/* ── 1. Balance table by event type ──────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Balance por tipo de evento</h2>

        {grouped.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin eventos en el período.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b text-left bg-muted/40">
                    <th className="py-2 px-3">Tipo de evento</th>
                    <th className="py-2 px-3 text-center">Cantidad</th>
                    <th className="py-2 px-3 text-right">I. servicios</th>
                    <th className="py-2 px-3 text-right">E. servicios</th>
                    <th className="py-2 px-3 text-right">E. empleados</th>
                    <th className="py-2 px-3 text-right">Serv. bonif.</th>
                    <th className="py-2 px-3 text-right font-semibold">Ganancia</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped.map((r) => (
                    <tr key={r.eventType} className="border-b hover:bg-muted/40">
                      <td className="py-2 px-3 font-medium">{r.eventType}</td>
                      <td className="py-2 px-3 text-center">{r.count}</td>
                      <td className="py-2 px-3 text-right">{fmt(r.servicePrice)}</td>
                      <td className="py-2 px-3 text-right text-red-600">{fmt(r.serviceCost)}</td>
                      <td className="py-2 px-3 text-right text-red-600">{fmt(r.providerCost)}</td>
                      <td className="py-2 px-3 text-right text-orange-600">
                        {r.totalBonificado > 0 ? fmt(r.totalBonificado) : "—"}
                      </td>
                      <td className={`py-2 px-3 text-right font-semibold ${r.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {fmt(r.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-muted/20 font-medium">
                    <td className="py-2 px-3">Total</td>
                    <td className="py-2 px-3 text-center">{grouped.reduce((s, r) => s + r.count, 0)}</td>
                    <td className="py-2 px-3 text-right">{fmt(grouped.reduce((s, r) => s + r.servicePrice, 0))}</td>
                    <td className="py-2 px-3 text-right text-red-600">{fmt(grouped.reduce((s, r) => s + r.serviceCost, 0))}</td>
                    <td className="py-2 px-3 text-right text-red-600">{fmt(grouped.reduce((s, r) => s + r.providerCost, 0))}</td>
                    <td className="py-2 px-3 text-right text-orange-600">{fmt(grouped.reduce((s, r) => s + r.totalBonificado, 0))}</td>
                    <td className={`py-2 px-3 text-right font-bold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {fmt(totalProfit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
              <div className="border rounded-lg p-3 space-y-1">
                <p className="text-xs text-muted-foreground">Ingresos eventos</p>
                <p className="text-lg font-bold text-green-600">{fmt(cards.ingresosEventos)}</p>
              </div>
              <div className="border rounded-lg p-3 space-y-1">
                <p className="text-xs text-muted-foreground">Egresos eventos</p>
                <p className="text-lg font-bold text-red-600">{fmt(cards.egresosEventos)}</p>
              </div>
              <div className="border rounded-lg p-3 space-y-1">
                <p className="text-xs text-muted-foreground">Otros egresos</p>
                <p className="text-lg font-bold text-red-600">{fmt(cards.otrosEgresos)}</p>
              </div>
              <div className="border rounded-lg p-3 space-y-1">
                <p className="text-xs text-muted-foreground">Inversiones</p>
                <p className="text-lg font-bold text-muted-foreground">{fmt(cards.inversiones)}</p>
              </div>
              <div className="border rounded-lg p-3 space-y-1 bg-muted/30">
                <p className="text-xs text-muted-foreground">Balance total</p>
                <p className={`text-lg font-bold ${cards.balanceTotal >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {fmt(cards.balanceTotal)}
                </p>
              </div>
            </div>
          </>
        )}
      </section>

      <hr />

      {/* ── 2. Per-event breakdown ───────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Detalle por evento</h2>

        {eventRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin eventos en el período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-left bg-muted/40">
                  <th className="py-2 px-3">Evento</th>
                  <th className="py-2 px-3">Cliente</th>
                  <th className="py-2 px-3">Fecha</th>
                  <th className="py-2 px-3">Estado</th>
                  <th className="py-2 px-3 text-right">I. servicios</th>
                  <th className="py-2 px-3 text-right">Bonificado</th>
                  <th className="py-2 px-3 text-right">Subtotal</th>
                  <th className="py-2 px-3 text-right">Costo total</th>
                  <th className="py-2 px-3 text-right">Ganancia</th>
                </tr>
              </thead>
              <tbody>
                {eventRows.map((e) => (
                  <tr key={e.id} className="border-b hover:bg-muted/40">
                    <td className="py-2 px-3">
                      <Link href={`/eventos/${e.id}/editar`} className="hover:underline font-medium">
                        {e.name}
                      </Link>
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">{e.clientName}</td>
                    <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">
                      {new Date(e.startAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                        {EVENT_STATE_LABELS[e.state] ?? e.state}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">{fmt(e.servicePrice)}</td>
                    <td className="py-2 px-3 text-right text-orange-600">
                      {e.totalBonificado > 0 ? `−${fmt(e.totalBonificado)}` : "—"}
                    </td>
                    <td className="py-2 px-3 text-right font-medium">{fmt(e.subtotal)}</td>
                    <td className="py-2 px-3 text-right text-red-600">{fmt(e.totalCost)}</td>
                    <td className={`py-2 px-3 text-right font-semibold ${e.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {fmt(e.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <hr />

      {/* ── 3. Movimientos sin evento ─────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Movimientos sin evento</h2>

        {movWithout.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin movimientos independientes en el período.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left bg-muted/40">
                <th className="py-2 px-3">Fecha</th>
                <th className="py-2 px-3">Tipo</th>
                <th className="py-2 px-3">Cuenta</th>
                <th className="py-2 px-3">Descripción</th>
                <th className="py-2 px-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {movWithout.map((m) => {
                const sign = MOVEMENT_SIGN[m.type as keyof typeof MOVEMENT_SIGN];
                return (
                  <tr key={m.id} className="border-b hover:bg-muted/40">
                    <td className="py-2 px-3 text-muted-foreground">
                      {new Date(m.date).toLocaleDateString("es-AR")}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${sign > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {MOVEMENT_TYPE_LABELS[m.type as keyof typeof MOVEMENT_TYPE_LABELS]}
                      </span>
                    </td>
                    <td className="py-2 px-3">{m.account.name}</td>
                    <td className="py-2 px-3 text-muted-foreground">{m.description ?? "—"}</td>
                    <td className={`py-2 px-3 text-right font-medium ${sign > 0 ? "text-green-600" : "text-red-600"}`}>
                      {sign > 0 ? "+" : "−"}{fmt(m.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
