import Link from "next/link";
import { Plus, UserCog, Search } from "lucide-react";
import { listProvidersFiltered } from "@/lib/providers/providerService";
import { buttonVariants, Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SortSelect } from "@/components/ui/sort-select";
import { Pager } from "@/components/ui/pager";
import { parsePage, buildPaginated } from "@/lib/pagination";
import { PROVIDER_SORT_OPTIONS, DEFAULT_PROVIDER_SORT } from "@/lib/providers/listFilters";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { DeleteProviderButton } from "./DeleteProviderButton";
import type { Provider } from "@/app/generated/prisma/client";

type Props = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    sort?: string;
  }>;
};

export default async function PrestadoresPage({ searchParams }: Props) {
  const params = await searchParams;
  const pageParams = parsePage(params.page, 15);
  const sort = params.sort || DEFAULT_PROVIDER_SORT;

  const { rows, total } = await listProvidersFiltered({
    q: params.q || undefined,
    sort,
    skip: pageParams.skip,
    take: pageParams.take,
  });
  const { rows: providers, page, pageCount } = buildPaginated(rows, total, pageParams);

  // Filters that should be preserved across pager links.
  const filterQuery = {
    q: params.q,
    sort: params.sort,
  };
  const hasFilters = Boolean(params.q);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prestadores"
        action={
          <Link href="/prestadores/nuevo" className={cn(buttonVariants())}>
            <Plus className="size-4" />
            Nuevo prestador
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
                placeholder="Nombre o rol…"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1 w-full sm:w-52">
            <label className="text-sm font-medium">Ordenar por</label>
            <SortSelect name="sort" defaultValue={sort} options={PROVIDER_SORT_OPTIONS} />
          </div>
          <Button type="submit">Filtrar</Button>
          <Link href="/prestadores" className={cn(buttonVariants({ variant: "outline" }))}>
            Limpiar
          </Link>
        </form>
      </Card>

      {providers.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title={hasFilters ? "Sin resultados" : "Todavía no hay prestadores"}
          description={
            hasFilters
              ? "Ningún prestador coincide con los filtros. Probá ajustarlos o limpiarlos."
              : "Sumá al personal y proveedores de servicio (DJ, animador, fotógrafo…) que asignás a los eventos."
          }
          action={
            hasFilters ? (
              <Link href="/prestadores" className={cn(buttonVariants({ variant: "outline" }))}>
                Limpiar filtros
              </Link>
            ) : (
              <Link href="/prestadores/nuevo" className={cn(buttonVariants())}>
                <Plus className="size-4" />
                Nuevo prestador
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
                  <th className="px-4 py-3 text-left font-medium">Rol</th>
                  <th className="px-4 py-3 text-left font-medium">Costo/evento</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {providers.map((p: Provider) => (
                  <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.role ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatMoney(p.cost)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/prestadores/${p.id}/editar`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          Editar
                        </Link>
                        <DeleteProviderButton id={p.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <ul className="md:hidden space-y-3">
            {providers.map((p: Provider) => (
              <li
                key={p.id}
                className="rounded-xl border border-border bg-card shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground truncate">
                      {p.role ?? "—"}
                    </p>
                    <p className="mt-2 text-sm font-medium">{formatMoney(p.cost)}</p>
                  </div>
                </div>
                <div className="flex gap-2 border-t border-border/60 px-4 py-2.5">
                  <Link
                    href={`/prestadores/${p.id}/editar`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Editar
                  </Link>
                  <DeleteProviderButton id={p.id} />
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
            basePath="/prestadores"
            query={filterQuery}
          />
        </div>
      )}
    </div>
  );
}
