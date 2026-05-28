import { prisma } from "@/lib/prisma";
import { ProveedorFormValues } from "./schema";

export async function listProveedores() {
  return prisma.proveedor.findMany({ orderBy: { name: "asc" } });
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
