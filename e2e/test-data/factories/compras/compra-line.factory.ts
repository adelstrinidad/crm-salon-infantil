import { faker } from "@faker-js/faker";
import type { CompraLineInput } from "../../../pages/compras/compra-form.page";

/**
 * Dynamic happy-path purchase line. The insumo name must reference an existing
 * insumo (pass it in); qty and unit cost are randomized within sane bounds.
 * @param {string} insumoName - Name of an existing insumo to buy.
 * @param {Partial<CompraLineInput>} [overrides] - Field overrides.
 * @returns {CompraLineInput}
 */
export function generateCompraLine(
  insumoName: string,
  overrides?: Partial<CompraLineInput>,
): CompraLineInput {
  return {
    insumoName,
    qty: faker.number.int({ min: 1, max: 20 }),
    unitCost: faker.number.int({ min: 1, max: 500 }),
    ...overrides,
  };
}
