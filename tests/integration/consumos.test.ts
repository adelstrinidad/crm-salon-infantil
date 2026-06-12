import { describe, it, expect, beforeEach } from "vitest";
import { resetDb, makeAccount, makeEvent, makeInsumo, prisma } from "./setup/db";
import {
  startConsumos,
  addConsumo,
  removeConsumo,
  closeConsumos,
  getEventConsumos,
  getRemovedConsumos,
  cobrarConsumosCliente,
  cobrarConsumosInvitado,
} from "@/lib/consumos/consumoService";
import { registrarCobro } from "@/lib/events/eventService";
import { listStockMovements } from "@/lib/stock/stockService";

// Integration tests for the event-consumption lifecycle: start → capture per
// table (stock deducted through the ledger) → voids (audited, reason-driven
// stock handling) → close → settle the client bill and each self-paying guest.
// Money in cents; payment date mid-day to dodge timezone edges.
const PAGO = { accountId: "", description: "", date: new Date("2026-06-01T12:00:00") };
const CLIENTE = { payerType: "CLIENTE" as const };

beforeEach(async () => {
  await resetDb();
});

async function startedEvent(overrides: Parameters<typeof makeEvent>[0] = {}) {
  const event = await makeEvent({ state: "RESERVADO", ...overrides });
  await startConsumos(event.id);
  return event;
}

describe("startConsumos", () => {
  it("moves a confirmed event to EN_CURSO and stamps consumosStartedAt", async () => {
    const event = await makeEvent({ state: "RESERVADO" });
    const updated = await startConsumos(event.id);
    expect(updated.state).toBe("EN_CURSO");
    expect(updated.consumosStartedAt).toBeInstanceOf(Date);
  });

  it("rejects quotes and suspended/closed events", async () => {
    for (const state of ["PRESUPUESTADO", "SUSPENDIDO", "CERRADO"] as const) {
      const event = await makeEvent({ state });
      await expect(startConsumos(event.id)).rejects.toThrow(/confirmado/i);
    }
  });

  it("rejects a second start", async () => {
    const event = await startedEvent();
    await expect(startConsumos(event.id)).rejects.toThrow(/ya fue iniciado/i);
  });
});

describe("addConsumo", () => {
  it("snapshots the insumo event price and deducts stock through the ledger", async () => {
    const event = await startedEvent();
    const insumo = await makeInsumo({ stockQty: 10, eventPrice: 150_00 });

    const line = await addConsumo(event.id, {
      insumoId: insumo.id,
      tableNumber: 3,
      qty: 2,
      ...CLIENTE,
    });

    expect(line.unitPrice).toBe(150_00);
    expect(line.tableNumber).toBe(3);
    expect(line.payerType).toBe("CLIENTE");
    expect(line.payerLabel).toBeNull();
    expect(line.paid).toBe(false);

    const after = await prisma.insumo.findUnique({ where: { id: insumo.id } });
    expect(after!.stockQty).toBe(8);

    const ledger = await listStockMovements(insumo.id);
    expect(ledger).toHaveLength(1);
    expect(ledger[0].kind).toBe("consumo-evento");
    expect(ledger[0].delta).toBe(-2);
    expect(ledger[0].reason).toContain("Mesa 3");
  });

  it("stores the guest label only for INVITADO lines", async () => {
    const event = await startedEvent();
    const insumo = await makeInsumo({ stockQty: 10, eventPrice: 100_00 });
    const line = await addConsumo(event.id, {
      insumoId: insumo.id,
      tableNumber: 1,
      qty: 1,
      payerType: "INVITADO",
      payerLabel: "Tío Juan",
    });
    expect(line.payerType).toBe("INVITADO");
    expect(line.payerLabel).toBe("Tío Juan");
  });

  it("keeps the snapshot when the catalog price changes later", async () => {
    const event = await startedEvent();
    const insumo = await makeInsumo({ stockQty: 10, eventPrice: 100_00 });
    const line = await addConsumo(event.id, {
      insumoId: insumo.id,
      tableNumber: 1,
      qty: 1,
      ...CLIENTE,
    });

    await prisma.insumo.update({ where: { id: insumo.id }, data: { eventPrice: 999_00 } });

    const found = await prisma.eventConsumo.findUnique({ where: { id: line.id } });
    expect(found!.unitPrice).toBe(100_00);
  });

  it("rejects capture before the event starts", async () => {
    const event = await makeEvent({ state: "RESERVADO" });
    const insumo = await makeInsumo({ stockQty: 10, eventPrice: 100_00 });
    await expect(
      addConsumo(event.id, { insumoId: insumo.id, tableNumber: 1, qty: 1, ...CLIENTE }),
    ).rejects.toThrow(/no fue iniciado/i);
  });

  it("rejects capture after close", async () => {
    const event = await startedEvent();
    await closeConsumos(event.id);
    const insumo = await makeInsumo({ stockQty: 10, eventPrice: 100_00 });
    await expect(
      addConsumo(event.id, { insumoId: insumo.id, tableNumber: 1, qty: 1, ...CLIENTE }),
    ).rejects.toThrow(/cerrados/i);
  });

  it("rolls back the line when stock is insufficient", async () => {
    const event = await startedEvent();
    const insumo = await makeInsumo({ stockQty: 1, eventPrice: 100_00 });

    await expect(
      addConsumo(event.id, { insumoId: insumo.id, tableNumber: 1, qty: 5, ...CLIENTE }),
    ).rejects.toThrow(/insuficiente/i);

    expect(await getEventConsumos(event.id)).toHaveLength(0);
    const after = await prisma.insumo.findUnique({ where: { id: insumo.id } });
    expect(after!.stockQty).toBe(1);
  });
});

