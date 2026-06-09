import Link from "next/link";
import { Plus, Sparkles, Search } from "lucide-react";
import { listServicesFiltered } from "@/lib/services/serviceService";
import { listProviders } from "@/lib/providers/providerService";
import { buttonVariants, Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SelectFilter } from "@/components/ui/select-filter";
import { SortSelect } from "@/components/ui/sort-select";
import { Pager } from "@/components/ui/pager";
import { parsePage, buildPaginated } from "@/lib/pagination";
import { SERVICE_SORT_OPTIONS, DEFAULT_SERVICE_SORT } from "@/lib/services/listFilters";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { DeleteServiceButton } from "./DeleteServiceButton";

type Props = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    prestadorId?: string;
    sort?: string;
  }>;
};

export default async function ServiciosPage({ searchParams }: Props) {
  const params = await searchParams;
  const pageParams = parsePage(params.page, 15);
  const sort = params.sort || DEFAULT_SERVICE_SORT;

  const [{ rows, total }, prestadores] = await Promise.all([
    listServicesFiltered({
      q: params.q || undefined,
      prestadorId: params.prestadorId || undefined,
      sort,
      skip: pageParams.skip,
      take: pageParams.take,
    }),
    listProviders(),
  ]);
  const { rows: services, page, pageCount } = buildPaginated(rows, total, pageParams);

  // Filters that should be preserved across pager links.
  const filterQuery = {
    q: params.q,
    prestadorId: params.prestadorId,
    sort: params.sort,
  };
  const hasFilters = Boolean(params.q || params.prestadorId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Servicios"
        action={
          <Link href="/servicios/nuevo" className={cn(buttonVariants())}>
            <Plus className="size-4" />
            Nuevo servicio
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
                placeholder="Nombre o descripción…"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1 w-full sm:w-44">
            <label className="text-sm font-medium">Prestador</label>
            <SelectFilter
              name="prestadorId"
              defaultValue={params.prestadorId ?? ""}
              allLabel="Todos"
              options={prestadores.map((p) => ({ value: p.id, label: p.name }))}
            />
          </div>
          <div className="space-y-1 w-full sm:w-52">
            <label className="text-sm font-medium">Ordenar por</label>
            <SortSelect name="sort" defaultValue={sort} options={SERVICE_SORT_OPTIONS} />
          </div>
          <Button type="submit">Filtrar</Button>
          <Link href="/servicios" className={cn(buttonVariants({ variant: "outline" }))}>
            Limpiar
          </Link>
        </form>
      </Card>

      {services.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={hasFilters ? "Sin resultados" : "Todavía no hay servicios"}
          description={
            hasFilters
              ? "Ningún servicio coincide con los filtros. Probá ajustarlos o limpiarlos."
              : "Cargá los servicios de tu catálogo (salón, torta, animación…) con su costo y precio."
          }
          action={
            hasFilters ? (
              <Link href="/servicios" className={cn(buttonVariants({ variant: "outline" }))}>
                Limpiar filtros
              </Link>
            ) : (
              <Link href="/servicios/nuevo" className={cn(buttonVariants())}>
                <Plus className="size-4" />
                Nuevo servicio
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
                  <th className="px-4 py-3 text-left font-medium">Descripción</th>
                  <th className="px-4 py-3 text-left font-medium">Prestador</th>
                  <th className="px-4 py-3 text-left font-medium">Costo</th>
                  <th className="px-4 py-3 text-left font-medium">Precio</th>
                  <th className="px-4 py-3 text-left font-medium">Ganancia</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate">
                      {s.description ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.prestador?.name ?? "—"}</td>
                    <td className="px-4 py-3">{formatMoney(s.cost)}</td>
                    <td className="px-4 py-3">{formatMoney(s.price)}</td>
                    <td className="px-4 py-3">{formatMoney(s.price - s.cost)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/servicios/${s.id}/editar`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          Editar
                        </Link>
                        <DeleteServiceButton id={s.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <ul className="md:hidden space-y-3">
            {services.map((s) => (
              <li key={s.id} className="rounded-xl border border-border bg-card shadow-sm">
                <div className="p-4">
                  <p className="font-medium truncate">{s.name}</p>
                  {s.description && (
                    <p className="mt-0.5 text-sm text-muted-foreground truncate">{s.description}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.prestador?.name ?? "Sin prestador"}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="text-muted-foreground">Costo {formatMoney(s.cost)}</span>
                    <span className="text-muted-foreground">Precio {formatMoney(s.price)}</span>
                    <span className="font-medium">Ganancia {formatMoney(s.price - s.cost)}</span>
                  </div>
                </div>
                <div className="flex gap-2 border-t border-border/60 px-4 py-2.5">
                  <Link
                    href={`/servicios/${s.id}/editar`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Editar
                  </Link>
                  <DeleteServiceButton id={s.id} />
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
            basePath="/servicios"
            query={filterQuery}
          />
        </div>
      )}
    </div>
  );
}
