import { prisma } from "@/lib/prisma";
import type { ServiceFormValues } from "./schema";
import { parseServiceSort } from "./listFilters";
import type { Prisma } from "@/app/generated/prisma/client";

export async function listServices() {
  return prisma.service.findMany({ orderBy: { name: "asc" }, include: { prestador: true } });
}

// Filtered + sorted + paginated list for the services table. Builds a Prisma
// `where` from optional filters (text search, prestador) and an `orderBy` from a
// validated sort string. Returns the page rows plus the total matching count so
// the pager stays correct.
export async function listServicesFiltered(opts: {
  q?: string;
  prestadorId?: string;
  sort?: string;
  skip: number;
  take: number;
}) {
  const where: Prisma.ServiceWhereInput = {
    ...(opts.q
      ? {
          OR: [
            { name: { contains: opts.q } },
            { description: { contains: opts.q } },
          ],
        }
      : {}),
    ...(opts.prestadorId ? { prestadorId: opts.prestadorId } : {}),
  };

  const { field, dir } = parseServiceSort(opts.sort);

  const [rows, total] = await Promise.all([
    prisma.service.findMany({
      where,
      include: { prestador: true },
      orderBy: { [field]: dir },
      skip: opts.skip,
      take: opts.take,
    }),
    prisma.service.count({ where }),
  ]);
  return { rows, total };
}

export async function getService(id: string) {
  return prisma.service.findUniqueOrThrow({ where: { id }, include: { prestador: true } });
}

export async function createService(data: ServiceFormValues) {
  return prisma.service.create({ data });
}

export async function updateService(id: string, data: ServiceFormValues) {
  return prisma.service.update({ where: { id }, data });
}

export async function deleteService(id: string) {
  return prisma.service.delete({ where: { id } });
}
