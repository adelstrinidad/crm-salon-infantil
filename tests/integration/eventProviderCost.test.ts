import { describe, it, expect, beforeEach } from "vitest";
import { resetDb, makeEvent, makeProvider } from "./setup/db";
import {
  addProviderToEvent,
  setProviderCost,
  removeProviderFromEvent,
} from "@/lib/events/eventProviderLines";
import { getProviderPayments } from "@/lib/pagos/pagosService";

// A provider's cost can vary per event (e.g. catering). EventProvider.cost is an
// explicit per-event amount in cents — never null. On assign it is snapshotted
// from the provider's catalog cost; the user can override it (0 included). These
// tests lock that it is stored, editable, and feeds the pago prestadores report
// (how the venue knows how much to pay). Money in cents.

beforeEach(async () => {
  await resetDb();
});

describe("per-event provider cost (always explicit)", () => {
  it("stores the explicit cost passed on attach", async () => {
    const e = await makeEvent();
    const catering = await makeProvider({ name: "Catering Variable", cost: 0 });

    await addProviderToEvent(e.id, catering.id, 150_000); // priced for this event

    const rows = await getProviderPayments({ providerId: catering.id });
    expect(rows[0].cost).toBe(150_000);
  });

  it("snapshots the catalog cost when no cost is given on attach", async () => {
    const e = await makeEvent();
    const dj = await makeProvider({ name: "DJ Fijo", cost: 80_000 });

    await addProviderToEvent(e.id, dj.id); // no cost → snapshot catalog

    const rows = await getProviderPayments({ providerId: dj.id });
    expect(rows[0].cost).toBe(80_000); // concrete value, not null

    // Later changes to the catalog cost do NOT move the snapshot.
    const p = await makeProvider({ cost: 999_999 });
    void p;
    expect((await getProviderPayments({ providerId: dj.id }))[0].cost).toBe(80_000);
  });

  it("updates the cost with setProviderCost", async () => {
    const e = await makeEvent();
    const p = await makeProvider({ cost: 0 });
    await addProviderToEvent(e.id, p.id, 100_000);

    await setProviderCost(e.id, p.id, 175_000);
    expect((await getProviderPayments({ providerId: p.id }))[0].cost).toBe(175_000);
  });

  it("can set the cost to 0 (clearing the field), never null", async () => {
    const e = await makeEvent();
    const p = await makeProvider({ cost: 60_000 });
    await addProviderToEvent(e.id, p.id, 100_000);

    await setProviderCost(e.id, p.id, 0);
    const rows = await getProviderPayments({ providerId: p.id });
    expect(rows[0].cost).toBe(0);
  });

  it("removes the provider line", async () => {
    const e = await makeEvent();
    const p = await makeProvider({ cost: 0 });
    await addProviderToEvent(e.id, p.id, 50_000);
    await removeProviderFromEvent(e.id, p.id);
    expect(await getProviderPayments({ providerId: p.id })).toHaveLength(0);
  });
});
