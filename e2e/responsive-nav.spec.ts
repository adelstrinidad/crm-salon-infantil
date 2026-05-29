import { test, expect } from "@playwright/test";

// Mobile navigation: the persistent sidebar is hidden on small screens and a
// hamburger opens a slide-over drawer that navigates and then closes.
test.use({ viewport: { width: 390, height: 844 } });

test("mobile: hamburger opens nav drawer, navigates, and closes", async ({ page }) => {
  // Login.
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email" }).fill("admin@salon.local");
  await page.getByRole("textbox", { name: "Contraseña" }).fill("admin1234");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await page.waitForURL("**/eventos");

  // On mobile the hamburger is the way in; the drawer is not open yet.
  const hamburger = page.getByRole("button", { name: "Abrir menú" });
  await expect(hamburger).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Menú de navegación" })).toHaveCount(0);

  // Open the drawer and navigate to Clientes.
  await hamburger.click();
  const drawer = page.getByRole("dialog", { name: "Menú de navegación" });
  await expect(drawer).toBeVisible();
  await drawer.getByRole("link", { name: "Clientes" }).click();

  await page.waitForURL("**/clientes");
  // Drawer closes itself after navigation.
  await expect(page.getByRole("dialog", { name: "Menú de navegación" })).toHaveCount(0);
});
