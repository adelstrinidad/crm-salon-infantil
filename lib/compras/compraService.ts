import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import type { MovementFormValues } from "@/lib/finanzas/schema";
import type { CompraValues } from "./schema";
import { computeCompraTotal } from "./calc";
import { parseCompraSort } from "./listFilters";

// Record a purchase. Atomically: create the Compra + its lines, and raise each
// line's insumo stock by the purchased qty. The total is derived from the lines
// (never trusted from the client). Either everything commits or nothing does, so
// stock can never drift from the recorded lines.
export async function createCompra(data: CompraValues) {
  const total = computeCompraTotal(data.lines);
  return prisma.$transaction(async (tx) => {
    const compra = await tx.compra.create({
      data: {
        proveedorId: data.proveedorId,
        date: data.date,
        notes: data.notes ?? null,
        total,
        lines: {
          create: data.lines.map((l) => ({
            insumoId: l.insumoId,
            qty: l.qty,
            unitCost: l.unitCost,
          })),
        },
      },
    });
    for (const l of data.lines) {
      await tx.insumo.update({
        where: { id: l.insumoId },
        data: { stockQty: { increment: l.qty } },
      });
    }
    return compra;
  });
}

// Filtered + sorted + paginated list for the compras table. `q` matches the
// proveedor name; `paid` narrows by settlement state. Returns rows (with
// proveedor + line count) plus the total matching count for the pager.
export async function listComprasFiltered(opts: {
  q?: string;
  sort?: string;
  paid?: boolean;
  skip: number;
  take: number;
}) {
  const where: Prisma.CompraWhereInput = {
    ...(opts.q ? { proveedor: { name: { contains: opts.q } } } : {}),
    ...(opts.paid !== undefined ? { paid: opts.paid } : {}),
  };
  const { field, dir } = parseCompraSort(opts.sort);

  const [rows, total] = await Promise.all([
    prisma.compra.findMany({
      where,
      orderBy: { [field]: dir },
      skip: opts.skip,
      take: opts.take,
      include: { proveedor: true, _count: { select: { lines: true } } },
    }),
    prisma.compra.count({ where }),
  ]);
  return { rows, total };
}

export async function getCompra(id: string) {
  return prisma.compra.findUnique({
    where: { id },
    include: { proveedor: true, lines: { include: { insumo: true } } },
  });
}

// Delete an unpaid purchase, reversing the stock it had added. Paid purchases
// can't be deleted (their EGRESO movement already posted) — fix by editing the
// movement, not by erasing history. Throws if the compra is paid.
export async function deleteCompra(id: string) {
  return prisma.$transaction(async (tx) => {
    const compra = await tx.compra.findUnique({
      where: { id },
      include: { lines: true },
    });
    if (!compra) return;
    if (compra.paid) {
      throw new Error("No se puede eliminar una compra ya pagada");
    }
    for (const l of compra.lines) {
      await tx.insumo.update({
        where: { id: l.insumoId },
        data: { stockQty: { decrement: l.qty } },
      });
    }
    await tx.compra.delete({ where: { id } }); // cascade removes lines
  });
}

// Purchases for the Pago a proveedores page: filter by settlement state, date
// range, and proveedor. Includes the proveedor + line count for display.
export async function getCompraPayments(opts: {
  from?: Date;
  to?: Date;
  proveedorId?: string;
  paid?: boolean;
}) {
  return prisma.compra.findMany({
    where: {
      ...(opts.proveedorId ? { proveedorId: opts.proveedorId } : {}),
      ...(opts.paid !== undefined ? { paid: opts.paid } : {}),
      date: {
        ...(opts.from ? { gte: opts.from } : {}),
        ...(opts.to ? { lte: opts.to } : {}),
      },
    },
    include: { proveedor: true, _count: { select: { lines: true } } },
    orderBy: { date: "asc" },
  });
}

// Settle a purchase atomically: mark it paid AND record the EGRESO movement in a
// single transaction (mirrors payProvider/payStaff). Either both commit or
// neither, so a compra is never marked paid without its cash-outflow movement.
export async function payCompra(compraId: string, movement: MovementFormValues) {
  const [, created] = await prisma.$transaction([
    prisma.compra.update({
      where: { id: compraId },
      data: { paid: true, paidAt: new Date() },
    }),
    prisma.movement.create({ data: movement }),
  ]);
  return created;
}
