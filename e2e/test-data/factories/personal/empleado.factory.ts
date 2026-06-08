import { faker } from "@faker-js/faker";
import type { EmpleadoFormData } from "../../../pages/personal/empleado-form.page";

/**
 * Dynamic happy-path staff payload. Name is prefixed "E2E" and suffixed with a
 * unique token so rows are recognizable and never collide across runs against
 * the stateful dev.db. Hourly rate is entered in pesos.
 * @param {Partial<EmpleadoFormData>} [overrides] - Field overrides.
 * @returns {EmpleadoFormData}
 */
export function generateEmpleado(overrides?: Partial<EmpleadoFormData>): EmpleadoFormData {
  const token = `${Date.now()}${faker.number.int({ min: 100, max: 999 })}`;
  return {
    name: `E2E ${faker.person.fullName()} ${token}`,
    role: faker.helpers.arrayElement(["Mozo", "Coordinador", "Limpieza"]),
    hourlyRate: String(faker.number.int({ min: 1000, max: 5000 })),
    ...overrides,
  };
}