describe("removeConsumo (anulación auditada)", () => {
  async function lineOnStartedEvent(qty = 4) {
    const event = await startedEvent();
    const insumo = await makeInsumo({ stockQty: 10, eventPrice: 100_00 });
    const line = await addConsumo(event.id, {
      insumoId: insumo.id,
      tableNumber: 2,
      qty,
      ...CLIENTE,
    });
    return { event, insumo, line };
  }

  it("restores stock and writes the audit snapshot for a stock-restoring reason", async () => {
    const { event, insumo, line } = await lineOnStartedEvent();

    await removeConsumo(line.id, { reason: "arrepentimiento" });

    expect(await getEventConsumos(event.id)).toHaveLength(0);
    const after = await prisma.insumo.findUnique({ where: { id: insumo.id } });
    expect(after!.stockQty).toBe(10);

    const ledger = await listStockMovements(insumo.id);
    expect(ledger).toHaveLength(2);
    const reversal = ledger.find((m) => m.delta === 4);
    expect(reversal!.kind).toBe("consumo-evento");
    expect(reversal!.reason).toContain("Anulación");

    const audit = await getRemovedConsumos(event.id);
    expect(audit).toHaveLength(1);
    expect(audit[0].reason).toBe("arrepentimiento");
    expect(audit[0].insumoName).toContain("Insumo");
    expect(audit[0].qty).toBe(4);
    expect(audit[0].unitPrice).toBe(100_00);
    expect(audit[0].tableNumber).toBe(2);
  });

  it("keeps stock down on merma, reclassifying the loss in the ledger", async () => {
    const { event, insumo, line } = await lineOnStartedEvent(3);

    await removeConsumo(line.id, { reason: "merma" });

    // The units are physically lost: counter stays down...
    const after = await prisma.insumo.findUnique({ where: { id: insumo.id } });
    expect(after!.stockQty).toBe(7);

    // ...but the ledger now tells the truth: consumo reversed, merma recorded.
    const ledger = await listStockMovements(insumo.id);
    expect(ledger).toHaveLength(3);
    const kinds = ledger.map((m) => `${m.kind}:${m.delta}`).sort();
    expect(kinds).toEqual(["consumo-evento:-3", "consumo-evento:3", "merma:-3"]);

    const audit = await getRemovedConsumos(event.id);
    expect(audit[0].reason).toBe("merma");
  });

  it("records the free-text detail for reason 'otro'", async () => {
    const { event, line } = await lineOnStartedEvent();
    await removeConsumo(line.id, { reason: "otro", reasonText: "se cobró en efectivo aparte" });
    const audit = await getRemovedConsumos(event.id);
    expect(audit[0].reason).toBe("otro");
    expect(audit[0].reasonText).toBe("se cobró en efectivo aparte");
  });

  it("snapshots the guest payer on the audit row", async () => {
    const event = await startedEvent();
    const insumo = await makeInsumo({ stockQty: 10, eventPrice: 100_00 });
    const line = await addConsumo(event.id, {
      insumoId: insumo.id,
      tableNumber: 1,
      qty: 1,
      payerType: "INVITADO",
      payerLabel: "Tía Rosa",
    });
    await removeConsumo(line.id, { reason: "error-entrega" });
    const audit = await getRemovedConsumos(event.id);
    expect(audit[0].payerType).toBe("INVITADO");
    expect(audit[0].payerLabel).toBe("Tía Rosa");
  });

  it("refuses to void after close", async () => {
    const { event, line } = await lineOnStartedEvent();
    await closeConsumos(event.id);
    await expect(removeConsumo(line.id, { reason: "arrepentimiento" })).rejects.toThrow(
      /cerrados/i,
    );
    expect(await getEventConsumos(event.id)).toHaveLength(1);
  });

  it("refuses to void an already-settled line", async () => {
    const event = await startedEvent();
    const insumo = await makeInsumo({ stockQty: 10, eventPrice: 100_00 });
    const line = await addConsumo(event.id, {
      insumoId: insumo.id,
      tableNumber: 1,
      qty: 1,
      payerType: "INVITADO",
      payerLabel: "Tío Juan",
    });
    const account = await makeAccount();
    await cobrarConsumosInvitado(event.id, "Tío Juan", { ...PAGO, accountId: account.id });

    await expect(removeConsumo(line.id, { reason: "arrepentimiento" })).rejects.toThrow(
      /ya fue cobrada/i,
    );
  });
});

