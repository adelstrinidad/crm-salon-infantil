import { faker } from "@faker-js/faker";
import type { PrestadorFormData } from "../../../pages/prestadores/prestador-form.page";

/**
 * Dynamic happy-path provider payload. Name is prefixed "E2E" and suffixed with a
 * unique token so rows are recognizable and never collide across runs against
 * the stateful dev.db. Cost is entered in pesos (the form's number spinbutton).
 * @param {Partial<PrestadorFormData>} [overrides] - Field overrides.
 * @returns {PrestadorFormData}
 */
export function generatePrestador(overrides?: Partial<PrestadorFormData>): PrestadorFormData {
  const token = `${Date.now()}${faker.number.int({ min: 100, max: 999 })}`;
  return {
    name: `E2E ${faker.person.fullName()} ${token}`,
    role: faker.helpers.arrayElement(["DJ", "Fotógrafo", "Animador", "Catering"]),
    cost: String(faker.number.int({ min: 1, max: 5000 })),
    ...overrides,
  };
}
