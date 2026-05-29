import Link from "next/link";
import { listMovementsFiltered, listAccounts } from "@/lib/finanzas/finanzasService";
import { MOVEMENT_TYPE_LABELS, MovementType, MOVEMENT_SIGN } from "@/lib/finanzas/schema";
import { buttonVariants, Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Money, signTone } from "@/components/ui/money";
import { Pager } from "@/components/ui/pager";
import { parsePage, buildPaginated } from "@/lib/pagination";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { DeleteMovementButton } from "../DeleteMovementButton";

type Props = { searchParams: Promise<{ from?: string; to?: string; accountId?: string; type?: string; page?: string }> };

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

  const pageParams = parsePage(params.page);

  const [movementsResult, accounts] = await Promise.all([
    listMovementsFiltered({
      from,
      to,
      accountId: params.accountId || undefined,
      type: params.type || undefined,
      skip: pageParams.skip,
      take: pageParams.take,
    }),
    listAccounts(),
  ]);

  const { rows: movements, total, totalIngreso, totalEgreso } = movementsResult;
  const { page, pageCount } = buildPaginated(movements, total, pageParams);

  const fmt = formatMoney;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Movimientos"
        action={
          <Link href="/finanzas/movimientos/nuevo" className={cn(buttonVariants())}>
            + Movimiento
          </Link>
        }
      />

      {/* Filters */}
      <Card className="p-4">
        <form method="GET" className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Desde</label>
            <input type="date" name="from" defaultValue={localDate(from)} className="border border-border bg-background rounded-md px-2 py-1.5 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Hasta</label>
            <input type="date" name="to" defaultValue={localDate(to)} className="border border-border bg-background rounded-md px-2 py-1.5 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Cuenta</label>
            <select name="accountId" defaultValue={params.accountId ?? ""} className="border border-border bg-background rounded-md px-2 py-1.5 text-sm">
              <option value="">Todas</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Tipo</label>
            <select name="type" defaultValue={params.type ?? ""} className="border border-border bg-background rounded-md px-2 py-1.5 text-sm">
              <option value="">Todos</option>
              {Object.values(MovementType).map((t) => (
                <option key={t} value={t}>{MOVEMENT_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <Button type="submit" size="sm">Filtrar</Button>
          <Link href="/finanzas/movimientos" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Limpiar
          </Link>
        </form>
      </Card>

      {/* Summary row */}
      {total > 0 && (
        <div className="flex gap-6 text-sm px-1">
          <span>
            <span className="text-muted-foreground">Ingresos: </span>
            <Money tone="success" className="font-medium">{fmt(totalIngreso)}</Money>
          </span>
          <span>
            <span className="text-muted-foreground">Egresos: </span>
            <Money tone="loss" className="font-medium">{fmt(totalEgreso)}</Money>
          </span>
          <span>
            <span className="text-muted-foreground">Neto: </span>
            <Money value={totalIngreso - totalEgreso} signed className="font-medium">
              {fmt(totalIngreso - totalEgreso)}
            </Money>
          </span>
          <span className="text-muted-foreground">{total} movimiento{total !== 1 ? "s" : ""}</span>
        </div>
      )}

      {/* Table */}
      {movements.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin movimientos en el período.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Descripción</th>
                <th className="px-4 py-3 text-left">Cuenta</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {movements.map((m) => {
                const sign = MOVEMENT_SIGN[m.type as keyof typeof MOVEMENT_SIGN];
                const tone = signTone(sign);
                return (
                  <tr key={m.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
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
                    <td className="px-4 py-2 text-muted-foreground">{m.description ?? "—"}</td>
                    <td className="px-4 py-2">{m.account.name}</td>
                    <td className="px-4 py-2 text-right">
                      <Money tone={tone} className="font-medium">
                        {sign > 0 ? "+" : "−"}{fmt(m.amount)}
                      </Money>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/finanzas/movimientos/${m.id}/editar`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
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

      {total > 0 && (
        <Pager
          page={page}
          pageCount={pageCount}
          total={total}
          basePath="/finanzas/movimientos"
          query={{
            from: params.from,
            to: params.to,
            accountId: params.accountId,
            type: params.type,
          }}
        />
      )}
    </div>
  );
}
