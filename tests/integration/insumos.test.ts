import { describe, it, expect, beforeEach } from "vitest";
import { resetDb, makeInsumo } from "./setup/db";
import {
  listInsumosFiltered,
  createInsumo,
  updateInsumo,
  getInsumo,
  deleteInsumo,
} from "@/lib/insumos/insumoService";

// Integration tests for the insumos catalog: the filtered list query the UI
// uses, plus CRUD round-trips against a real migrated SQLite DB.

beforeEach(async () => {
  await resetDb();
});

describe("listInsumosFiltered", () => {
  it("filters by text search across name", async () => {
    await makeInsumo({ name: "Gaseosa 2L" });
    await makeInsumo({ name: "Platos descartables" });
    await makeInsumo({ name: "Sin coincidencia" });

    const { rows, total } = await listInsumosFiltered({ q: "Gaseosa", skip: 0, take: 10 });
    expect(total).toBe(1);
    expect(rows[0].name).toBe("Gaseosa 2L");
  });

  it("filters by text search across notes", async () => {
    await makeInsumo({ name: "Insumo A", notes: "comprar en Makro" });
    await makeInsumo({ name: "Insumo B", notes: "stock crítico" });

    const { rows, total } = await listInsumosFiltered({ q: "Makro", skip: 0, take: 10 });
    expect(total).toBe(1);
    expect(rows[0].name).toBe("Insumo A");
  });

  it("sorts by stock ascending when requested", async () => {
    await makeInsumo({ name: "Mucho", stockQty: 50 });
    await makeInsumo({ name: "Poco", stockQty: 2 });
    const { rows } = await listInsumosFiltered({ sort: "stockQty:asc", skip: 0, take: 10 });
    expect(rows.map((r) => r.name)).toEqual(["Poco", "Mucho"]);
  });

  it("defaults to name asc and paginates with the full count", async () => {
    for (let i = 0; i < 5; i++) {
      await makeInsumo({ name: `Insumo ${String.fromCharCode(65 + i)}` });
    }
    const { rows, total } = await listInsumosFiltered({ skip: 0, take: 2 });
    expect(total).toBe(5);
    expect(rows).toHaveLength(2);
    expect(rows[0].name).toBe("Insumo A");
  });
});

describe("insumo CRUD", () => {
  it("creates with defaults and round-trips", async () => {
    const created = await createInsumo({
      name: "Gas 10kg",
      unit: "kg",
      stockQty: 4,
      minStock: 1,
      notes: "",
    });
    const found = await getInsumo(created.id);
    expect(found?.name).toBe("Gas 10kg");
    expect(found?.unit).toBe("kg");
    expect(found?.stockQty).toBe(4);
    expect(found?.notes).toBeNull(); // empty string normalized to null
  });

  it("updates fields", async () => {
    const created = await createInsumo({ name: "Bolsas", unit: "caja", stockQty: 10, minStock: 2 });
    await updateInsumo(created.id, { name: "Bolsas grandes", unit: "caja", stockQty: 8, minStock: 3 });
    const found = await getInsumo(created.id);
    expect(found?.name).toBe("Bolsas grandes");
    expect(found?.stockQty).toBe(8);
    expect(found?.minStock).toBe(3);
  });

  it("deletes", async () => {
    const created = await createInsumo({ name: "Temp", unit: "unidad", stockQty: 0, minStock: 0 });
    await deleteInsumo(created.id);
    expect(await getInsumo(created.id)).toBeNull();
  });
});
