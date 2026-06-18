import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventWithAll } from "@/lib/events/eventProviderLines";
import { getMovementsByEvent, listAccounts } from "@/lib/finanzas/finanzasService";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";
import { StatusBadge } from "@/components/ui/status-badge";
import { Money, moneyToneClass } from "@/components/ui/money";
import { computeEventFinancials } from "@/lib/events/financials";
import { formatMoney } from "@/lib/money";
import { formatHHMM, staffLineCost, effectiveMinutes } from "@/lib/staff/hours";
import { cn } from "@/lib/utils";
import { RegistrarCobroPanel } from "./RegistrarCobroPanel";
import { RegistrarPagoConsumosPanel } from "./RegistrarPagoConsumosPanel";
import { CobrarInvitadoPanel } from "./CobrarInvitadoPanel";
import { IniciarEventoButton, CerrarConsumosButton } from "./ConsumosLifecycleButtons";
import { getEventConsumos, STARTABLE_STATES } from "@/lib/consumos/consumoService";
import {
  computeConsumosFinancials,
  splitConsumosByPayer,
  pendingClientTotal,
} from "@/lib/consumos/calc";
import { EmptyState } from "@/components/ui/empty-state";
import { Sparkles, Users, UserRound, ArrowLeftRight, UtensilsCrossed, Plus } from "lucide-react";
import { MovimientosDetailModal } from "./MovimientosDetailModal";
import { ConsumosDetailModal } from "./ConsumosDetailModal";
import { PagarButton } from "../../pagos/prestadores/PagarButton";
import { PagarStaffButton } from "../../pagos/personal/PagarStaffButton";
import { AnularPagoButton } from "@/components/pagos/AnularPagoButton";

type Props = { params: Promise<{ id: string }> };

const fmt = formatMoney;

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(new Date(d));
}

// Empty-state CTA: services / providers / staff are added on the edit page
// (autosave pickers live there), so the button links there instead of
// duplicating the pickers on this read-only detail page.
function EditCta({ id, label, anchor }: { id: string; label: string; anchor: string }) {
  return (
    <Link
      href={`/eventos/${id}/editar#${anchor}`}
      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
    >
      <Plus className="size-4" />
      {label}
    </Link>
  );
}

