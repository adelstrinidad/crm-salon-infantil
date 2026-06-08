import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventWithAll } from "@/lib/events/eventProviderLines";
import { getMovementsByEvent, listAccounts } from "@/lib/finanzas/finanzasService";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";
import { StatusBadge } from "@/components/ui/status-badge";
import { Money, moneyToneClass, signTone } from "@/components/ui/money";
import { computeEventFinancials } from "@/lib/events/financials";
import { formatMoney } from "@/lib/money";
import { formatHHMM, staffLineCost, effectiveMinutes } from "@/lib/staff/hours";
import { cn } from "@/lib/utils";
import { RegistrarCobroPanel } from "./RegistrarCobroPanel";

type Props = { params: Promise<{ id: string }> };

const fmt = formatMoney;

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(new Date(d));
}

export default async function EventoDetailPage({ params }: Props) {
  const { id } = await params;

  const [event, movements, accounts] = await Promise.all([
    getEventWithAll(id).catch(() => null),
    getMovementsByEvent(id),
    listAccounts(),
  ]);
  if (!event) return notFound();

  const { serviceCost, providerCost, staffCost, totalBonificado, totalCost, profit } =
    computeEventFinancials(event);

  // "Falta registro de empleados": any assigned staff without real hours logged.
  const staffPending = event.staff.some((l) => l.actualMinutes == null);

  const cobrado = movements
    .filter((m) => m.type === "INGRESO")
    .reduce((s, m) => s + m.amount, 0);
  const saldo = event.totalPrice - cobrado;

  // Running "Acumulado" per row, precomputed before render (no mutation inside JSX).
  // Null for non-INGRESO rows, which display "—".
  const cobradoAcumulados: (number | null)[] = [];
  let acumulado = 0;
  for (const m of movements) {
    if (m.type === "INGRESO") acumulado += m.amount;
    cobradoAcumulados.push(m.type === "INGRESO" ? acumulado : null);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            <Link href="/eventos" className="hover:underline">Eventos</Link>
            {" / "}
            {event.name}
          </p>
          <h1 className="font-heading text-2xl font-medium tracking-tight text-foreground">
            {event.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge state={event.state} />
            {staffPending && (
              <span className="inline-flex items-center rounded-full border bg-amber-100/70 text-amber-900 border-amber-200 px-2.5 py-0.5 text-xs font-medium">
                Falta registro de empleados
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/eventos/${id}/editar`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Editar
          </Link>
          <Link
            href={`/eventos/${id}/presupuesto`}
            target="_blank"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Generar presupuesto
          </Link>
          <RegistrarCobroPanel eventId={id} saldo={saldo} accounts={accounts} />
        </div>
      </div>

      {/* Info + Financial summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información básica */}
        <Card className="p-5 space-y-2 text-sm">
          <SectionTitle className="text-base mb-3">Información básica</SectionTitle>
          <div className="space-y-1.5">
            <div>
              <span className="font-medium">Cliente: </span>
              <span>{event.clientName}</span>
            </div>
            <div>
              <span className="font-medium">Tipo de evento: </span>
              <span>{event.eventType}</span>
            </div>
            <div>
              <span className="font-medium">Estado: </span>
              <StatusBadge state={event.state} />
            </div>
            <div>
              <span className="font-medium">Inicio: </span>
              <span>{fmtDate(event.startAt)}</span>
            </div>
            <div>
              <span className="font-medium">Fin: </span>
              <span>{fmtDate(event.endAt)}</span>
            </div>
            {event.details && (
              <div>
                <p className="font-medium mb-0.5">Detalle:</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{event.details}</p>
              </div>
            )}
            {event.notes && (
              <div>
                <p className="font-medium mb-0.5">Notas:</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{event.notes}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Contabilidad */}
        <Card className="p-5 text-sm">
          <SectionTitle className="text-base mb-3">Contabilidad</SectionTitle>
          <table className="w-full mb-4 border border-border">
            <tbody>
              <tr className="border-b border-border/60">
                <td className="py-1.5 text-muted-foreground">Precio total</td>
                <td className="py-1.5 text-right font-medium">{fmt(event.totalPrice)}</td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-1.5 text-muted-foreground">Cobrado</td>
                <td className="py-1.5 text-right">
                  <Money tone="success" className="font-medium">{fmt(cobrado)}</Money>
                </td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-1.5 text-muted-foreground">Saldo</td>
                <td className="py-1.5 text-right">
                  <Money tone={saldo > 0 ? "loss" : "success"} className="font-medium">
                    {fmt(saldo)}
                  </Money>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="space-y-1 pt-2 border-t border-border/60">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Costo servicios</span>
              <span>{fmt(serviceCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Costo prestadores</span>
              <span>{fmt(providerCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Costo personal</span>
              <span>{fmt(staffCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total bonificado</span>
              <span className="text-accent">-{fmt(totalBonificado)}</span>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-1">
              <span className="font-medium">Costo total</span>
              <span className="font-medium">{fmt(totalCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Ganancia estimada</span>
              <Money value={profit} signed className="font-medium">
                {fmt(profit)}
              </Money>
            </div>
          </div>
        </Card>
      </div>

      {/* Servicios */}
      <Card className="p-5">
        <SectionTitle className="text-base mb-3">Servicios</SectionTitle>
        {event.services.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin servicios asignados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">Nombre</th>
                  <th className="px-3 py-2 text-left">Proveedor</th>
                  <th className="px-3 py-2 text-center">Cant.</th>
                  <th className="px-3 py-2 text-right">Costo/u</th>
                  <th className="px-3 py-2 text-right">Precio/u</th>
                  <th className="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {event.services.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-3 py-2 font-medium">{l.service.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{l.service.proveedor?.name ?? "—"}</td>
                    <td className="px-3 py-2 text-center">{l.qty}</td>
                    <td className="px-3 py-2 text-right">{fmt(l.service.cost)}</td>
                    <td className="px-3 py-2 text-right">{fmt(l.service.price)}</td>
                    <td className="px-3 py-2 text-right font-medium">{fmt(l.service.price * l.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Bonificados */}
      {event.bonificados.length > 0 && (
        <Card className="p-5">
          <SectionTitle className="text-base mb-3">Bonificados</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">Servicio</th>
                  <th className="px-3 py-2 text-center">Cant.</th>
                  <th className="px-3 py-2 text-right">Valor bonificado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {event.bonificados.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-3 py-2">{l.service.name}</td>
                    <td className="px-3 py-2 text-center">{l.qty}</td>
                    <td className="px-3 py-2 text-right text-accent">-{fmt(l.service.price * l.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Prestadores */}
      <Card className="p-5">
        <SectionTitle className="text-base mb-3">Prestadores</SectionTitle>
        {event.providers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin prestadores asignados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-3 py-2 text-left">Nombre</th>
                <th className="px-3 py-2 text-left">Rol</th>
                <th className="px-3 py-2 text-right">Costo</th>
                <th className="px-3 py-2 text-left">Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {event.providers.map((l) => (
                <tr key={l.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-3 py-2 font-medium">{l.provider.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{l.provider.role ?? "—"}</td>
                  <td className="px-3 py-2 text-right">{fmt(l.cost)}</td>
                  <td className="px-3 py-2">
                    {l.paid ? (
                      <span className="inline-flex items-center rounded-full border bg-success/10 text-success border-success/20 px-2.5 py-0.5 text-xs font-medium">
                        Pagado {l.paidAt ? new Date(l.paidAt).toLocaleDateString("es-AR") : ""}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border bg-amber-100/70 text-amber-900 border-amber-200 px-2.5 py-0.5 text-xs font-medium">
                        Pendiente
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Personal (internal hourly staff) */}
      <Card className="p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <SectionTitle className="text-base">Personal</SectionTitle>
          {staffPending && (
            <span className="inline-flex items-center rounded-full border bg-amber-100/70 text-amber-900 border-amber-200 px-2.5 py-0.5 text-xs font-medium">
              Falta registro de empleados
            </span>
          )}
        </div>
        {event.staff.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin personal asignado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">Nombre</th>
                  <th className="px-3 py-2 text-left">Rol</th>
                  <th className="px-3 py-2 text-right">Costo/hora</th>
                  <th className="px-3 py-2 text-right">Estimado</th>
                  <th className="px-3 py-2 text-right">Real</th>
                  <th className="px-3 py-2 text-right">Costo</th>
                  <th className="px-3 py-2 text-left">Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {event.staff.map((l) => {
                  const minutes = effectiveMinutes(l.estMinutes, l.actualMinutes);
                  return (
                    <tr key={l.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-3 py-2 font-medium">{l.staff.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{l.staff.role ?? "—"}</td>
                      <td className="px-3 py-2 text-right">{fmt(l.staff.hourlyRate)}</td>
                      <td className="px-3 py-2 text-right">
                        {l.estMinutes != null ? `${formatHHMM(l.estMinutes)} hs` : "—"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {l.actualMinutes != null ? (
                          `${formatHHMM(l.actualMinutes)} hs`
                        ) : (
                          <span className="text-amber-700">Sin registrar</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-medium">
                        {fmt(staffLineCost(l.staff.hourlyRate, minutes))}
                      </td>
                      <td className="px-3 py-2">
                        {l.paid ? (
                          <span className="inline-flex items-center rounded-full border bg-success/10 text-success border-success/20 px-2.5 py-0.5 text-xs font-medium">
                            Pagado {l.paidAt ? new Date(l.paidAt).toLocaleDateString("es-AR") : ""}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border bg-amber-100/70 text-amber-900 border-amber-200 px-2.5 py-0.5 text-xs font-medium">
                            Pendiente
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Movimientos */}
      <Card className="p-5">
        <SectionTitle className="text-base mb-3">Movimientos</SectionTitle>

        {/* Summary cards */}
        <div className="flex flex-wrap gap-4 mb-4">
          {[
            { label: "Precio total", value: fmt(event.totalPrice), tone: "default" as const },
            { label: "Cobrado", value: fmt(cobrado), tone: "success" as const },
            { label: "Saldo", value: fmt(saldo), tone: saldo > 0 ? ("loss" as const) : ("success" as const) },
          ].map(({ label, value, tone }) => (
            <div key={label} className="rounded-lg border border-border bg-card px-4 py-2 text-sm min-w-[120px]">
              <p className="text-muted-foreground text-xs">{label}</p>
              <p className={cn("font-semibold text-base", moneyToneClass(tone))}>{value}</p>
            </div>
          ))}
        </div>

        {movements.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin movimientos registrados para este evento.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Descripción</th>
                  <th className="px-3 py-2 text-left">Cuenta</th>
                  <th className="px-3 py-2 text-left">Tipo</th>
                  <th className="px-3 py-2 text-right">Monto</th>
                  <th className="px-3 py-2 text-right">Acumulado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {movements.map((m, i) => {
                  const tone = signTone(m.type === "INGRESO" ? 1 : -1);
                  return (
                    <tr key={m.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap">{new Date(m.date).toLocaleDateString("es-AR")}</td>
                      <td className="px-3 py-2">{m.description ?? "—"}</td>
                      <td className="px-3 py-2 text-muted-foreground">{m.account.name}</td>
                      <td className="px-3 py-2">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                            tone === "success"
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-loss/10 text-loss border-loss/20",
                          )}
                        >
                          {m.type}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-medium">{fmt(m.amount)}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">
                        {cobradoAcumulados[i] !== null ? fmt(cobradoAcumulados[i]!) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
