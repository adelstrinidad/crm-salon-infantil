import { test, expect, type Page } from "@playwright/test";

// Verifies the payment → event-state automation:
//   RESERVADO + partial payment (< total)  → SENADO ("Señado")
//   SENADO   + payment completing the total → PAGADO ("Pagado")
//
// Auth: dashboard is gated by proxy.ts; we log in with the seeded admin.
// Money is entered in pesos; the app stores cents.

const ADMIN_EMAIL = "admin@salon.local";
const ADMIN_PASSWORD = "admin1234";
const TOTAL = "100"; // event price in pesos

async function login(page: Page) {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email" }).fill(ADMIN_EMAIL);
  await page.getByRole("textbox", { name: "Contraseña" }).fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await page.waitForURL("**/eventos");
}

// Creates a RESERVADO event with a total price, returns its id.
async function createReservedEvent(page: Page, name: string): Promise<string> {
  await page.goto("/eventos/nuevo");
  await page.getByRole("textbox", { name: "Nombre del evento" }).fill(name);
  await page.getByLabel("Tipo de evento").selectOption("Cumpleaños");

  // Client picker (combobox) — pick a seeded client.
  await page.getByText("Seleccionar cliente…").click();
  await page.getByRole("option", { name: "Familia García" }).click();

  await page.getByRole("textbox", { name: "Inicio" }).fill("2026-07-01T15:00");
  await page.getByRole("textbox", { name: "Fin" }).fill("2026-07-01T18:00");

  await page.getByRole("button", { name: "Reservar" }).click();

  // Create redirects to the edit page; capture the id from the URL.
  await page.waitForURL(/\/eventos\/[^/]+\/editar$/);
  const id = page.url().match(/\/eventos\/([^/]+)\/editar$/)![1];

  // Set the total price (only available in edit mode) and save.
  await page.getByRole("spinbutton", { name: "Precio total" }).fill(TOTAL);
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await page.waitForURL("**/eventos");

  return id;
}

// Opens the "Registrar cobro" modal and records a payment of `amount` pesos.
async function registrarCobro(page: Page, amount: string) {
  await page.getByRole("button", { name: "Registrar cobro" }).click();
  const importe = page.getByRole("spinbutton"); // only the modal's amount input on this page
  await importe.fill(amount);
  await page.getByRole("button", { name: "Cobrar" }).click();
}

test("payment advances event state: RESERVADO → SENADO → PAGADO", async ({ page }) => {
  await login(page);

  const id = await createReservedEvent(page, `E2E Pago ${Date.now()}`);
  await page.goto(`/eventos/${id}`);

  // Starts as Reservado, nothing collected.
  await expect(page.getByText("Reservado").first()).toBeVisible();
  await expect(page.getByRole("row", { name: /Saldo \$100/ })).toBeVisible();

  // Partial payment ($40 of $100) → SENADO.
  await registrarCobro(page, "40");
  await expect(page.getByText("Señado").first()).toBeVisible();
  await expect(page.getByRole("row", { name: /Cobrado \$40/ })).toBeVisible();
  await expect(page.getByRole("row", { name: /Saldo \$60/ })).toBeVisible();
  // Not yet fully paid.
  await expect(page.getByText("Pagado")).toHaveCount(0);
  // The cobro movement gets a default description (no manual one was entered).
  await expect(page.getByRole("cell", { name: /Cobro —/ }).first()).toBeVisible();

  // Remaining payment ($60) completes the total → PAGADO.
  await registrarCobro(page, "60");
  await expect(page.getByText("Pagado").first()).toBeVisible();
  await expect(page.getByRole("row", { name: /Cobrado \$100/ })).toBeVisible();
  await expect(page.getByRole("row", { name: /Saldo \$0/ })).toBeVisible();
});
