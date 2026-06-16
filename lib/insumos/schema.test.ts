import { describe, it, expect } from "vitest";
import { insumoSchema } from "./schema";

describe("insumoSchema", () => {
  it("accepts a valid insumo and converts eventPrice pesos → cents", () => {
    const parsed = insumoSchema.parse({
      name: "Gaseosa 2L",
      unit: "unidad",
      stockQty: 12,
      minStock: 3,
      eventPrice: "1500.50",
      notes: "",
    });
    expect(parsed.stockQty).toBe(12);
    expect(parsed.minStock).toBe(3);
    expect(parsed.unit).toBe("unidad");
    expect(parsed.eventPrice).toBe(150050);
  });

  it("rejects a negative eventPrice", () => {
    const r = insumoSchema.safeParse({
      name: "X",
      unit: "kg",
      stockQty: 0,
      minStock: 0,
      eventPrice: "-1",
    });
    expect(r.success).toBe(false);
  });

  it("defaults an empty eventPrice to 0 cents", () => {
    const parsed = insumoSchema.parse({
      name: "X",
      unit: "kg",
      stockQty: 0,
      minStock: 0,
      eventPrice: "",
    });
    expect(parsed.eventPrice).toBe(0);
  });

  it("rejects non-numeric stock (string)", () => {
    const r = insumoSchema.safeParse({ name: "X", unit: "kg", stockQty: "12", minStock: 0, eventPrice: "0" });
    expect(r.success).toBe(false);
  });

  it("rejects an empty name", () => {
    const r = insumoSchema.safeParse({ name: "", unit: "kg", stockQty: 0, minStock: 0, eventPrice: "0" });
    expect(r.success).toBe(false);
  });

  it("rejects an unknown unit", () => {
    const r = insumoSchema.safeParse({ name: "X", unit: "barril", stockQty: 0, minStock: 0, eventPrice: "0" });
    expect(r.success).toBe(false);
  });

  it("rejects negative or non-integer stock", () => {
    expect(insumoSchema.safeParse({ name: "X", unit: "kg", stockQty: -1, minStock: 0, eventPrice: "0" }).success).toBe(false);
    expect(insumoSchema.safeParse({ name: "X", unit: "kg", stockQty: 1.5, minStock: 0, eventPrice: "0" }).success).toBe(false);
  });
});
