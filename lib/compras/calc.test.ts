import { describe, it, expect } from "vitest";
import { lineSubtotal, computeCompraTotal } from "./calc";

describe("lineSubtotal", () => {
  it("multiplies qty by unit cost (cents)", () => {
    expect(lineSubtotal({ qty: 12, unitCost: 800 })).toBe(9600);
    expect(lineSubtotal({ qty: 1, unitCost: 0 })).toBe(0);
  });
});

describe("computeCompraTotal", () => {
  it("sums every line subtotal", () => {
    expect(
      computeCompraTotal([
        { qty: 12, unitCost: 800 }, // 9600
        { qty: 4, unitCost: 1200 }, // 4800
      ]),
    ).toBe(14400);
  });

  it("returns 0 for no lines", () => {
    expect(computeCompraTotal([])).toBe(0);
  });
});
