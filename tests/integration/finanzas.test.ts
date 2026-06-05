import { describe, it, expect, beforeEach } from "vitest";
import {
  resetDb,
  makeAccount,
  makeMovement,
  makeEvent,
} from "./setup/db";
import {
  createAccount,
  createMovement,
  getAccountsWithBalance,
  listMovementsFiltered,
} from "@/lib/finanzas/finanzasService";

// Integration tests: the finanzas service against a real migrated SQLite DB.
// These prove the balance and ingreso/egreso aggregations are correct end to
// end (Prisma query → reduce/groupBy → result), not just on paper.

beforeEach(async () => {
  await resetDb();
});

describe("createAccount / createMovement", () => {
  it("persists an account", async () => {
    const acc = await createAccount({ name: "Caja Principal" });
    expect(acc.id).toBeTruthy();
    expect(acc.name).toBe("Caja Principal");
  });

  it("persists a movement against an account", async () => {
    const acc = await makeAccount();
    const mov = await createMovement({
      accountId: acc.id,
      type: "INGRESO",
      amount: 50000,
      date: new Date("2026-06-01"),
      toAccountId: undefined,
      eventId: undefined,
      description: undefined,
    });
    expect(mov.id).toBeTruthy();
    expect(mov.amount).toBe(50000);
  });
});

describe("getAccountsWithBalance", () => {
  it("returns 0 balance for an account with no movements", async () => {
    await makeAccount({ name: "Vacía" });
    const [acc] = await getAccountsWithBalance();
    expect(acc.balance).toBe(0);
  });

  it("computes a signed balance across movement types", async () => {
    const acc = await makeAccount();
    await makeMovement(acc.id, { type: "INGRESO", amount: 100000 });
    await makeMovement(acc.id, { type: "ARQUEO", amount: 5000 });
    await makeMovement(acc.id, { type: "EGRESO", amount: 30000 });
    await makeMovement(acc.id, { type: "RETIRO", amount: 10000 });

    const [result] = await getAccountsWithBalance();
    // +100000 +5000 -30000 -10000
    expect(result.balance).toBe(65000);
  });

  it("credits the destination on a transfer (money-neutral overall)", async () => {
    const caja = await makeAccount({ name: "Caja" });
    const banco = await makeAccount({ name: "Banco" });
    // Transfer 10000 cents from Caja → Banco.
    await makeMovement(caja.id, { type: "TRANSFERENCIA", amount: 10000, toAccountId: banco.id });

    const accounts = await getAccountsWithBalance();
    const byName = Object.fromEntries(accounts.map((x) => [x.name, x.balance]));
    expect(byName.Caja).toBe(-10000); // source debited
    expect(byName.Banco).toBe(10000); // destination credited
    expect(byName.Caja + byName.Banco).toBe(0); // total preserved
  });

  it("keeps each account's balance independent", async () => {
    const a = await makeAccount({ name: "A" });
    const b = await makeAccount({ name: "B" });
    await makeMovement(a.id, { type: "INGRESO", amount: 20000 });
    await makeMovement(b.id, { type: "EGRESO", amount: 7000 });

    const accounts = await getAccountsWithBalance();
    const byName = Object.fromEntries(accounts.map((x) => [x.name, x.balance]));
    expect(byName.A).toBe(20000);
    expect(byName.B).toBe(-7000);
  });
});

describe("listMovementsFiltered", () => {
  it("aggregates ingreso/egreso over the full filtered set", async () => {
    const acc = await makeAccount();
    await makeMovement(acc.id, { type: "INGRESO", amount: 80000 });
    await makeMovement(acc.id, { type: "EGRESO", amount: 25000 });
    await makeMovement(acc.id, { type: "TRANSFERENCIA", amount: 5000 });

    const { total, totalIngreso, totalEgreso } = await listMovementsFiltered({});
    expect(total).toBe(3);
    expect(totalIngreso).toBe(80000);
    expect(totalEgreso).toBe(30000); // EGRESO + TRANSFERENCIA
  });

  it("filters by account", async () => {
    const a = await makeAccount();
    const b = await makeAccount();
    await makeMovement(a.id, { type: "INGRESO", amount: 10000 });
    await makeMovement(b.id, { type: "INGRESO", amount: 99000 });

    const { total, totalIngreso } = await listMovementsFiltered({ accountId: a.id });
    expect(total).toBe(1);
    expect(totalIngreso).toBe(10000);
  });

  it("filters by type", async () => {
    const acc = await makeAccount();
    await makeMovement(acc.id, { type: "INGRESO", amount: 10000 });
    await makeMovement(acc.id, { type: "EGRESO", amount: 4000 });

    const { total, totalEgreso } = await listMovementsFiltered({ type: "EGRESO" });
    expect(total).toBe(1);
    expect(totalEgreso).toBe(4000);
  });

  it("filters by date range", async () => {
    const acc = await makeAccount();
    await makeMovement(acc.id, { amount: 1000, date: new Date("2026-01-15") });
    await makeMovement(acc.id, { amount: 2000, date: new Date("2026-06-15") });

    const { total } = await listMovementsFiltered({
      from: new Date("2026-06-01"),
      to: new Date("2026-06-30"),
    });
    expect(total).toBe(1);
  });

  it("paginates rows while aggregating over the whole set", async () => {
    const acc = await makeAccount();
    for (let i = 0; i < 5; i++) {
      await makeMovement(acc.id, { type: "INGRESO", amount: 1000 });
    }

    const { rows, total, totalIngreso } = await listMovementsFiltered({ skip: 0, take: 2 });
    expect(rows).toHaveLength(2); // page size
    expect(total).toBe(5); // full count
    expect(totalIngreso).toBe(5000); // aggregate over all 5, not the page
  });

  it("can link a movement to an event", async () => {
    const acc = await makeAccount();
    const event = await makeEvent();
    await makeMovement(acc.id, { type: "INGRESO", amount: 12000, eventId: event.id });

    const { rows } = await listMovementsFiltered({});
    expect(rows[0].eventId).toBe(event.id);
  });
});
