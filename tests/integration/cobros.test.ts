import { describe, it, expect, beforeEach } from "vitest";
import { prisma, resetDb, makeEvent, makeAccount, makeMovement } from "./setup/db";
import { registrarCobro } from "@/lib/events/eventService";

// Integration tests for registrarCobro: the INGRESO movement and the payment
// state auto-advance must commit together (one transaction), and the new state
// is decided from the total collected including this payment.

beforeEach(async () => {
  await resetDb();
});

function cobro(accountId: string, amount: number, description = "") {
  return {
    accountId,
    amount,
    description,
    date: new Date("2026-06-10T15:00:00"),
  };
}

describe("registrarCobro", () => {
  it("records the INGRESO and advances RESERVADO → SENADO on partial payment", async () => {
    const event = await makeEvent({ state: "RESERVADO", totalPrice: 100000 });
    const account = await makeAccount();

    const { movement, newState } = await registrarCobro(event.id, cobro(account.id, 40000));

    expect(newState).toBe("SENADO");
    expect(movement.type).toBe("INGRESO");
    expect(movement.amount).toBe(40000);
    expect(movement.eventId).toBe(event.id);
    const row = await prisma.event.findUniqueOrThrow({ where: { id: event.id } });
    expect(row.state).toBe("SENADO");
  });

  it("advances to PAGADO when the collected total reaches the price", async () => {
    const event = await makeEvent({ state: "SENADO", totalPrice: 100000 });
    const account = await makeAccount();
    // A previous deposit already collected 40%.
    await makeMovement(account.id, { type: "INGRESO", amount: 40000, eventId: event.id });

    const { newState } = await registrarCobro(event.id, cobro(account.id, 60000));

    expect(newState).toBe("PAGADO");
    const row = await prisma.event.findUniqueOrThrow({ where: { id: event.id } });
    expect(row.state).toBe("PAGADO");
    expect(await prisma.movement.count({ where: { eventId: event.id } })).toBe(2);
  });

  it("leaves terminal states untouched but still records the movement", async () => {
    const event = await makeEvent({ state: "CERRADO", totalPrice: 100000 });
    const account = await makeAccount();

    const { newState } = await registrarCobro(event.id, cobro(account.id, 100000));

    expect(newState).toBeNull();
    const row = await prisma.event.findUniqueOrThrow({ where: { id: event.id } });
    expect(row.state).toBe("CERRADO");
    expect(await prisma.movement.count({ where: { eventId: event.id } })).toBe(1);
  });

  it("defaults a description so the movement isn't blank on the Movimientos list", async () => {
    const event = await makeEvent({ state: "RESERVADO", totalPrice: 100000 });
    const account = await makeAccount();

    const { movement } = await registrarCobro(event.id, cobro(account.id, 10000));

    expect(movement.description).toBe(`Cobro — ${event.name}`);
  });

  it("keeps a custom description when given", async () => {
    const event = await makeEvent({ state: "RESERVADO", totalPrice: 100000 });
    const account = await makeAccount();

    const { movement } = await registrarCobro(event.id, cobro(account.id, 10000, "Seña"));

    expect(movement.description).toBe("Seña");
  });

  it("rolls back the movement when the state update can't commit (atomicity)", async () => {
    const event = await makeEvent({ state: "RESERVADO", totalPrice: 100000 });

    // Unknown account → movement.create violates the accountId FK; nothing may
    // persist, including any state change computed for the payment.
    await expect(registrarCobro(event.id, cobro("nonexistent-account-id", 100000))).rejects.toThrow();

    const row = await prisma.event.findUniqueOrThrow({ where: { id: event.id } });
    expect(row.state).toBe("RESERVADO");
    expect(await prisma.movement.count()).toBe(0);
  });

  it("throws for an unknown event", async () => {
    const account = await makeAccount();
    await expect(registrarCobro("nope", cobro(account.id, 10000))).rejects.toThrow();
  });
});
