import { describe, expect, it } from "vitest";
import {
  REVERSAL_REASON_KEYS,
  REVERSAL_REASONS,
  reversalReasonLabel,
} from "./reversalReasons";

describe("reversalReasons", () => {
  it("exposes every reason key", () => {
    expect(REVERSAL_REASON_KEYS).toEqual([
      "error-monto",
      "error-cuenta",
      "pago-duplicado",
      "no-correspondia",
      "otro",
    ]);
  });

  it("maps a known key to its Spanish label", () => {
    expect(reversalReasonLabel("pago-duplicado")).toBe("Pago duplicado");
    expect(reversalReasonLabel("otro")).toBe(REVERSAL_REASONS.otro.label);
  });

  it("falls back to the raw value for an unknown key", () => {
    expect(reversalReasonLabel("inexistente")).toBe("inexistente");
  });
});
