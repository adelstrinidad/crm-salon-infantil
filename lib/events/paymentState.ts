// Decide whether recording a payment should auto-advance an event's state.
// Pure function — given the current state, the total collected (cobrado) and
// the event price (both in cents), return the new state, or null for no change.
//
// Rules:
//   - Fully paid (cobrado >= totalPrice, totalPrice > 0) → PAGADO.
//   - Partially paid (0 < cobrado < totalPrice) → SENADO (deposit / "seña").
//   - Never downgrade: CERRADO, SUSPENDIDO and already-PAGADO events are left
//     untouched, and a partial payment never moves SENADO back or past itself.
import type { EventState } from "./schema";

export function resolvePaidState(
  current: EventState,
  cobrado: number,
  totalPrice: number
): EventState | null {
  if (totalPrice <= 0) return null;

  // Terminal / manual states are never auto-changed.
  if (current === "CERRADO" || current === "SUSPENDIDO") return null;

  const fullyPaid = cobrado >= totalPrice;

  if (fullyPaid) {
    return current === "PAGADO" ? null : "PAGADO";
  }

  // Partial payment: promote a quote/reservation to "deposit paid".
  if (cobrado > 0 && (current === "PRESUPUESTADO" || current === "RESERVADO")) {
    return "SENADO";
  }

  return null;
}
