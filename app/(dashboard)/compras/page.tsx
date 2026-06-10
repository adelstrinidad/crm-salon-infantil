import Link from "next/link";
import { Plus, ShoppingCart, Search } from "lucide-react";
import { listComprasFiltered } from "@/lib/compras/compraService";
import { buttonVariants, Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SortSelect } from "@/components/ui/sort-select";
import { SelectFilter } from "@/components/ui/select-filter";
import { Money } from "@/components/ui/money";
import { Pager } from "@/components/ui/pager";
import { parsePage, buildPaginated } from "@/lib/pagination";
import { COMPRA_SORT_OPTIONS, DEFAULT_COMPRA_SORT } from "@/lib/compras/listFilters";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { DeleteCompraButton } from "./DeleteCompraButton";

type Props = {
  searchParams: Promise<{ page?: string; q?: string; sort?: string; estado?: string }>;
};

const fmtDate = (d: Date) => new Date(d).toLocaleDateString("es-AR");

export default async function ComprasPage({ searchParams }: Props) {
  const params = await searchParams;
  const pageParams = parsePage(params.page, 15);
  const sort = params.sort || DEFAULT_COMPRA_SORT;
  const estado = params.estado ?? "";
  const paid = estado === "pagada" ? true : estado === "pendiente" ? false : undefined;

  const { rows, total } = await listComprasFiltered({
    q: params.q || undefined,
    sort,
    paid,
    skip: pageParams.skip,
    take: pageParams.take,
  });
  const { rows: compras, page, pageCount } = buildPaginated(rows, total, pageParams);

  const filterQuery = { q: params.q, sort: params.sort, estado: params.estado };
  const hasFilters = Boolean(params.q || estado);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compras"
        action={
          <Link href="/compras/nuevo" className={cn(buttonVariants())}>
            <Plus className="size-4" />
            Nueva compra
          </Link>
        }
      />

      <Card className="p-4">
        <form method="GET" className="flex flex-wrap items-end gap-3">
          <div className="space-y-1 w-full sm:w-56">
            <label className="text-sm font-medium">Buscar</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input name="q" defaultValue={params.q ?? ""} placeholder="Proveedor…" className="pl-9" />
            </div>
          </div>
          <div className="space-y-1 w-full sm:w-44">
            <label className="text-sm font-medium">Estado</label>
            <SelectFilter
              name="estado"
              defaultValue={params.estado ?? ""}
              allLabel="Todas"
              options={[
                { value: "pendiente", label: "Pendiente" },
                { value: "pagada", label: "Pagada" },
              ]}
            />
          </div>
          <div className="space-y-1 w-full sm:w-52">
            <label className="text-sm font-medium">Ordenar por</label>
            <SortSelect name="sort" defaultValue={sort} options={COMPRA_SORT_OPTIONS} />
          </div>
          <Button type="submit">Filtrar</Button>
          <Link href="/compras" className={cn(buttonVariants({ variant: "outline" }))}>
            Limpiar
          </Link>
        </form>
      </Card>

      {compras.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title={hasFilters ? "Sin resultados" : "Todavía no hay compras"}
          description={
            hasFilters
              ? "Ninguna compra coincide con los filtros. Probá ajustarlos o limpiarlos."
              : "Registrá las compras de insumos a tus proveedores. Cada compra suma stock y queda pendiente de pago."
          }
          action={
            hasFilters ? (
              <Link href="/compras" className={cn(buttonVariants({ variant: "outline" }))}>
                Limpiar filtros
              </Link>
            ) : (
              <Link href="/compras/nuevo" className={cn(buttonVariants())}>
                <Plus className="size-4" />
                Nueva compra
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
                  <th className="px-4 py-3 text-left font-medium">Proveedor</th>
                  <th className="px-4 py-3 text-left font-medium">Fecha</th>
                  <th className="px-4 py-3 text-right font-medium">Insumos</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {compras.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 font-medium">{c.proveedor.name}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{fmtDate(c.date)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{c._count.lines}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatMoney(c.total)}</td>
                    <td className="px-4 py-3">
                      {c.paid ? (
                        <span className="inline-flex items-center rounded-full border bg-success/10 text-success border-success/20 px-2.5 py-0.5 text-xs font-medium">
                          Pagada
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border bg-amber-100/70 text-amber-900 border-amber-200 px-2.5 py-0.5 text-xs font-medium">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/compras/${c.id}`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          Ver
                        </Link>
                        {!c.paid && <DeleteCompraButton id={c.id} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <ul className="md:hidden space-y-3">
            {compras.map((c) => (
              <li key={c.id} className="rounded-xl border border-border bg-card shadow-sm">
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">{c.proveedor.name}</p>
                    {c.paid ? (
                      <span className="inline-flex shrink-0 items-center rounded-full border bg-success/10 text-success border-success/20 px-2 py-0.5 text-xs font-medium">
                        Pagada
                      </span>
                    ) : (
                      <span className="inline-flex shrink-0 items-center rounded-full border bg-amber-100/70 text-amber-900 border-amber-200 px-2 py-0.5 text-xs font-medium">
                        Pendiente
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {fmtDate(c.date)} · {c._count.lines} insumo{c._count.lines !== 1 ? "s" : ""} ·{" "}
                    <Money className="font-medium text-foreground">{formatMoney(c.total)}</Money>
                  </div>
                </div>
                <div className="flex gap-2 border-t border-border/60 px-4 py-2.5">
                  <Link
                    href={`/compras/${c.id}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Ver
                  </Link>
                  {!c.paid && <DeleteCompraButton id={c.id} />}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {total > 0 && (
        <div className="mt-4">
          <Pager page={page} pageCount={pageCount} total={total} basePath="/compras" query={filterQuery} />
        </div>
      )}
    </div>
  );
}
