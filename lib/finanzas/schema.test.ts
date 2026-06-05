import { describe, it, expect } from "vitest";
import {
  movementFormInputSchema,
  movementSchema,
  accountFormInputSchema,
  MovementType,
  MOVEMENT_SIGN,
} from "./schema";

// Validation + transform for the movement form. movementFormInputSchema is what
// the HTML form sends (amount/date as strings); movementSchema transforms those
// into the typed values the service stores (amount → cents, date → Date).

const validInput = {
  accountId: "acc_1",
  type: MovementType.INGRESO,
  amount: "1500",
  date: "2026-06-01",
};

describe("accountFormInputSchema", () => {
  it("accepts a named account", () => {
    expect(accountFormInputSchema.safeParse({ name: "Caja" }).success).toBe(true);
  });

  it("rejects an empty name", () => {
    const r = accountFormInputSchema.safeParse({ name: "" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toBe("El nombre es requerido");
  });
});

describe("movementFormInputSchema", () => {
  it("accepts a valid movement", () => {
    expect(movementFormInputSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects a missing accountId", () => {
    expect(movementFormInputSchema.safeParse({ ...validInput, accountId: "" }).success).toBe(false);
  });

  it("rejects a missing date", () => {
    expect(movementFormInputSchema.safeParse({ ...validInput, date: "" }).success).toBe(false);
  });

  it("rejects an invalid movement type", () => {
    expect(movementFormInputSchema.safeParse({ ...validInput, type: "FOO" }).success).toBe(false);
  });
});

describe("movementSchema (transform)", () => {
  it("converts the amount string (pesos) to integer cents", () => {
    const r = movementSchema.safeParse(validInput);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.amount).toBe(150000); // 1500 pesos → 150000 cents
  });

  it("converts the date string to a Date", () => {
    const r = movementSchema.safeParse(validInput);
    expect(r.success && r.data.date).toBeInstanceOf(Date);
  });

  it("normalizes empty optional ids to undefined", () => {
    const r = movementSchema.safeParse({ ...validInput, toAccountId: "", eventId: "" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.toAccountId).toBeUndefined();
      expect(r.data.eventId).toBeUndefined();
    }
  });
});

describe("MOVEMENT_SIGN", () => {
  it("has a sign for every movement type", () => {
    for (const type of Object.values(MovementType)) {
      expect(MOVEMENT_SIGN[type], `sign for ${type}`).toBeDefined();
    }
  });

  it("marks INGRESO/ARQUEO as +1 and the rest as -1", () => {
    expect(MOVEMENT_SIGN.INGRESO).toBe(1);
    expect(MOVEMENT_SIGN.ARQUEO).toBe(1);
    expect(MOVEMENT_SIGN.EGRESO).toBe(-1);
    expect(MOVEMENT_SIGN.INVERSION).toBe(-1);
    expect(MOVEMENT_SIGN.RETIRO).toBe(-1);
    expect(MOVEMENT_SIGN.TRANSFERENCIA).toBe(-1);
  });
});
