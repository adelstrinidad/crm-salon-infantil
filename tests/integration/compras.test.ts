import { describe, it, expect, beforeEach } from "vitest";
import { resetDb, makeProveedor, makeInsumo, makeAccount, prisma } from "./setup/db";
import {
  createCompra,
  deleteCompra,
  getCompra,
  getCompraPayments,
  payCompra,
  settleCompraPayment,
  listComprasFiltered,
} from "@/lib/compras/compraService";

// Integration tests for the compras (purchases) flow against a real migrated DB:
// stock side-effects, total derivation, settlement atomicity, and the list/pay
// queries the UI uses.

beforeEach(async () => {
  await resetDb();
});

describe("createCompra", () => {
  it("derives the total and raises each insumo's stock", async () => {
    const prov = await makeProveedor();
    const gaseosa = await makeInsumo({ name: "Gaseosa", stockQty: 5 });
    const hielo = await makeInsumo({ name: "Hielo", stockQty: 0 });

    const compra = await createCompra({
      proveedorId: prov.id,
      date: new Date("2026-06-10T12:00:00"),
      lines: [
        { insumoId: gaseosa.id, qty: 12, unitCost: 800 },
        { insumoId: hielo.id, qty: 4, unitCost: 1200 },
      ],
    });

    expect(compra.total).toBe(12 * 800 + 4 * 1200); // 14400
    expect((await prisma.insumo.findUnique({ where: { id: gaseosa.id } }))!.stockQty).toBe(17);
    expect((await prisma.insumo.findUnique({ where: { id: hielo.id } }))!.stockQty).toBe(4);

    const full = await getCompra(compra.id);
    expect(full!.lines).toHaveLength(2);
    expect(full!.paid).toBe(false);
  });
});

describe("deleteCompra", () => {
  it("reverses the stock it added", async () => {
    const prov = await makeProveedor();
    const insumo = await makeInsumo({ stockQty: 10 });
    const compra = await createCompra({
      proveedorId: prov.id,
      date: new Date("2026-06-10T12:00:00"),
      lines: [{ insumoId: insumo.id, qty: 6, unitCost: 500 }],
    });
    expect((await prisma.insumo.findUnique({ where: { id: insumo.id } }))!.stockQty).toBe(16);

    await deleteCompra(compra.id);
    expect((await prisma.insumo.findUnique({ where: { id: insumo.id } }))!.stockQty).toBe(10);
    expect(await getCompra(compra.id)).toBeNull();
  });

  it("refuses to delete a paid compra", async () => {
    const prov = await makeProveedor();
    const insumo = await makeInsumo({ stockQty: 0 });
    const account = await makeAccount();
    const compra = await createCompra({
      proveedorId: prov.id,
      date: new Date("2026-06-10T12:00:00"),
      lines: [{ insumoId: insumo.id, qty: 2, unitCost: 500 }],
    });
    await payCompra(compra.id, {
      accountId: account.id,
      type: "EGRESO",
      amount: compra.total,
      description: "pago",
      date: new Date(),
      toAccountId: undefined,
      eventId: undefined,
    });

    await expect(deleteCompra(compra.id)).rejects.toThrow(/pagada/);
    // stock stays raised (delete rolled back)
    expect((await prisma.insumo.findUnique({ where: { id: insumo.id } }))!.stockQty).toBe(2);
  });
});

describe("payCompra", () => {
  it("marks paid and records the EGRESO movement atomically", async () => {
    const prov = await makeProveedor();
    const insumo = await makeInsumo({ stockQty: 0 });
    const account = await makeAccount();
    const compra = await createCompra({
      proveedorId: prov.id,
      date: new Date("2026-06-10T12:00:00"),
      lines: [{ insumoId: insumo.id, qty: 3, unitCost: 1000 }],
    });

    await payCompra(compra.id, {
      accountId: account.id,
      type: "EGRESO",
      amount: compra.total,
      description: "Compra test",
      date: new Date(),
      toAccountId: undefined,
      eventId: undefined,
    });

    const settled = await getCompra(compra.id);
    expect(settled!.paid).toBe(true);
    expect(settled!.paidAt).not.toBeNull();

    const movements = await prisma.movement.findMany({ where: { accountId: account.id } });
    expect(movements).toHaveLength(1);
    expect(movements[0].type).toBe("EGRESO");
    expect(movements[0].amount).toBe(3000);
  });
});

