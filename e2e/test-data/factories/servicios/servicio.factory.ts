import { faker } from "@faker-js/faker";
import type { ServicioFormData } from "../../../pages/servicios/servicio-form.page";

/**
 * Dynamic happy-path service payload. Name is prefixed "E2E" and suffixed with a
 * unique token so rows are recognizable and never collide across runs against
 * the stateful dev.db. Cost/price are pesos strings (the form parses them to cents).
 * @param {Partial<ServicioFormData>} [overrides] - Field overrides.
 * @returns {ServicioFormData}
 */
export function generateServicio(overrides?: Partial<ServicioFormData>): ServicioFormData {
  const token = `${Date.now()}${faker.number.int({ min: 100, max: 999 })}`;
  return {
    name: `E2E ${faker.commerce.productName()} ${token}`,
    description: faker.commerce.productDescription(),
    cost: String(faker.number.int({ min: 1000, max: 5000 })),
    price: String(faker.number.int({ min: 6000, max: 12000 })),
    ...overrides,
  };
}
