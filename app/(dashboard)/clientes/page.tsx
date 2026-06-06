import Link from "next/link";
import { Plus, Users, ChevronRight, Search } from "lucide-react";
import { listClientsFiltered } from "@/lib/clients/clientService";
import { buttonVariants, Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Pager } from "@/components/ui/pager";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SortSelect } from "@/components/ui/sort-select";
import { parsePage, buildPaginated } from "@/lib/pagination";
import { CLIENT_SORT_OPTIONS, DEFAULT_CLIENT_SORT } from "@/lib/clients/listFilters";
import { cn } from "@/lib/utils";
import type { Client } from "@/app/generated/prisma/client";
import { DeleteClientButton } from "./DeleteClientButton";

type Props = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    sort?: string;
  }>;
};

export default async function ClientesPage({ searchParams }: Props) {
  const params = await searchParams;
  const pageParams = parsePage(params.page, 15);

  const sort = params.sort || DEFAULT_CLIENT_SORT;

  const { rows, total } = await listClientsFiltered({
    q: params.q || undefined,
    sort,
    skip: pageParams.skip,
    take: pageParams.take,
  });
  const { rows: clients, page, pageCount } = buildPaginated(rows, total, pageParams);

  // Filters that should be preserved across pager links.
  const filterQuery = {
    q: params.q,
    sort: params.sort,
  };
  const hasFilters = Boolean(params.q);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        action={
          <Link href="/clientes/nuevo" className={cn(buttonVariants())}>
            <Plus className="size-4" />
            Nuevo cliente
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
                placeholder="Nombre, DNI, teléfono o email…"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1 w-full sm:w-52">
            <label className="text-sm font-medium">Ordenar por</label>
            <SortSelect name="sort" defaultValue={sort} options={CLIENT_SORT_OPTIONS} />
          </div>
          <Button type="submit">Filtrar</Button>
          <Link href="/clientes" className={cn(buttonVariants({ variant: "outline" }))}>
            Limpiar
          </Link>
        </form>
      </Card>

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title={hasFilters ? "Sin resultados" : "Todavía no hay clientes"}
          description={
            hasFilters
              ? "Ningún cliente coincide con la búsqueda. Probá ajustarla o limpiarla."
              : "Registrá tu primer cliente para empezar a asociar eventos y contactos."
          }
          action={
            hasFilters ? (
              <Link href="/clientes" className={cn(buttonVariants({ variant: "outline" }))}>
                Limpiar filtros
              </Link>
            ) : (
              <Link href="/clientes/nuevo" className={cn(buttonVariants())}>
                <Plus className="size-4" />
                Nuevo cliente
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
                  <th className="px-4 py-3 text-left font-medium">Teléfono</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {clients.map((c: Client) => (
                  <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/clientes/${c.id}`} className="hover:underline">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/clientes/${c.id}/editar`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          Editar
                        </Link>
                        <DeleteClientButton id={c.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <ul className="md:hidden space-y-3">
            {clients.map((c: Client) => (
              <li key={c.id} className="rounded-xl border border-border bg-card shadow-sm">
                <Link
                  href={`/clientes/${c.id}`}
                  className="flex items-start justify-between gap-3 p-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{c.name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground truncate">
                      {c.phone ?? "—"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground truncate">{c.email ?? "—"}</p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground mt-1" />
                </Link>
                <div className="flex gap-2 border-t border-border/60 px-4 py-2.5">
                  <Link
                    href={`/clientes/${c.id}/editar`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Editar
                  </Link>
                  <DeleteClientButton id={c.id} />
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
            basePath="/clientes"
            query={filterQuery}
          />
        </div>
      )}
    </div>
  );
}
