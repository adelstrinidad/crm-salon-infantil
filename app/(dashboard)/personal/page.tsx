import Link from "next/link";
import { Plus, UsersRound, Search } from "lucide-react";
import { listStaffFiltered } from "@/lib/staff/staffService";
import { buttonVariants, Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SortSelect } from "@/components/ui/sort-select";
import { Pager } from "@/components/ui/pager";
import { parsePage, buildPaginated } from "@/lib/pagination";
import { STAFF_SORT_OPTIONS, DEFAULT_STAFF_SORT } from "@/lib/staff/listFilters";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { DeleteStaffButton } from "./DeleteStaffButton";
import type { Staff } from "@/app/generated/prisma/client";

type Props = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    sort?: string;
  }>;
};

function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center rounded-full border bg-success/10 text-success border-success/20 px-2.5 py-0.5 text-xs font-medium">
      Activo
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full border bg-muted text-muted-foreground border-border px-2.5 py-0.5 text-xs font-medium">
      Inactivo
    </span>
  );
}

export default async function PersonalPage({ searchParams }: Props) {
  const params = await searchParams;
  const pageParams = parsePage(params.page, 15);
  const sort = params.sort || DEFAULT_STAFF_SORT;

  const { rows, total } = await listStaffFiltered({
    q: params.q || undefined,
    sort,
    skip: pageParams.skip,
    take: pageParams.take,
  });
  const { rows: staff, page, pageCount } = buildPaginated(rows, total, pageParams);

  const filterQuery = {
    q: params.q,
    sort: params.sort,
  };
  const hasFilters = Boolean(params.q);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personal"
        action={
          <Link href="/personal/nuevo" className={cn(buttonVariants())}>
            <Plus className="size-4" />
            Nuevo empleado
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
            <SortSelect name="sort" defaultValue={sort} options={STAFF_SORT_OPTIONS} />
          </div>
          <Button type="submit">Filtrar</Button>
          <Link href="/personal" className={cn(buttonVariants({ variant: "outline" }))}>
            Limpiar
          </Link>
        </form>
      </Card>

      {staff.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title={hasFilters ? "Sin resultados" : "Todavía no hay personal"}
          description={
            hasFilters
              ? "Ningún empleado coincide con los filtros. Probá ajustarlos o limpiarlos."
              : "Sumá a los empleados internos (mozos, coordinadores, limpieza…) que trabajan por hora en los eventos."
          }
          action={
            hasFilters ? (
              <Link href="/personal" className={cn(buttonVariants({ variant: "outline" }))}>
                Limpiar filtros
              </Link>
            ) : (
              <Link href="/personal/nuevo" className={cn(buttonVariants())}>
                <Plus className="size-4" />
                Nuevo empleado
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
                  <th className="px-4 py-3 text-left font-medium">Costo/hora</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {staff.map((s: Staff) => (
                  <tr key={s.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.role ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatMoney(s.hourlyRate)}
                    </td>
                    <td className="px-4 py-3">
                      <ActiveBadge active={s.active} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/personal/${s.id}/editar`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          Editar
                        </Link>
                        <DeleteStaffButton id={s.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <ul className="md:hidden space-y-3">
            {staff.map((s: Staff) => (
              <li key={s.id} className="rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{s.name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground truncate">
                      {s.role ?? "—"}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <ActiveBadge active={s.active} />
                      <span className="text-sm font-medium">{formatMoney(s.hourlyRate)}/h</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 border-t border-border/60 px-4 py-2.5">
                  <Link
                    href={`/personal/${s.id}/editar`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Editar
                  </Link>
                  <DeleteStaffButton id={s.id} />
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
            basePath="/personal"
            query={filterQuery}
          />
        </div>
      )}
    </div>
  );
}
