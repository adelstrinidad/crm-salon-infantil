import { describe, it, expect, beforeEach } from "vitest";
import { prisma, resetDb, makeEvent, makeProvider, makeService, makeStaff } from "./setup/db";
import { addProviderToEvent, removeProviderFromEvent } from "@/lib/events/eventProviderLines";
import { addServiceToEvent, removeServiceFromEvent } from "@/lib/events/eventServiceLines";
import { addStaffToEvent, removeStaffFromEvent } from "@/lib/events/eventStaffLines";
import { getRemovedPayments } from "@/lib/pagos/pagosService";
import { staffLineCost } from "@/lib/staff/hours";

// Removing a provider/service/staff line must snapshot it into RemovedEventLine
// (audit) and physically delete the live join row, in one transaction.
beforeEach(async () => {
  await resetDb();
});

describe("removeProviderFromEvent — audit snapshot", () => {
  it("snapshots the line and deletes the live row", async () => {
    const event = await makeEvent({ name: "Fiesta García" });
    const provider = await makeProvider({ name: "DJ Luis", role: "DJ", cost: 50000 });
    await addProviderToEvent(event.id, provider.id); // cost snapshotted = 50000

    await removeProviderFromEvent(event.id, provider.id);

    expect(await prisma.eventProvider.count()).toBe(0);
    const rows = await getRemovedPayments({ kinds: ["provider"] });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      kind: "provider",
      eventId: event.id,
      eventName: "Fiesta García",
      entityName: "DJ Luis",
      entityRole: "DJ",
      amount: 50000,
      paid: false,
    });
    expect(rows[0].removedAt).toBeInstanceOf(Date);
  });

  it("is a no-op when the line does not exist", async () => {
    const event = await makeEvent();
    const provider = await makeProvider();
    const res = await removeProviderFromEvent(event.id, provider.id);
    expect(res).toBeNull();
    expect(await getRemovedPayments({ kinds: ["provider"] })).toHaveLength(0);
  });
});

describe("removeServiceFromEvent — audit snapshot", () => {
  it("snapshots owed = service.cost * qty", async () => {
    const event = await makeEvent({ name: "Cumple" });
    const service = await makeService({ name: "Catering", cost: 30000 });
    await addServiceToEvent(event.id, service.id, 2);

    await removeServiceFromEvent(event.id, service.id);

    expect(await prisma.eventService.count()).toBe(0);
    const rows = await getRemovedPayments({ kinds: ["service"] });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      kind: "service",
      entityName: "Catering",
      entityRole: null,
      amount: 60000, // 30000 * 2
    });
  });
});

describe("removeStaffFromEvent — audit snapshot", () => {
  it("snapshots owed = staffLineCost over the effective minutes", async () => {
    const event = await makeEvent();
    const staff = await makeStaff({ name: "Ana Mozo", role: "Mozo", hourlyRate: 200000 });
    await addStaffToEvent(event.id, staff.id, 300); // est 300 min (5h)

    await removeStaffFromEvent(event.id, staff.id);

    expect(await prisma.eventStaff.count()).toBe(0);
    const rows = await getRemovedPayments({ kinds: ["staff"] });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      kind: "staff",
      entityName: "Ana Mozo",
      entityRole: "Mozo",
      amount: staffLineCost(200000, 300),
    });
  });
});

describe("getRemovedPayments — kind filter", () => {
  it("returns only the requested kinds", async () => {
    const event = await makeEvent();
    const provider = await makeProvider({ cost: 1000 });
    const staff = await makeStaff({ hourlyRate: 100000 });
    await addProviderToEvent(event.id, provider.id);
    await addStaffToEvent(event.id, staff.id, 60);
    await removeProviderFromEvent(event.id, provider.id);
    await removeStaffFromEvent(event.id, staff.id);

    expect(await getRemovedPayments({ kinds: ["provider"] })).toHaveLength(1);
    expect(await getRemovedPayments({ kinds: ["staff"] })).toHaveLength(1);
    expect(await getRemovedPayments({ kinds: ["provider", "staff"] })).toHaveLength(2);
    expect(await getRemovedPayments({ kinds: ["service"] })).toHaveLength(0);
  });
});
