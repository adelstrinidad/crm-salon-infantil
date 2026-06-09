import Link from "next/link";
import { getStaffPayments, getRemovedPayments } from "@/lib/pagos/pagosService";
import { listAccounts } from "@/lib/finanzas/finanzasService";
import { listStaff } from "@/lib/staff/staffService";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Money } from "@/components/ui/money";
import { Button } from "@/components/ui/button";
import { PagarStaffButton } from "./PagarStaffButton";
import { formatMoney } from "@/lib/money";
import { formatHHMM, staffLineCost, effectiveMinutes } from "@/lib/staff/hours";
import { SelectFilter } from "@/components/ui/select-filter";
import { Input } from "@/components/ui/input";

type Props = {
  searchParams: Promise<{ from?: string; to?: string; staffId?: string; estado?: string }>;
};

// Normalized row: an active staff assignment or a removed (audited) line.
type RowVM = {
  key: string;
  id: string;
  staffName: string;
  staffRole: string | null;
  eventId: string | null;
  eventName: string;
  eventStartAt: Date | null;
  createdAt: Date;
  actualMinutes: number | null;
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

export default async function PagosPersonalPage({ searchParams }: Props) {
  const params = await searchParams;

  const from = params.from ? new Date(params.from + "T00:00:00") : undefined;
  const to = params.to ? new Date(params.to + "T23:59:59") : undefined;
  const staffId = params.staffId || undefined;
  const estado = params.estado ?? "";

  const showActive = estado !== "eliminado";
  const showRemoved = (estado === "" || estado === "eliminado") && !staffId;
  const paidFilter = estado === "pagado" ? true : estado === "pendiente" ? false : undefined;

  const [staffPayments, removedRows, accounts, staff] = await Promise.all([
    showActive ? getStaffPayments({ from, to, staffId, paid: paidFilter }) : [],
    showRemoved ? getRemovedPayments({ kinds: ["staff"], from, to }) : [],
    listAccounts(),
    listStaff(),
  ]);

  const activeRows: RowVM[] = staffPayments.map((r) => ({
    key: `es-${r.id}`,
    id: r.id,
    staffName: r.staff.name,
    staffRole: r.staff.role,
    eventId: r.eventId,
    eventName: r.event.name,
    eventStartAt: r.event.startAt,
    createdAt: r.createdAt,
    actualMinutes: r.actualMinutes,
    amount: staffLineCost(r.staff.hourlyRate, effectiveMinutes(r.estMinutes, r.actualMinutes)),
    paid: r.paid,
    paidAt: r.paidAt,
    removed: false,
    removedAt: null,
  }));

  const removed: RowVM[] = removedRows.map((r) => ({
    key: `rm-${r.id}`,
    id: r.id,
    staffName: r.entityName,
    staffRole: r.entityRole,
    eventId: null,
    eventName: r.eventName,
    eventStartAt: null,
    createdAt: r.originalCreatedAt,
    actualMinutes: null,
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
      <PageHeader title="Pago a personal" />

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
            <label className="text-sm font-medium">Empleado</label>
            <SelectFilter
              name="staffId"
              defaultValue={params.staffId ?? ""}
              allLabel="Todos"
              options={staff.map((s) => ({
                value: s.id,
                label: `${s.name}${s.role ? ` (${s.role})` : ""}`,
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
        <p className="text-sm text-muted-foreground">Sin asignaciones en el período.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Empleado</th>
                <th className="px-4 py-3 text-left">Evento</th>
                <th className="px-4 py-3 text-left">Fecha evento</th>
                <th className="px-4 py-3 text-left">Fecha de alta</th>
                <th className="px-4 py-3 text-right">Horas reales</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3 text-left">Fecha de pago</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((r) => {
                const registered = r.actualMinutes != null;
                return (
                  <tr key={r.key} className={`hover:bg-muted/40 transition-colors${r.removed ? " opacity-60" : ""}`}>
                    <td className="px-4 py-2 font-medium">
                      {r.staffName}
                      {r.staffRole && <span className="text-muted-foreground text-xs ml-1">({r.staffRole})</span>}
                    </td>
                    <td className="px-4 py-2">
                      {r.eventId ? (
                        <Link href={`/eventos/${r.eventId}`} className="hover:underline">{r.eventName}</Link>
                      ) : (
                        r.eventName
                      )}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                      {r.eventStartAt ? new Date(r.eventStartAt).toLocaleDateString("es-AR") : "—"}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      {registered ? `${formatHHMM(r.actualMinutes)} hs` : "—"}
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
                      {!r.removed && !r.paid && !registered && (
                        <Link
                          href={`/eventos/${r.eventId}/editar`}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          Registrá las horas
                        </Link>
                      )}
                      {!r.removed && !r.paid && registered && accounts.length > 0 && (
                        <PagarStaffButton eventStaffId={r.id} accounts={accounts} />
                      )}
                      {!r.removed && !r.paid && registered && accounts.length === 0 && (
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
