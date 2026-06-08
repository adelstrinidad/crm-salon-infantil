import { faker } from "@faker-js/faker";
import type { ProveedorFormData } from "../../../pages/proveedores/proveedor-form.page";

/**
 * Dynamic happy-path supplier payload. Name is prefixed "E2E" and suffixed with a
 * unique token so rows are recognizable and never collide across runs against the
 * stateful dev.db.
 * @param {Partial<ProveedorFormData>} [overrides] - Field overrides.
 * @returns {ProveedorFormData}
 */
export function generateProveedor(overrides?: Partial<ProveedorFormData>): ProveedorFormData {
  const token = `${Date.now()}${faker.number.int({ min: 100, max: 999 })}`;
  return {
    name: `E2E ${faker.company.name()} ${token}`,
    description: faker.commerce.productDescription(),
    phone: faker.phone.number(),
    email: faker.internet.email().toLowerCase(),
    ...overrides,
  };
}
