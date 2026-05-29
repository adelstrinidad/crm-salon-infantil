import Link from "next/link";
import {
  getEventGroupedByType,
  getEventPerformanceReport,
  getBalanceSummaryCards,
  getMovementsWithoutEvent,
} from "@/lib/reports/reportsService";
import { MOVEMENT_TYPE_LABELS, MOVEMENT_SIGN } from "@/lib/finanzas/schema";
import { EventState } from "@/lib/events/schema";
import { PageHeader } from "@/components/ui/page-header";
import { SectionTitle } from "@/components/ui/section-title";
import { Card } from "@/components/ui/card";
import { StatusBadge, statusBadgeLabel } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Money, moneyToneClass, signTone } from "@/components/ui/money";
import { cn } from "@/lib/utils";

type Props = { searchParams: Promise<{ from?: string; to?: string; state?: string }> };

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
        <PageHeader title="Reportes" />

        {/* Filters */}
        <Card className="p-4">
          <form method="GET" className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Fecha desde</label>
              <input
                type="date"
                name="from"
                defaultValue={toInputDate(from)}
                className="border border-border bg-background rounded-md px-2 py-1.5 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Fecha hasta</label>
              <input
                type="date"
                name="to"
                defaultValue={toInputDate(to)}
                className="border border-border bg-background rounded-md px-2 py-1.5 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Estado</label>
              <select
                name="state"
                defaultValue={params.state ?? ""}
                className="border border-border bg-background rounded-md px-2 py-1.5 text-sm"
              >
                <option value="">Todos</option>
                {Object.values(EventState).map((s) => (
                  <option key={s} value={s}>{statusBadgeLabel(s)}</option>
                ))}
              </select>
            </div>
            <Button type="submit" size="sm">Filtrar</Button>
          </form>
        </Card>
      </div>

      {/* ── 1. Balance table by event type ──────────────────────────────────── */}
      <section className="space-y-4">
        <SectionTitle>Balance por tipo de evento</SectionTitle>

        {grouped.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin eventos en el período.</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Tipo de evento</th>
                    <th className="px-4 py-3 text-center">Cantidad</th>
                    <th className="px-4 py-3 text-right">I. servicios</th>
                    <th className="px-4 py-3 text-right">E. servicios</th>
                    <th className="px-4 py-3 text-right">E. empleados</th>
                    <th className="px-4 py-3 text-right">Serv. bonif.</th>
                    <th className="px-4 py-3 text-right font-semibold">Ganancia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {grouped.map((r) => (
                    <tr key={r.eventType} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-2 font-medium">{r.eventType}</td>
                      <td className="px-4 py-2 text-center">{r.count}</td>
                      <td className="px-4 py-2 text-right">{fmt(r.servicePrice)}</td>
                      <td className="px-4 py-2 text-right text-loss">{fmt(r.serviceCost)}</td>
                      <td className="px-4 py-2 text-right text-loss">{fmt(r.providerCost)}</td>
                      <td className="px-4 py-2 text-right text-accent">
                        {r.totalBonificado > 0 ? fmt(r.totalBonificado) : "—"}
                      </td>
                      <td className={cn("px-4 py-2 text-right font-semibold", moneyToneClass(signTone(r.profit)))}>
                        {fmt(r.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/30 font-medium border-t border-border">
                    <td className="px-4 py-2">Total</td>
                    <td className="px-4 py-2 text-center">{grouped.reduce((s, r) => s + r.count, 0)}</td>
                    <td className="px-4 py-2 text-right">{fmt(grouped.reduce((s, r) => s + r.servicePrice, 0))}</td>
                    <td className="px-4 py-2 text-right text-loss">{fmt(grouped.reduce((s, r) => s + r.serviceCost, 0))}</td>
                    <td className="px-4 py-2 text-right text-loss">{fmt(grouped.reduce((s, r) => s + r.providerCost, 0))}</td>
                    <td className="px-4 py-2 text-right text-accent">{fmt(grouped.reduce((s, r) => s + r.totalBonificado, 0))}</td>
                    <td className={cn("px-4 py-2 text-right font-semibold", moneyToneClass(signTone(totalProfit)))}>
                      {fmt(totalProfit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
              <Card className="p-3 space-y-1">
                <p className="text-xs text-muted-foreground">Ingresos eventos</p>
                <Money tone="success" className="text-lg font-semibold block">{fmt(cards.ingresosEventos)}</Money>
              </Card>
              <Card className="p-3 space-y-1">
                <p className="text-xs text-muted-foreground">Egresos eventos</p>
                <Money tone="loss" className="text-lg font-semibold block">{fmt(cards.egresosEventos)}</Money>
              </Card>
              <Card className="p-3 space-y-1">
                <p className="text-xs text-muted-foreground">Otros egresos</p>
                <Money tone="loss" className="text-lg font-semibold block">{fmt(cards.otrosEgresos)}</Money>
              </Card>
              <Card className="p-3 space-y-1">
                <p className="text-xs text-muted-foreground">Inversiones</p>
                <Money tone="muted" className="text-lg font-semibold block">{fmt(cards.inversiones)}</Money>
              </Card>
              <Card className="p-3 space-y-1 bg-muted/30">
                <p className="text-xs text-muted-foreground">Balance total</p>
                <Money value={cards.balanceTotal} signed className="text-lg font-semibold block">
                  {fmt(cards.balanceTotal)}
                </Money>
              </Card>
            </div>
          </>
        )}
      </section>

      {/* ── 2. Per-event breakdown ───────────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionTitle>Detalle por evento</SectionTitle>

        {eventRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin eventos en el período.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Evento</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-right">I. servicios</th>
                  <th className="px-4 py-3 text-right">Bonificado</th>
                  <th className="px-4 py-3 text-right">Subtotal</th>
                  <th className="px-4 py-3 text-right">Costo total</th>
                  <th className="px-4 py-3 text-right">Ganancia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {eventRows.map((e) => (
                  <tr key={e.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-2">
                      <Link href={`/eventos/${e.id}/editar`} className="hover:underline font-medium">
                        {e.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{e.clientName}</td>
                    <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                      {new Date(e.startAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge state={e.state} />
                    </td>
                    <td className="px-4 py-2 text-right">{fmt(e.servicePrice)}</td>
                    <td className="px-4 py-2 text-right text-accent">
                      {e.totalBonificado > 0 ? `−${fmt(e.totalBonificado)}` : "—"}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">{fmt(e.subtotal)}</td>
                    <td className="px-4 py-2 text-right text-loss">{fmt(e.totalCost)}</td>
                    <td className={cn("px-4 py-2 text-right font-semibold", moneyToneClass(signTone(e.profit)))}>
                      {fmt(e.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── 3. Movimientos sin evento ─────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionTitle>Movimientos sin evento</SectionTitle>

        {movWithout.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin movimientos independientes en el período.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Cuenta</th>
                  <th className="px-4 py-3 text-left">Descripción</th>
                  <th className="px-4 py-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {movWithout.map((m) => {
                  const sign = MOVEMENT_SIGN[m.type as keyof typeof MOVEMENT_SIGN];
                  const tone = signTone(sign);
                  return (
                    <tr key={m.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-2 text-muted-foreground">
                        {new Date(m.date).toLocaleDateString("es-AR")}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                            tone === "success"
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-loss/10 text-loss border-loss/20",
                          )}
                        >
                          {MOVEMENT_TYPE_LABELS[m.type as keyof typeof MOVEMENT_TYPE_LABELS]}
                        </span>
                      </td>
                      <td className="px-4 py-2">{m.account.name}</td>
                      <td className="px-4 py-2 text-muted-foreground">{m.description ?? "—"}</td>
                      <td className="px-4 py-2 text-right">
                        <Money tone={tone} className="font-medium">
                          {sign > 0 ? "+" : "−"}{fmt(m.amount)}
                        </Money>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
