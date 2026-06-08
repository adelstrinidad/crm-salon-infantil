import { test, expect, type Page } from "@playwright/test";

// Verifies the payment → event-state automation:
//   RESERVADO + partial payment (< total)  → SENADO ("Señado")
//   SENADO   + payment completing the total → PAGADO ("Pagado")
//
// Auth: dashboard is gated by proxy.ts; we log in with the seeded admin.
// Money is entered in pesos; the app stores cents.

const ADMIN_EMAIL = "admin@salon.local";
const ADMIN_PASSWORD = "admin1234";
// The event price is derived from its services (no manual price field). We add
// the seeded "Animación" service (price $10.000) so the total is deterministic.

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// A unique future time slot per run so repeated runs never double-book the venue
// (a confirmed RESERVADO event can't overlap another).
function uniqueSlot(): { start: string; end: string } {
  const d = new Date(2027, 5, 1, 9, 0);
  d.setMinutes(d.getMinutes() + (Date.now() % 200000));
  const fmt = (x: Date) =>
    `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}`;
  return { start: fmt(d), end: fmt(new Date(d.getTime() + 3 * 60 * 60 * 1000)) };
}

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
  // Tipo de evento is a styled (Radix) Select: open it and pick the option.
  await page.getByLabel("Tipo de evento").click();
  await page.getByRole("option", { name: "Cumpleaños" }).click();

  // Client picker (combobox) — pick a seeded client.
  await page.getByText("Seleccionar cliente…").click();
  await page.getByRole("option", { name: "Familia García" }).click();

  const { start, end } = uniqueSlot();
  await page.getByRole("textbox", { name: "Inicio" }).fill(start);
  await page.getByRole("textbox", { name: "Fin" }).fill(end);

  await page.getByRole("button", { name: "Reservar" }).click();

  // Create redirects to the edit page; capture the id from the URL.
  await page.waitForURL(/\/eventos\/[^/]+\/editar$/);
  const id = page.url().match(/\/eventos\/([^/]+)\/editar$/)![1];

  // Price is derived from services (no manual field). Add a known-priced service
  // so the total is deterministic; it auto-saves (no "Guardar" needed). Scope to
  // the "Servicios del evento" section to disambiguate from the other pickers.
  await page.getByRole("combobox", { name: "Agregar servicio" }).click();
  await page.getByRole("option", { name: /Animación/ }).click();
  await page.getByRole("button", { name: "Agregar servicio" }).click();
  await expect(page.getByRole("cell", { name: "Animación" })).toBeVisible();

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
  await expect(page.getByRole("row", { name: /Saldo \$10\.000/ })).toBeVisible();

  // Partial payment ($4.000 of $10.000) → SENADO.
  await registrarCobro(page, "4000");
  await expect(page.getByText("Señado").first()).toBeVisible();
  await expect(page.getByRole("row", { name: /Cobrado \$4\.000/ })).toBeVisible();
  await expect(page.getByRole("row", { name: /Saldo \$6\.000/ })).toBeVisible();
  // Not yet fully paid.
  await expect(page.getByText("Pagado")).toHaveCount(0);
  // The cobro movement gets a default description (no manual one was entered).
  await expect(page.getByRole("cell", { name: /Cobro —/ }).first()).toBeVisible();

  // Remaining payment ($6.000) completes the total → PAGADO.
  await registrarCobro(page, "6000");
  await expect(page.getByText("Pagado").first()).toBeVisible();
  await expect(page.getByRole("row", { name: /Cobrado \$10\.000/ })).toBeVisible();
  await expect(page.getByRole("row", { name: /Saldo \$0/ })).toBeVisible();
});
