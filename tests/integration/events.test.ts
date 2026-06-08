import { describe, it, expect, beforeEach } from "vitest";
import { resetDb, makeEvent } from "./setup/db";
import {
  createEvent,
  getEvent,
  updateEvent,
  deleteEvent,
  setEventState,
  rescheduleEvent,
  findBlockingOverlap,
  listEventsPage,
  listEventsFiltered,
  listEventsInRange,
} from "@/lib/events/eventService";

// Integration tests for the event service CRUD + the list queries the UI uses
// (paginated table, calendar range). Money in cents; dates are real Dates.

// No totalPrice: the price is derived from service/bonificado lines via
// recomputeEventTotalPrice(), never set through createEvent/updateEvent.
const baseEvent = {
  name: "Cumpleaños de Sofía",
  eventType: "Cumpleaños",
  clientName: "María García",
  startAt: new Date("2026-06-10T15:00:00"),
  endAt: new Date("2026-06-10T18:00:00"),
  state: "PRESUPUESTADO" as const,
};

beforeEach(async () => {
  await resetDb();
});

describe("createEvent / getEvent", () => {
  it("creates and reads back an event", async () => {
    const created = await createEvent(baseEvent);
    const found = await getEvent(created.id);
    expect(found.name).toBe("Cumpleaños de Sofía");
    expect(found.totalPrice).toBe(0); // no service lines yet → derived price is 0
    expect(found.state).toBe("PRESUPUESTADO");
  });

  it("defaults state to PRESUPUESTADO and totalPrice to 0", async () => {
    const e = await makeEvent();
    const found = await getEvent(e.id);
    expect(found.state).toBe("PRESUPUESTADO");
    expect(found.totalPrice).toBe(0);
  });

  it("throws when getting a missing event", async () => {
    await expect(getEvent("does-not-exist")).rejects.toThrow();
  });
});

describe("updateEvent / setEventState / deleteEvent", () => {
  it("updates fields", async () => {
    const e = await createEvent(baseEvent);
    const updated = await updateEvent(e.id, { ...baseEvent, name: "Renombrado" });
    expect(updated.name).toBe("Renombrado");
    expect(updated.totalPrice).toBe(0); // updateEvent never touches the derived price
  });

  it("changes only the state", async () => {
    const e = await createEvent(baseEvent);
    const updated = await setEventState(e.id, "RESERVADO");
    expect(updated.state).toBe("RESERVADO");
    expect(updated.name).toBe(e.name); // untouched
  });

  it("reschedules only the time range, leaving other fields intact", async () => {
    const e = await createEvent(baseEvent);
    const newStart = new Date("2026-07-20T16:00:00");
    const newEnd = new Date("2026-07-20T19:00:00");
    const moved = await rescheduleEvent(e.id, newStart, newEnd);
    expect(moved.startAt.getTime()).toBe(newStart.getTime());
    expect(moved.endAt.getTime()).toBe(newEnd.getTime());
    expect(moved.name).toBe(baseEvent.name); // untouched
    expect(moved.totalPrice).toBe(0); // untouched
    expect(moved.state).toBe(baseEvent.state); // untouched
  });

  it("deletes an event", async () => {
    const e = await createEvent(baseEvent);
    await deleteEvent(e.id);
    await expect(getEvent(e.id)).rejects.toThrow();
  });
});

describe("findBlockingOverlap (double-booking guard)", () => {
  const at = (h: number) => new Date(`2026-06-10T${String(h).padStart(2, "0")}:00:00`);

  it("finds a confirmed booking overlapping the slot", async () => {
    await makeEvent({ name: "Reservado", state: "RESERVADO", startAt: at(15), endAt: at(18) });
    const conflict = await findBlockingOverlap(at(16), at(19));
    expect(conflict?.name).toBe("Reservado");
  });

  it("returns null when the slot is free", async () => {
    await makeEvent({ name: "Reservado", state: "RESERVADO", startAt: at(15), endAt: at(18) });
    expect(await findBlockingOverlap(at(18), at(20))).toBeNull(); // touching edge, half-open
  });

  it("ignores quotes and suspended events (non-blocking states)", async () => {
    await makeEvent({ name: "Quote", state: "PRESUPUESTADO", startAt: at(15), endAt: at(18) });
    await makeEvent({ name: "Suspended", state: "SUSPENDIDO", startAt: at(15), endAt: at(18) });
    expect(await findBlockingOverlap(at(16), at(17))).toBeNull();
  });

  it("excludes the event being edited via excludeId", async () => {
    const e = await makeEvent({ name: "Self", state: "PAGADO", startAt: at(15), endAt: at(18) });
    expect(await findBlockingOverlap(at(15), at(18))).not.toBeNull();
    expect(await findBlockingOverlap(at(15), at(18), e.id)).toBeNull();
  });
});

