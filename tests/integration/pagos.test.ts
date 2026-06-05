import { describe, it, expect, beforeEach } from "vitest";
import {
  prisma,
  resetDb,
  makeEvent,
  makeProvider,
  makeProveedor,
  makeService,
} from "./setup/db";
import {
  getProviderPayments,
  markProviderPaid,
  getProveedorPayments,
  markServicePaid,
} from "@/lib/pagos/pagosService";

// Integration tests for staff (prestador) and vendor (proveedor) payment
// tracking — the filters the pagos pages use and the mark-as-paid mutations.

beforeEach(async () => {
  await resetDb();
});

// An event with one provider line assigned.
async function eventWithProvider(startAt = new Date("2026-06-10T15:00:00")) {
  const event = await makeEvent({ startAt });
  const provider = await makeProvider({ cost: 50000 });
  const link = await prisma.eventProvider.create({
    data: { eventId: event.id, providerId: provider.id },
  });
  return { event, provider, link };
}

// An event with one service line whose service has a proveedor.
async function eventWithProveedorService(startAt = new Date("2026-06-10T15:00:00")) {
  const event = await makeEvent({ startAt });
  const proveedor = await makeProveedor();
  const service = await makeService({ cost: 30000, proveedorId: proveedor.id });
  const link = await prisma.eventService.create({
    data: { eventId: event.id, serviceId: service.id, qty: 1 },
  });
  return { event, proveedor, service, link };
}

describe("getProviderPayments / markProviderPaid", () => {
  it("lists provider lines with event and provider included", async () => {
    const { provider } = await eventWithProvider();
    const rows = await getProviderPayments({});
    expect(rows).toHaveLength(1);
    expect(rows[0].provider.id).toBe(provider.id);
    expect(rows[0].event).toBeTruthy();
    expect(rows[0].paid).toBe(false);
  });

  it("filters by providerId", async () => {
    const a = await eventWithProvider();
    await eventWithProvider();
    const rows = await getProviderPayments({ providerId: a.provider.id });
    expect(rows).toHaveLength(1);
    expect(rows[0].providerId).toBe(a.provider.id);
  });

  it("filters by paid status", async () => {
    const { link } = await eventWithProvider();
    await eventWithProvider();
    await markProviderPaid(link.id);

    const paid = await getProviderPayments({ paid: true });
    const unpaid = await getProviderPayments({ paid: false });
    expect(paid).toHaveLength(1);
    expect(unpaid).toHaveLength(1);
    expect(paid[0].id).toBe(link.id);
  });

  it("filters by event date range", async () => {
    await eventWithProvider(new Date("2026-05-20T10:00:00"));
    await eventWithProvider(new Date("2026-06-15T10:00:00"));
    const rows = await getProviderPayments({
      from: new Date("2026-06-01"),
      to: new Date("2026-06-30"),
    });
    expect(rows).toHaveLength(1);
  });

  it("marks a provider line paid with a timestamp", async () => {
    const { link } = await eventWithProvider();
    const updated = await markProviderPaid(link.id);
    expect(updated.paid).toBe(true);
    expect(updated.paidAt).toBeInstanceOf(Date);
  });
});

describe("getProveedorPayments / markServicePaid", () => {
  it("lists only service lines whose service has a proveedor", async () => {
    await eventWithProveedorService();
    // A service WITHOUT a proveedor must NOT appear.
    const event = await makeEvent();
    const noVendor = await makeService({}); // proveedorId null
    await prisma.eventService.create({ data: { eventId: event.id, serviceId: noVendor.id, qty: 1 } });

    const rows = await getProveedorPayments({});
    expect(rows).toHaveLength(1);
    expect(rows[0].service.proveedor).toBeTruthy();
  });

  it("filters by proveedorId", async () => {
    const a = await eventWithProveedorService();
    await eventWithProveedorService();
    const rows = await getProveedorPayments({ proveedorId: a.proveedor.id });
    expect(rows).toHaveLength(1);
    expect(rows[0].service.proveedorId).toBe(a.proveedor.id);
  });

  it("filters by paid status", async () => {
    const { link } = await eventWithProveedorService();
    await eventWithProveedorService();
    await markServicePaid(link.id);

    const paid = await getProveedorPayments({ paid: true });
    expect(paid).toHaveLength(1);
    expect(paid[0].id).toBe(link.id);
  });

  it("marks a service line paid with a timestamp", async () => {
    const { link } = await eventWithProveedorService();
    const updated = await markServicePaid(link.id);
    expect(updated.paid).toBe(true);
    expect(updated.paidAt).toBeInstanceOf(Date);
  });
});
