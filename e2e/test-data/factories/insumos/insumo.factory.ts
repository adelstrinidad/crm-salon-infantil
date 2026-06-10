import { faker } from "@faker-js/faker";
import type { InsumoFormData } from "../../../pages/insumos/insumo-form.page";

/**
 * Dynamic happy-path supply payload. Name is prefixed "E2E" and suffixed with a
 * unique token so rows are recognizable and never collide across runs against the
 * stateful dev.db.
 * @param {Partial<InsumoFormData>} [overrides] - Field overrides.
 * @returns {InsumoFormData}
 */
export function generateInsumo(overrides?: Partial<InsumoFormData>): InsumoFormData {
  const token = `${Date.now()}${faker.number.int({ min: 100, max: 999 })}`;
  return {
    name: `E2E ${faker.commerce.product()} ${token}`,
    stockQty: faker.number.int({ min: 1, max: 200 }),
    minStock: faker.number.int({ min: 0, max: 10 }),
    notes: faker.commerce.productDescription(),
    ...overrides,
  };
}
