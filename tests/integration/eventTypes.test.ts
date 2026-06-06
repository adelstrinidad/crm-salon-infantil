import { describe, it, expect, beforeEach } from "vitest";
import { resetDb, makeEventType } from "./setup/db";
import { listEventTypesFiltered } from "@/lib/eventTypes/eventTypeService";

// Integration tests for the event-type list query the UI uses (filtered +
// sorted + paginated table). `name` is unique, so tests use distinct names.

beforeEach(async () => {
  await resetDb();
});

describe("listEventTypesFiltered", () => {
  it("filters by text search on name (contains)", async () => {
    await makeEventType({ name: "Cumpleaños" });
    await makeEventType({ name: "Corporativo" });
    await makeEventType({ name: "Casamiento" });

    const { rows, total } = await listEventTypesFiltered({ q: "Corp", skip: 0, take: 10 });
    expect(total).toBe(1);
    expect(rows[0].name).toBe("Corporativo");
  });

  it("sorts by name ascending by default", async () => {
    await makeEventType({ name: "Zeta" });
    await makeEventType({ name: "Alfa" });
    await makeEventType({ name: "Mu" });

    const { rows } = await listEventTypesFiltered({ skip: 0, take: 10 });
    expect(rows.map((r) => r.name)).toEqual(["Alfa", "Mu", "Zeta"]);
  });

  it("sorts by name descending when requested", async () => {
    await makeEventType({ name: "Alfa" });
    await makeEventType({ name: "Zeta" });

    const { rows } = await listEventTypesFiltered({ sort: "name:desc", skip: 0, take: 10 });
    expect(rows.map((r) => r.name)).toEqual(["Zeta", "Alfa"]);
  });

  it("paginates and returns the full matching count", async () => {
    await makeEventType({ name: "Alfa" });
    await makeEventType({ name: "Beta" });
    await makeEventType({ name: "Gamma" });
    await makeEventType({ name: "Delta" });
    await makeEventType({ name: "Epsilon" });

    const { rows, total } = await listEventTypesFiltered({ skip: 0, take: 2 });
    expect(total).toBe(5);
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.name)).toEqual(["Alfa", "Beta"]); // name:asc
  });
});
