import { prisma } from "@/lib/prisma";
import type { ClientFormInput } from "./schema";
import { parseClientSort } from "./listFilters";
import type { Prisma } from "@/app/generated/prisma/client";

export async function listClients() {
  return prisma.client.findMany({ orderBy: { name: "asc" } });
}

// Filtered + sorted + paginated list for the clients table. Builds a Prisma
// `where` from an optional text search (name/dni/phone/email) and an `orderBy`
// from a validated sort string. Returns the page rows plus the total matching
// count so the pager stays correct.
export async function listClientsFiltered(opts: {
  q?: string;
  sort?: string;
  skip: number;
  take: number;
}) {
  const where: Prisma.ClientWhereInput = opts.q
    ? {
        OR: [
          { name: { contains: opts.q } },
          { dni: { contains: opts.q } },
          { phone: { contains: opts.q } },
          { email: { contains: opts.q } },
        ],
      }
    : {};

  const { field, dir } = parseClientSort(opts.sort);

  const [rows, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { [field]: dir },
      skip: opts.skip,
      take: opts.take,
    }),
    prisma.client.count({ where }),
  ]);
  return { rows, total };
}

export async function getClient(id: string) {
  return prisma.client.findUniqueOrThrow({ where: { id } });
}

export async function getClientWithEvents(id: string) {
  return prisma.client.findUniqueOrThrow({
    where: { id },
    include: {
      events: { orderBy: { startAt: "desc" } },
    },
  });
}

export async function createClient(data: ClientFormInput) {
  return prisma.client.create({ data });
}

export async function updateClient(id: string, data: ClientFormInput) {
  return prisma.client.update({ where: { id }, data });
}

export async function deleteClient(id: string) {
  return prisma.client.delete({ where: { id } });
}