describe("listEventsPage", () => {
  it("returns the page rows plus the full count", async () => {
    for (let i = 0; i < 5; i++) {
      await makeEvent({ name: `E${i}`, startAt: new Date(`2026-06-0${i + 1}T10:00:00`) });
    }
    const { rows, total } = await listEventsPage({ skip: 0, take: 2 });
    expect(rows).toHaveLength(2);
    expect(total).toBe(5);
  });

  it("orders by startAt descending", async () => {
    await makeEvent({ name: "Older", startAt: new Date("2026-06-01T10:00:00") });
    await makeEvent({ name: "Newer", startAt: new Date("2026-06-20T10:00:00") });
    const { rows } = await listEventsPage({ skip: 0, take: 10 });
    expect(rows[0].name).toBe("Newer");
  });
});

describe("listEventsFiltered", () => {
  it("filters by text search across name and clientName", async () => {
    await makeEvent({ name: "Fiesta Sofía", clientName: "García" });
    await makeEvent({ name: "Otro evento", clientName: "Sofía Pérez" });
    await makeEvent({ name: "Sin coincidencia", clientName: "López" });

    const { rows, total } = await listEventsFiltered({ q: "Sofía", skip: 0, take: 10 });
    expect(total).toBe(2);
    expect(rows.map((r) => r.name).sort()).toEqual(["Fiesta Sofía", "Otro evento"]);
  });

  it("filters by state", async () => {
    await makeEvent({ name: "A", state: "RESERVADO" });
    await makeEvent({ name: "B", state: "PRESUPUESTADO" });
    const { rows, total } = await listEventsFiltered({ state: "RESERVADO", skip: 0, take: 10 });
    expect(total).toBe(1);
    expect(rows[0].name).toBe("A");
  });

  it("filters by eventType", async () => {
    await makeEvent({ name: "Cumple", eventType: "Cumpleaños" });
    await makeEvent({ name: "Corp", eventType: "Corporativo" });
    const { rows, total } = await listEventsFiltered({ eventType: "Corporativo", skip: 0, take: 10 });
    expect(total).toBe(1);
    expect(rows[0].name).toBe("Corp");
  });

  it("filters by start-date range", async () => {
    await makeEvent({ name: "Before", startAt: new Date("2026-05-30T12:00:00") });
    await makeEvent({ name: "Inside", startAt: new Date("2026-06-15T12:00:00") });
    await makeEvent({ name: "After", startAt: new Date("2026-07-05T12:00:00") });
    const { rows } = await listEventsFiltered({
      from: new Date("2026-06-01T00:00:00"),
      to: new Date("2026-06-30T23:59:59"),
      skip: 0,
      take: 10,
    });
    expect(rows.map((r) => r.name)).toEqual(["Inside"]);
  });

  it("combines filters (AND) and counts only matches", async () => {
    await makeEvent({ name: "Match", clientName: "Sofía", state: "RESERVADO" });
    await makeEvent({ name: "WrongState", clientName: "Sofía", state: "PRESUPUESTADO" });
    await makeEvent({ name: "WrongName", clientName: "Otro", state: "RESERVADO" });
    const { rows, total } = await listEventsFiltered({
      q: "Sofía",
      state: "RESERVADO",
      skip: 0,
      take: 10,
    });
    expect(total).toBe(1);
    expect(rows[0].name).toBe("Match");
  });

  it("sorts by name ascending when requested", async () => {
    await makeEvent({ name: "Zeta" });
    await makeEvent({ name: "Alfa" });
    const { rows } = await listEventsFiltered({ sort: "name:asc", skip: 0, take: 10 });
    expect(rows.map((r) => r.name)).toEqual(["Alfa", "Zeta"]);
  });

  it("sorts by totalPrice descending when requested", async () => {
    await makeEvent({ name: "Cheap", totalPrice: 100_00 });
    await makeEvent({ name: "Pricey", totalPrice: 900_00 });
    const { rows } = await listEventsFiltered({ sort: "totalPrice:desc", skip: 0, take: 10 });
    expect(rows[0].name).toBe("Pricey");
  });

  it("defaults to startAt desc and paginates with the full count", async () => {
    for (let i = 1; i <= 5; i++) {
      await makeEvent({ name: `E${i}`, startAt: new Date(`2026-06-0${i}T12:00:00`) });
    }
    const { rows, total } = await listEventsFiltered({ skip: 0, take: 2 });
    expect(total).toBe(5);
    expect(rows).toHaveLength(2);
    expect(rows[0].name).toBe("E5"); // newest first
  });
});

describe("listEventsInRange", () => {
  it("returns only events whose startAt falls in the range", async () => {
    await makeEvent({ name: "Before", startAt: new Date("2026-05-30T10:00:00") });
    await makeEvent({ name: "Inside", startAt: new Date("2026-06-15T10:00:00") });
    await makeEvent({ name: "After", startAt: new Date("2026-07-05T10:00:00") });

    const rows = await listEventsInRange(new Date("2026-06-01"), new Date("2026-06-30"));
    expect(rows.map((r) => r.name)).toEqual(["Inside"]);
  });
});
