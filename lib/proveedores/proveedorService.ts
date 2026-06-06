import { prisma } from "@/lib/prisma";
import { ProveedorFormValues } from "./schema";
import { parseProveedorSort } from "./listFilters";
import type { Prisma } from "@/app/generated/prisma/client";

export async function listProveedores() {
  return prisma.proveedor.findMany({ orderBy: { name: "asc" } });
}

// Filtered + sorted + paginated list for the proveedores table. Builds a Prisma
// `where` from an optional text search (name/description/phone/email) and an
// `orderBy` from a validated sort string. Returns the page rows plus the total
// matching count so the pager stays correct.
export async function listProveedoresFiltered(opts: {
  q?: string;
  sort?: string;
  skip: number;
  take: number;
}) {
  const where: Prisma.ProveedorWhereInput = opts.q
    ? {
        OR: [
          { name: { contains: opts.q } },
          { description: { contains: opts.q } },
          { phone: { contains: opts.q } },
          { email: { contains: opts.q } },
        ],
      }
    : {};

  const { field, dir } = parseProveedorSort(opts.sort);

  const [rows, total] = await Promise.all([
    prisma.proveedor.findMany({
      where,
      orderBy: { [field]: dir },
      skip: opts.skip,
      take: opts.take,
    }),
    prisma.proveedor.count({ where }),
  ]);
  return { rows, total };
}

export async function getProveedor(id: string) {
  return prisma.proveedor.findUnique({ where: { id } });
}

export async function createProveedor(data: ProveedorFormValues) {
  return prisma.proveedor.create({ data: { ...data, email: data.email || null } });
}

export async function updateProveedor(id: string, data: ProveedorFormValues) {
  return prisma.proveedor.update({ where: { id }, data: { ...data, email: data.email || null } });
}

export async function deleteProveedor(id: string) {
  return prisma.proveedor.delete({ where: { id } });
}
