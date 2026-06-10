import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import type { StockKind } from "./kinds";
import type { StockAdjustValues } from "./schema";

type Tx = Prisma.TransactionClient;

// Apply one stock change inside a transaction: append the ledger row AND move
// the insumo's running count by the same signed delta. The single chokepoint for
// every stock mutation (compras, adjustments) so the counter and ledger can
// never disagree. Guards against driving stock negative.
export async function applyStockMovement(
  tx: Tx,
  args: { insumoId: string; kind: StockKind; delta: number; reason?: string; compraId?: string },
) {
  const insumo = await tx.insumo.findUnique({ where: { id: args.insumoId } });
  if (!insumo) throw new Error("Insumo no encontrado");
  const next = insumo.stockQty + args.delta;
  if (next < 0) {
    throw new Error(`Stock insuficiente: ${insumo.name} tiene ${insumo.stockQty}`);
  }
  await tx.stockMovement.create({
    data: {
      insumoId: args.insumoId,
      kind: args.kind,
      delta: args.delta,
      reason: args.reason ?? null,
      compraId: args.compraId ?? null,
    },
  });
  await tx.insumo.update({
    where: { id: args.insumoId },
    data: { stockQty: next },
  });
}

// Manual stock adjustment (consumo / merma / ajuste). Wraps applyStockMovement in
// its own transaction.
export async function adjustStock(data: StockAdjustValues) {
  return prisma.$transaction((tx) =>
    applyStockMovement(tx, {
      insumoId: data.insumoId,
      kind: data.kind,
      delta: data.delta,
      reason: data.reason,
    }),
  );
}

// The audit ledger for one insumo, most recent first.
export async function listStockMovements(insumoId: string) {
  return prisma.stockMovement.findMany({
    where: { insumoId },
    orderBy: { createdAt: "desc" },
  });
}
