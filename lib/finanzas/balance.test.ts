import { describe, it, expect } from "vitest";
import {
  computeBalance,
  summarizeMovements,
  summarizeGroupedByType,
  type SignedMovement,
} from "./balance";

// Account balance and the ingreso/egreso split are the core accounting
// calculations. MOVEMENT_SIGN decides which way each movement type pushes the
// balance: INGRESO/ARQUEO add; EGRESO/INVERSION/RETIRO/TRANSFERENCIA subtract.

describe("computeBalance", () => {
  it("returns 0 for no movements", () => {
    expect(computeBalance([])).toBe(0);
  });

  it("adds INGRESO and ARQUEO, subtracts EGRESO/INVERSION/RETIRO", () => {
    const movements: SignedMovement[] = [
      { type: "INGRESO", amount: 10000 },
      { type: "ARQUEO", amount: 500 },
      { type: "EGRESO", amount: 3000 },
      { type: "INVERSION", amount: 2000 },
      { type: "RETIRO", amount: 1000 },
    ];
    // +10000 +500 -3000 -2000 -1000
    expect(computeBalance(movements)).toBe(4500);
  });

  it("can go negative", () => {
    expect(computeBalance([{ type: "EGRESO", amount: 5000 }])).toBe(-5000);
  });

  // Documents CURRENT behavior — a transfer only DEBITS the source account;
  // the matching credit to toAccountId is not modeled in the balance. If this
  // is wrong for the business, fix computeBalance + getAccountsWithBalance.
  it("treats TRANSFERENCIA as an outflow only (known limitation)", () => {
    expect(computeBalance([{ type: "TRANSFERENCIA", amount: 7000 }])).toBe(-7000);
  });
});

describe("summarizeMovements", () => {
  it("returns all zeros for no movements", () => {
    expect(summarizeMovements([])).toEqual({ totalIngreso: 0, totalEgreso: 0, net: 0 });
  });

  it("splits by sign and reports egreso as a positive magnitude", () => {
    const result = summarizeMovements([
      { type: "INGRESO", amount: 10000 },
      { type: "ARQUEO", amount: 2000 },
      { type: "EGRESO", amount: 3000 },
      { type: "RETIRO", amount: 1000 },
    ]);
    expect(result.totalIngreso).toBe(12000);
    expect(result.totalEgreso).toBe(4000);
    expect(result.net).toBe(8000); // 12000 - 4000
  });
});

describe("summarizeGroupedByType", () => {
  it("splits a pre-aggregated groupBy result by sign", () => {
    const result = summarizeGroupedByType([
      { type: "INGRESO", sum: 15000 },
      { type: "EGRESO", sum: 5000 },
      { type: "TRANSFERENCIA", sum: 2000 },
    ]);
    expect(result.totalIngreso).toBe(15000);
    expect(result.totalEgreso).toBe(7000); // EGRESO + TRANSFERENCIA
  });
});
