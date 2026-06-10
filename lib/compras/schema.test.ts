import { describe, it, expect } from "vitest";
import { compraSchema } from "./schema";

describe("compraSchema (transform)", () => {
  it("parses qty to int and unitCost pesos→cents, date to Date", () => {
    const r = compraSchema.safeParse({
      proveedorId: "p1",
      date: "2026-06-10",
      notes: "",
      lines: [{ insumoId: "i1", qty: "12", unitCost: "8" }],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.lines[0]).toEqual({ insumoId: "i1", qty: 12, unitCost: 800 });
      expect(r.data.date).toBeInstanceOf(Date);
      expect(r.data.notes).toBeUndefined(); // empty string → undefined
    }
  });

  it("requires at least one line", () => {
    const r = compraSchema.safeParse({
      proveedorId: "p1",
      date: "2026-06-10",
      lines: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects a non-positive quantity", () => {
    const r = compraSchema.safeParse({
      proveedorId: "p1",
      date: "2026-06-10",
      lines: [{ insumoId: "i1", qty: "0", unitCost: "8" }],
    });
    expect(r.success).toBe(false);
  });

  it("rejects a non-positive unit cost", () => {
    const r = compraSchema.safeParse({
      proveedorId: "p1",
      date: "2026-06-10",
      lines: [{ insumoId: "i1", qty: "1", unitCost: "0" }],
    });
    expect(r.success).toBe(false);
  });

  it("requires a proveedor", () => {
    const r = compraSchema.safeParse({
      proveedorId: "",
      date: "2026-06-10",
      lines: [{ insumoId: "i1", qty: "1", unitCost: "8" }],
    });
    expect(r.success).toBe(false);
  });
});
