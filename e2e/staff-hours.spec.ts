import { test, expect, type Page } from "@playwright/test";

// Verifies the Personal (internal hourly staff) flow:
//   1. create a staff member with an hourly rate
//   2. assign them to an event with estimated hours
//   3. "Falta registro de empleados" flag shows until real hours are logged
//   4. logging the real hours clears the flag and costs into the event
//
// Auth: dashboard is gated by proxy.ts; we log in with the seeded admin.
// Money is entered in pesos; hours as hh:mm with minutes 00/30.

const ADMIN_EMAIL = "admin@salon.local";
const ADMIN_PASSWORD = "admin1234";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email" }).fill(ADMIN_EMAIL);
  await page.getByRole("textbox", { name: "Contraseña" }).fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await page.waitForURL("**/eventos");
}

async function createStaff(page: Page, name: string, rate: string) {
  await page.goto("/personal/nuevo");
  await page.getByRole("textbox", { name: "Nombre" }).fill(name);
  await page.getByRole("spinbutton", { name: "Costo por hora" }).fill(rate);
  await page.getByRole("button", { name: "Crear empleado" }).click();
  // Redirect to the list only happens on a successful create. (Don't assert the
  // row is visible — the list paginates and prior test runs may push it off page 1.)
  await page.waitForURL("**/personal");
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// A unique future time slot per run so repeated runs never double-book the venue
// (a confirmed RESERVADO event can't overlap another).
function uniqueSlot(): { start: string; end: string } {
  const d = new Date(2027, 0, 1, 9, 0);
  d.setMinutes(d.getMinutes() + (Date.now() % 200000)); // spread across many days
  const start = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const e = new Date(d.getTime() + 3 * 60 * 60 * 1000);
  const end = `${e.getFullYear()}-${pad(e.getMonth() + 1)}-${pad(e.getDate())}T${pad(e.getHours())}:${pad(e.getMinutes())}`;
  return { start, end };
}

async function createReservedEvent(page: Page, name: string): Promise<string> {
  const { start, end } = uniqueSlot();
  await page.goto("/eventos/nuevo");
  await page.getByRole("textbox", { name: "Nombre del evento" }).fill(name);
  await page.getByLabel("Tipo de evento").click();
  await page.getByRole("option", { name: "Cumpleaños" }).click();
  await page.getByText("Seleccionar cliente…").click();
  await page.getByRole("option", { name: "Familia García" }).click();
  await page.getByRole("textbox", { name: "Inicio" }).fill(start);
  await page.getByRole("textbox", { name: "Fin" }).fill(end);
  await page.getByRole("button", { name: "Reservar" }).click();
  await page.waitForURL(/\/eventos\/[^/]+\/editar$/);
  return page.url().match(/\/eventos\/([^/]+)\/editar$/)![1];
}

// Assign a staff member with an estimate (hours) on the open edit page.
async function assignStaff(page: Page, staffName: string, hours: string) {
  await page.getByLabel("Agregar empleado").click();
  await page.getByRole("option", { name: staffName }).click();
  await page.getByRole("spinbutton", { name: "Horas" }).fill(hours);
  // Only the staff picker's "Agregar" is enabled (a staff member is selected);
  // the service/provider/bonificado ones stay disabled with no pending pick.
  await page.getByRole("button", { name: "Agregar", disabled: false }).click();
  await expect(page.getByText(staffName).first()).toBeVisible();
}

test("staff hours: assign estimate, flag pending, log real hours, flag clears", async ({ page }) => {
  await login(page);

  const staffName = `E2E Mozo ${Date.now()}`;
  await createStaff(page, staffName, "2500"); // $2.500/h

  const id = await createReservedEvent(page, `E2E Personal ${Date.now()}`);

  await assignStaff(page, staffName, "5");

  // The "falta registro" flag is visible and the estimated cost is shown.
  await expect(page.getByText("Falta registro de empleados")).toBeVisible();
  await expect(page.getByText("$12.500").first()).toBeVisible(); // $2.500 × 5h

  // Log the real hours on the assignment card and save.
  const card = page.getByRole("listitem").filter({ hasText: staffName });
  await card.getByRole("spinbutton", { name: "Horas" }).fill("5");
  await card.getByRole("button", { name: "Guardar" }).click();

  // Flag clears once real hours are registered.
  await expect(page.getByText("Falta registro de empleados")).toHaveCount(0);

  // Detail page shows the staff cost line and the assignment.
  await page.goto(`/eventos/${id}`);
  await expect(page.getByText("Costo personal")).toBeVisible();
  await expect(page.getByText(staffName).first()).toBeVisible();
});

// Staff can be added and have their hours logged regardless of event state —
// crucially after the event is already PAGADO (the venue still owes the hours).
test("staff can be added and edited on a PAGADO event, with correct cost", async ({ page }) => {
  await login(page);

  const staffName = `E2E Pagado Mozo ${Date.now()}`;
  await createStaff(page, staffName, "3000"); // $3.000/h

  const id = await createReservedEvent(page, `E2E Personal Pagado ${Date.now()}`);

  // Move the event to PAGADO via the edit form's Estado select. The edit page
  // auto-saves on change (no "Guardar" button) — wait for the saved indicator.
  await page.getByLabel("Estado").click();
  await page.getByRole("option", { name: "Pagado" }).click();
  await expect(page.getByText("Guardado", { exact: true })).toBeVisible();

  // Reopen the (now PAGADO) event and assign staff — must still be allowed.
  await page.goto(`/eventos/${id}/editar`);
  await assignStaff(page, staffName, "6");
  // Estimated cost = $3.000 × 6h = $18.000.
  await expect(page.getByText("$18.000").first()).toBeVisible();

  // Log real hours (6:30) on the card → cost updates to $19.500.
  const card = page.getByRole("listitem").filter({ hasText: staffName });
  await card.getByRole("spinbutton", { name: "Horas" }).fill("6");
  await card.getByRole("combobox", { name: "Minutos" }).click();
  await page.getByRole("option", { name: "30" }).click();
  await card.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByText("Falta registro de empleados")).toHaveCount(0);

  // Detail: still Pagado, with the staff cost reflected ($3.000 × 6.5h = $19.500).
  await page.goto(`/eventos/${id}`);
  await expect(page.getByText("Pagado").first()).toBeVisible();
  await expect(page.getByText("Costo personal")).toBeVisible();
  await expect(page.getByText("$19.500").first()).toBeVisible();
});

