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
  listEventsInRange,
} from "@/lib/events/eventService";

// Integration tests for the event service CRUD + the list queries the UI uses
// (paginated table, calendar range). Money in cents; dates are real Dates.

const baseEvent = {
  name: "Cumpleaños de Sofía",
  eventType: "Cumpleaños",
  clientName: "María García",
  startAt: new Date("2026-06-10T15:00:00"),
  endAt: new Date("2026-06-10T18:00:00"),
  state: "PRESUPUESTADO" as const,
  totalPrice: 1_500_000,
};

beforeEach(async () => {
  await resetDb();
});

describe("createEvent / getEvent", () => {
  it("creates and reads back an event", async () => {
    const created = await createEvent(baseEvent);
    const found = await getEvent(created.id);
    expect(found.name).toBe("Cumpleaños de Sofía");
    expect(found.totalPrice).toBe(1_500_000);
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
    const updated = await updateEvent(e.id, { ...baseEvent, name: "Renombrado", totalPrice: 2_000_000 });
    expect(updated.name).toBe("Renombrado");
    expect(updated.totalPrice).toBe(2_000_000);
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
    expect(moved.totalPrice).toBe(baseEvent.totalPrice); // untouched
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

describe("listEventsInRange", () => {
  it("returns only events whose startAt falls in the range", async () => {
    await makeEvent({ name: "Before", startAt: new Date("2026-05-30T10:00:00") });
    await makeEvent({ name: "Inside", startAt: new Date("2026-06-15T10:00:00") });
    await makeEvent({ name: "After", startAt: new Date("2026-07-05T10:00:00") });

    const rows = await listEventsInRange(new Date("2026-06-01"), new Date("2026-06-30"));
    expect(rows.map((r) => r.name)).toEqual(["Inside"]);
  });
});
