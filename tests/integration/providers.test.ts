import { describe, it, expect, beforeEach } from "vitest";
import { resetDb, makeProvider } from "./setup/db";
import { listProvidersFiltered } from "@/lib/providers/providerService";

// Integration tests for the providers list query the UI uses (filtered,
// sorted, paginated table). Money (cost) in cents.

beforeEach(async () => {
  await resetDb();
});

describe("listProvidersFiltered", () => {
  it("filters by text search across name and role", async () => {
    await makeProvider({ name: "DJ Sofía", role: "Animador" });
    await makeProvider({ name: "Otro prestador", role: "Sofía sonido" });
    await makeProvider({ name: "Sin coincidencia", role: "Fotógrafo" });

    const { rows, total } = await listProvidersFiltered({ q: "Sofía", skip: 0, take: 10 });
    expect(total).toBe(2);
    expect(rows.map((r) => r.name).sort()).toEqual(["DJ Sofía", "Otro prestador"]);
  });

  it("matches role-only hits", async () => {
    await makeProvider({ name: "Carlos", role: "Fotógrafo" });
    await makeProvider({ name: "Lucía", role: "Animador" });
    const { rows, total } = await listProvidersFiltered({ q: "Fotógrafo", skip: 0, take: 10 });
    expect(total).toBe(1);
    expect(rows[0].name).toBe("Carlos");
  });

  it("sorts by cost descending when requested", async () => {
    await makeProvider({ name: "Barato", cost: 100_00 });
    await makeProvider({ name: "Caro", cost: 900_00 });
    const { rows } = await listProvidersFiltered({ sort: "cost:desc", skip: 0, take: 10 });
    expect(rows[0].name).toBe("Caro");
  });

  it("defaults to name asc and paginates with the full count", async () => {
    await makeProvider({ name: "Zeta" });
    await makeProvider({ name: "Alfa" });
    await makeProvider({ name: "Beta" });
    await makeProvider({ name: "Gamma" });
    await makeProvider({ name: "Delta" });

    const { rows, total } = await listProvidersFiltered({ skip: 0, take: 2 });
    expect(total).toBe(5);
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.name)).toEqual(["Alfa", "Beta"]); // name asc default
  });
});
