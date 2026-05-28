import { prisma } from "@/lib/prisma";
import type { ProviderFormValues } from "./schema";

export async function listProviders() {
  return prisma.provider.findMany({ orderBy: { name: "asc" } });
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
