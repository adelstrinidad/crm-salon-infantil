import { describe, it, expect } from "vitest";
import { stockAdjustSchema } from "./schema";

describe("stockAdjustSchema (transform)", () => {
  it("maps a consumo op to a negative delta", () => {
    const r = stockAdjustSchema.safeParse({ insumoId: "i1", op: "consumo", qty: "3", reason: "fiesta" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).toEqual({ insumoId: "i1", kind: "consumo", delta: -3, reason: "fiesta" });
    }
  });

  it("maps ajuste-sumar to a positive delta and drops empty reason", () => {
    const r = stockAdjustSchema.safeParse({ insumoId: "i1", op: "ajuste-sumar", qty: "10", reason: "" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.delta).toBe(10);
      expect(r.data.kind).toBe("ajuste");
      expect(r.data.reason).toBeUndefined();
    }
  });

  it("rejects a non-positive quantity", () => {
    expect(stockAdjustSchema.safeParse({ insumoId: "i1", op: "consumo", qty: "0" }).success).toBe(false);
    expect(stockAdjustSchema.safeParse({ insumoId: "i1", op: "consumo", qty: "-2" }).success).toBe(false);
  });

  it("rejects an unknown op", () => {
    expect(stockAdjustSchema.safeParse({ insumoId: "i1", op: "robo", qty: "1" }).success).toBe(false);
  });
});
