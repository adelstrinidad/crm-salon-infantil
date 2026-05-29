import { describe, it, expect } from "vitest";
import { eventSchema, eventFormInputSchema, EventState } from "./schema";

// Tests for the Zod validation schemas.
// eventFormInputSchema  — what the HTML form sends (all strings).
// eventSchema           — transforms form strings into typed values for the service.
// As QA, these cover: required fields, boundary values, type coercion, enum coverage.

// All fields as strings — exactly what the form sends.
const validFormInput = {
  name: "Cumpleaños de Sofía",
  eventType: "Cumpleaños",
  clientName: "María García",
  startAt: "2026-06-01T15:00",
  endAt: "2026-06-01T18:00",
  state: EventState.PRESUPUESTADO,
  totalPrice: "15000",
};

describe("eventFormInputSchema (client-side validation)", () => {
  it("accepts a valid form input", () => {
    expect(eventFormInputSchema.safeParse(validFormInput).success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = eventFormInputSchema.safeParse({ ...validFormInput, name: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("El nombre es requerido");
  });

  it("rejects empty clientName", () => {
    const result = eventFormInputSchema.safeParse({ ...validFormInput, clientName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty startAt", () => {
    const result = eventFormInputSchema.safeParse({ ...validFormInput, startAt: "" });
    expect(result.success).toBe(false);
  });
});

describe("eventSchema (server-side transform)", () => {
  it("transforms string dates to Date objects", () => {
    const result = eventSchema.safeParse(validFormInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startAt).toBeInstanceOf(Date);
      expect(result.data.endAt).toBeInstanceOf(Date);
    }
  });

  it("transforms string price (pesos) to integer cents", () => {
    const result = eventSchema.safeParse(validFormInput);
    expect(result.success).toBe(true);
    if (result.success) {
      // "15000" pesos → 1_500_000 cents
      expect(result.data.totalPrice).toBe(1_500_000);
    }
  });

  it("defaults totalPrice to 0 when '0' string is passed", () => {
    const result = eventSchema.safeParse({ ...validFormInput, totalPrice: "0" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totalPrice).toBe(0);
    }
  });

  it("accepts all valid EventState values", () => {
    for (const state of Object.values(EventState)) {
      const result = eventSchema.safeParse({ ...validFormInput, state });
      expect(result.success, `state ${state} should be valid`).toBe(true);
    }
  });
});