export default async function EventoDetailPage({ params }: Props) {
  const { id } = await params;

  const [event, movements, accounts, consumos] = await Promise.all([
    getEventWithAll(id).catch(() => null),
    getMovementsByEvent(id),
    listAccounts(),
    getEventConsumos(id),
  ]);
  if (!event) return notFound();

  // Consumption session status drives which actions the Consumos card offers.
  const consumosOpen = event.consumosStartedAt != null && event.consumosClosedAt == null;
  // Consumo money split (Vendido / Cobrado / Pendiente) for the card summary.
  // Cost/margin intentionally omitted — insumos carry no purchase cost on record.
  const consumosFin = computeConsumosFinancials(consumos);
  const consumosMesas = new Set(consumos.map((c) => c.tableNumber)).size;
  const canStart = event.consumosStartedAt == null && STARTABLE_STATES.includes(event.state);
  // Client bill vs self-paying guests: settled separately.
  const { cliente: clientLines, invitados } = splitConsumosByPayer(consumos);
  const clientPending = pendingClientTotal(consumos);
  const clientBillPaid =
    event.consumosClosedAt != null && clientLines.length > 0 && clientPending === 0;
  const clientPaidAt = clientLines.reduce<Date | null>(
    (latest, l) => (l.paidAt && (!latest || l.paidAt > latest) ? l.paidAt : latest),
    null,
  );

  const { serviceCost, providerCost, staffCost, totalBonificado, totalCost, profit } =
    computeEventFinancials(event);

  // "Falta registro de empleados": any assigned staff without real hours logged.
  const staffPending = event.staff.some((l) => l.actualMinutes == null);

  // Consumption-bill payments (kind "consumo") are income but never count
  // against the event price — totalPrice covers services only.
  const cobrado = movements
    .filter((m) => m.type === "INGRESO" && m.kind !== "consumo")
    .reduce((s, m) => s + m.amount, 0);
  const saldo = event.totalPrice - cobrado;

  // Running "Acumulado" per row, precomputed before render (no mutation inside JSX).
  // Null for non-INGRESO rows, which display "—".
  const cobradoAcumulados: (number | null)[] = [];
  let acumulado = 0;
  for (const m of movements) {
    const countsAsCobro = m.type === "INGRESO" && m.kind !== "consumo";
    if (countsAsCobro) acumulado += m.amount;
    cobradoAcumulados.push(countsAsCobro ? acumulado : null);
  }

  // Flattened, serializable rows for the "Ver detalle" movements modal.
  const movimientoRows = movements.map((m, i) => ({
    id: m.id,
    date: new Date(m.date).toISOString(),
    description: m.description,
    accountName: m.account.name,
    type: m.type,
    amount: m.amount,
    acumulado: cobradoAcumulados[i],
  }));

  // Plain rows for the "Ver detalle" consumos modal (per-table breakdown).
  const consumoRows = consumos.map((c) => ({
    id: c.id,
    tableNumber: c.tableNumber,
    insumoName: c.insumo.name,
    payerType: c.payerType,
    payerLabel: c.payerLabel,
    qty: c.qty,
    unitPrice: c.unitPrice,
    paid: c.paid,
  }));

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
          {canStart && <IniciarEventoButton eventId={id} />}
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

          {/* Resultado del evento: package profit + consumo income, itemized
              (never blended — consumos count as collected income, not margin,
              since insumos carry no cost on record). Shown only once the event
              has consumos, otherwise it would just repeat the profit. */}
          {consumos.length > 0 && (
            <div className="space-y-1 mt-4 pt-3 border-t border-border">
              <SectionTitle className="text-sm mb-1">Resultado del evento</SectionTitle>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ganancia del paquete</span>
                <Money value={profit} signed>{fmt(profit)}</Money>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Consumos cobrados</span>
                <Money tone="success">{fmt(consumosFin.cobrado)}</Money>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-1 font-medium">
                <span>Resultado total</span>
                <Money value={profit + consumosFin.cobrado} signed>
                  {fmt(profit + consumosFin.cobrado)}
                </Money>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Servicios */}
      <Card className="p-5">
        <SectionTitle className="text-base mb-3">Servicios</SectionTitle>
        {event.services.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Sin servicios asignados"
            description="Agregá servicios al evento para armar el presupuesto."
            action={<EditCta id={id} label="Agregar servicios" anchor="servicios" />}
            className="py-8"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full max-w-4xl text-sm">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">Nombre</th>
                  <th className="px-3 py-2 text-left">Prestador</th>
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
                    <td className="px-3 py-2 text-muted-foreground">{l.service.prestador?.name ?? "—"}</td>
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
            <table className="w-full max-w-xl text-sm">
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
          <EmptyState
            icon={Users}
            title="Sin prestadores asignados"
            description="Asigná prestadores al evento."
            action={<EditCta id={id} label="Agregar prestadores" anchor="prestadores" />}
            className="py-8"
          />
        ) : (
          <table className="w-full max-w-2xl text-sm">
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
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className="inline-flex items-center rounded-full border bg-success/10 text-success border-success/20 px-2.5 py-0.5 text-xs font-medium">
                          Pagado {l.paidAt ? new Date(l.paidAt).toLocaleDateString("es-AR") : ""}
                        </span>
                        <AnularPagoButton kind="event-provider" id={l.id} />
                      </div>
                    ) : accounts.length > 0 ? (
                      <PagarButton kind="event-provider" id={l.id} accounts={accounts} />
                    ) : (
                      <span className="inline-flex items-center rounded-full border bg-amber-100/70 text-amber-900 border-amber-200 px-2.5 py-0.5 text-xs font-medium">
                        Pendiente — sin cuentas
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
          <EmptyState
            icon={UserRound}
            title="Sin personal asignado"
            description="Asigná empleados al evento."
            action={<EditCta id={id} label="Asignar personal" anchor="personal" />}
            className="py-8"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full max-w-5xl text-sm">
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
                          <div className="flex flex-col gap-1.5 items-start">
                            <span className="inline-flex items-center rounded-full border bg-success/10 text-success border-success/20 px-2.5 py-0.5 text-xs font-medium">
                              Pagado {l.paidAt ? new Date(l.paidAt).toLocaleDateString("es-AR") : ""}
                            </span>
                            <AnularPagoButton kind="staff" id={l.id} />
                          </div>
                        ) : accounts.length > 0 ? (
                          <PagarStaffButton eventStaffId={l.id} accounts={accounts} />
                        ) : (
                          <span className="inline-flex items-center rounded-full border bg-amber-100/70 text-amber-900 border-amber-200 px-2.5 py-0.5 text-xs font-medium">
                            Pendiente — sin cuentas
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

      {/* Consumos (per-table consumption during the running event) */}
      <Card className="p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SectionTitle className="text-base">Consumos</SectionTitle>
            {event.consumosStartedAt && (
              <span className="inline-flex items-center rounded-full border bg-cyan-100/70 text-cyan-900 border-cyan-200 px-2.5 py-0.5 text-xs font-medium">
                {consumosOpen ? "Abierto" : "Cerrado"}
              </span>
            )}
            {clientBillPaid && (
              <span className="inline-flex items-center rounded-full border bg-success/10 text-success border-success/20 px-2.5 py-0.5 text-xs font-medium">
                Pagado {clientPaidAt ? new Date(clientPaidAt).toLocaleDateString("es-AR") : ""}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {consumosOpen && (
              <>
                <Link href={`/eventos/${id}/consumos`} className={cn(buttonVariants({ variant: "outline" }))}>
                  Registrar consumos
                </Link>
                <CerrarConsumosButton eventId={id} />
              </>
            )}
            {event.consumosClosedAt && (
              <Link
                href={`/eventos/${id}/consumos/reporte`}
                target="_blank"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Ver reporte
              </Link>
            )}
            {event.consumosClosedAt && clientPending > 0 && (
              <RegistrarPagoConsumosPanel eventId={id} total={clientPending} accounts={accounts} />
            )}
          </div>
        </div>

        {!event.consumosStartedAt ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="Evento no iniciado"
            description={
              canStart
                ? "Iniciá el evento para registrar los consumos de cada mesa."
                : "Los consumos se registran con el evento en curso (solo eventos confirmados)."
            }
            className="py-8"
          />
        ) : consumos.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="Sin consumos registrados"
            description="Registrá lo que pida cada mesa durante el evento."
            className="py-8"
          />
        ) : (
          <div className="space-y-4">
            {/* Summary: Vendido (all lines) / Cobrado (paid) / Pendiente (gap). */}
            <div className="flex flex-wrap gap-4">
              {[
                { label: "Vendido", value: fmt(consumosFin.vendido), tone: "default" as const },
                { label: "Cobrado", value: fmt(consumosFin.cobrado), tone: "success" as const },
                {
                  label: "Pendiente",
                  value: fmt(consumosFin.pendiente),
                  tone: consumosFin.pendiente > 0 ? ("loss" as const) : ("success" as const),
                },
              ].map(({ label, value, tone }) => (
                <div
                  key={label}
                  role="group"
                  aria-label={`${label} ${value}`}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm min-w-[120px]"
                >
                  <p className="text-muted-foreground text-xs">{label}</p>
                  <p className={cn("font-semibold text-base", moneyToneClass(tone))}>{value}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ConsumosDetailModal lines={consumoRows} />
              <p className="text-sm text-muted-foreground">
                {consumos.length} {consumos.length === 1 ? "línea" : "líneas"} · {consumosMesas}{" "}
                {consumosMesas === 1 ? "mesa" : "mesas"}
              </p>
            </div>
          </div>
        )}

        {/* Self-paying guests, chargeable at any moment after start. */}
        {invitados.length > 0 && (
          <div className="mt-4 border-t border-border/60 pt-4 space-y-2">
            <p className="text-sm font-medium">Invitados</p>
            <ul className="space-y-1.5 text-sm">
              {invitados.map((g) => (
                <li key={g.label} className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    {g.label}
                    {g.paid ? (
                      <span className="ml-1.5 inline-flex items-center rounded-full border bg-success/10 text-success border-success/20 px-2 py-0.5 text-xs font-medium">
                        Pagado
                      </span>
                    ) : (
                      <span className="ml-1.5 inline-flex items-center rounded-full border bg-amber-100/70 text-amber-900 border-amber-200 px-2 py-0.5 text-xs font-medium">
                        Pendiente
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-medium">{fmt(g.pendingTotal > 0 ? g.pendingTotal : g.total)}</span>
                    {!g.paid && (
                      <CobrarInvitadoPanel
                        eventId={id}
                        payerLabel={g.label}
                        total={g.pendingTotal}
                        accounts={accounts}
                      />
                    )}
                  </span>
                </li>
              ))}
            </ul>
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
          <EmptyState
            icon={ArrowLeftRight}
            title="Sin movimientos registrados"
            description="Registrá un cobro para empezar el historial de pagos del evento."
            className="py-8"
          />
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <MovimientosDetailModal rows={movimientoRows} />
            <p className="text-sm text-muted-foreground">
              {movements.length} {movements.length === 1 ? "movimiento" : "movimientos"} registrados
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
