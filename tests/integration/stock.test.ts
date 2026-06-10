import { describe, it, expect, beforeEach } from "vitest";
import { resetDb, makeProveedor, makeInsumo, prisma } from "./setup/db";
import { adjustStock, listStockMovements } from "@/lib/stock/stockService";
import { createCompra, deleteCompra } from "@/lib/compras/compraService";

// Integration tests for the stock ledger: manual adjustments, the negative
// guard, and the compra ↔ ledger coupling (counter + ledger stay in sync).

beforeEach(async () => {
  await resetDb();
});

describe("adjustStock", () => {
  it("appends a ledger row and moves the running count", async () => {
    const insumo = await makeInsumo({ stockQty: 10 });

    await adjustStock({ insumoId: insumo.id, kind: "consumo", delta: -3, reason: "fiesta" });

    const after = await prisma.insumo.findUnique({ where: { id: insumo.id } });
    expect(after!.stockQty).toBe(7);

    const ledger = await listStockMovements(insumo.id);
    expect(ledger).toHaveLength(1);
    expect(ledger[0].delta).toBe(-3);
    expect(ledger[0].kind).toBe("consumo");
    expect(ledger[0].reason).toBe("fiesta");
  });

  it("adds stock on a positive ajuste", async () => {
    const insumo = await makeInsumo({ stockQty: 4 });
    await adjustStock({ insumoId: insumo.id, kind: "ajuste", delta: 6 });
    expect((await prisma.insumo.findUnique({ where: { id: insumo.id } }))!.stockQty).toBe(10);
  });

  it("refuses to drive stock negative (no row, no change)", async () => {
    const insumo = await makeInsumo({ stockQty: 2 });
    await expect(
      adjustStock({ insumoId: insumo.id, kind: "consumo", delta: -5 }),
    ).rejects.toThrow(/insuficiente/i);
    expect((await prisma.insumo.findUnique({ where: { id: insumo.id } }))!.stockQty).toBe(2);
    expect(await listStockMovements(insumo.id)).toHaveLength(0);
  });
});

describe("compra ↔ stock ledger", () => {
  it("createCompra appends a 'compra' ledger row per line and raises stock", async () => {
    const prov = await makeProveedor();
    const insumo = await makeInsumo({ stockQty: 5 });

    const compra = await createCompra({
      proveedorId: prov.id,
      date: new Date("2026-06-10T12:00:00"),
      lines: [{ insumoId: insumo.id, qty: 12, unitCost: 800 }],
    });

    expect((await prisma.insumo.findUnique({ where: { id: insumo.id } }))!.stockQty).toBe(17);
    const ledger = await listStockMovements(insumo.id);
    expect(ledger).toHaveLength(1);
    expect(ledger[0].kind).toBe("compra");
    expect(ledger[0].delta).toBe(12);
    expect(ledger[0].compraId).toBe(compra.id);
  });

  it("deleting an unpaid compra removes its ledger rows and reverses stock", async () => {
    const prov = await makeProveedor();
    const insumo = await makeInsumo({ stockQty: 0 });
    const compra = await createCompra({
      proveedorId: prov.id,
      date: new Date("2026-06-10T12:00:00"),
      lines: [{ insumoId: insumo.id, qty: 8, unitCost: 500 }],
    });
    expect((await prisma.insumo.findUnique({ where: { id: insumo.id } }))!.stockQty).toBe(8);

    await deleteCompra(compra.id);

    expect((await prisma.insumo.findUnique({ where: { id: insumo.id } }))!.stockQty).toBe(0);
    expect(await listStockMovements(insumo.id)).toHaveLength(0); // cascade removed
  });
});
