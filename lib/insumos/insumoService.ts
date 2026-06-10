import { prisma } from "@/lib/prisma";
import { InsumoFormValues } from "./schema";
import { parseInsumoSort } from "./listFilters";
import type { Prisma } from "@/app/generated/prisma/client";

export async function listInsumos() {
  return prisma.insumo.findMany({ orderBy: { name: "asc" } });
}

// Filtered + sorted + paginated list for the insumos table. Builds a Prisma
// `where` from an optional text search (name/notes) and an `orderBy` from a
// validated sort string. Returns the page rows plus the total matching count
// so the pager stays correct.
export async function listInsumosFiltered(opts: {
  q?: string;
  sort?: string;
  lowStock?: boolean;
  skip: number;
  take: number;
}) {
  const where: Prisma.InsumoWhereInput = {
    ...(opts.q
      ? { OR: [{ name: { contains: opts.q } }, { notes: { contains: opts.q } }] }
      : {}),
    // Low-stock: on-hand at or below the alert threshold. Field-reference compare
    // (stockQty ≤ minStock) keeps the filter in SQL so pagination stays correct.
    ...(opts.lowStock ? { stockQty: { lte: prisma.insumo.fields.minStock } } : {}),
  };

  const { field, dir } = parseInsumoSort(opts.sort);

  const [rows, total] = await Promise.all([
    prisma.insumo.findMany({
      where,
      orderBy: { [field]: dir },
      skip: opts.skip,
      take: opts.take,
    }),
    prisma.insumo.count({ where }),
  ]);
  return { rows, total };
}

export async function getInsumo(id: string) {
  return prisma.insumo.findUnique({ where: { id } });
}

export async function createInsumo(data: InsumoFormValues) {
  return prisma.insumo.create({ data: { ...data, notes: data.notes || null } });
}

export async function updateInsumo(id: string, data: InsumoFormValues) {
  return prisma.insumo.update({ where: { id }, data: { ...data, notes: data.notes || null } });
}

export async function deleteInsumo(id: string) {
  return prisma.insumo.delete({ where: { id } });
}
