import { prisma } from "@/lib/prisma";
import type { ClientFormInput } from "./schema";

export async function listClients() {
  return prisma.client.findMany({ orderBy: { name: "asc" } });
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
