import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { getInsumo } from "@/lib/insumos/insumoService";
import { listStockMovements } from "@/lib/stock/stockService";
import { STOCK_KIND_LABELS, type StockKind } from "@/lib/stock/kinds";
import { INSUMO_UNIT_LABELS, type InsumoUnit } from "@/lib/insumos/schema";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { AdjustStockForm } from "@/components/insumos/AdjustStockForm";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

const fmtDate = (d: Date) => new Date(d).toLocaleDateString("es-AR");
const unitLabel = (u: string) => INSUMO_UNIT_LABELS[u as InsumoUnit] ?? u;
const kindLabel = (k: string) => STOCK_KIND_LABELS[k as StockKind] ?? k;

export default async function InsumoDetailPage({ params }: Props) {
  const { id } = await params;
  const insumo = await getInsumo(id);
  if (!insumo) return notFound();

  const movements = await listStockMovements(id);
  const low = insumo.stockQty <= insumo.minStock;

  return (
    <div className="space-y-6">
      <PageHeader
        title={insumo.name}
        action={
          <div className="flex gap-2">
            <Link href={`/insumos/${insumo.id}/editar`} className={cn(buttonVariants({ variant: "outline" }))}>
              Editar
            </Link>
            <Link href="/insumos" className={cn(buttonVariants({ variant: "outline" }))}>
              Volver
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current stock */}
        <Card className="p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Stock actual</p>
          <p className="text-3xl font-semibold flex items-center gap-2">
            {insumo.stockQty}
            <span className="text-base font-normal text-muted-foreground">{unitLabel(insumo.unit)}</span>
            {low && (
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                <AlertTriangle className="size-3" />
                Bajo (mín. {insumo.minStock})
              </span>
            )}
          </p>
          {insumo.notes && <p className="text-sm text-muted-foreground pt-1">{insumo.notes}</p>}
        </Card>

        {/* Adjust */}
        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-3">Ajustar stock</h2>
          <AdjustStockForm insumoId={insumo.id} />
        </Card>
      </div>

      {/* Ledger */}
      <div>
        <h2 className="text-sm font-semibold mb-2">Movimientos de stock</h2>
        {movements.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay movimientos.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Fecha</th>
                  <th className="px-4 py-3 text-left font-medium">Tipo</th>
                  <th className="px-4 py-3 text-right font-medium">Cambio</th>
                  <th className="px-4 py-3 text-left font-medium">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">{fmtDate(m.createdAt)}</td>
                    <td className="px-4 py-2">{kindLabel(m.kind)}</td>
                    <td
                      className={cn(
                        "px-4 py-2 text-right font-medium",
                        m.delta >= 0 ? "text-success" : "text-loss",
                      )}
                    >
                      {m.delta >= 0 ? `+${m.delta}` : m.delta}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {m.reason ?? (m.compraId ? "Compra registrada" : "—")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
