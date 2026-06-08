import { faker } from "@faker-js/faker";
import type { CuentaFormData } from "../../../pages/finanzas/cuenta-form.page";

/**
 * Dynamic happy-path account payload. Name is prefixed "E2E" and suffixed with a
 * unique token so cards are recognizable and never collide across runs against
 * the stateful dev.db.
 * @param {Partial<CuentaFormData>} [overrides] - Field overrides.
 * @returns {CuentaFormData}
 */
export function generateCuenta(overrides?: Partial<CuentaFormData>): CuentaFormData {
  const token = `${Date.now()}${faker.number.int({ min: 100, max: 999 })}`;
  return {
    name: `E2E ${faker.finance.accountName()} ${token}`,
    description: faker.lorem.sentence(),
    ...overrides,
  };
}
