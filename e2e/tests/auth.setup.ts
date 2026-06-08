import { test as setup, expect } from "@playwright/test";
import { LoginPage } from "../pages/auth/login.page";
import { SidebarComponent } from "../pages/components/sidebar.component";
import { StorageStatePaths } from "../enums/util/storage";

// Runs once before the "e2e" project (declared as its dependency). Logs in with
// the seeded admin and saves the session so every spec starts authenticated.
setup("authenticate as admin", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login();

  // Confirm we really landed in the dashboard before persisting the session.
  await expect(new SidebarComponent(page).hamburger.or(page.getByRole("link", { name: "Eventos" }).first())).toBeVisible();

  await page.context().storageState({ path: StorageStatePaths.ADMIN });
});