// The "Guardar" (log real hours) button stays disabled until a non-zero time is
// picked, and saving the real hours clears the "falta registro" cartel on the
// edit page.
test("save-hours button disabled until a time is picked; flag clears on save", async ({ page }) => {
  await login(page);

  const staffName = `E2E Horas ${Date.now()}`;
  await createStaff(page, staffName, "2000");
  await createReservedEvent(page, `E2E Horas Ev ${Date.now()}`);
  await assignStaff(page, staffName, "0"); // no estimate → real-hours draft starts at 0

  await expect(page.getByText("Falta registro de empleados")).toBeVisible();

  const card = page.getByRole("listitem").filter({ hasText: staffName });
  // Disabled with no time selected (0:00).
  await expect(card.getByRole("button", { name: "Guardar" })).toBeDisabled();

  // Picking a time enables it.
  await card.getByRole("spinbutton", { name: "Horas" }).fill("3");
  await expect(card.getByRole("button", { name: "Guardar" })).toBeEnabled();

  // Saving clears the cartel on the edit page.
  await card.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByText("Falta registro de empleados")).toHaveCount(0);
});

// The staff payment is registered on the dedicated Pago personal page (mirrors
// prestadores/proveedores), and only once the real hours are logged.
test("staff payment: register a payment on the Pago personal page", async ({ page }) => {
  await login(page);

  const staffName = `E2E Pago Personal ${Date.now()}`;
  await createStaff(page, staffName, "2000"); // $2.000/h

  const id = await createReservedEvent(page, `E2E Pago Ev ${Date.now()}`);
  await assignStaff(page, staffName, "5"); // estimate 5h

  // Before logging real hours: Pago personal offers no "Pagar", only a prompt.
  await page.goto("/pagos/personal");
  let row = page.getByRole("row").filter({ hasText: staffName });
  await expect(row.getByText("Registrá las horas")).toBeVisible();
  await expect(row.getByRole("button", { name: "Pagar" })).toHaveCount(0);

  // Log the real hours on the event, then the row becomes payable.
  await page.goBack();
  const card = page.getByRole("listitem").filter({ hasText: staffName });
  await card.getByRole("spinbutton", { name: "Horas" }).fill("5");
  await card.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByText("Falta registro de empleados")).toHaveCount(0);

  // Before paying, the event detail shows the assignment as Pendiente.
  await page.goto(`/eventos/${id}`);
  await expect(
    page.getByRole("row").filter({ hasText: staffName }).getByText("Pendiente"),
  ).toBeVisible();

  // Pay it: $2.000 × 5h = $10.000, default account.
  await page.goto("/pagos/personal");
  row = page.getByRole("row").filter({ hasText: staffName });
  await expect(row.getByText("$10.000")).toBeVisible();
  await row.getByRole("button", { name: "Pagar" }).click();
  await row.getByRole("button", { name: "Confirmar" }).click();

  // Row now shows Pagado; an EGRESO movement was recorded.
  await expect(row.getByText(/Pagado/)).toBeVisible();
  await page.goto("/finanzas/movimientos");
  await expect(page.getByText(`Pago personal — ${staffName}`).first()).toBeVisible();

  // Scenario 1 on the event detail: single employee, now paid → no "falta
  // registro" cartel and the assignment shows Pagado.
  await page.goto(`/eventos/${id}`);
  await expect(page.getByText("Falta registro de empleados")).toHaveCount(0);
  const detailRow = page.getByRole("row").filter({ hasText: staffName });
  await expect(detailRow.getByText(/Pagado/)).toBeVisible();
});
