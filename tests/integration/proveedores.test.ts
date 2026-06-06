import { describe, it, expect, beforeEach } from "vitest";
import { resetDb, makeProveedor } from "./setup/db";
import { listProveedoresFiltered } from "@/lib/proveedores/proveedorService";

// Integration tests for the proveedores list query the UI uses
// (filtered + sorted + paginated table).

beforeEach(async () => {
  await resetDb();
});

describe("listProveedoresFiltered", () => {
  it("filters by text search across name", async () => {
    await makeProveedor({ name: "Globos Fiesta" });
    await makeProveedor({ name: "Catering Delicias" });
    await makeProveedor({ name: "Sin coincidencia" });

    const { rows, total } = await listProveedoresFiltered({ q: "Fiesta", skip: 0, take: 10 });
    expect(total).toBe(1);
    expect(rows[0].name).toBe("Globos Fiesta");
  });

  it("filters by text search across email", async () => {
    await makeProveedor({ name: "Proveedor A", email: "ventas@globos.com" });
    await makeProveedor({ name: "Proveedor B", email: "info@catering.com" });

    const { rows, total } = await listProveedoresFiltered({ q: "globos", skip: 0, take: 10 });
    expect(total).toBe(1);
    expect(rows[0].name).toBe("Proveedor A");
  });

  it("sorts by name ascending when requested", async () => {
    await makeProveedor({ name: "Zeta" });
    await makeProveedor({ name: "Alfa" });
    const { rows } = await listProveedoresFiltered({ sort: "name:asc", skip: 0, take: 10 });
    expect(rows.map((r) => r.name)).toEqual(["Alfa", "Zeta"]);
  });

  it("defaults to name asc and paginates with the full count", async () => {
    for (let i = 0; i < 5; i++) {
      await makeProveedor({ name: `Proveedor ${String.fromCharCode(65 + i)}` });
    }
    const { rows, total } = await listProveedoresFiltered({ skip: 0, take: 2 });
    expect(total).toBe(5);
    expect(rows).toHaveLength(2);
    expect(rows[0].name).toBe("Proveedor A"); // A→Z default
  });
});
