import { describe, it, expect, beforeEach } from "vitest";
import { resetDb, makeEvent, makeService, makeProvider } from "./setup/db";
import { recomputeEventTotalPrice, getEvent } from "@/lib/events/eventService";
import { addServiceToEvent, removeServiceFromEvent } from "@/lib/events/eventServiceLines";
import { addBonificadoToEvent, removeBonificadoFromEvent } from "@/lib/events/eventBonificadoLines";
import { addProviderToEvent } from "@/lib/events/eventProviderLines";

// The event price is never entered by hand: it is the subtotal derived from the
// event's service lines minus its bonificado (complimentary) lines, kept in sync
// by recomputeEventTotalPrice(). These tests lock that behavior. Money in cents.

beforeEach(async () => {
  await resetDb();
});

describe("recomputeEventTotalPrice", () => {
  it("is 0 for an event with no service lines", async () => {
    const e = await makeEvent({ totalPrice: 999_999 }); // stale value to be corrected
    const subtotal = await recomputeEventTotalPrice(e.id);
    expect(subtotal).toBe(0);
    expect((await getEvent(e.id)).totalPrice).toBe(0);
  });

  it("sums service price × qty", async () => {
    const e = await makeEvent();
    const s = await makeService({ price: 10_000, cost: 4_000 });
    await addServiceToEvent(e.id, s.id, 2);

    const subtotal = await recomputeEventTotalPrice(e.id);
    expect(subtotal).toBe(20_000);
    expect((await getEvent(e.id)).totalPrice).toBe(20_000);
  });

  it("subtracts bonificado (waived) service price from the subtotal", async () => {
    const e = await makeEvent();
    const billed = await makeService({ price: 10_000 });
    const waived = await makeService({ price: 4_000 });
    await addServiceToEvent(e.id, billed.id, 1);
    await addBonificadoToEvent(e.id, waived.id, 1);

    expect(await recomputeEventTotalPrice(e.id)).toBe(6_000); // 10_000 − 4_000
  });

  it("ignores provider cost — providers never raise the price", async () => {
    const e = await makeEvent();
    const s = await makeService({ price: 10_000 });
    await addServiceToEvent(e.id, s.id, 1);
    const p = await makeProvider({ cost: 7_000 });
    await addProviderToEvent(e.id, p.id);

    expect(await recomputeEventTotalPrice(e.id)).toBe(10_000); // provider cost excluded
  });

  it("updates the stored price when a service or bonificado is removed", async () => {
    const e = await makeEvent();
    const a = await makeService({ price: 10_000 });
    const b = await makeService({ price: 5_000 });
    await addServiceToEvent(e.id, a.id, 1);
    await addServiceToEvent(e.id, b.id, 1);
    await addBonificadoToEvent(e.id, b.id, 1);
    expect(await recomputeEventTotalPrice(e.id)).toBe(10_000); // 15_000 − 5_000

    await removeBonificadoFromEvent(e.id, b.id);
    expect(await recomputeEventTotalPrice(e.id)).toBe(15_000);

    await removeServiceFromEvent(e.id, b.id);
    expect(await recomputeEventTotalPrice(e.id)).toBe(10_000);
  });
});
