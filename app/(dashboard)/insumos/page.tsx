import Link from "next/link";
import { Plus, Package, Search, AlertTriangle } from "lucide-react";
import { listInsumosFiltered } from "@/lib/insumos/insumoService";
import { buttonVariants, Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SortSelect } from "@/components/ui/sort-select";
import { Pager } from "@/components/ui/pager";
import { parsePage, buildPaginated } from "@/lib/pagination";
import { INSUMO_SORT_OPTIONS, DEFAULT_INSUMO_SORT } from "@/lib/insumos/listFilters";
import { INSUMO_UNIT_LABELS, type InsumoUnit } from "@/lib/insumos/schema";
import { cn } from "@/lib/utils";
import { DeleteInsumoButton } from "./DeleteInsumoButton";
import type { Insumo } from "@/app/generated/prisma/client";

type Props = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    sort?: string;
  }>;
};

const unitLabel = (u: string) => INSUMO_UNIT_LABELS[u as InsumoUnit] ?? u;
const isLow = (i: Insumo) => i.stockQty <= i.minStock;

export default async function InsumosPage({ searchParams }: Props) {
  const params = await searchParams;
  const pageParams = parsePage(params.page, 15);
  const sort = params.sort || DEFAULT_INSUMO_SORT;

  const { rows, total } = await listInsumosFiltered({
    q: params.q || undefined,
    sort,
    skip: pageParams.skip,
    take: pageParams.take,
  });
  const { rows: insumos, page, pageCount } = buildPaginated(rows, total, pageParams);

  const filterQuery = { q: params.q, sort: params.sort };
  const hasFilters = Boolean(params.q);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insumos"
        action={
          <Link href="/insumos/nuevo" className={cn(buttonVariants())}>
            <Plus className="size-4" />
            Nuevo insumo
          </Link>
        }
      />

      {/* Filters + sort */}
      <Card className="p-4">
        <form method="GET" className="flex flex-wrap items-end gap-3">
          <div className="space-y-1 w-full sm:w-56">
            <label className="text-sm font-medium">Buscar</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Nombre o notas…"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1 w-full sm:w-52">
            <label className="text-sm font-medium">Ordenar por</label>
            <SortSelect name="sort" defaultValue={sort} options={INSUMO_SORT_OPTIONS} />
          </div>
          <Button type="submit">Filtrar</Button>
          <Link href="/insumos" className={cn(buttonVariants({ variant: "outline" }))}>
            Limpiar
          </Link>
        </form>
      </Card>

      {insumos.length === 0 ? (
        <EmptyState
          icon={Package}
          title={hasFilters ? "Sin resultados" : "Todavía no hay insumos"}
          description={
            hasFilters
              ? "Ningún insumo coincide con los filtros. Probá ajustarlos o limpiarlos."
              : "Registrá los insumos que comprás a tus proveedores y su stock disponible."
          }
          action={
            hasFilters ? (
              <Link href="/insumos" className={cn(buttonVariants({ variant: "outline" }))}>
                Limpiar filtros
              </Link>
            ) : (
              <Link href="/insumos/nuevo" className={cn(buttonVariants())}>
                <Plus className="size-4" />
                Nuevo insumo
              </Link>
            )
          }
        />
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Nombre</th>
                  <th className="px-4 py-3 text-left font-medium">Unidad</th>
                  <th className="px-4 py-3 text-right font-medium">Stock</th>
                  <th className="px-4 py-3 text-right font-medium">Mínimo</th>
                  <th className="px-4 py-3 text-left font-medium">Notas</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {insumos.map((i: Insumo) => (
                  <tr key={i.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 font-medium">{i.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{unitLabel(i.unit)}</td>
                    <td className="px-4 py-3 text-right">
                      {isLow(i) ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                          <AlertTriangle className="size-3" />
                          {i.stockQty}
                        </span>
                      ) : (
                        i.stockQty
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{i.minStock}</td>
                    <td className="px-4 py-3 text-muted-foreground">{i.notes ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/insumos/${i.id}/editar`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          Editar
                        </Link>
                        <DeleteInsumoButton id={i.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <ul className="md:hidden space-y-3">
            {insumos.map((i: Insumo) => (
              <li key={i.id} className="rounded-xl border border-border bg-card shadow-sm">
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">{i.name}</p>
                    {isLow(i) && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                        <AlertTriangle className="size-3" />
                        Bajo
                      </span>
                    )}
                  </div>
                  <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                    <p>
                      Stock: <span className="font-medium text-foreground">{i.stockQty}</span> {unitLabel(i.unit)}
                      {" · "}mín. {i.minStock}
                    </p>
                    {i.notes && <p>{i.notes}</p>}
                  </div>
                </div>
                <div className="flex gap-2 border-t border-border/60 px-4 py-2.5">
                  <Link
                    href={`/insumos/${i.id}/editar`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Editar
                  </Link>
                  <DeleteInsumoButton id={i.id} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {total > 0 && (
        <div className="mt-4">
          <Pager
            page={page}
            pageCount={pageCount}
            total={total}
            basePath="/insumos"
            query={filterQuery}
          />
        </div>
      )}
    </div>
  );
}
