import { prisma } from "@/lib/prisma";
import type { ServiceFormValues } from "./schema";

export async function listServices() {
  return prisma.service.findMany({ orderBy: { name: "asc" }, include: { proveedor: true } });
}

export async function getService(id: string) {
  return prisma.service.findUniqueOrThrow({ where: { id }, include: { proveedor: true } });
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
