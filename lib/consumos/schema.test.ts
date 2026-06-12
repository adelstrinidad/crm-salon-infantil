import { describe, it, expect } from "vitest";
import {
  TABLE_COUNT,
  TABLE_NUMBERS,
  tableLabel,
  consumoInputSchema,
  consumoPagoSchema,
  consumoRemovalInputSchema,
} from "./schema";
import { REMOVAL_REASONS, reasonRestoresStock } from "./removalReasons";

describe("table vocabulary", () => {
  it("exposes the fixed floor layout (Mesa 1..5)", () => {
    expect(TABLE_COUNT).toBe(5);
    expect(TABLE_NUMBERS).toEqual([1, 2, 3, 4, 5]);
    expect(tableLabel(3)).toBe("Mesa 3");
  });
});

describe("consumoInputSchema", () => {
  const valid = { insumoId: "abc", tableNumber: 1, qty: 2, payerType: "CLIENTE" as const };

  it("accepts a valid line", () => {
    expect(consumoInputSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a table outside 1..TABLE_COUNT", () => {
    expect(consumoInputSchema.safeParse({ ...valid, tableNumber: 0 }).success).toBe(false);
    expect(consumoInputSchema.safeParse({ ...valid, tableNumber: TABLE_COUNT + 1 }).success).toBe(false);
  });

  it("rejects non-integer or non-positive quantities", () => {
    expect(consumoInputSchema.safeParse({ ...valid, qty: 0 }).success).toBe(false);
    expect(consumoInputSchema.safeParse({ ...valid, qty: -1 }).success).toBe(false);
    expect(consumoInputSchema.safeParse({ ...valid, qty: 1.5 }).success).toBe(false);
  });

  it("rejects a missing insumo", () => {
    expect(consumoInputSchema.safeParse({ ...valid, insumoId: "" }).success).toBe(false);
  });

  it("requires a guest label when an INVITADO pays", () => {
    expect(consumoInputSchema.safeParse({ ...valid, payerType: "INVITADO" }).success).toBe(false);
    expect(
      consumoInputSchema.safeParse({ ...valid, payerType: "INVITADO", payerLabel: "  " }).success,
    ).toBe(false);
    expect(
      consumoInputSchema.safeParse({ ...valid, payerType: "INVITADO", payerLabel: "Tío Juan" })
        .success,
    ).toBe(true);
  });

  it("accepts CLIENTE without a label", () => {
    expect(consumoInputSchema.safeParse(valid).success).toBe(true);
  });
});

describe("consumoRemovalInputSchema", () => {
  const valid = { reason: "arrepentimiento" as const, managerCode: "1234" };

  it("accepts a valid removal", () => {
    expect(consumoRemovalInputSchema.safeParse(valid).success).toBe(true);
  });

  it("requires the manager code", () => {
    expect(consumoRemovalInputSchema.safeParse({ ...valid, managerCode: "" }).success).toBe(false);
  });

  it("requires free text only for reason 'otro'", () => {
    expect(consumoRemovalInputSchema.safeParse({ ...valid, reason: "otro" }).success).toBe(false);
    expect(
      consumoRemovalInputSchema.safeParse({ ...valid, reason: "otro", reasonText: "detalle" })
        .success,
    ).toBe(true);
    expect(consumoRemovalInputSchema.safeParse({ ...valid, reason: "merma" }).success).toBe(true);
  });

  it("rejects an unknown reason", () => {
    expect(
      consumoRemovalInputSchema.safeParse({ ...valid, reason: "fraude" }).success,
    ).toBe(false);
  });
});

describe("removal reasons vocabulary", () => {
  it("only merma keeps the stock down", () => {
    const nonRestoring = Object.entries(REMOVAL_REASONS)
      .filter(([, v]) => !v.restoresStock)
      .map(([k]) => k);
    expect(nonRestoring).toEqual(["merma"]);
    expect(reasonRestoresStock("arrepentimiento")).toBe(true);
    expect(reasonRestoresStock("merma")).toBe(false);
  });
});

describe("consumoPagoSchema", () => {
  it("requires an account and a date, and transforms the date", () => {
    const parsed = consumoPagoSchema.safeParse({
      accountId: "acc1",
      description: "",
      date: "2026-06-11",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.date).toBeInstanceOf(Date);
  });

  it("rejects a missing account", () => {
    expect(
      consumoPagoSchema.safeParse({ accountId: "", description: "", date: "2026-06-11" }).success,
    ).toBe(false);
  });
});
