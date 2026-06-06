import Link from "next/link";
import { Plus, Truck, Search } from "lucide-react";
import { listProveedoresFiltered } from "@/lib/proveedores/proveedorService";
import { buttonVariants, Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SortSelect } from "@/components/ui/sort-select";
import { Pager } from "@/components/ui/pager";
import { parsePage, buildPaginated } from "@/lib/pagination";
import {
  PROVEEDOR_SORT_OPTIONS,
  DEFAULT_PROVEEDOR_SORT,
} from "@/lib/proveedores/listFilters";
import { cn } from "@/lib/utils";
import { DeleteProveedorButton } from "./DeleteProveedorButton";
import type { Proveedor } from "@/app/generated/prisma/client";

type Props = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    sort?: string;
  }>;
};

export default async function ProveedoresPage({ searchParams }: Props) {
  const params = await searchParams;
  const pageParams = parsePage(params.page, 15);
  const sort = params.sort || DEFAULT_PROVEEDOR_SORT;

  const { rows, total } = await listProveedoresFiltered({
    q: params.q || undefined,
    sort,
    skip: pageParams.skip,
    take: pageParams.take,
  });
  const { rows: proveedores, page, pageCount } = buildPaginated(rows, total, pageParams);

  // Filters that should be preserved across pager links.
  const filterQuery = {
    q: params.q,
    sort: params.sort,
  };
  const hasFilters = Boolean(params.q);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proveedores"
        action={
          <Link href="/proveedores/nuevo" className={cn(buttonVariants())}>
            <Plus className="size-4" />
            Nuevo proveedor
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
                placeholder="Nombre, teléfono o email…"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1 w-full sm:w-52">
            <label className="text-sm font-medium">Ordenar por</label>
            <SortSelect name="sort" defaultValue={sort} options={PROVEEDOR_SORT_OPTIONS} />
          </div>
          <Button type="submit">Filtrar</Button>
          <Link href="/proveedores" className={cn(buttonVariants({ variant: "outline" }))}>
            Limpiar
          </Link>
        </form>
      </Card>

      {proveedores.length === 0 ? (
        <EmptyState
          icon={Truck}
          title={hasFilters ? "Sin resultados" : "Todavía no hay proveedores"}
          description={
            hasFilters
              ? "Ningún proveedor coincide con los filtros. Probá ajustarlos o limpiarlos."
              : "Registrá los proveedores externos que abastecen tus servicios."
          }
          action={
            hasFilters ? (
              <Link href="/proveedores" className={cn(buttonVariants({ variant: "outline" }))}>
                Limpiar filtros
              </Link>
            ) : (
              <Link href="/proveedores/nuevo" className={cn(buttonVariants())}>
                <Plus className="size-4" />
                Nuevo proveedor
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
                  <th className="px-4 py-3 text-left font-medium">Teléfono</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {proveedores.map((p: Proveedor) => (
                  <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.description ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/proveedores/${p.id}/editar`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          Editar
                        </Link>
                        <DeleteProveedorButton id={p.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <ul className="md:hidden space-y-3">
            {proveedores.map((p: Proveedor) => (
              <li key={p.id} className="rounded-xl border border-border bg-card shadow-sm">
                <div className="p-4">
                  <p className="font-medium truncate">{p.name}</p>
                  {p.description && (
                    <p className="mt-0.5 text-sm text-muted-foreground truncate">
                      {p.description}
                    </p>
                  )}
                  <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                    {p.phone && <p>{p.phone}</p>}
                    {p.email && <p>{p.email}</p>}
                  </div>
                </div>
                <div className="flex gap-2 border-t border-border/60 px-4 py-2.5">
                  <Link
                    href={`/proveedores/${p.id}/editar`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Editar
                  </Link>
                  <DeleteProveedorButton id={p.id} />
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
            basePath="/proveedores"
            query={filterQuery}
          />
        </div>
      )}
    </div>
  );
}
