import { describe, it, expect, beforeEach } from "vitest";
import { resetDb, makeStaff, makeEvent, makeService } from "./setup/db";
import { listStaffFiltered } from "@/lib/staff/staffService";
import {
  addStaffToEvent,
  setStaffActualMinutes,
  removeStaffFromEvent,
  setStaffPaid,
} from "@/lib/events/eventStaffLines";
import { addServiceToEvent } from "@/lib/events/eventServiceLines";
import { getEventWithAll } from "@/lib/events/eventProviderLines";
import { computeEventFinancials } from "@/lib/events/financials";
import { EventState } from "@/lib/events/schema";

// Integration tests for the Personal (staff) module against the real test DB.
// hourlyRate is cents/hour; minutes are stored as integers (multiples of 30).

beforeEach(async () => {
  await resetDb();
});

describe("listStaffFiltered", () => {
  it("filters by text search across name and role", async () => {
    await makeStaff({ name: "Ana Torres", role: "Mozo" });
    await makeStaff({ name: "Otro empleado", role: "Ana coordinación" });
    await makeStaff({ name: "Sin coincidencia", role: "Limpieza" });

    const { rows, total } = await listStaffFiltered({ q: "Ana", skip: 0, take: 10 });
    expect(total).toBe(2);
    expect(rows.map((r) => r.name).sort()).toEqual(["Ana Torres", "Otro empleado"]);
  });

  it("sorts by hourlyRate descending when requested", async () => {
    await makeStaff({ name: "Barato", hourlyRate: 200_00 });
    await makeStaff({ name: "Caro", hourlyRate: 900_00 });
    const { rows } = await listStaffFiltered({ sort: "hourlyRate:desc", skip: 0, take: 10 });
    expect(rows[0].name).toBe("Caro");
  });

  it("defaults to name asc and paginates with the full count", async () => {
    for (const name of ["Zeta", "Alfa", "Beta", "Gamma", "Delta"]) {
      await makeStaff({ name });
    }
    const { rows, total } = await listStaffFiltered({ skip: 0, take: 2 });
    expect(total).toBe(5);
    expect(rows.map((r) => r.name)).toEqual(["Alfa", "Beta"]);
  });
});

describe("event staff assignment + financials", () => {
  it("adds staff with an estimate and costs it into totalCost (not subtotal)", async () => {
    const event = await makeEvent({ totalPrice: 0 });
    const ana = await makeStaff({ name: "Ana", hourlyRate: 250000 }); // $2.500/h

    await addStaffToEvent(event.id, ana.id, 300); // 5h estimated

    const full = await getEventWithAll(event.id);
    const f = computeEventFinancials(full);
    expect(f.staffCost).toBe(1250000); // 250000 * 300 / 60
    expect(f.totalCost).toBe(1250000);
    expect(f.subtotal).toBe(0); // client price untouched
    expect(f.profit).toBe(-1250000);
  });

  it("uses the real hours over the estimate once logged", async () => {
    const event = await makeEvent();
    const ana = await makeStaff({ name: "Ana", hourlyRate: 250000 });
    await addStaffToEvent(event.id, ana.id, 300);

    await setStaffActualMinutes(event.id, ana.id, 330); // worked 5:30

    const full = await getEventWithAll(event.id);
    const f = computeEventFinancials(full);
    expect(f.staffCost).toBe(Math.round((250000 * 330) / 60)); // 1.375.000
  });

  it("flags 'falta registro' until actual minutes are logged", async () => {
    const event = await makeEvent();
    const ana = await makeStaff();
    await addStaffToEvent(event.id, ana.id, 300);

    let full = await getEventWithAll(event.id);
    expect(full.staff.some((l) => l.actualMinutes == null)).toBe(true);

    await setStaffActualMinutes(event.id, ana.id, 300);
    full = await getEventWithAll(event.id);
    expect(full.staff.some((l) => l.actualMinutes == null)).toBe(false);
  });

  // Staff assignment is independent of the event state: you must be able to add
  // staff and log/adjust their real hours even after the event is fully paid or
  // closed (the hours are a venue cost, never billed to the client). These tests
  // walk every state and verify the cost lands in totalCost/profit only — never
  // in subtotal or totalPrice.
  describe.each(Object.values(EventState))("event state %s", (state) => {
    it("allows assigning staff, logging real hours, and costs them correctly", async () => {
      const event = await makeEvent({ state, totalPrice: 5_000_000 });
      // A service gives the client a real subtotal we can assert stays untouched.
      const svc = await makeService({ cost: 0, price: 2_000_000 });
      await addServiceToEvent(event.id, svc.id, 1);

      const ana = await makeStaff({ name: "Ana", hourlyRate: 250000 }); // $2.500/h

      // Add with a 5h estimate.
      await addStaffToEvent(event.id, ana.id, 300);
      let full = await getEventWithAll(event.id);
      expect(full.staff).toHaveLength(1);
      let f = computeEventFinancials(full);
      expect(f.staffCost).toBe(1250000); // 250000 * 300 / 60
      expect(f.subtotal).toBe(2_000_000); // client price untouched
      expect(full.totalPrice).toBe(5_000_000); // stored price untouched
      expect(f.totalCost).toBe(1250000);
      expect(f.profit).toBe(2_000_000 - 1250000);

      // Adjust the real hours after the event — works in every state.
      await setStaffActualMinutes(event.id, ana.id, 330); // 5:30
      full = await getEventWithAll(event.id);
      f = computeEventFinancials(full);
      expect(f.staffCost).toBe(Math.round((250000 * 330) / 60)); // 1.375.000
      expect(f.subtotal).toBe(2_000_000); // still untouched
      expect(f.profit).toBe(2_000_000 - 1375000);
    });
  });

  // The event-level "falta registro de empleados" flag (computed by the detail
  // and list pages) is `staff.some(l => l.actualMinutes == null)` — it tracks
  // HOURS registration, independent of payment. With several employees it must
  // persist until every one has its real hours logged.
  it("staffPending stays true until ALL employees have real hours logged", async () => {
    const event = await makeEvent();
    const a = await makeStaff({ name: "A" });
    const b = await makeStaff({ name: "B" });
    await addStaffToEvent(event.id, a.id, 300);
    await addStaffToEvent(event.id, b.id, 240);

    const pending = async () =>
      (await getEventWithAll(event.id)).staff.some((l) => l.actualMinutes == null);

    expect(await pending()).toBe(true); // neither logged
    await setStaffActualMinutes(event.id, a.id, 300);
    expect(await pending()).toBe(true); // only A logged → still pending
    await setStaffActualMinutes(event.id, b.id, 240);
    expect(await pending()).toBe(false); // all logged → flag clears
  });

  it("marks an assignment paid and can remove an unpaid one", async () => {
    const event = await makeEvent();
    const ana = await makeStaff({ hourlyRate: 100000 });
    await addStaffToEvent(event.id, ana.id, 60);

    await setStaffPaid(event.id, ana.id, true);
    let full = await getEventWithAll(event.id);
    expect(full.staff[0].paid).toBe(true);
    expect(full.staff[0].paidAt).not.toBeNull();

    const bob = await makeStaff({ name: "Bob" });
    await addStaffToEvent(event.id, bob.id, 60);
    await removeStaffFromEvent(event.id, bob.id);
    full = await getEventWithAll(event.id);
    expect(full.staff.map((l) => l.staffId)).toEqual([ana.id]);
  });
});
