import { describe, it, expect, beforeEach } from "vitest";
import { resetDb, makeClient } from "./setup/db";
import { listClientsFiltered } from "@/lib/clients/clientService";

// Integration tests for the client list query the UI uses (filtered + sorted +
// paginated table). Runs against the migrated SQLite test DB.

beforeEach(async () => {
  await resetDb();
});

describe("listClientsFiltered", () => {
  it("filters by text search across name and phone", async () => {
    await makeClient({ name: "María García", phone: "1100000000" });
    await makeClient({ name: "Otro cliente", phone: "1199999999" });
    await makeClient({ name: "Sin coincidencia", phone: "5555555" });

    const byName = await listClientsFiltered({ q: "García", skip: 0, take: 10 });
    expect(byName.total).toBe(1);
    expect(byName.rows[0].name).toBe("María García");

    const byPhone = await listClientsFiltered({ q: "1199", skip: 0, take: 10 });
    expect(byPhone.total).toBe(1);
    expect(byPhone.rows[0].name).toBe("Otro cliente");
  });

  it("sorts by name ascending when requested", async () => {
    await makeClient({ name: "Zeta" });
    await makeClient({ name: "Alfa" });
    const { rows } = await listClientsFiltered({ sort: "name:asc", skip: 0, take: 10 });
    expect(rows.map((r) => r.name)).toEqual(["Alfa", "Zeta"]);
  });

  it("paginates with the full matching count", async () => {
    for (let i = 0; i < 5; i++) {
      await makeClient({ name: `Cliente ${String.fromCharCode(65 + i)}` });
    }
    const { rows, total } = await listClientsFiltered({ skip: 0, take: 2 });
    expect(total).toBe(5);
    expect(rows).toHaveLength(2);
    expect(rows[0].name).toBe("Cliente A"); // name:asc default
  });
});
