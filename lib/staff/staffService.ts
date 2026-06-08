import { prisma } from "@/lib/prisma";
import type { StaffFormValues } from "./schema";
import { parseStaffSort } from "./listFilters";
import type { Prisma } from "@/app/generated/prisma/client";

export async function listStaff() {
  return prisma.staff.findMany({ orderBy: { name: "asc" } });
}

// Filtered + sorted + paginated list for the Personal table. Builds a Prisma
// `where` from an optional text search (name/role) and an `orderBy` from a
// validated sort string. Returns the page rows plus the total matching count
// so the pager stays correct.
export async function listStaffFiltered(opts: {
  q?: string;
  sort?: string;
  skip: number;
  take: number;
}) {
  const where: Prisma.StaffWhereInput = {
    ...(opts.q
      ? {
          OR: [
            { name: { contains: opts.q } },
            { role: { contains: opts.q } },
          ],
        }
      : {}),
  };

  const { field, dir } = parseStaffSort(opts.sort);

  const [rows, total] = await Promise.all([
    prisma.staff.findMany({
      where,
      orderBy: { [field]: dir },
      skip: opts.skip,
      take: opts.take,
    }),
    prisma.staff.count({ where }),
  ]);
  return { rows, total };
}

export async function getStaff(id: string) {
  return prisma.staff.findUniqueOrThrow({ where: { id } });
}

export async function createStaff(data: StaffFormValues) {
  return prisma.staff.create({ data });
}

export async function updateStaff(id: string, data: StaffFormValues) {
  return prisma.staff.update({ where: { id }, data });
}

export async function deleteStaff(id: string) {
  return prisma.staff.delete({ where: { id } });
}