describe("getCompraPayments / listComprasFiltered", () => {
  it("filters by paid state", async () => {
    const prov = await makeProveedor();
    const insumo = await makeInsumo({ stockQty: 0 });
    const account = await makeAccount();
    const paidCompra = await createCompra({
      proveedorId: prov.id,
      date: new Date("2026-06-10T12:00:00"),
      lines: [{ insumoId: insumo.id, qty: 1, unitCost: 100 }],
    });
    await createCompra({
      proveedorId: prov.id,
      date: new Date("2026-06-10T12:00:00"),
      lines: [{ insumoId: insumo.id, qty: 1, unitCost: 200 }],
    });
    await payCompra(paidCompra.id, {
      accountId: account.id,
      type: "EGRESO",
      amount: 100,
      description: "x",
      date: new Date(),
      toAccountId: undefined,
      eventId: undefined,
    });

    const pending = await getCompraPayments({ paid: false });
    expect(pending).toHaveLength(1);
    expect(pending[0].paid).toBe(false);

    const paid = await getCompraPayments({ paid: true });
    expect(paid).toHaveLength(1);
    expect(paid[0].id).toBe(paidCompra.id);
  });

  it("searches the list by proveedor name", async () => {
    const a = await makeProveedor({ name: "Distribuidora Norte" });
    const b = await makeProveedor({ name: "Mayorista Sur" });
    const insumo = await makeInsumo({ stockQty: 0 });
    await createCompra({
      proveedorId: a.id,
      date: new Date("2026-06-10T12:00:00"),
      lines: [{ insumoId: insumo.id, qty: 1, unitCost: 100 }],
    });
    await createCompra({
      proveedorId: b.id,
      date: new Date("2026-06-10T12:00:00"),
      lines: [{ insumoId: insumo.id, qty: 1, unitCost: 100 }],
    });

    const { rows, total } = await listComprasFiltered({ q: "Norte", skip: 0, take: 10 });
    expect(total).toBe(1);
    expect(rows[0].proveedor.name).toBe("Distribuidora Norte");
  });
});

// settleCompraPayment is the trust boundary the pago proveedores action calls:
// amount and description come from the compra itself, never from the client,
// and an already-paid compra can't be settled twice (double EGRESO).
describe("settleCompraPayment", () => {
  async function makePendingCompra() {
    const prov = await makeProveedor();
    const insumo = await makeInsumo();
    const compra = await createCompra({
      proveedorId: prov.id,
      date: new Date("2026-06-10T12:00:00"),
      lines: [{ insumoId: insumo.id, qty: 2, unitCost: 7000 }],
    });
    return { prov, compra };
  }

  it("settles with the compra's own total and description", async () => {
    const { prov, compra } = await makePendingCompra();
    const account = await makeAccount();

    const result = await settleCompraPayment(compra.id, account.id);

    expect(result).toEqual({ ok: true });
    const row = await prisma.compra.findUniqueOrThrow({ where: { id: compra.id } });
    expect(row.paid).toBe(true);
    const movements = await prisma.movement.findMany({ where: { accountId: account.id } });
    expect(movements).toHaveLength(1);
    expect(movements[0].type).toBe("EGRESO");
    expect(movements[0].amount).toBe(14000); // compra.total, not client input
    expect(movements[0].description).toBe(`Compra ${prov.name} — 1 insumo`);
  });

  it("rejects an unknown compra", async () => {
    const account = await makeAccount();
    const result = await settleCompraPayment("nope", account.id);
    expect(result).toEqual({ ok: false, error: "Compra no encontrada" });
    expect(await prisma.movement.findMany()).toHaveLength(0);
  });

  it("rejects an already-paid compra (no second EGRESO)", async () => {
    const { compra } = await makePendingCompra();
    const account = await makeAccount();
    await settleCompraPayment(compra.id, account.id);

    const again = await settleCompraPayment(compra.id, account.id);
    expect(again).toEqual({ ok: false, error: "Ya está pagada" });
    expect(await prisma.movement.findMany()).toHaveLength(1);
  });
});
