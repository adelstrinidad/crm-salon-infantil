import { describe, it, expect, beforeEach } from "vitest";
import { resetDb, makeService, makeProveedor } from "./setup/db";
import { listServicesFiltered } from "@/lib/services/serviceService";

// Integration tests for the service list query the UI uses (filtered + sorted +
// paginated table). Money in cents.

beforeEach(async () => {
  await resetDb();
});

describe("listServicesFiltered", () => {
  it("filters by text search across name and description", async () => {
    await makeService({ name: "Animación infantil", description: "payasos" });
    await makeService({ name: "Otro", description: "incluye animación musical" });
    await makeService({ name: "Sin coincidencia", description: "torta" });

    const { rows, total } = await listServicesFiltered({ q: "animación", skip: 0, take: 10 });
    expect(total).toBe(2);
    expect(rows.map((r) => r.name).sort()).toEqual(["Animación infantil", "Otro"]);
  });

  it("filters by proveedorId (exact)", async () => {
    const prov = await makeProveedor({ name: "Proveedor A" });
    await makeService({ name: "Con proveedor", proveedorId: prov.id });
    await makeService({ name: "Sin proveedor" });

    const { rows, total } = await listServicesFiltered({
      proveedorId: prov.id,
      skip: 0,
      take: 10,
    });
    expect(total).toBe(1);
    expect(rows[0].name).toBe("Con proveedor");
    expect(rows[0].proveedor?.name).toBe("Proveedor A");
  });

  it("sorts by price descending when requested", async () => {
    await makeService({ name: "Barato", price: 100_00 });
    await makeService({ name: "Caro", price: 900_00 });
    const { rows } = await listServicesFiltered({ sort: "price:desc", skip: 0, take: 10 });
    expect(rows[0].name).toBe("Caro");
  });

  it("defaults to name asc and paginates with the full count", async () => {
    for (const name of ["Zeta", "Alfa", "Mu", "Beta", "Gamma"]) {
      await makeService({ name });
    }
    const { rows, total } = await listServicesFiltered({ skip: 0, take: 2 });
    expect(total).toBe(5);
    expect(rows).toHaveLength(2);
    expect(rows[0].name).toBe("Alfa"); // A→Z default
  });
});
