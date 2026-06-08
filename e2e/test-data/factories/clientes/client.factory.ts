import { faker } from "@faker-js/faker";
import type { ClienteFormData } from "../../../pages/clientes/cliente-form.page";

/**
 * Dynamic happy-path client payload. Name is prefixed "E2E" and suffixed with a
 * unique token so rows are recognizable and never collide across runs against
 * the stateful dev.db.
 * @param {Partial<ClienteFormData>} [overrides] - Field overrides.
 * @returns {ClienteFormData}
 */
export function generateClient(overrides?: Partial<ClienteFormData>): ClienteFormData {
  const token = `${Date.now()}${faker.number.int({ min: 100, max: 999 })}`;
  return {
    name: `E2E ${faker.person.lastName()} ${token}`,
    phone: faker.phone.number(),
    email: faker.internet.email().toLowerCase(),
    dni: faker.string.numeric(8),
    address: faker.location.streetAddress(),
    notes: faker.lorem.sentence(),
    ...overrides,
  };
}
