import { faker } from "@faker-js/faker";
import type { EventoBasics } from "../../../pages/eventos/evento-form.page";

/**
 * Dynamic event basics. Name is "E2E"-prefixed and unique so runs against the
 * stateful dev.db never collide. Type/client default to seeded picker options.
 * @param {Partial<EventoBasics>} [overrides] - Field overrides.
 * @returns {EventoBasics}
 */
export function generateEvento(overrides?: Partial<EventoBasics>): EventoBasics {
  const token = `${Date.now()}${faker.number.int({ min: 100, max: 999 })}`;
  return {
    name: `E2E ${faker.word.noun()} ${token}`,
    ...overrides,
  };
}