describe("closeConsumos", () => {
  it("stamps consumosClosedAt and keeps the event EN_CURSO", async () => {
    const event = await startedEvent();
    const closed = await closeConsumos(event.id);
    expect(closed.consumosClosedAt).toBeInstanceOf(Date);
    expect(closed.state).toBe("EN_CURSO");
  });

  it("rejects closing before start and double close", async () => {
    const event = await makeEvent({ state: "RESERVADO" });
    await expect(closeConsumos(event.id)).rejects.toThrow(/no fue iniciado/i);
    await startConsumos(event.id);
    await closeConsumos(event.id);
    await expect(closeConsumos(event.id)).rejects.toThrow(/cerrados/i);
  });
});

describe("cobrarConsumosCliente", () => {
  async function eventWithMixedBill() {
    const event = await startedEvent();
    const insumo = await makeInsumo({ stockQty: 20, eventPrice: 150_00 });
    await addConsumo(event.id, { insumoId: insumo.id, tableNumber: 1, qty: 2, ...CLIENTE }); // 300_00
    await addConsumo(event.id, { insumoId: insumo.id, tableNumber: 4, qty: 1, ...CLIENTE }); // 150_00
    await addConsumo(event.id, {
      insumoId: insumo.id,
      tableNumber: 2,
      qty: 2,
      payerType: "INVITADO",
      payerLabel: "Tío Juan",
    }); // 300_00 — guest, NOT part of the client bill
    return { event, insumo };
  }

  it("settles only the CLIENTE lines for the server-computed total", async () => {
    const { event } = await eventWithMixedBill();
    await closeConsumos(event.id);
    const account = await makeAccount();

    const { movement, total } = await cobrarConsumosCliente(event.id, {
      ...PAGO,
      accountId: account.id,
    });

    expect(total).toBe(450_00); // guest's 300_00 excluded
    expect(movement.type).toBe("INGRESO");
    expect(movement.kind).toBe("consumo");
    expect(movement.amount).toBe(450_00);
    expect(movement.eventId).toBe(event.id);
    expect(movement.description).toContain("Consumos");

    const lines = await getEventConsumos(event.id);
    const client = lines.filter((l) => l.payerType === "CLIENTE");
    const guest = lines.filter((l) => l.payerType === "INVITADO");
    expect(client.every((l) => l.paid && l.paidAt)).toBe(true);
    expect(guest.every((l) => !l.paid)).toBe(true);
  });

  it("requires the bill to be closed first", async () => {
    const { event } = await eventWithMixedBill();
    const account = await makeAccount();
    await expect(
      cobrarConsumosCliente(event.id, { ...PAGO, accountId: account.id }),
    ).rejects.toThrow(/Cerrá los consumos/i);
  });

  it("guards against double payment (nothing pending the second time)", async () => {
    const { event } = await eventWithMixedBill();
    await closeConsumos(event.id);
    const account = await makeAccount();
    await cobrarConsumosCliente(event.id, { ...PAGO, accountId: account.id });
    await expect(
      cobrarConsumosCliente(event.id, { ...PAGO, accountId: account.id }),
    ).rejects.toThrow(/pendientes/i);
    const movements = await prisma.movement.findMany({ where: { eventId: event.id } });
    expect(movements).toHaveLength(1);
  });

  it("rejects an empty client bill", async () => {
    const event = await startedEvent();
    await closeConsumos(event.id);
    const account = await makeAccount();
    await expect(
      cobrarConsumosCliente(event.id, { ...PAGO, accountId: account.id }),
    ).rejects.toThrow(/pendientes/i);
  });

  it("never counts toward the event's cobrado/saldo or auto-advances state", async () => {
    const event = await startedEvent({ totalPrice: 1000_00 });
    const insumo = await makeInsumo({ stockQty: 20, eventPrice: 150_00 });
    await addConsumo(event.id, { insumoId: insumo.id, tableNumber: 1, qty: 2, ...CLIENTE });
    await closeConsumos(event.id);
    const account = await makeAccount();
    await cobrarConsumosCliente(event.id, { ...PAGO, accountId: account.id });

    // A full-price cobro after the consumption payment: the consumo INGRESO
    // must not inflate the collected total, and EN_CURSO never auto-advances.
    const { newState } = await registrarCobro(event.id, {
      accountId: account.id,
      amount: 1000_00,
      description: "",
      date: new Date("2026-06-01T12:00:00"),
    });
    expect(newState).toBeNull();

    const after = await prisma.event.findUnique({ where: { id: event.id } });
    expect(after!.state).toBe("EN_CURSO");

    const cobros = await prisma.movement.aggregate({
      where: { eventId: event.id, type: "INGRESO", kind: null },
      _sum: { amount: true },
    });
    expect(cobros._sum.amount).toBe(1000_00);
  });
});

