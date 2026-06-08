import { faker } from "@faker-js/faker";
import type { TipoEventoFormData } from "../../../pages/tipos-evento/tipo-evento-form.page";

/**
 * Dynamic happy-path event-type payload. Name is prefixed "E2E" and suffixed
 * with a unique token so rows are recognizable and never collide across runs
 * against the stateful dev.db.
 * @param {Partial<TipoEventoFormData>} [overrides] - Field overrides.
 * @returns {TipoEventoFormData}
 */
export function generateTipoEvento(
  overrides?: Partial<TipoEventoFormData>,
): TipoEventoFormData {
  const token = `${Date.now()}${faker.number.int({ min: 100, max: 999 })}`;
  return {
    name: `E2E ${faker.word.noun()} ${token}`,
    ...overrides,
  };
}
