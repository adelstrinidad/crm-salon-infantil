import { prisma } from "@/lib/prisma";
import type { ProviderFormValues } from "./schema";
import { parseProviderSort } from "./listFilters";
import type { Prisma } from "@/app/generated/prisma/client";

export async function listProviders() {
  return prisma.provider.findMany({ orderBy: { name: "asc" } });
}

// Filtered + sorted + paginated list for the providers table. Builds a Prisma
// `where` from an optional text search (name/role) and an `orderBy` from a
// validated sort string. Returns the page rows plus the total matching count
// so the pager stays correct.
export async function listProvidersFiltered(opts: {
  q?: string;
  sort?: string;
  skip: number;
  take: number;
}) {
  const where: Prisma.ProviderWhereInput = {
    ...(opts.q
      ? {
          OR: [
            { name: { contains: opts.q } },
            { role: { contains: opts.q } },
          ],
        }
      : {}),
  };

  const { field, dir } = parseProviderSort(opts.sort);

  const [rows, total] = await Promise.all([
    prisma.provider.findMany({
      where,
      orderBy: { [field]: dir },
      skip: opts.skip,
      take: opts.take,
    }),
    prisma.provider.count({ where }),
  ]);
  return { rows, total };
}

export async function getProvider(id: string) {
  return prisma.provider.findUniqueOrThrow({ where: { id } });
}

export async function createProvider(data: ProviderFormValues) {
  return prisma.provider.create({ data });
}

export async function updateProvider(id: string, data: ProviderFormValues) {
  return prisma.provider.update({ where: { id }, data });
}

export async function deleteProvider(id: string) {
  return prisma.provider.delete({ where: { id } });
}
