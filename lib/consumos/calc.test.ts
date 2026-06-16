import { describe, it, expect } from "vitest";
import {
  consumoLineTotal,
  computeConsumosSummary,
  computeConsumosFinancials,
  splitConsumosByPayer,
  pendingClientTotal,
} from "./calc";

// Consumption-bill math. Amounts in cents.
describe("consumoLineTotal", () => {
  it("multiplies unit price by quantity", () => {
    expect(consumoLineTotal({ qty: 3, unitPrice: 150_00 })).toBe(450_00);
  });

  it("is zero for a zero-priced insumo", () => {
    expect(consumoLineTotal({ qty: 5, unitPrice: 0 })).toBe(0);
  });
});

describe("computeConsumosSummary", () => {
  it("returns an empty summary for no lines", () => {
    expect(computeConsumosSummary([])).toEqual({ total: 0, totalQty: 0, byTable: [] });
  });

  it("totals a single table", () => {
    const summary = computeConsumosSummary([
      { tableNumber: 2, qty: 2, unitPrice: 100_00 },
      { tableNumber: 2, qty: 1, unitPrice: 50_00 },
    ]);
    expect(summary.total).toBe(250_00);
    expect(summary.totalQty).toBe(3);
    expect(summary.byTable).toEqual([{ tableNumber: 2, qty: 3, total: 250_00 }]);
  });

  it("groups by table and sorts ascending regardless of capture order", () => {
    const summary = computeConsumosSummary([
      { tableNumber: 5, qty: 1, unitPrice: 200_00 },
      { tableNumber: 1, qty: 2, unitPrice: 100_00 },
      { tableNumber: 5, qty: 3, unitPrice: 100_00 },
    ]);
    expect(summary.byTable).toEqual([
      { tableNumber: 1, qty: 2, total: 200_00 },
      { tableNumber: 5, qty: 4, total: 500_00 },
    ]);
    expect(summary.total).toBe(700_00);
    expect(summary.totalQty).toBe(6);
  });

  it("omits tables without lines", () => {
    const summary = computeConsumosSummary([{ tableNumber: 3, qty: 1, unitPrice: 100_00 }]);
    expect(summary.byTable.map((t) => t.tableNumber)).toEqual([3]);
  });
});

// Helper to build a payer-aware line tersely.
function line(
  payerType: "CLIENTE" | "INVITADO",
  opts: { qty?: number; unitPrice?: number; label?: string; paid?: boolean } = {},
) {
  return {
    tableNumber: 1,
    qty: opts.qty ?? 1,
    unitPrice: opts.unitPrice ?? 100_00,
    payerType,
    payerLabel: opts.label ?? null,
    paid: opts.paid ?? false,
  };
}

describe("splitConsumosByPayer", () => {
  it("separates the client bill from per-guest groups", () => {
    const { cliente, invitados } = splitConsumosByPayer([
      line("CLIENTE", { qty: 2 }),
      line("INVITADO", { label: "Tío Juan", qty: 3 }),
      line("INVITADO", { label: "Tía Rosa" }),
      line("INVITADO", { label: "Tío Juan", paid: true }),
    ]);
    expect(cliente).toHaveLength(1);
    expect(invitados.map((g) => g.label)).toEqual(["Tío Juan", "Tía Rosa"]);
    const juan = invitados[0];
    expect(juan.total).toBe(400_00); // 3 + 1 paid
    expect(juan.pendingTotal).toBe(300_00); // only the unpaid line
    expect(juan.paid).toBe(false);
  });

  it("marks a guest group paid when every line is settled", () => {
    const { invitados } = splitConsumosByPayer([
      line("INVITADO", { label: "Tía Rosa", paid: true }),
    ]);
    expect(invitados[0].paid).toBe(true);
    expect(invitados[0].pendingTotal).toBe(0);
  });

  it("treats a guest line without label as part of the client bill (defensive)", () => {
    const { cliente, invitados } = splitConsumosByPayer([line("INVITADO")]);
    expect(cliente).toHaveLength(1);
    expect(invitados).toHaveLength(0);
  });
});

describe("computeConsumosFinancials", () => {
  it("returns zeros for no lines", () => {
    expect(computeConsumosFinancials([])).toEqual({ vendido: 0, cobrado: 0, pendiente: 0 });
  });

  it("counts every line as vendido and only paid lines as cobrado", () => {
    const fin = computeConsumosFinancials([
      { qty: 2, unitPrice: 150_00, paid: true }, // 300_00 paid
      { qty: 1, unitPrice: 150_00, paid: false }, // 150_00 pending
    ]);
    expect(fin.vendido).toBe(450_00);
    expect(fin.cobrado).toBe(300_00);
    expect(fin.pendiente).toBe(150_00);
  });

  it("has no pendiente once all lines are paid", () => {
    const fin = computeConsumosFinancials([
      { qty: 2, unitPrice: 150_00, paid: true },
      { qty: 1, unitPrice: 150_00, paid: true },
    ]);
    expect(fin).toEqual({ vendido: 450_00, cobrado: 450_00, pendiente: 0 });
  });
});

describe("pendingClientTotal", () => {
  it("sums only unpaid CLIENTE lines", () => {
    const total = pendingClientTotal([
      line("CLIENTE", { qty: 2 }), // 200_00 pending
      line("CLIENTE", { paid: true }), // settled
      line("INVITADO", { label: "Tío Juan", qty: 5 }), // guest — not the client's
    ]);
    expect(total).toBe(200_00);
  });
});
