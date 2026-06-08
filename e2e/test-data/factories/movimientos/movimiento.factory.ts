import { faker } from "@faker-js/faker";
import type { MovimientoFormData } from "../../../pages/movimientos/movimiento-form.page";
import { Seeded } from "../../../config/timeouts";
import { MovementTypeLabel } from "../../../enums/app/event";

/** Today as yyyy-mm-dd (local), within the list's default current-month filter. */
function today(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * Dynamic happy-path movement payload. Defaults to an "Ingreso" against the
 * seeded "Caja" account, dated today (so it shows under the list's default
 * current-month filter). Description is prefixed "E2E" with a unique token so
 * rows are recognizable and never collide across runs on the stateful dev.db.
 * @param {Partial<MovimientoFormData>} [overrides] - Field overrides.
 * @returns {MovimientoFormData}
 */
export function generateMovimiento(overrides?: Partial<MovimientoFormData>): MovimientoFormData {
  const token = `${Date.now()}${faker.number.int({ min: 100, max: 999 })}`;
  return {
    typeLabel: MovementTypeLabel.INGRESO,
    accountName: Seeded.ACCOUNT,
    amountPesos: String(faker.number.int({ min: 1000, max: 50000 })),
    date: today(),
    description: `E2E ${faker.commerce.productName()} ${token}`,
    ...overrides,
  };
}
