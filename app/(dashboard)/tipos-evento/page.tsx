import Link from "next/link";
import { Plus, Tags, Search } from "lucide-react";
import { listEventTypesFiltered } from "@/lib/eventTypes/eventTypeService";
import { buttonVariants, Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Pager } from "@/components/ui/pager";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SortSelect } from "@/components/ui/sort-select";
import { parsePage, buildPaginated } from "@/lib/pagination";
import {
  EVENT_TYPE_SORT_OPTIONS,
  DEFAULT_EVENT_TYPE_SORT,
} from "@/lib/eventTypes/listFilters";
import { cn } from "@/lib/utils";
import { DeleteEventTypeButton } from "./DeleteEventTypeButton";

type Props = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    sort?: string;
  }>;
};

export default async function TiposEventoPage({ searchParams }: Props) {
  const params = await searchParams;
  const pageParams = parsePage(params.page, 15);

  const sort = params.sort || DEFAULT_EVENT_TYPE_SORT;

  const { rows, total } = await listEventTypesFiltered({
    q: params.q || undefined,
    sort,
    skip: pageParams.skip,
    take: pageParams.take,
  });
  const { rows: types, page, pageCount } = buildPaginated(rows, total, pageParams);

  // Filters that should be preserved across pager links.
  const filterQuery = {
    q: params.q,
    sort: params.sort,
  };
  const hasFilters = Boolean(params.q);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tipos de evento"
        action={
          <Link href="/tipos-evento/nuevo" className={cn(buttonVariants())}>
            <Plus className="size-4" />
            Nuevo tipo
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
                placeholder="Nombre…"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1 w-full sm:w-52">
            <label className="text-sm font-medium">Ordenar por</label>
            <SortSelect name="sort" defaultValue={sort} options={EVENT_TYPE_SORT_OPTIONS} />
          </div>
          <Button type="submit">Filtrar</Button>
          <Link href="/tipos-evento" className={cn(buttonVariants({ variant: "outline" }))}>
            Limpiar
          </Link>
        </form>
      </Card>

      {types.length === 0 ? (
        <EmptyState
          icon={Tags}
          title={hasFilters ? "Sin resultados" : "Todavía no hay tipos de evento"}
          description={
            hasFilters
              ? "Ningún tipo coincide con la búsqueda. Probá ajustarla o limpiarla."
              : "Creá tu primer tipo de evento para usarlo en los eventos."
          }
          action={
            hasFilters ? (
              <Link href="/tipos-evento" className={cn(buttonVariants({ variant: "outline" }))}>
                Limpiar filtros
              </Link>
            ) : (
              <Link href="/tipos-evento/nuevo" className={cn(buttonVariants())}>
                <Plus className="size-4" />
                Nuevo tipo
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
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {types.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 font-medium">{t.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/tipos-evento/${t.id}/editar`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          Editar
                        </Link>
                        <DeleteEventTypeButton id={t.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <ul className="md:hidden space-y-3">
            {types.map((t) => (
              <li key={t.id} className="rounded-xl border border-border bg-card shadow-sm">
                <div className="p-4 font-medium">{t.name}</div>
                <div className="flex gap-2 border-t border-border/60 px-4 py-2.5">
                  <Link
                    href={`/tipos-evento/${t.id}/editar`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Editar
                  </Link>
                  <DeleteEventTypeButton id={t.id} />
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
            basePath="/tipos-evento"
            query={filterQuery}
          />
        </div>
      )}
    </div>
  );
}