describe("cobrarConsumosInvitado", () => {
  async function eventWithGuests() {
    const event = await startedEvent();
    const insumo = await makeInsumo({ stockQty: 20, eventPrice: 100_00 });
    await addConsumo(event.id, {
      insumoId: insumo.id,
      tableNumber: 1,
      qty: 2,
      payerType: "INVITADO",
      payerLabel: "Tío Juan",
    }); // 200_00
    await addConsumo(event.id, {
      insumoId: insumo.id,
      tableNumber: 3,
      qty: 1,
      payerType: "INVITADO",
      payerLabel: "Tía Rosa",
    }); // 100_00
    await addConsumo(event.id, { insumoId: insumo.id, tableNumber: 1, qty: 1, ...CLIENTE });
    return event;
  }

  it("settles one guest's lines while the event is still open", async () => {
    const event = await eventWithGuests();
    const account = await makeAccount();

    const { movement, total } = await cobrarConsumosInvitado(event.id, "Tío Juan", {
      ...PAGO,
      accountId: account.id,
    });

    expect(total).toBe(200_00);
    expect(movement.kind).toBe("consumo");
    expect(movement.description).toContain("Tío Juan");

    const lines = await getEventConsumos(event.id);
    expect(lines.find((l) => l.payerLabel === "Tío Juan")!.paid).toBe(true);
    expect(lines.find((l) => l.payerLabel === "Tía Rosa")!.paid).toBe(false);
    expect(lines.find((l) => l.payerType === "CLIENTE")!.paid).toBe(false);
  });

  it("also settles after close (guest pays at the end)", async () => {
    const event = await eventWithGuests();
    await closeConsumos(event.id);
    const account = await makeAccount();
    const { total } = await cobrarConsumosInvitado(event.id, "Tía Rosa", {
      ...PAGO,
      accountId: account.id,
    });
    expect(total).toBe(100_00);
  });

  it("rejects a guest with nothing pending (double-pay guard)", async () => {
    const event = await eventWithGuests();
    const account = await makeAccount();
    await cobrarConsumosInvitado(event.id, "Tío Juan", { ...PAGO, accountId: account.id });
    await expect(
      cobrarConsumosInvitado(event.id, "Tío Juan", { ...PAGO, accountId: account.id }),
    ).rejects.toThrow(/pendientes/i);
  });

  it("rejects an unknown guest", async () => {
    const event = await eventWithGuests();
    const account = await makeAccount();
    await expect(
      cobrarConsumosInvitado(event.id, "Nadie", { ...PAGO, accountId: account.id }),
    ).rejects.toThrow(/pendientes/i);
  });

  it("rejects before the event starts", async () => {
    const event = await makeEvent({ state: "RESERVADO" });
    const account = await makeAccount();
    await expect(
      cobrarConsumosInvitado(event.id, "Tío Juan", { ...PAGO, accountId: account.id }),
    ).rejects.toThrow(/no fue iniciado/i);
  });
});
